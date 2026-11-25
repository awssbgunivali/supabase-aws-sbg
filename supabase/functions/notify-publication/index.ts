// Avisos por e-mail da aprovação de publicações nas redes (Studio), pelo servidor de e-mail DO GRUPO do post.
//
//   requested  o core enviou um post para aprovação  -> e-mail para o(s) líder(es)
//   approved   o líder aprovou (já está na fila)       -> e-mail para quem criou o post
//   rejected   o líder recusou, com motivo             -> e-mail para quem criou o post
//
// Servidor de e-mail: o do grupo (aba Comunicados). Opcional: SITE_URL (link "Abrir no site"; sem ele usa a origem
// da página). Só líder e core team do grupo chamam (is_group_staff com o token de quem chamou), e cada aviso confere o estado REAL do post
// no banco (quem criou, quem aprovou) e só sai uma vez (social_posts.notify_log): não dá para usar isto para mandar
// e-mail avulso a ninguém.
//
// Corpo: { postId, event: 'requested' | 'approved' | 'rejected' }
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

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const EMAIL = /^[^\s@<>()"',;]+@[^\s@<>()"',;]+\.[^\s@<>()"',;]{2,}$/;
const CHANNEL = { instagram: 'Instagram', linkedin: 'LinkedIn' } as Record<string, string>;

const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
const httpUrl = (v: unknown) => {
  try {
    const u = new URL(String(v ?? '').trim());
    return u.protocol === 'https:' || u.protocol === 'http:' ? u.href : '';
  } catch {
    return '';
  }
};
const when = (iso: string) =>
  new Date(iso).toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo', weekday: 'short', day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' });

function render(opts: { groupName: string; heading: string; intro: string; post: Record<string, any>; button?: { label: string; href: string }; reason?: string }) {
  const { groupName, heading, intro, post, button, reason } = opts;
  const cover = post.image_urls?.[0] && httpUrl(post.image_urls[0]);
  const caption = String(post.caption ?? '').trim().slice(0, 500);
  const channels = (post.channels ?? []).map((c: string) => CHANNEL[c] ?? c).join(' e ');
  return `<!doctype html><html><body style="margin:0;background:#f6f6f8">
<div style="max-width:600px;margin:0 auto;background:#ffffff;border:1px solid #dedee3">
  <div style="background:#161d26;color:#ffffff;padding:18px 24px;font-family:'IBM Plex Mono',monospace;font-size:15px"><span style="display:inline-block;width:10px;height:10px;background:#ad5cff;margin-right:10px"></span>Studio · ${esc(groupName)}</div>
  <div style="padding:28px 24px;font-family:Arial,sans-serif;font-size:15px;line-height:1.6;color:#161d26">
    <h1 style="font-family:'IBM Plex Mono',monospace;font-weight:500;font-size:21px;line-height:1.3;margin:0 0 14px">${esc(heading)}</h1>
    <p style="margin:0 0 16px">${esc(intro)}</p>
    ${reason ? `<p style="margin:0 0 16px;padding:12px 14px;background:#f6f6f8;border-left:3px solid #ff57e9"><strong>Motivo:</strong> ${esc(reason)}</p>` : ''}
    <table style="width:100%;border-collapse:collapse;font-size:14px;margin:0 0 16px">
      <tr><td style="padding:6px 0;color:#656871;width:110px">Post</td><td style="padding:6px 0"><strong>${esc(String(post.title ?? ''))}</strong></td></tr>
      <tr><td style="padding:6px 0;color:#656871">Onde</td><td style="padding:6px 0">${esc(channels)}</td></tr>
      <tr><td style="padding:6px 0;color:#656871">Horário</td><td style="padding:6px 0">${esc(when(post.publish_at))}</td></tr>
    </table>
    ${cover ? `<p style="margin:0 0 16px"><img src="${esc(cover)}" alt="" width="200" style="display:block;border:1px solid #dedee3"></p>` : ''}
    <div style="padding:12px 14px;background:#f6f6f8;font-size:14px;white-space:pre-line;color:#3b4350">${esc(caption)}${String(post.caption ?? '').length > 500 ? '…' : ''}</div>
    ${button ? `<p style="margin:26px 0 6px"><a href="${esc(button.href)}" style="display:inline-block;background:#ad5cff;color:#161d26;font-family:'IBM Plex Mono',monospace;font-weight:600;font-size:14px;text-decoration:none;padding:14px 22px">${esc(button.label)} →</a></p>` : ''}
  </div>
  <div style="padding:16px 24px;border-top:1px solid #dedee3;font-family:Arial,sans-serif;font-size:12px;line-height:1.5;color:#656871">Aviso automático do Studio do grupo.</div>
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
  if (!user) return json({ error: 'Faça login.' }, 401);

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return json({ error: 'Corpo inválido.' }, 400);
  }
  const postId = String(body.postId ?? '');
  const event = String(body.event ?? '');
  if (!UUID.test(postId) || !['requested', 'approved', 'rejected'].includes(event)) return json({ error: 'Pedido inválido.' }, 400);

  const { data: post, error } = await supabase
    .from('social_posts')
    .select('id, group_id, title, caption, channels, image_urls, publish_at, status, created_by, approved_by, rejected_reason, notify_log')
    .eq('id', postId)
    .maybeSingle();
  if (error || !post) return json({ error: 'Post não encontrado.' }, 404);
  const { data: staff } = await supabase.rpc('is_group_staff', { g: post.group_id });
  if (staff !== true) return json({ error: 'Só o líder e o core team do grupo.' }, 403);
  const { data: isLeader } = await supabase.rpc('is_group_leader', { g: post.group_id });
  const { data: group } = await supabase.from('groups').select('name, slug').eq('id', post.group_id).maybeSingle();
  if (post.notify_log?.[event]) return json({ ok: true, skipped: 'já avisado' });

  // O estado real do post tem que bater com o aviso pedido (quem chama não escolhe o destinatário nem o texto)
  const okState =
    (event === 'requested' && post.status === 'pending_approval' && post.created_by === user.id) ||
    (event === 'approved' && post.status === 'scheduled' && isLeader === true && post.approved_by === user.id && post.created_by !== user.id) ||
    (event === 'rejected' && post.status === 'rejected' && isLeader === true);
  if (!okState) return json({ error: 'Esse aviso não vale para a situação atual do post.' }, 409);

  const smtp = await loadGroupSmtp(post.group_id, group?.name ?? 'Studio');
  if (!smtp) return json({ error: SMTP_NOT_CONFIGURED, code: 'smtp_not_configured' }, 503);

  const site = httpUrl(Deno.env.get('SITE_URL')) || httpUrl(req.headers.get('origin'));
  const dashboard = site ? new URL(`/${group?.slug ?? ''}/dashboard`, site).href : '';

  // ---- destinatários e texto
  let to: string[] = [];
  let subject = '';
  let html = '';
  let nameOf = 'Alguém do core team';
  const { data: author } = post.created_by ? await supabase.from('profiles').select('full_name, email').eq('id', post.created_by).maybeSingle() : { data: null };
  if (author?.full_name) nameOf = author.full_name;

  if (event === 'requested') {
    // O líder DESTE grupo (a lista de membros só devolve e-mails a quem é da equipe)
    const { data: leaders } = await supabase.rpc('list_group_members', { g: post.group_id });
    to = (leaders ?? []).filter((m: { role: string; email: string | null }) => m.role === 'leader' && m.email).map((m: { email: string }) => String(m.email).trim().toLowerCase()).filter((e: string) => EMAIL.test(e));
    subject = `Aprovação pendente: ${post.title}`.slice(0, 200);
    html = render({
      groupName: group?.name ?? '',
      heading: 'Um post espera a sua aprovação',
      intro: `${nameOf} preparou uma publicação e pediu a sua aprovação. Ao aprovar, ela entra na fila para o horário abaixo.`,
      post,
      button: dashboard ? { label: 'Revisar no painel', href: dashboard } : undefined,
    });
  } else {
    const email = String(author?.email ?? '').trim().toLowerCase();
    to = EMAIL.test(email) && email !== String(user.email ?? '').toLowerCase() ? [email] : [];
    if (event === 'approved') {
      subject = `Aprovado: ${post.title}`.slice(0, 200);
      html = render({ groupName: group?.name ?? '', heading: 'Seu post foi aprovado', intro: 'O líder aprovou. O post já está na fila e sai no horário abaixo (se esse horário já passou, sai em instantes).', post });
    } else {
      subject = `Ajustes pedidos: ${post.title}`.slice(0, 200);
      html = render({
        groupName: group?.name ?? '',
        heading: 'O líder pediu ajustes no seu post',
        intro: 'O post não foi aprovado. Ajuste no Studio e envie de novo, ou cancele.',
        post,
        reason: String(post.rejected_reason ?? '').trim().slice(0, 500) || undefined,
      });
    }
  }
  if (!to.length) return json({ ok: true, skipped: 'sem destinatário' });

  const text = html.replace(/<style[\s\S]*?<\/style>/g, '').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
  try {
    const transport = nodemailer.createTransport({ host: smtp.host, port: smtp.port, secure: smtp.port === 465, requireTLS: smtp.port !== 465, auth: { user: smtp.user, pass: smtp.pass }, connectionTimeout: 15_000, greetingTimeout: 15_000, socketTimeout: 30_000 });
    await transport.sendMail({ from: `"${smtp.fromName}" <${smtp.from}>`, to: `"${smtp.fromName}" <${smtp.from}>`, bcc: to, subject, html, text });
  } catch (err) {
    console.error(JSON.stringify({ event: 'notify_publication_failed', post: postId, kind: event, error: String(err) }));
    return json({ error: `O servidor de e-mail recusou o envio: ${String((err as Error)?.message ?? err)}` }, 502);
  }
  await supabase.from('social_posts').update({ notify_log: { ...(post.notify_log ?? {}), [event]: new Date().toISOString() } }).eq('id', postId);
  console.log(JSON.stringify({ event: 'notify_publication_sent', post: postId, kind: event, recipients: to.length }));
  return json({ ok: true, sent: to.length });
}
