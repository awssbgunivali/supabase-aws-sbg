// Edge Function "studio-mcp": o servidor MCP do Studio (o Claude cria materiais, projetos, tarefas e links no Studio,
// em nome de quem gerou o token pessoal em Studio > Conectar ao Claude, e SÓ no grupo daquele token).
//
// studioMcp.js é GERADO pelo repositório do Studio (studio-aws-sbg), onde ficam o código e os testes do MCP:
//   (no Studio)   npm run build:mcp
//   (aqui)         npm run functions:deploy:mcp
// verify_jwt = false (config.toml): quem chama é o Claude, com o token pessoal, e não um login do Supabase.
// Secrets: STUDIO_URL (endereço do Studio, para os links) e SITE_URL (endereço do site, para o QR e os links dos
// materiais). SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY já vêm prontos.
import { createClient } from 'npm:@supabase/supabase-js@2';
import { createMcpHandler, project, supabaseRepo } from './studioMcp.js';

const db = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!, {
  auth: { persistSession: false, autoRefreshToken: false },
});

Deno.serve(createMcpHandler({
  repo: supabaseRepo(db),
  project,
  studioUrl: Deno.env.get('STUDIO_URL') ?? '',
  siteUrl: Deno.env.get('SITE_URL') ?? '',
  supabaseUrl: Deno.env.get('SUPABASE_URL') ?? '',
}));
