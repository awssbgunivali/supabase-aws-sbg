-- AWS Student Builder Groups: esquema multi-grupo (parte 1 de 2).
--
-- Um único projeto Supabase atende vários grupos. Cada grupo (tabela `groups`) tem os próprios eventos,
-- equipe, galeria, apoiadores e membros; a conta da pessoa (`profiles`) é uma só e vale em todos.
--
-- Cargos são POR GRUPO (`group_members.role`):
--   member  : participa; aparece no mural de membros do grupo
--   speaker : palestrante (pode ser vinculado a eventos)
--   core    : core team do grupo: eventos, inscritos, galeria, apoiadores, comunicados
--   leader  : tudo do core + configura o grupo, a equipe do site e os cargos
-- E um cargo da plataforma: `platform_admins` (cria grupos, nomeia o primeiro líder).
--
-- Nada aqui é específico de um grupo: não há e-mails, nomes ou links semeados. Para criar o primeiro
-- grupo e o primeiro administrador, veja docs/PRIMEIROS-PASSOS.md.

-- ---------------------------------------------------------------- utilitários
create or replace function public.is_http_url(value text)
returns boolean
language sql
immutable
set search_path = ''
as $$
  select value is null or (value ~* '^https?://[^\s<>"]+$' and length(value) <= 500);
$$;

-- Objeto {chave: url}: toda URL precisa ser http(s) (barra "javascript:" e "data:")
create or replace function public.valid_url_map(v jsonb)
returns boolean
language sql
immutable
set search_path = ''
as $$
  select case
    when jsonb_typeof(v) <> 'object' then false
    when octet_length(v::text) > 4000 then false
    else not exists (
      select 1 from jsonb_each(v) e
      where jsonb_typeof(e.value) <> 'string' or not public.is_http_url(e.value #>> '{}')
    )
  end;
$$;

-- Texto traduzível {"pt": "...", "en": "...", "es": "..."}
create or replace function public.valid_localized(v jsonb, max_len integer)
returns boolean
language sql
immutable
set search_path = ''
as $$
  select case
    when v is null then true
    when jsonb_typeof(v) <> 'object' then false
    else octet_length(v::text) <= max_len
  end;
$$;

create or replace function public.valid_certifications(v jsonb)
returns boolean
language sql
immutable
set search_path = ''
as $$
  select case
    when jsonb_typeof(v) <> 'array' then false
    when jsonb_array_length(v) > 12 or octet_length(v::text) > 4000 then false
    else not exists (
      select 1
      from jsonb_array_elements(v) e
      where jsonb_typeof(e) <> 'object'
         or coalesce(e->>'id', '') = ''
         or length(e->>'id') > 60
         or (coalesce(e->>'url', '') <> '' and not public.is_http_url(e->>'url'))
    )
  end;
$$;

-- ---------------------------------------------------------------- perfis (conta global)
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text,
  full_name text check (full_name is null or length(full_name) <= 80),
  avatar_url text,
  headline text check (headline is null or char_length(headline) <= 80),   -- ex.: "Ciência da Computação · 5º período"
  bio text check (bio is null or char_length(bio) <= 400),
  linkedin text check (public.is_http_url(linkedin)),
  github text check (public.is_http_url(github)),
  instagram text check (public.is_http_url(instagram)),
  website text check (public.is_http_url(website)),
  certifications jsonb not null default '[]'::jsonb check (public.valid_certifications(certifications)),
  email_news boolean not null default true,
  created_at timestamptz not null default now(),
  -- A foto precisa estar na pasta do próprio usuário no bucket "avatars"
  constraint profiles_avatar_own_bucket check (
    avatar_url is null
    or (public.is_http_url(avatar_url) and avatar_url like '%/storage/v1/object/public/avatars/' || id::text || '/%')
  )
);

create table if not exists public.platform_admins (
  user_id uuid primary key references public.profiles (id) on delete cascade,
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------- grupos
create table if not exists public.groups (
  id uuid primary key default gen_random_uuid(),
  -- Endereço do grupo no site: /<slug>. Não pode colidir com rotas do site.
  slug text not null unique check (
    slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'
    and length(slug) between 2 and 40
    and slug not in ('login', 'perfil', 'admin', 'grupos', 'api', 'assets', 'fonts', 'g', 'sobre', 'equipe',
                     'eventos', 'galeria', 'membros', 'comece', 'dashboard', 'links', 'entrar')
  ),
  name text not null check (length(name) between 2 and 100),            -- "AWS Student Builder Group Univali"
  short_name text not null check (length(short_name) between 1 and 40), -- "Univali": o que aparece depois de "AWS SBG"
  institution text check (institution is null or length(institution) <= 120),  -- "Universidade do Vale do Itajaí"
  city text check (city is null or length(city) <= 80),
  country text check (country is null or length(country) <= 60),
  founded_year integer check (founded_year is null or founded_year between 2000 and 2100),
  default_lang text not null default 'pt' check (default_lang in ('pt', 'en', 'es')),
  tagline jsonb check (public.valid_localized(tagline, 1200)),          -- frase curta do topo da Home
  about jsonb check (public.valid_localized(about, 6000)),              -- texto "Sobre o grupo"
  mascot jsonb check (mascot is null or (jsonb_typeof(mascot) = 'object' and octet_length(mascot::text) <= 6000)),
  -- Redes: {"instagram": "https://...", "linkedin": "...", "meetup": "...", "youtube": "...", "whatsapp": "...", "github": "...", "discord": "..."}
  socials jsonb not null default '{}'::jsonb check (public.valid_url_map(socials)),
  -- Endereços do grupo: {"study_group": "...", "call_for_papers": "...", "sponsor_contact": "...", "linktree": "..."}
  urls jsonb not null default '{}'::jsonb check (public.valid_url_map(urls)),
  -- Chaves ligáveis: {"member_wall": true, "member_area": false, "student_day": false}
  features jsonb not null default '{"member_wall": true, "member_area": false}'::jsonb
    check (jsonb_typeof(features) = 'object' and octet_length(features::text) <= 1000),
  status text not null default 'active' check (status in ('active', 'hidden')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ---------------------------------------------------------------- participação em grupos
create table if not exists public.group_members (
  group_id uuid not null references public.groups (id) on delete cascade,
  user_id uuid not null references public.profiles (id) on delete cascade,
  role text not null default 'member' check (role in ('member', 'speaker', 'core', 'leader')),
  show_in_wall boolean not null default true,
  joined_at timestamptz not null default now(),
  primary key (group_id, user_id)
);
create index if not exists group_members_user_idx on public.group_members (user_id);
-- Um líder por grupo (a troca de liderança é feita pelo administrador da plataforma)
create unique index if not exists group_members_one_leader on public.group_members (group_id) where role = 'leader';

-- Convite por e-mail: vira participação quando a pessoa criar a conta (ou na hora, se ela já tem)
create table if not exists public.group_invites (
  group_id uuid not null references public.groups (id) on delete cascade,
  email text not null check (email = lower(email) and length(email) between 5 and 200),
  role text not null default 'member' check (role in ('member', 'speaker', 'core', 'leader')),
  invited_by uuid references public.profiles (id) on delete set null,
  created_at timestamptz not null default now(),
  primary key (group_id, email)
);
create index if not exists group_invites_email_idx on public.group_invites (email);

-- ---------------------------------------------------------------- funções de permissão
create or replace function public.is_platform_admin()
returns boolean language sql stable security definer set search_path = '' as $$
  select exists (select 1 from public.platform_admins where user_id = (select auth.uid()));
$$;

create or replace function public.group_role(g uuid)
returns text language sql stable security definer set search_path = '' as $$
  select role from public.group_members where group_id = g and user_id = (select auth.uid());
$$;

-- Core team ou líder do grupo (ou administrador da plataforma)
create or replace function public.is_group_staff(g uuid)
returns boolean language sql stable security definer set search_path = '' as $$
  select coalesce(public.group_role(g) in ('core', 'leader'), false) or public.is_platform_admin();
$$;

create or replace function public.is_group_leader(g uuid)
returns boolean language sql stable security definer set search_path = '' as $$
  select coalesce(public.group_role(g) = 'leader', false) or public.is_platform_admin();
$$;

-- A pessoa `target` é de um grupo que eu lidero/ajudo a organizar (ou se inscreveu num evento dele)?
create or replace function public.is_staff_of_user(target uuid)
returns boolean language plpgsql stable security definer set search_path = '' as $$
begin
  -- plpgsql de propósito: registrations e events só existem na parte 2
  return public.is_platform_admin()
    or exists (
      select 1 from public.group_members t
      join public.group_members me on me.group_id = t.group_id
      where t.user_id = target and me.user_id = (select auth.uid()) and me.role in ('core', 'leader')
    )
    or exists (
      select 1 from public.registrations r
      join public.events e on e.id = r.event_id
      join public.group_members me on me.group_id = e.group_id
      where r.user_id = target and me.user_id = (select auth.uid()) and me.role in ('core', 'leader')
    );
end;
$$;

-- Caminhos do Storage começam pelo id do grupo: "<group_id>/arquivo.webp"
create or replace function public.storage_group_id(name text)
returns uuid language sql immutable set search_path = '' as $$
  select case
    when split_part(name, '/', 1) ~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'
    then split_part(name, '/', 1)::uuid
  end;
$$;

-- ---------------------------------------------------------------- cadastro
-- Cria o perfil e aplica os convites pendentes do e-mail (cargo definido por quem convidou)
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  insert into public.profiles (id, email, full_name)
  values (new.id, new.email, coalesce(new.raw_user_meta_data ->> 'full_name', new.raw_user_meta_data ->> 'name'))
  on conflict (id) do nothing;

  insert into public.group_members (group_id, user_id, role)
  select i.group_id, new.id, i.role from public.group_invites i where i.email = lower(new.email)
  on conflict (group_id, user_id) do nothing;
  delete from public.group_invites where email = lower(new.email);
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------------------------------------------------------------- RLS
alter table public.profiles enable row level security;
alter table public.platform_admins enable row level security;   -- sem policies: só as funções leem
alter table public.groups enable row level security;
alter table public.group_members enable row level security;
alter table public.group_invites enable row level security;     -- sem policies: só as funções leem/escrevem

-- Perfis: o próprio, ou a equipe de um grupo a que a pessoa pertence (para inscritos e membros)
drop policy if exists "profiles: ver o próprio ou equipe" on public.profiles;
create policy "profiles: ver o próprio ou equipe" on public.profiles for select to authenticated
  using (id = (select auth.uid()) or (select public.is_staff_of_user(id)));

drop policy if exists "profiles: editar o próprio" on public.profiles;
create policy "profiles: editar o próprio" on public.profiles for update to authenticated
  using (id = (select auth.uid())) with check (id = (select auth.uid()));

-- Grupos: público vê os ativos; a equipe vê também o oculto; o líder edita os dados do grupo
drop policy if exists "groups: leitura pública" on public.groups;
create policy "groups: leitura pública" on public.groups for select to anon, authenticated
  using (status = 'active');

drop policy if exists "groups: equipe lê o próprio" on public.groups;
create policy "groups: equipe lê o próprio" on public.groups for select to authenticated
  using ((select public.is_group_staff(id)));

drop policy if exists "groups: líder edita" on public.groups;
create policy "groups: líder edita" on public.groups for update to authenticated
  using ((select public.is_group_leader(id))) with check ((select public.is_group_leader(id)));

-- Participações: cada um vê as próprias; a equipe vê as do grupo. Mudanças de cargo só pelas funções abaixo.
drop policy if exists "group_members: ver" on public.group_members;
create policy "group_members: ver" on public.group_members for select to authenticated
  using (user_id = (select auth.uid()) or (select public.is_group_staff(group_id)));

drop policy if exists "group_members: ajustar o próprio mural" on public.group_members;
create policy "group_members: ajustar o próprio mural" on public.group_members for update to authenticated
  using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));

drop policy if exists "group_members: sair do grupo" on public.group_members;
create policy "group_members: sair do grupo" on public.group_members for delete to authenticated
  using (user_id = (select auth.uid()) and role <> 'leader');

-- ---------------------------------------------------------------- funções chamadas pelo site
-- Entrar num grupo (vira "member")
create or replace function public.join_group(g uuid)
returns void language plpgsql security definer set search_path = '' as $$
begin
  if (select auth.uid()) is null then raise exception 'Faça login' using errcode = '42501'; end if;
  if not exists (select 1 from public.groups where id = g and status = 'active') then
    raise exception 'Grupo não encontrado' using errcode = 'P0002';
  end if;
  insert into public.group_members (group_id, user_id, role) values (g, (select auth.uid()), 'member')
  on conflict (group_id, user_id) do nothing;
end;
$$;

-- O líder define o cargo de alguém do grupo
create or replace function public.set_member_role(g uuid, target uuid, new_role text)
returns void language plpgsql security definer set search_path = '' as $$
begin
  if not public.is_group_leader(g) then raise exception 'Apenas o líder pode alterar cargos' using errcode = '42501'; end if;
  if new_role not in ('member', 'speaker', 'core') then raise exception 'Cargo inválido: %', new_role using errcode = '22023'; end if;
  if target = (select auth.uid()) then raise exception 'O líder não pode alterar o próprio cargo' using errcode = '42501'; end if;
  update public.group_members set role = new_role where group_id = g and user_id = target and role <> 'leader';
end;
$$;

-- O líder liga/desliga o mural de outra pessoa
create or replace function public.set_member_wall(g uuid, target uuid, visible boolean)
returns void language plpgsql security definer set search_path = '' as $$
begin
  if not public.is_group_leader(g) then raise exception 'Apenas o líder pode mudar o mural de outra pessoa' using errcode = '42501'; end if;
  if visible and coalesce(trim((select full_name from public.profiles where id = target)), '') = '' then
    raise exception 'A pessoa precisa ter o nome preenchido para aparecer no mural' using errcode = '22023';
  end if;
  update public.group_members set show_in_wall = visible where group_id = g and user_id = target;
end;
$$;

-- O líder tira alguém do grupo
create or replace function public.remove_member(g uuid, target uuid)
returns void language plpgsql security definer set search_path = '' as $$
begin
  if not public.is_group_leader(g) then raise exception 'Apenas o líder pode remover membros' using errcode = '42501'; end if;
  delete from public.group_members where group_id = g and user_id = target and role <> 'leader';
end;
$$;

-- O líder adiciona alguém pelo e-mail: entra na hora se a conta já existe; senão fica convidado
create or replace function public.add_member_by_email(g uuid, member_email text, member_role text default 'member')
returns text language plpgsql security definer set search_path = '' as $$
declare
  mail text := lower(trim(member_email));
  uid uuid;
begin
  if not public.is_group_leader(g) then raise exception 'Apenas o líder pode adicionar pessoas' using errcode = '42501'; end if;
  if member_role not in ('member', 'speaker', 'core') then raise exception 'Cargo inválido: %', member_role using errcode = '22023'; end if;
  if mail !~ '^[^\s@<>()"'',;]+@[^\s@<>()"'',;]+\.[^\s@<>()"'',;]{2,}$' then raise exception 'E-mail inválido' using errcode = '22023'; end if;
  select id into uid from public.profiles where lower(email) = mail;
  if uid is not null then
    insert into public.group_members (group_id, user_id, role) values (g, uid, member_role)
    on conflict (group_id, user_id) do update set role = excluded.role where public.group_members.role <> 'leader';
    return 'added';
  end if;
  insert into public.group_invites (group_id, email, role, invited_by) values (g, mail, member_role, (select auth.uid()))
  on conflict (group_id, email) do update set role = excluded.role;
  return 'invited';
end;
$$;

-- Equipe do grupo vê quem são os membros (com e-mail) e os convites pendentes
create or replace function public.list_group_members(g uuid)
returns table (
  user_id uuid, full_name text, email text, avatar_url text, headline text, bio text, linkedin text, github text,
  role text, show_in_wall boolean, joined_at timestamptz, pending boolean
)
language plpgsql stable security definer set search_path = '' as $$
begin
  if not public.is_group_staff(g) then raise exception 'Apenas a equipe do grupo' using errcode = '42501'; end if;
  return query
    select m.user_id, p.full_name, p.email, p.avatar_url, p.headline, p.bio, p.linkedin, p.github,
           m.role, m.show_in_wall, m.joined_at, false
    from public.group_members m join public.profiles p on p.id = m.user_id
    where m.group_id = g
    union all
    select null::uuid, null::text, i.email, null::text, null::text, null::text, null::text, null::text,
           i.role, false, i.created_at, true
    from public.group_invites i where i.group_id = g
    order by 9, 3;
end;
$$;

-- Mural público do grupo: só quem optou por aparecer; nunca expõe o e-mail
create or replace function public.get_member_wall(g uuid)
returns table (
  id uuid, full_name text, avatar_url text, headline text, bio text,
  linkedin text, github text, instagram text, website text, role text,
  joined_at timestamptz, certifications jsonb
)
language sql stable security definer set search_path = '' as $$
  select p.id, p.full_name, p.avatar_url, p.headline, p.bio, p.linkedin, p.github, p.instagram, p.website,
         m.role, m.joined_at, p.certifications
  from public.group_members m
  join public.profiles p on p.id = m.user_id
  join public.groups gr on gr.id = m.group_id and gr.status = 'active'
  where m.group_id = g and m.show_in_wall and coalesce(trim(p.full_name), '') <> ''
  order by (m.role = 'leader') desc, (m.role = 'core') desc, m.joined_at;
$$;

-- Quantas pessoas recebem comunicados do grupo
create or replace function public.count_group_recipients(g uuid)
returns table (with_news bigint, total bigint)
language plpgsql stable security definer set search_path = '' as $$
begin
  if not public.is_group_staff(g) then raise exception 'Apenas a equipe do grupo' using errcode = '42501'; end if;
  return query
    select count(*) filter (where p.email_news), count(*)
    from public.group_members m join public.profiles p on p.id = m.user_id
    where m.group_id = g and p.email is not null;
end;
$$;

-- E-mails dos destinatários de um comunicado (usada pela Edge Function send-announcement)
create or replace function public.group_announcement_emails(g uuid)
returns table (email text)
language plpgsql stable security definer set search_path = '' as $$
begin
  if not public.is_group_staff(g) then raise exception 'Apenas a equipe do grupo' using errcode = '42501'; end if;
  return query
    select p.email from public.group_members m join public.profiles p on p.id = m.user_id
    where m.group_id = g and p.email_news and p.email is not null;
end;
$$;

-- ---------------------------------------------------------------- administração da plataforma
-- Cria um grupo e define o líder (entra na hora se a conta já existe; senão, ao criar a conta)
create or replace function public.create_group(p_slug text, p_name text, p_short_name text, p_leader_email text)
returns uuid language plpgsql security definer set search_path = '' as $$
declare
  gid uuid;
  mail text := lower(trim(p_leader_email));
  uid uuid;
begin
  if not public.is_platform_admin() then raise exception 'Apenas o administrador da plataforma' using errcode = '42501'; end if;
  insert into public.groups (slug, name, short_name) values (lower(trim(p_slug)), trim(p_name), trim(p_short_name)) returning id into gid;
  select id into uid from public.profiles where lower(email) = mail;
  if uid is not null then
    insert into public.group_members (group_id, user_id, role) values (gid, uid, 'leader');
  else
    insert into public.group_invites (group_id, email, role, invited_by) values (gid, mail, 'leader', (select auth.uid()));
  end if;
  return gid;
end;
$$;

-- Troca o líder de um grupo
create or replace function public.set_group_leader(g uuid, leader_email text)
returns text language plpgsql security definer set search_path = '' as $$
declare
  mail text := lower(trim(leader_email));
  uid uuid;
begin
  if not public.is_platform_admin() then raise exception 'Apenas o administrador da plataforma' using errcode = '42501'; end if;
  select id into uid from public.profiles where lower(email) = mail;
  update public.group_members set role = 'core' where group_id = g and role = 'leader';
  delete from public.group_invites where group_id = g and role = 'leader';
  if uid is not null then
    insert into public.group_members (group_id, user_id, role) values (g, uid, 'leader')
    on conflict (group_id, user_id) do update set role = 'leader';
    return 'added';
  end if;
  insert into public.group_invites (group_id, email, role, invited_by) values (g, mail, 'leader', (select auth.uid()))
  on conflict (group_id, email) do update set role = 'leader';
  return 'invited';
end;
$$;

create or replace function public.set_group_status(g uuid, new_status text)
returns void language plpgsql security definer set search_path = '' as $$
begin
  if not public.is_platform_admin() then raise exception 'Apenas o administrador da plataforma' using errcode = '42501'; end if;
  update public.groups set status = new_status, updated_at = now() where id = g;
end;
$$;

-- Todos os grupos, inclusive ocultos, para o painel da plataforma
create or replace function public.admin_list_groups()
returns table (id uuid, slug text, name text, short_name text, status text, members bigint, leader_name text, leader_email text, created_at timestamptz)
language plpgsql stable security definer set search_path = '' as $$
begin
  if not public.is_platform_admin() then raise exception 'Apenas o administrador da plataforma' using errcode = '42501'; end if;
  return query
    select g.id, g.slug, g.name, g.short_name, g.status,
           (select count(*) from public.group_members m where m.group_id = g.id),
           (select p.full_name from public.group_members m join public.profiles p on p.id = m.user_id where m.group_id = g.id and m.role = 'leader'),
           coalesce((select p.email from public.group_members m join public.profiles p on p.id = m.user_id where m.group_id = g.id and m.role = 'leader'),
                    (select i.email from public.group_invites i where i.group_id = g.id and i.role = 'leader' limit 1)),
           g.created_at
    from public.groups g order by g.created_at;
end;
$$;
