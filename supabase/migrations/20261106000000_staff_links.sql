-- Links da equipe: links úteis para quem organiza os grupos (avaliação do grupo, voucher, resgate de prêmios...).
-- Uma lista só para a plataforma inteira, cadastrada pelo administrador. Só líderes e core team (de qualquer
-- grupo) e os administradores enxergam; o público e os membros comuns não.

create table if not exists public.staff_links (
  id uuid primary key default gen_random_uuid(),
  title jsonb not null check (jsonb_typeof(title) = 'object' and coalesce(title ->> 'pt', '') <> '' and octet_length(title::text) <= 600),
  description jsonb check (public.valid_localized(description, 1500)),
  url text not null check (url ~* '^https?://[^\s<>"]+$' and length(url) <= 500),
  -- Agrupa os links no painel (ex.: "Programa AWS", "Prêmios"); vazio = "Geral"
  category text check (category is null or length(category) <= 60),
  sort_order integer not null default 0,
  updated_by uuid default auth.uid() references public.profiles (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists staff_links_order_idx on public.staff_links (category, sort_order, created_at);

-- Líder ou core team em algum grupo (ou administrador da plataforma)
create or replace function public.is_any_group_staff()
returns boolean language sql stable security definer set search_path = '' as $$
  select public.is_platform_admin()
    or exists (select 1 from public.group_members where user_id = (select auth.uid()) and role in ('core', 'leader'));
$$;
revoke execute on function public.is_any_group_staff() from public, anon;
grant execute on function public.is_any_group_staff() to authenticated;

alter table public.staff_links enable row level security;

drop policy if exists "staff_links: equipe dos grupos lê" on public.staff_links;
create policy "staff_links: equipe dos grupos lê" on public.staff_links for select to authenticated
  using ((select public.is_any_group_staff()));
drop policy if exists "staff_links: admin insere" on public.staff_links;
create policy "staff_links: admin insere" on public.staff_links for insert to authenticated
  with check ((select public.is_platform_admin()));
drop policy if exists "staff_links: admin edita" on public.staff_links;
create policy "staff_links: admin edita" on public.staff_links for update to authenticated
  using ((select public.is_platform_admin())) with check ((select public.is_platform_admin()));
drop policy if exists "staff_links: admin remove" on public.staff_links;
create policy "staff_links: admin remove" on public.staff_links for delete to authenticated
  using ((select public.is_platform_admin()));

revoke all on public.staff_links from anon;
grant select, insert, update, delete on public.staff_links to authenticated;
