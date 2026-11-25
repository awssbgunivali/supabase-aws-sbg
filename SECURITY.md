# Política de segurança

## Reportando uma vulnerabilidade

Encontrou uma falha de segurança? **Não abra uma issue pública.** Reporte de forma privada pela aba
[Security → Report a vulnerability](../../security/advisories/new) do GitHub, ou fale direto com os mantenedores.

Inclua o máximo de detalhes: passos para reproduzir, impacto e, se possível, uma sugestão de correção.
Responderemos o quanto antes e avisaremos quando a correção estiver publicada.

## O que é sensível neste projeto

- **Regras de acesso do banco (RLS):** um líder nunca pode mexer em outro grupo; ninguém muda o próprio cargo.
  Qualquer mudança nelas precisa passar nos testes de permissão (`npm run test:db` no repositório do Supabase).
- **Senhas de e-mail (SMTP) dos grupos:** ficam no Supabase Vault e só a função de envio as lê.
- **Chaves:** a chave *publishable* do Supabase é pública por design; a *service_role* nunca vai para o navegador
  nem para o repositório.
