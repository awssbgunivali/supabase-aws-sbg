-- Mural de membros de TODOS os grupos (página do programa).
-- Uma linha por pessoa, com a lista dos grupos em que ela escolheu aparecer (e o cargo em cada um).
-- Só entram pessoas com nome, em grupos ativos, e que ligaram "aparecer no mural" naquele grupo.
-- Nunca expõe e-mail.

create or replace function public.get_program_wall()
returns table (
  id uuid, full_name text, avatar_url text, headline text, bio text,
  linkedin text, github text, instagram text, website text,
  certifications jsonb, groups jsonb, joined_at timestamptz
)
language sql stable security definer set search_path = '' as $$
  select p.id, p.full_name, p.avatar_url, p.headline, p.bio, p.linkedin, p.github, p.instagram, p.website,
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

revoke execute on function public.get_program_wall() from public;
grant execute on function public.get_program_wall() to anon, authenticated;
