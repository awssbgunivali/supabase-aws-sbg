# Como contribuir

Este repositório guarda o banco (migrations), as regras de acesso (RLS) e as funções do site dos AWS Student
Builder Groups.

## Regras para migrations

- **Uma migration nova para cada mudança.** Nunca edite uma migration que já foi aplicada em algum ambiente.
- **Tudo por grupo.** Conteúdo novo ganha `group_id`, RLS pela equipe do próprio grupo (`is_group_staff`,
  `is_group_leader`) e, quando for público, leitura só do que for público.
- **Nada de dados reais nas migrations** (e-mails, nomes, links de um grupo). Dados de um grupo ficam em
  arquivos `*.local.sql`, que o Git ignora.
- **Teste de permissão para toda regra nova** em `supabase/tests/10_permissions.sql`.

## Antes de abrir um pull request

```bash
npm run test:db   # precisa de Docker: sobe um Postgres, aplica as migrations e confere as permissões
```

Falhas de segurança: veja `SECURITY.md`.
