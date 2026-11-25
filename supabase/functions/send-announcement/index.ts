// Comunicados por e-mail para os membros (novo evento, Student Community Day, novidades).
//
// Cada grupo envia pelo PRÓPRIO servidor de e-mail (SMTP), cadastrado pelo líder na aba Comunicados do painel
// (tabela group_email_settings; a senha fica no Vault e só esta função a lê). Só líder e core team DO GRUPO
// enviam (is_group_staff com o token de quem chamou). Destinatários: membros do grupo com e-mail que não
// desligaram "Receber novidades" no perfil. Vão em cópia oculta (BCC), em lotes. Opcional: SITE_URL (link do
// rodapé para o perfil; sem ele, usa a origem da página).
//
// Corpo: { group_id, subject, message, link?, test? }  test=true envia só para quem está enviando.
import { createClient } from 'npm:@supabase/supabase-js@2';
import nodemailer from 'npm:nodemailer@6.9.16';
import { withCors } from '../_shared/cors.ts';

const CORS = {
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { ...CORS, 'Content-Type': 'application/json' } });

const BATCH = 45;
// Evita disparo duplo (clique duplo, duas pessoas ao mesmo tempo)
const COOLDOWN_MS = 5 * 60 * 1000;
const EMAIL = /^[^\s@<>()"',;]+@[^\s@<>()"',;]+\.[^\s@<>()"',;]{2,}$/;

const escapeHtml = (s: string) =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');

const httpUrl = (v: unknown) => {
  const s = String(v ?? '').trim();
  if (!s) return '';
  try {
    const u = new URL(s);
    return u.protocol === 'https:' || u.protocol === 'http:' ? u.href : '';
  } catch {
    return '';
  }
};

function render(groupName: string, shortName: string, subject: string, message: string, link: string, profileUrl: string) {
  const body = escapeHtml(message).replace(/\r?\n/g, '<br>');
  const button = link
    ? `<p style="margin:28px 0 8px"><a href="${escapeHtml(link)}" style="display:inline-block;background:#ad5cff;color:#161d26;font-family:'IBM Plex Mono',monospace;font-weight:600;font-size:14px;text-decoration:none;padding:14px 22px">Saiba mais →</a></p>`
    : '';
  const footer = profileUrl
    ? `Você recebe este e-mail porque participa de ${escapeHtml(shortName)}. Para não receber mais, desmarque "Receber novidades por e-mail" em <a href="${escapeHtml(profileUrl)}" style="color:#656871">Meu perfil</a>.`
    : `Você recebe este e-mail porque participa de ${escapeHtml(shortName)}. Para não receber mais, desmarque "Receber novidades por e-mail" em Meu perfil.`;
  return `<!doctype html><html><body style="margin:0;background:#f6f6f8">
<div style="max-width:600px;margin:0 auto;background:#ffffff;border:1px solid #dedee3">
  <div style="background:#161d26;color:#ffffff;padding:18px 24px;font-family:'IBM Plex Mono',monospace;font-size:15px">
    <span style="display:inline-block;width:10px;height:10px;background:#ad5cff;margin-right:10px"></span>${escapeHtml(groupName)}
  </div>
  <div style="padding:28px 24px;font-family:Arial,sans-serif;font-size:15px;line-height:1.6;color:#161d26">
    <h1 style="font-family:'IBM Plex Mono',monospace;font-weight:500;font-size:22px;line-height:1.3;margin:0 0 18px">${escapeHtml(subject)}</h1>
    ${body}
    ${button}
  </div>
  <div style="padding:16px 24px;border-top:1px solid #dedee3;font-family:Arial,sans-serif;font-size:12px;line-height:1.5;color:#656871">${footer}</div>
</div></body></html>`;
}

Deno.serve(async (req) => withCors(req, await handle(req)));

async function handle(req: Request): Promise<Response> {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: CORS });
  if (req.method !== 'POST') return json({ error: 'Método não permitido.' }, 405);

  const supabase = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_ANON_KEY')!, {
    global: { headers: { Authorization: req.headers.get('Authorization') ?? '' } },
  });
  const { data: userData } = await supabase.auth.getUser();
  const user = userData?.user;
  if (!user) return json({ error: 'Faça login para enviar comunicados.' }, 401);

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return json({ error: 'Corpo inválido.' }, 400);
  }
  const groupId = String(body.group_id ?? '');
  if (!/^[0-9a-f-]{36}$/i.test(groupId)) return json({ error: 'Informe o grupo.' }, 400);
  const { data: staff, error: staffError } = await supabase.rpc('is_group_staff', { g: groupId });
  if (staffError || staff !== true) return json({ error: 'Só o líder e o core team do grupo podem enviar comunicados.' }, 403);
  const { data: group } = await supabase.from('groups').select('name, short_name, slug').eq('id', groupId).maybeSingle();
  if (!group) return json({ error: 'Grupo não encontrado.' }, 404);

  // Servidor de e-mail do PRÓPRIO grupo (cadastrado pelo líder no painel); a senha só é lida aqui, com a chave de serviço
  const admin = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!, { auth: { persistSession: false } });
  const { data: smtpRows } = await admin.rpc('get_group_smtp', { g: groupId });
  const smtp = (smtpRows as { smtp_host: string; smtp_port: number; smtp_user: string; smtp_pass: string; from_email: string; from_name: string | null }[] | null)?.[0];
  if (!smtp) {
    return json({ error: 'O envio de e-mail deste grupo ainda não foi configurado. O líder cadastra o servidor de e-mail na aba Comunicados.', code: 'smtp_not_configured' }, 503);
  }
  const { smtp_host: host, smtp_port: port, smtp_user: smtpUser, smtp_pass: pass, from_email: from } = smtp;
  const fromName = String(smtp.from_name || group.name).replace(/["\r\n]/g, '');
  const subject = String(body.subject ?? '').replace(/[\r\n]+/g, ' ').trim().slice(0, 200);
  const message = String(body.message ?? '').trim().slice(0, 5000);
  const link = httpUrl(body.link);
  const test = body.test === true;
  if (!subject) return json({ error: 'Escreva o assunto.' }, 400);
  if (!message) return json({ error: 'Escreva a mensagem.' }, 400);
  if (String(body.link ?? '').trim() && !link) return json({ error: 'O link precisa começar com https://' }, 400);

  const site = httpUrl(Deno.env.get('SITE_URL')) || httpUrl(req.headers.get('origin'));
  const profileUrl = site ? new URL('/perfil', site).href : '';

  // ---- destinatários
  let recipients: string[];
  if (test) {
    recipients = user.email ? [user.email] : [];
  } else {
    const { data: last } = await supabase.from('announcements').select('created_at').eq('group_id', groupId).order('created_at', { ascending: false }).limit(1);
    if (last?.[0] && Date.now() - new Date(last[0].created_at).getTime() < COOLDOWN_MS) {
      return json({ error: 'Um comunicado acabou de ser enviado. Espere alguns minutos antes de enviar outro.' }, 429);
    }
    const { data: rows, error } = await supabase.rpc('group_announcement_emails', { g: groupId }).limit(5000);
    if (error) return json({ error: `Não foi possível ler a lista de membros: ${error.message}` }, 500);
    recipients = [...new Set(((rows ?? []) as { email: string }[]).map((r) => String(r.email).trim().toLowerCase()).filter((e) => EMAIL.test(e)))];
  }
  if (!recipients.length) return json({ error: 'Ninguém para receber.' }, 400);

  // ---- envio em lotes, com os destinatários em cópia oculta
  const html = render(group.name, group.short_name, subject, message, link, profileUrl);
  const text = `${message}${link ? `\n\n${link}` : ''}\n\n—\nVocê recebe este e-mail porque participa de ${group.short_name}. Para não receber mais, desmarque "Receber novidades por e-mail" em Meu perfil${profileUrl ? `: ${profileUrl}` : '.'}`;
  const transport = nodemailer.createTransport({ host, port, secure: port === 465, requireTLS: port !== 465, auth: { user: smtpUser, pass }, connectionTimeout: 15_000, greetingTimeout: 15_000, socketTimeout: 30_000 });
  let sent = 0;
  try {
    for (let i = 0; i < recipients.length; i += BATCH) {
      const bcc = recipients.slice(i, i + BATCH);
      // Teste: só para quem clicou. Envio de verdade: "Para" é o próprio grupo e os membros vão em cópia oculta
      const to = test ? bcc.join(', ') : `"${fromName}" <${from}>`;
      await transport.sendMail({ from: `"${fromName}" <${from}>`, to, ...(test ? {} : { bcc }), subject, html, text });
      sent += bcc.length;
    }
  } catch (err) {
    console.error(JSON.stringify({ event: 'announcement_failed', by: user.id, sent, error: String(err) }));
    // Registra o que já saiu (e ativa a espera): reenviar mandaria de novo para os mesmos
    if (!test && sent > 0) {
      await supabase.from('announcements').insert({ group_id: groupId, subject, message, link: link || null, recipients: sent, sent_by: user.id });
    }
    return json({ error: `O servidor de e-mail recusou o envio depois de ${sent} destinatários: ${String((err as Error)?.message ?? err)}`, sent }, 502);
  }

  if (!test) {
    await supabase.from('announcements').insert({ group_id: groupId, subject, message, link: link || null, recipients: sent, sent_by: user.id });
  }
  console.log(JSON.stringify({ event: test ? 'announcement_test' : 'announcement_sent', by: user.id, group: groupId, recipients: sent }));
  return json({ ok: true, sent });
}
