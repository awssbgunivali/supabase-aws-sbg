-- 1) Configurações da PLATAFORMA editáveis no /admin (nome, região, textos do programa) — sem deploy.
-- 2) Pedidos de novo grupo feitos pelo site, aprovados pelo administrador.
-- 3) Domínio próprio por grupo (ex.: univali.meusite.org), definido pelo administrador.
-- 4) Inscrição em evento só onde faz sentido (evento visível, grupo ativo com inscrição pelo site ligada).
-- 5) Limpeza: colunas de apoiadores que só serviam a uma ferramenta externa.

-- ---------------------------------------------------------------- 1. plataforma
create table if not exists public.platform_settings (
  id boolean primary key default true check (id),
  name text check (name is null or length(name) between 2 and 100),          -- vazio = nome padrão do deploy
  region text check (region is null or length(region) <= 40),                -- ex.: "Brasil"
  tagline jsonb check (public.valid_localized(tagline, 1200)),               -- frase do topo da página inicial
  contact_email text check (contact_email is null or contact_email ~ '^[^\s@<>()"'',;]+@[^\s@<>()"'',;]+\.[^\s@<>()"'',;]{2,}$'),
  socials jsonb not null default '{}'::jsonb check (public.valid_url_map(socials)),
  -- Textos do programa que substituem os padrões do site: { stats: [...], pillars: [...], rewards: [...], faq: [...] }
  content jsonb not null default '{}'::jsonb check (jsonb_typeof(content) = 'object' and octet_length(content::text) <= 60000),
  updated_at timestamptz not null default now()
);
insert into public.platform_settings (id) values (true) on conflict (id) do nothing;

alter table public.platform_settings enable row level security;
drop policy if exists "platform_settings: leitura pública" on public.platform_settings;
create policy "platform_settings: leitura pública" on public.platform_settings for select to anon, authenticated using (true);
drop policy if exists "platform_settings: admin edita" on public.platform_settings;
create policy "platform_settings: admin edita" on public.platform_settings for update to authenticated
  using ((select public.is_platform_admin())) with check ((select public.is_platform_admin()));
grant select on public.platform_settings to anon, authenticated;
grant update (name, region, tagline, contact_email, socials, content, updated_at) on public.platform_settings to authenticated;

-- ---------------------------------------------------------------- 2. pedidos de novo grupo
create table if not exists public.group_requests (
  id uuid primary key default gen_random_uuid(),
  name text not null check (length(name) between 2 and 100),
  short_name text not null check (length(short_name) between 1 and 40),
  institution text check (institution is null or length(institution) <= 120),
  city text check (city is null or length(city) <= 80),
  country text check (country is null or length(country) <= 60),
  message text check (message is null or length(message) <= 2000),
  contact_email text not null check (contact_email ~ '^[^\s@<>()"'',;]+@[^\s@<>()"'',;]+\.[^\s@<>()"'',;]{2,}$'),
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  review_note text check (review_note is null or length(review_note) <= 1000),
  group_id uuid references public.groups (id) on delete set null,
  created_by uuid not null default auth.uid() references public.profiles (id) on delete cascade,
  reviewed_by uuid references public.profiles (id) on delete set null,
  created_at timestamptz not null default now(),
  reviewed_at timestamptz
);
create index if not exists group_requests_status_idx on public.group_requests (status, created_at);
create index if not exists group_requests_created_by_idx on public.group_requests (created_by);

alter table public.group_requests enable row level security;
drop policy if exists "group_requests: ver os próprios ou admin" on public.group_requests;
create policy "group_requests: ver os próprios ou admin" on public.group_requests for select to authenticated
  using (created_by = (select auth.uid()) or (select public.is_platform_admin()));
grant select on public.group_requests to authenticated;

-- Pedido feito pelo site: precisa de login; um pedido em análise por pessoa
create or replace function public.submit_group_request(
  p_name text, p_short_name text, p_institution text, p_city text, p_country text, p_message text, p_contact_email text
) returns uuid language plpgsql security definer set search_path = '' as $$
declare rid uuid;
begin
  if (select auth.uid()) is null then raise exception 'Faça login para pedir um grupo' using errcode = '42501'; end if;
  if exists (select 1 from public.group_requests where created_by = (select auth.uid()) and status = 'pending') then
    raise exception 'Você já tem um pedido em análise' using errcode = '22023';
  end if;
  insert into public.group_requests (name, short_name, institution, city, country, message, contact_email)
  values (trim(p_name), trim(p_short_name), nullif(trim(coalesce(p_institution, '')), ''), nullif(trim(coalesce(p_city, '')), ''),
          nullif(trim(coalesce(p_country, '')), ''), nullif(trim(coalesce(p_message, '')), ''), lower(trim(p_contact_email)))
  returning id into rid;
  return rid;
end;
$$;

-- Administrador aprova: cria o grupo com o endereço escolhido, já com os dados do pedido, e o contato vira líder
create or replace function public.approve_group_request(req uuid, p_slug text)
returns uuid language plpgsql security definer set search_path = '' as $$
declare
  r public.group_requests;
  gid uuid;
begin
  if not public.is_platform_admin() then raise exception 'Apenas o administrador da plataforma' using errcode = '42501'; end if;
  select * into r from public.group_requests where id = req and status = 'pending' for update;
  if not found then raise exception 'Pedido não encontrado ou já analisado' using errcode = 'P0002'; end if;
  gid := public.create_group(p_slug, r.name, r.short_name, r.contact_email);
  update public.groups set institution = r.institution, city = r.city, country = r.country where id = gid;
  update public.group_requests set status = 'approved', group_id = gid, reviewed_by = (select auth.uid()), reviewed_at = now() where id = req;
  return gid;
end;
$$;

create or replace function public.reject_group_request(req uuid, note text)
returns void language plpgsql security definer set search_path = '' as $$
begin
  if not public.is_platform_admin() then raise exception 'Apenas o administrador da plataforma' using errcode = '42501'; end if;
  update public.group_requests
    set status = 'rejected', review_note = nullif(trim(coalesce(note, '')), ''), reviewed_by = (select auth.uid()), reviewed_at = now()
    where id = req and status = 'pending';
  if not found then raise exception 'Pedido não encontrado ou já analisado' using errcode = 'P0002'; end if;
end;
$$;

-- ---------------------------------------------------------------- 3. domínio próprio do grupo
alter table public.groups add column if not exists domain text unique
  check (domain is null or (domain ~ '^[a-z0-9]([a-z0-9-]*[a-z0-9])?(\.[a-z0-9]([a-z0-9-]*[a-z0-9])?)+$' and length(domain) <= 200));

create or replace function public.set_group_domain(g uuid, new_domain text)
returns void language plpgsql security definer set search_path = '' as $$
begin
  if not public.is_platform_admin() then raise exception 'Apenas o administrador da plataforma' using errcode = '42501'; end if;
  update public.groups set domain = nullif(lower(trim(coalesce(new_domain, ''))), ''), updated_at = now() where id = g;
end;
$$;

-- O painel da plataforma passa a mostrar o domínio de cada grupo (o tipo de retorno muda: recria a função)
drop function if exists public.admin_list_groups();
create function public.admin_list_groups()
returns table (id uuid, slug text, name text, short_name text, status text, domain text, members bigint, leader_name text, leader_email text, created_at timestamptz)
language plpgsql stable security definer set search_path = '' as $$
begin
  if not public.is_platform_admin() then raise exception 'Apenas o administrador da plataforma' using errcode = '42501'; end if;
  return query
    select g.id, g.slug, g.name, g.short_name, g.status, g.domain,
           (select count(*) from public.group_members m where m.group_id = g.id),
           (select p.full_name from public.group_members m join public.profiles p on p.id = m.user_id where m.group_id = g.id and m.role = 'leader'),
           coalesce((select p.email from public.group_members m join public.profiles p on p.id = m.user_id where m.group_id = g.id and m.role = 'leader'),
                    (select i.email from public.group_invites i where i.group_id = g.id and i.role = 'leader' limit 1)),
           g.created_at
    from public.groups g order by g.created_at;
end;
$$;
revoke execute on function public.admin_list_groups() from public, anon;
grant execute on function public.admin_list_groups() to authenticated;

-- ---------------------------------------------------------------- 4. inscrição em evento
drop policy if exists "registrations: inscrever a si mesmo" on public.registrations;
create policy "registrations: inscrever a si mesmo" on public.registrations for insert to authenticated
  with check (
    user_id = (select auth.uid())
    and exists (
      select 1 from public.events e join public.groups g on g.id = e.group_id
      where e.id = event_id and not e.is_hidden and g.status = 'active'
        and coalesce((g.features ->> 'member_area')::boolean, false)
    )
  );

-- ---------------------------------------------------------------- 5. limpeza
alter table public.sponsors drop column if exists in_posts;
alter table public.sponsors drop column if exists post_scale;

-- ---------------------------------------------------------------- permissões das funções
revoke execute on function public.submit_group_request(text, text, text, text, text, text, text) from public, anon;
revoke execute on function public.approve_group_request(uuid, text) from public, anon;
revoke execute on function public.reject_group_request(uuid, text) from public, anon;
revoke execute on function public.set_group_domain(uuid, text) from public, anon;
grant execute on function public.submit_group_request(text, text, text, text, text, text, text) to authenticated;
grant execute on function public.approve_group_request(uuid, text) to authenticated;
grant execute on function public.reject_group_request(uuid, text) to authenticated;
grant execute on function public.set_group_domain(uuid, text) to authenticated;
