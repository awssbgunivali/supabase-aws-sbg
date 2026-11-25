// CORS restrito aos domínios do site. As funções já exigem login e cargo de equipe; isto só impede que
// outros sites chamem a função a partir do navegador de alguém logado.
//
// Configure no Supabase (Edge Functions → Secrets):  ALLOWED_ORIGINS=https://meusite.exemplo,https://grupo.meusite.exemplo
// Sem a variável, vale a lista padrão abaixo (+ localhost para desenvolvimento).
const DEFAULT_ORIGINS: string[] = []; // sem ALLOWED_ORIGINS só o localhost (desenvolvimento) é aceito
const DEV = /^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/;

const allowed = (Deno.env.get('ALLOWED_ORIGINS') ?? DEFAULT_ORIGINS.join(','))
  .split(',')
  .map((o) => o.trim().replace(/\/$/, ''))
  .filter(Boolean);

/** Aplica o Access-Control-Allow-Origin certo à resposta (só para origens autorizadas). */
export function withCors(req: Request, res: Response): Response {
  const origin = req.headers.get('Origin') ?? '';
  const headers = new Headers(res.headers);
  headers.delete('Access-Control-Allow-Origin');
  if (origin && (allowed.includes(origin) || DEV.test(origin))) {
    headers.set('Access-Control-Allow-Origin', origin);
    headers.append('Vary', 'Origin');
  }
  return new Response(res.body, { status: res.status, statusText: res.statusText, headers });
}
