-- Perfil no AWS Builder Center (builder.aws.com) no perfil da pessoa: aparece no mural de membros e no card da
-- Equipe (inclusive o do líder, que vem do perfil). As funções públicas passam a devolver o campo; mudar as
-- colunas devolvidas exige recriar cada função (create or replace não troca o tipo de retorno).

alter table public.profiles add column if not exists builder_center text
  check (builder_center is null or (public.is_http_url(builder_center) and builder_center ~* '^https://([a-z0-9-]+\.)*builder\.aws\.com/'));
grant update (builder_center) on public.profiles to authenticated;

-- Mural do grupo
drop function if exists public.get_member_wall(uuid);
create function public.get_member_wall(g uuid)
returns table (
  id uuid, full_name text, avatar_url text, headline text, bio text,
  linkedin text, github text, instagram text, website text, builder_center text, role text,
  joined_at timestamptz, certifications jsonb
)
language sql stable security definer set search_path = '' as $$
  select p.id, p.full_name, p.avatar_url, p.headline, p.bio, p.linkedin, p.github, p.instagram, p.website, p.builder_center,
         m.role, m.joined_at, p.certifications
  from public.group_members m
  join public.profiles p on p.id = m.user_id
  join public.groups gr on gr.id = m.group_id and gr.status = 'active'
  where m.group_id = g and m.show_in_wall and coalesce(trim(p.full_name), '') <> ''
  order by (m.role = 'leader') desc, (m.role = 'core') desc, m.joined_at;
$$;

-- Mural de todos os grupos
drop function if exists public.get_program_wall();
create function public.get_program_wall()
returns table (
  id uuid, full_name text, avatar_url text, headline text, bio text,
  linkedin text, github text, instagram text, website text, builder_center text,
  certifications jsonb, groups jsonb, joined_at timestamptz
)
language sql stable security definer set search_path = '' as $$
  select p.id, p.full_name, p.avatar_url, p.headline, p.bio, p.linkedin, p.github, p.instagram, p.website, p.builder_center,
         p.certifications,
         jsonb_agg(jsonb_build_object('slug', g.slug, 'short_name', g.short_name, 'role', m.role)
                   order by (m.role = 'leader') desc, (m.role = 'core') desc, m.joined_at),
         min(m.joined_at)
  from public.group_members m
  join public.profiles p on p.id = m.user_id
  join public.groups g on g.id = m.group_id and g.status = 'active'
  where m.show_in_wall and coalesce(trim(p.full_name), '') <> ''
  group by p.id
  order by bool_or(m.role = 'leader') desc, bool_or(m.role = 'core') desc, min(m.joined_at);
$$;

-- Perfis vinculados à Equipe
drop function if exists public.get_team_profiles(uuid);
create function public.get_team_profiles(g uuid)
returns table (
  id uuid, full_name text, headline text, bio text, avatar_url text,
  linkedin text, github text, instagram text, website text, builder_center text, certifications jsonb
)
language sql stable security definer set search_path = '' as $$
  select distinct p.id, p.full_name, p.headline, p.bio, p.avatar_url, p.linkedin, p.github, p.instagram, p.website, p.builder_center, p.certifications
  from public.team_members tm
  join public.profiles p on p.id = tm.profile_id
  where tm.group_id = g and (not public.team_year_hidden(tm.group_id, tm.year) or public.is_group_staff(g));
$$;

-- Líder do grupo na Equipe
drop function if exists public.get_group_leader(uuid);
create function public.get_group_leader(g uuid)
returns table (
  id uuid, full_name text, headline text, bio text, avatar_url text,
  linkedin text, github text, instagram text, website text, builder_center text, certifications jsonb
)
language sql stable security definer set search_path = '' as $$
  select p.id, p.full_name, p.headline, p.bio, p.avatar_url, p.linkedin, p.github, p.instagram, p.website, p.builder_center, p.certifications
  from public.group_members m
  join public.profiles p on p.id = m.user_id
  join public.groups gr on gr.id = m.group_id
  where m.group_id = g and m.role = 'leader' and (gr.status = 'active' or public.is_group_staff(g))
  limit 1;
$$;

revoke execute on function public.get_member_wall(uuid), public.get_program_wall(), public.get_team_profiles(uuid), public.get_group_leader(uuid) from public;
grant execute on function public.get_member_wall(uuid), public.get_program_wall(), public.get_team_profiles(uuid), public.get_group_leader(uuid) to anon, authenticated;
