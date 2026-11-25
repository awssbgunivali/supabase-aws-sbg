-- O Studio mostra só os grupos em que a pessoa TEM cargo (líder, core team ou palestrante). O administrador da
-- plataforma não vira líder de todos os grupos aqui: sem isso o seletor de grupo virava uma lista gigante.
-- (No site e no painel do admin nada muda: is_group_staff continua deixando o administrador gerenciar qualquer grupo.)

create or replace function public.studio_role(g uuid)
returns text language sql stable security definer set search_path = '' as $$
  select m.role from public.group_members m
  where m.group_id = g and m.user_id = (select auth.uid()) and m.role in ('speaker', 'core', 'leader');
$$;

create or replace function public.has_studio_access()
returns boolean language sql stable security definer set search_path = '' as $$
  select exists (select 1 from public.group_members where user_id = (select auth.uid()) and role in ('speaker', 'core', 'leader'));
$$;

-- Líder ou core team de ALGUM grupo (de verdade: sem contar o administrador). Usado pelo item "Studio" do menu do site.
create or replace function public.has_group_staff_role()
returns boolean language sql stable security definer set search_path = '' as $$
  select exists (select 1 from public.group_members where user_id = (select auth.uid()) and role in ('core', 'leader'));
$$;
revoke execute on function public.has_group_staff_role() from public, anon;
grant execute on function public.has_group_staff_role() to authenticated;
