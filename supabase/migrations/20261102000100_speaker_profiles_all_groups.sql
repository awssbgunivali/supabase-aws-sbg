-- Perfil público dos palestrantes vinculados aos eventos. Sem grupo (g nulo), vale para os eventos de
-- TODOS os grupos ativos (página de eventos do programa).
drop function if exists public.get_event_speaker_profiles(uuid);

create function public.get_event_speaker_profiles(g uuid default null)
returns table (id uuid, full_name text, headline text, avatar_url text, linkedin text, github text, instagram text, website text)
language sql stable security definer set search_path = '' as $$
  select distinct p.id, p.full_name, p.headline, p.avatar_url, p.linkedin, p.github, p.instagram, p.website
  from public.events e
  join public.groups gr on gr.id = e.group_id and gr.status = 'active'
  cross join lateral jsonb_array_elements(e.speakers) s
  join public.profiles p on p.id::text = s->>'profile_id'
  where (g is null or e.group_id = g) and not e.is_hidden;
$$;

revoke execute on function public.get_event_speaker_profiles(uuid) from public;
grant execute on function public.get_event_speaker_profiles(uuid) to anon, authenticated;
