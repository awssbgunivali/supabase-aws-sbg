-- Testes de permissão (RLS e funções) com dois grupos. Cada verificação falha com uma mensagem clara.
-- Roda num Postgres de teste, depois de 00_stubs, 01_vault_stub e todas as migrations (scripts/test-db.sh).
\set ON_ERROR_STOP on

create or replace function pg_temp.as_user(uid text) returns void language plpgsql as $$
begin perform set_config('request.jwt.claim.sub', uid, false); end $$;

create or replace function pg_temp.check(ok boolean, what text) returns void language plpgsql as $$
begin
  if not coalesce(ok, false) then raise exception 'FALHOU: %', what; end if;
  raise notice 'ok: %', what;
end $$;

-- Espera erro de permissão ao rodar o comando
create or replace function pg_temp.denied(cmd text, what text) returns void language plpgsql as $$
begin
  execute cmd;
  raise exception 'FALHOU (deveria negar): %', what;
exception when insufficient_privilege or check_violation or raise_exception or invalid_parameter_value then
  if sqlerrm like 'FALHOU%' then raise; end if;
  raise notice 'ok (negado): %', what;
end $$;

grant execute on all functions in schema pg_temp to authenticated, anon;

insert into auth.users (id, email, raw_user_meta_data) values
  ('00000000-0000-0000-0000-00000000000a', 'admin@teste.org', '{"full_name":"Admin"}'),
  ('00000000-0000-0000-0000-00000000000b', 'lider.a@teste.org', '{"full_name":"Lider A"}'),
  ('00000000-0000-0000-0000-00000000000c', 'membro@teste.org', '{"user_name":"membro-gh"}');
insert into public.platform_admins values ('00000000-0000-0000-0000-00000000000a');

select pg_temp.check((select full_name from profiles where email = 'membro@teste.org') = 'membro-gh', 'cadastro usa o usuário do GitHub sem nome');

-- Admin cria os grupos
set role authenticated;
select pg_temp.as_user('00000000-0000-0000-0000-00000000000a');
select public.create_group('grupo-a', 'Grupo A', 'A', 'lider.a@teste.org');
select public.create_group('grupo-b', 'Grupo B', 'B', 'lider.b@teste.org');
select pg_temp.denied($$select public.create_group('login', 'Nome qualquer', 'L', 'x@teste.org')$$, 'endereço reservado');
reset role;

select pg_temp.check((select count(*) = 1 from group_invites where email = 'lider.b@teste.org'), 'líder sem conta fica convidado');
insert into auth.users (id, email) values ('00000000-0000-0000-0000-00000000000d', 'lider.b@teste.org');
select pg_temp.check((select role = 'leader' from group_members where user_id = '00000000-0000-0000-0000-00000000000d'), 'convite vira liderança ao criar a conta');

-- Líder A só mexe no grupo A
set role authenticated;
select pg_temp.as_user('00000000-0000-0000-0000-00000000000b');
insert into events (group_id, title, date) select id, 'Evento A', now() from groups where slug = 'grupo-a';
select pg_temp.denied($$insert into events (group_id, title, date) select id, 'Invasão', now() from groups where slug = 'grupo-b'$$, 'líder A criando evento no grupo B');
update groups set name = 'Hackeado' where slug = 'grupo-b';
select pg_temp.check((select name from groups where slug = 'grupo-b') = 'Grupo B', 'líder A não renomeia o grupo B');
select pg_temp.denied($$update groups set slug = 'outro' where slug = 'grupo-a'$$, 'líder não muda o endereço do grupo');
select pg_temp.denied($$update groups set socials = '{"instagram":"javascript:alert(1)"}' where slug = 'grupo-a'$$, 'link javascript: nas redes');
select pg_temp.check(public.add_member_by_email((select id from groups where slug = 'grupo-a'), 'membro@teste.org', 'core') = 'added', 'líder adiciona membro existente');
select pg_temp.denied($$select public.set_member_role((select id from groups where slug = 'grupo-b'), '00000000-0000-0000-0000-00000000000c', 'core')$$, 'líder A mudando cargo no grupo B');
select pg_temp.denied($$select public.set_group_email_settings((select id from groups where slug = 'grupo-a'), '192.168.0.10', 465, 'u', 'p', 'a@teste.org', null)$$, 'servidor de e-mail interno');
select public.set_group_email_settings((select id from groups where slug = 'grupo-a'), 'smtp.teste.org', 587, 'u', 'senha', 'a@teste.org', null);
select pg_temp.denied($$select * from public.group_email_settings$$, 'leitura direta das configurações de e-mail');
select pg_temp.denied($$select * from public.get_group_smtp((select id from groups where slug = 'grupo-a'))$$, 'senha SMTP pelo navegador');
reset role;

-- Visitante só vê o que é público
set role anon;
select pg_temp.check((select count(*) = 2 from groups), 'visitante vê os grupos ativos');
select pg_temp.denied($$select count(*) from profiles$$, 'visitante lendo perfis');
reset role;

-- Membro não se promove
set role authenticated;
select pg_temp.as_user('00000000-0000-0000-0000-00000000000c');
select pg_temp.denied($$update group_members set role = 'leader' where user_id = '00000000-0000-0000-0000-00000000000c'$$, 'membro mudando o próprio cargo');
select public.join_group((select id from groups where slug = 'grupo-b'));
select pg_temp.check((select count(*) = 2 from group_members where user_id = '00000000-0000-0000-0000-00000000000c'), 'membro entra em outro grupo');
reset role;

-- Mural geral junta os grupos de cada pessoa
select pg_temp.check((select jsonb_array_length(groups) = 2 from get_program_wall() where full_name = 'membro-gh'), 'mural geral: uma linha por pessoa, com os dois grupos');

-- Grupo oculto some do público
set role authenticated;
select pg_temp.as_user('00000000-0000-0000-0000-00000000000a');
select public.set_group_status((select id from groups where slug = 'grupo-b'), 'hidden');
reset role;
set role anon;
select pg_temp.check((select count(*) = 1 from groups), 'grupo oculto some para o visitante');
reset role;

-- Plataforma, pedidos de grupo e domínio
set role anon;
select pg_temp.check((select count(*) = 1 from platform_settings), 'visitante lê as configurações da plataforma');
reset role;
set role authenticated;
select pg_temp.as_user('00000000-0000-0000-0000-00000000000c');
update platform_settings set name = 'Hack';
select pg_temp.check((select name is null from platform_settings), 'membro não edita a plataforma');
select public.submit_group_request('AWS SBG Nova', 'Nova', 'Universidade Nova', 'Cidade', 'Brasil', 'Queremos começar', 'membro@teste.org');
select pg_temp.denied($$select public.submit_group_request('Outro', 'O', null, null, null, null, 'membro@teste.org')$$, 'segundo pedido em análise');
select pg_temp.denied($$select public.approve_group_request((select id from group_requests limit 1), 'nova')$$, 'membro aprovando o próprio pedido');
select pg_temp.denied($$select public.set_group_domain((select id from groups where slug = 'grupo-a'), 'a.teste.org')$$, 'membro definindo domínio');
select pg_temp.as_user('00000000-0000-0000-0000-00000000000a');
update platform_settings set region = 'Brasil';
select pg_temp.check((select region = 'Brasil' from platform_settings), 'admin edita a plataforma');
select public.approve_group_request((select id from group_requests where status = 'pending' limit 1), 'nova');
select pg_temp.check((select institution = 'Universidade Nova' from groups where slug = 'nova'), 'pedido aprovado vira grupo com os dados');
select pg_temp.check((select role = 'leader' from group_members m join groups g on g.id = m.group_id where g.slug = 'nova' and m.user_id = '00000000-0000-0000-0000-00000000000c'), 'quem pediu vira líder');
select public.set_group_domain((select id from groups where slug = 'grupo-a'), 'A.Teste.org');
select pg_temp.check((select domain = 'a.teste.org' from groups where slug = 'grupo-a'), 'admin define domínio do grupo');
reset role;

-- Inscrição só com inscrição pelo site ligada
set role authenticated;
select pg_temp.as_user('00000000-0000-0000-0000-00000000000c');
select pg_temp.denied($$insert into registrations (user_id, event_id) select '00000000-0000-0000-0000-00000000000c', id from events limit 1$$, 'inscrição com a inscrição pelo site desligada');
reset role;
update groups set features = features || '{"member_area": true}' where slug = 'grupo-a';
set role authenticated;
insert into registrations (user_id, event_id) select '00000000-0000-0000-0000-00000000000c', id from events limit 1;
select pg_temp.check((select count(*) = 1 from registrations), 'inscrição com a inscrição pelo site ligada');
reset role;

-- Links da equipe: só líderes e core team dos grupos
set role authenticated;
select pg_temp.as_user('00000000-0000-0000-0000-00000000000a');
insert into staff_links (title, url) values ('{"pt":"Avaliação do grupo"}', 'https://exemplo.org/avaliacao');
select pg_temp.as_user('00000000-0000-0000-0000-00000000000b');
select pg_temp.check((select count(*) = 1 from staff_links), 'líder vê os links da equipe');
select pg_temp.denied($$insert into staff_links (title, url) values ('{"pt":"x"}', 'https://x.org')$$, 'líder cadastrando link geral');
reset role;
insert into auth.users (id, email, raw_user_meta_data) values ('00000000-0000-0000-0000-00000000000e', 'so.membro@teste.org', '{"full_name":"Só Membro"}');
insert into group_members (group_id, user_id, role) select id, '00000000-0000-0000-0000-00000000000e', 'member' from groups where slug = 'grupo-a';
set role authenticated;
select pg_temp.as_user('00000000-0000-0000-0000-00000000000e');
select pg_temp.check((select count(*) = 0 from staff_links), 'membro comum não vê os links da equipe');
reset role;
set role anon;
select pg_temp.denied($$select count(*) from staff_links$$, 'visitante lendo os links da equipe');
reset role;

-- Líder do grupo na Equipe (dinâmico, sem e-mail)
set role anon;
select pg_temp.check((select full_name = 'Lider A' from public.get_group_leader((select id from groups where slug = 'grupo-a'))), 'visitante vê o líder do grupo na Equipe');
select pg_temp.check((select count(*) = 0 from public.get_group_leader((select id from groups where slug = 'grupo-b'))), 'grupo oculto não mostra o líder ao visitante');
reset role;

-- Badges das certificações: só o administrador envia
set role authenticated;
select pg_temp.as_user('00000000-0000-0000-0000-00000000000b');
select pg_temp.denied($$insert into storage.objects (bucket_id, name) values ('certs', 'cloud-practitioner.webp')$$, 'líder enviando badge de certificação');
select pg_temp.as_user('00000000-0000-0000-0000-00000000000a');
insert into storage.objects (bucket_id, name) values ('certs', 'cloud-practitioner.webp');
select pg_temp.check((select count(*) = 1 from storage.objects where bucket_id = 'certs'), 'admin envia badge de certificação');
reset role;

-- Builder Center no perfil
set role authenticated;
select pg_temp.as_user('00000000-0000-0000-0000-00000000000b');
update profiles set builder_center = 'https://builder.aws.com/community/@lider' where id = '00000000-0000-0000-0000-00000000000b';
select pg_temp.denied($$update profiles set builder_center = 'https://outro-site.com/x' where id = '00000000-0000-0000-0000-00000000000b'$$, 'Builder Center fora do builder.aws.com');
reset role;
set role anon;
select pg_temp.check((select builder_center = 'https://builder.aws.com/community/@lider' from public.get_group_leader((select id from groups where slug = 'grupo-a'))), 'Builder Center do líder na Equipe');
reset role;
