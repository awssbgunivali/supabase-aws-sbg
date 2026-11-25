# Primeiros passos

Um projeto Supabase atende vários grupos. Estes passos só se fazem uma vez.

## 1. Aplicar o esquema

```bash
npm install
export SUPABASE_PROJECT_REF=<ref do projeto>   # Project Settings > General
npm run db:link
npm run db:push
```

As migrations de `supabase/migrations` criam as tabelas, as regras de acesso (RLS) e os buckets.


### Ícones e favicons (bucket `brand`)

O ícone do programa e os favicons do site e do Studio **não vêm nos repositórios**: ficam no bucket público `brand`
(criado pela migration `20261112000000_brand_bucket.sql`). Suba pelo painel (*Storage → brand*): `site/sbg-icon.svg`,
`site/favicon.ico`, `site/apple-touch-icon.png` e `studio/studio-icon.svg`. A logo do apoiador padrão da AWS vai no bucket
`sponsors`, em `global/aws.svg`. Sem esses arquivos o site funciona: o chip e o favicon não aparecem.

## 2. Autenticação

No painel do Supabase: Authentication > Providers, ligue GitHub e/ou Google. Em URL Configuration,
adicione a URL do site (ex.: `http://localhost:5173/**` e a de produção) em Redirect URLs.

## 3. Primeiro administrador da plataforma

1. Entre no site com a sua conta (isso cria o seu perfil).
2. No SQL Editor:

```sql
insert into public.platform_admins (user_id)
select id from public.profiles where email = 'voce@exemplo.com';
```

## 4. Criar o primeiro grupo

Pelo site, em `/admin` (só administradores), ou pelo SQL Editor:

```sql
select public.create_group('meu-grupo', 'AWS Student Builder Group Minha Universidade', 'Minha Universidade', 'lider@exemplo.com');
```

O líder entra na hora se já tiver conta; se não, assim que criar a conta. A partir daí, o líder configura
tudo em `/<slug>/dashboard`: dados e redes do grupo, equipe, eventos, galeria, apoiadores e membros.

## E-mails (comunicados)

Cada grupo envia pelo **próprio servidor de e-mail (SMTP)**. O líder cadastra os dados na aba **Comunicados** do
painel do grupo (servidor, porta, usuário, senha e e-mail de envio) e manda um e-mail de teste para conferir.
A senha fica criptografada no Supabase Vault e nunca volta para o navegador. Não há SMTP único da plataforma.

Para o envio funcionar, publique a função (uma vez) e, se quiser, defina os secrets opcionais:

```bash
npm run functions:deploy                         # publica só a send-announcement
npx supabase secrets set SITE_URL=https://seu-site ALLOWED_ORIGINS=https://seu-site
```

## Plataforma, pedidos de grupo e domínios

- **Nome e textos da plataforma:** em `/admin` > Plataforma (nome, região, frase da página inicial, redes e os
  textos do programa: números, pilares, benefícios e FAQ). Sem nada salvo, valem os padrões do site.
- **Pedidos de novo grupo:** qualquer pessoa logada pede em `/grupos/novo`; você aprova ou recusa em `/admin`.
  Ao aprovar, o grupo é criado e quem pediu vira o líder.
- **Domínio próprio de um grupo:** em `/admin`, botão do globo no grupo (ex.: `univali.meusite.org`). Depois:
  1. aponte o DNS desse domínio para o mesmo site (na Cloudflare, adicione o domínio ao Worker);
  2. no Supabase, em Authentication > URL Configuration, adicione `https://univali.meusite.org/**` às Redirect URLs;
  3. no site, defina `VITE_PLATFORM_URL` (endereço principal), para os links de volta à plataforma;
  4. para o login valer em todos os subdomínios, defina `VITE_AUTH_COOKIE_DOMAIN=meusite.org`.

## Dados reais de um grupo

Arquivos `*.local.sql` ficam fora do Git: use-os para dados de um grupo de verdade (equipe, palestrantes...)
que você quer carregar no seu banco, como o `supabase/seed-univali.local.sql`.
