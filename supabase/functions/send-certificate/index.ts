// Envio de certificados do Studio por e-mail, um destinatário por chamada, pelo servidor de e-mail DO GRUPO
// (cadastrado pelo líder na aba Comunicados; a senha fica criptografada no banco e só esta função a lê).
// Só líder e core team do grupo enviam (is_group_staff, com o token de quem chamou).
//
// Corpo: { group_id, to, name, subject, message, filename, pdfBase64 }
import { createClient } from 'npm:@supabase/supabase-js@2';
import nodemailer from 'npm:nodemailer@6.9.16';
import { withCors } from '../_shared/cors.ts';
import { loadGroupSmtp, SMTP_NOT_CONFIGURED } from '../_shared/groupSmtp.ts';

const CORS = {
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { ...CORS, 'Content-Type': 'application/json' } });

const EMAIL = /^[^\s@<>()"',;]+@[^\s@<>()"',;]+\.[^\s@<>()"',;]{2,}$/;
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const MAX_PDF_BASE64 = 7_000_000; // ~5 MB de PDF

const escapeHtml = (s: string) =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');

Deno.serve(async (req) => withCors(req, await handle(req)));

async function handle(req: Request): Promise<Response> {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: CORS });
  if (req.method !== 'POST') return json({ error: 'Método não permitido.' }, 405);

  // ---- quem está chamando: precisa estar logado e ser core/líder do grupo
  const supabase = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_ANON_KEY')!, {
    global: { headers: { Authorization: req.headers.get('Authorization') ?? '' } },
  });
  const { data: userData } = await supabase.auth.getUser();
  const user = userData?.user;
  if (!user) return json({ error: 'Faça login para enviar certificados.' }, 401);

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return json({ error: 'Corpo inválido.' }, 400);
  }
  const groupId = String(body.group_id ?? '');
  if (!UUID.test(groupId)) return json({ error: 'Informe o grupo.' }, 400);
  const { data: staff, error: staffError } = await supabase.rpc('is_group_staff', { g: groupId });
  if (staffError || staff !== true) return json({ error: 'Só o líder e o core team do grupo podem enviar certificados.' }, 403);
  const { data: group } = await supabase.from('groups').select('name').eq('id', groupId).maybeSingle();
  if (!group) return json({ error: 'Grupo não encontrado.' }, 404);

  // ---- servidor de e-mail do grupo
  const smtp = await loadGroupSmtp(groupId, group.name);
  if (!smtp) return json({ error: SMTP_NOT_CONFIGURED, code: 'smtp_not_configured' }, 503);

  // ---- dados do envio
  const to = String(body.to ?? '').trim().toLowerCase();
  const name = String(body.name ?? '').trim().slice(0, 120);
  const subject = String(body.subject ?? '').replace(/[\r\n]+/g, ' ').trim().slice(0, 200);
  const message = String(body.message ?? '').slice(0, 5000);
  const filename = String(body.filename ?? '');
  const pdfBase64 = String(body.pdfBase64 ?? '');

  if (!EMAIL.test(to)) return json({ error: 'E-mail do destinatário inválido.' }, 400);
  if (!name) return json({ error: 'Nome do destinatário vazio.' }, 400);
  if (!subject) return json({ error: 'Assunto vazio.' }, 400);
  if (!/^[A-Za-z0-9_.-]{1,120}\.pdf$/.test(filename)) return json({ error: 'Nome de arquivo inválido.' }, 400);
  if (!pdfBase64.startsWith('JVBER') || pdfBase64.length > MAX_PDF_BASE64) {
    return json({ error: 'O anexo precisa ser um PDF de até 5 MB.' }, 400);
  }

  // Texto simples -> HTML seguro (nada do que foi digitado vira HTML de verdade)
  const html = escapeHtml(message.replace(/\{nome\}/gi, name)).replace(/\r?\n/g, '<br>');

  try {
    const transport = nodemailer.createTransport({ host: smtp.host, port: smtp.port, secure: smtp.port === 465, requireTLS: smtp.port !== 465, auth: { user: smtp.user, pass: smtp.pass }, connectionTimeout: 15_000, greetingTimeout: 15_000, socketTimeout: 30_000 });
    await transport.sendMail({
      from: `"${smtp.fromName}" <${smtp.from}>`,
      to,
      subject,
      html: `<div style="font-family:Arial,sans-serif;font-size:15px;line-height:1.6;color:#161d26">${html}</div>`,
      text: message.replace(/\{nome\}/gi, name),
      attachments: [{ filename, content: pdfBase64, encoding: 'base64', contentType: 'application/pdf' }],
    });
  } catch (err) {
    console.error(JSON.stringify({ event: 'certificate_failed', by: user.id, group: groupId, error: String(err) }));
    return json({ error: `O servidor de e-mail recusou o envio: ${String((err as Error)?.message ?? err)}` }, 502);
  }

  // Registro sem dados pessoais do destinatário (só o domínio), para auditoria nos logs
  console.log(JSON.stringify({ event: 'certificate_sent', by: user.id, group: groupId, toDomain: to.split('@')[1] }));
  return json({ ok: true });
}
