-- Nome do perfil no cadastro: além de full_name/name, usa o usuário do GitHub (user_name) quando a conta
-- não tem nome público. Sem nome a pessoa não aparece nos murais; ela pode corrigir em Perfil.
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  insert into public.profiles (id, email, full_name)
  values (
    new.id,
    new.email,
    left(coalesce(
      nullif(trim(new.raw_user_meta_data ->> 'full_name'), ''),
      nullif(trim(new.raw_user_meta_data ->> 'name'), ''),
      nullif(trim(new.raw_user_meta_data ->> 'user_name'), ''),
      nullif(trim(new.raw_user_meta_data ->> 'preferred_username'), '')
    ), 80)
  )
  on conflict (id) do nothing;

  insert into public.group_members (group_id, user_id, role)
  select i.group_id, new.id, i.role from public.group_invites i where i.email = lower(new.email)
  on conflict (group_id, user_id) do nothing;
  delete from public.group_invites where email = lower(new.email);
  return new;
end;
$$;

revoke execute on function public.handle_new_user() from public, anon, authenticated;
