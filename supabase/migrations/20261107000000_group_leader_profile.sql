-- Líder do grupo na página da Equipe, sem cadastro manual: os dados públicos do perfil de quem é o líder do grupo
-- (group_members.role = 'leader'). Mesmos campos públicos do mural; nunca o e-mail.
create or replace function public.get_group_leader(g uuid)
returns table (
  id uuid, full_name text, headline text, bio text, avatar_url text,
  linkedin text, github text, instagram text, website text, certifications jsonb
)
language sql stable security definer set search_path = '' as $$
  select p.id, p.full_name, p.headline, p.bio, p.avatar_url, p.linkedin, p.github, p.instagram, p.website, p.certifications
  from public.group_members m
  join public.profiles p on p.id = m.user_id
  join public.groups gr on gr.id = m.group_id
  where m.group_id = g and m.role = 'leader' and (gr.status = 'active' or public.is_group_staff(g))
  limit 1;
$$;

revoke execute on function public.get_group_leader(uuid) from public;
grant execute on function public.get_group_leader(uuid) to anon, authenticated;
