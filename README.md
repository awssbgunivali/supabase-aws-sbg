# Supabase · AWS Student Builder Groups

Banco, autenticação, armazenamento e funções de e-mail do [site](../site-aws-sbg). **Um projeto Supabase atende
vários grupos**: todo conteúdo tem `group_id`, e os cargos são por grupo.

> **Projeto da comunidade, não oficial.** Este projeto é feito por estudantes e voluntários da comunidade AWS Student Builder Groups. Não é um produto oficial da AWS, nem é mantido ou endossado pela Amazon Web Services. AWS e Amazon Web Services são marcas da Amazon.com, Inc. ou de suas afiliadas.


## Modelo

| Tabela | O que guarda |
|---|---|
| `profiles` | A conta da pessoa (nome, foto, bio, redes, certificações). Uma só, vale em todos os grupos |
| `groups` | Cada grupo: nome, instituição, textos, redes, links, recursos, símbolo, logo, cor, domínio próprio, status |
| `group_members` | Quem participa de cada grupo e com qual cargo (`member`, `speaker`, `core`, `leader`) |
| `group_invites` | Convites por e-mail; viram participação quando a pessoa cria a conta |
| `platform_admins` | Administradores da plataforma (criam grupos e nomeiam líderes) |
| `events`, `registrations` | Eventos do grupo e inscrições |
| `team_members`, `team_years` | Equipe do site por gestão (ano), com gestões ocultas |
| `sponsors` | Apoiadores do grupo; `group_id` nulo = apoiador do programa (aparece em todos) |
| `gallery_photos` | Fotos do grupo |
| `announcements` | Histórico de comunicados por e-mail |
| `group_email_settings` | Servidor de e-mail (SMTP) de cada grupo; a senha fica no Supabase Vault |
| `platform_settings` | Nome, região e textos do programa, editáveis no `/admin` |
| `group_requests` | Pedidos de novo grupo feitos pelo site, aprovados no `/admin` |
| `staff_links` | Links úteis para líderes e core team de todos os grupos (cadastro no `/admin`) |

Arquivos no Storage ficam em `<group_id>/...` (buckets `gallery`, `team`, `speakers`, `sponsors`) ou `<user_id>/...` (`avatars`).

Quem pode o quê (RLS): leitura pública só do que é público; escrita pela equipe **do próprio grupo**; o cargo nunca é
editável direto, só pelas funções (`set_member_role`, `add_member_by_email`, `create_group`...).

## Começando

Veja [`docs/PRIMEIROS-PASSOS.md`](docs/PRIMEIROS-PASSOS.md): aplicar o esquema, ligar o login, criar o primeiro
administrador e o primeiro grupo.

## Pastas

```
supabase/migrations/    esquema multi-grupo (é o que roda)
supabase/functions/     send-announcement (comunicados por grupo)
supabase/seed.sql       grupo de exemplo, só para desenvolvimento local
supabase/tests/         testes de permissão (RLS): `npm run test:db` (precisa de Docker)
*.local.sql             dados reais de um grupo, só na sua máquina (fora do Git)
supabase/legacy-univali/  esquema antigo (um grupo só), só local e fora do Git; NÃO é aplicado
```

Só a função `send-announcement` (comunicados por e-mail) faz parte deste repositório.

## Testes

```bash
npm run test:db   # sobe um Postgres no Docker, aplica as migrations e confere as permissões entre grupos
```

Toda mudança em migration deve manter esses testes passando (e ganhar um teste novo quando mexer em permissão).

## Licença

MIT (veja `LICENSE`). Marcas e materiais da Amazon não estão cobertos pela licença.
