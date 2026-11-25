-- Testes do Studio por grupo. Roda DEPOIS de 10_permissions.sql (reaproveita os usuários e grupos dele):
--   a = administrador, b = líder do grupo A, c = core do grupo A / membro do B / líder do "nova",
--   d = líder do grupo B, e = só membro do grupo A.
\set ON_ERROR_STOP on

create or replace function pg_temp.as_user(uid text) returns void language plpgsql as $$
begin perform set_config('request.jwt.claim.sub', uid, false); end $$;
create or replace function pg_temp.check(ok boolean, what text) returns void language plpgsql as $$
begin
  if not coalesce(ok, false) then raise exception 'FALHOU: %', what; end if;
  raise notice 'ok: %', what;
end $$;
create or replace function pg_temp.denied(cmd text, what text) returns void language plpgsql as $$
begin
  execute cmd;
  raise exception 'FALHOU (deveria negar): %', what;
exception when insufficient_privilege or check_violation or raise_exception or invalid_parameter_value or foreign_key_violation then
  if sqlerrm like 'FALHOU%' then raise; end if;
  raise notice 'ok (negado): %', what;
end $$;
grant execute on all functions in schema pg_temp to authenticated, anon;

-- O grupo B ficou oculto no fim do teste anterior: volta a aparecer (os INSERT ... SELECT abaixo dependem de enxergá-lo)
update groups set status = 'active' where slug = 'grupo-b';

-- ---------------------------------------------------------------- cargos e seletor de grupo
set role authenticated;
select pg_temp.as_user('00000000-0000-0000-0000-00000000000c');
select pg_temp.check((select count(*) = 2 from public.my_studio_groups()), 'core vê só os grupos onde tem cargo (A e nova)');
select pg_temp.check((select count(*) = 0 from public.my_studio_groups() where slug = 'grupo-b'), 'core não vê o grupo onde é só membro');
select pg_temp.as_user('00000000-0000-0000-0000-00000000000e');
select pg_temp.check((select count(*) = 0 from public.my_studio_groups()), 'membro comum não tem Studio');
select pg_temp.denied($$insert into studio_projects (group_id, title, mode, data) select id, 'x', 'presentation', '{}' from groups where slug = 'grupo-a'$$, 'membro criando apresentação');
reset role;

-- ---------------------------------------------------------------- projetos e pastas
set role authenticated;
select pg_temp.as_user('00000000-0000-0000-0000-00000000000c');
insert into studio_folders (group_id, name) select id, 'Pasta A' from groups where slug = 'grupo-a';
insert into studio_projects (group_id, title, mode, data, folder_id)
  select g.id, 'Post A', 'content', '{"slides":[]}', (select id from studio_folders limit 1) from groups g where slug = 'grupo-a';
insert into studio_projects (group_id, title, mode, data) select id, 'Palestra A', 'presentation', '{}' from groups where slug = 'grupo-a';
select pg_temp.denied($$insert into studio_projects (group_id, title, mode, data) select id, 'Invasão', 'content', '{}' from groups where slug = 'grupo-b'$$, 'core criando projeto no grupo onde é só membro');
select pg_temp.denied($$insert into studio_folders (group_id, name) select id, 'Invasão' from groups where slug = 'grupo-b'$$, 'core criando pasta em outro grupo');
select pg_temp.denied($$update studio_projects set group_id = (select id from groups where slug = 'nova') where title = 'Post A'$$, 'mover projeto para outro grupo');

-- líder do grupo B cria uma pasta; o core do A não pode usá-la
select pg_temp.as_user('00000000-0000-0000-0000-00000000000d');
insert into studio_folders (group_id, name) select id, 'Pasta B' from groups where slug = 'grupo-b';
reset role;
create table public.t_pasta_b as select id from studio_folders where name = 'Pasta B'; -- o core do A nem enxerga a pasta: o id vem daqui
grant select on public.t_pasta_b to authenticated;
set role authenticated;
select pg_temp.as_user('00000000-0000-0000-0000-00000000000c');
select pg_temp.denied($$insert into studio_projects (group_id, title, mode, data, folder_id) select g.id, 'Cruzado', 'content', '{}', (select id from public.t_pasta_b) from groups g where slug = 'grupo-a'$$, 'projeto do grupo A numa pasta do grupo B');

-- quem vê o quê
select pg_temp.as_user('00000000-0000-0000-0000-00000000000b');
select pg_temp.check((select count(*) = 1 from studio_projects where title = 'Post A'), 'líder do A vê o post da equipe');
select pg_temp.check((select count(*) = 0 from studio_projects where title = 'Palestra A'), 'líder não vê a apresentação do palestrante/core');
select pg_temp.as_user('00000000-0000-0000-0000-00000000000d');
select pg_temp.check((select count(*) = 0 from studio_projects), 'líder do B não vê nada do grupo A');
select pg_temp.check((select count(*) = 0 from studio_folders where name = 'Pasta A'), 'líder do B não vê as pastas do A');
reset role;

-- ---------------------------------------------------------------- aprovação
set role authenticated;
select pg_temp.as_user('00000000-0000-0000-0000-00000000000c');
select pg_temp.denied($$update studio_projects set approval = 'approved' where title = 'Post A'$$, 'core aprovando o próprio arquivo');
update studio_projects set approval = 'review' where title = 'Post A';
select pg_temp.as_user('00000000-0000-0000-0000-00000000000b');
update studio_projects set approval = 'approved' where title = 'Post A';
select pg_temp.check((select approval = 'approved' and approved_by is not null from studio_projects where title = 'Post A'), 'líder aprova');
select pg_temp.as_user('00000000-0000-0000-0000-00000000000c');
update studio_projects set data = '{"slides":[1]}' where title = 'Post A';
select pg_temp.check((select approval = 'draft' from studio_projects where title = 'Post A'), 'editar arquivo aprovado volta para rascunho');
reset role;

-- ---------------------------------------------------------------- tarefas
set role authenticated;
select pg_temp.as_user('00000000-0000-0000-0000-00000000000c');
insert into studio_tasks (group_id, title) select id, 'Tarefa A' from groups where slug = 'grupo-a';
select pg_temp.denied($$insert into studio_tasks (group_id, title, assignee_id) select id, 'x', '00000000-0000-0000-0000-00000000000d' from groups where slug = 'grupo-a'$$, 'responsável de outro grupo');
select pg_temp.denied($$update studio_tasks set status = 'done' where title = 'Tarefa A'$$, 'core concluindo tarefa');
select pg_temp.denied($$insert into studio_tasks (group_id, title) select id, 'Invasão' from groups where slug = 'grupo-b'$$, 'core criando tarefa em outro grupo');
select pg_temp.as_user('00000000-0000-0000-0000-00000000000b');
update studio_tasks set status = 'done' where title = 'Tarefa A';
select pg_temp.check((select status = 'done' and approved_by is not null from studio_tasks where title = 'Tarefa A'), 'líder conclui a tarefa');
select pg_temp.as_user('00000000-0000-0000-0000-00000000000d');
select pg_temp.check((select count(*) = 0 from studio_tasks), 'líder do B não vê as tarefas do A');
reset role;
create table public.t_tarefa_a as select id from studio_tasks where title = 'Tarefa A'; -- o líder do B nem enxerga a tarefa: o id vem daqui
grant select on public.t_tarefa_a to authenticated;
set role authenticated;
select pg_temp.as_user('00000000-0000-0000-0000-00000000000d');
select pg_temp.denied($$insert into studio_task_comments (task_id, body) select id, 'oi' from public.t_tarefa_a$$, 'comentar tarefa de outro grupo');
select pg_temp.as_user('00000000-0000-0000-0000-00000000000c');
insert into studio_task_comments (task_id, body) select id, 'oi' from public.t_tarefa_a;
select pg_temp.check((select count(*) = 1 from studio_task_comments), 'core comenta a tarefa do próprio grupo');
reset role;
drop table public.t_tarefa_a;

-- ---------------------------------------------------------------- tokens do Claude
set role authenticated;
select pg_temp.as_user('00000000-0000-0000-0000-00000000000c');
insert into studio_mcp_tokens (group_id, token_hash) select id, repeat('a', 64) from groups where slug = 'grupo-a';
select pg_temp.denied($$insert into studio_mcp_tokens (group_id, token_hash) select id, repeat('b', 64) from groups where slug = 'grupo-b'$$, 'token para um grupo sem cargo');
select pg_temp.as_user('00000000-0000-0000-0000-00000000000b');
select pg_temp.check((select count(*) = 0 from studio_mcp_tokens), 'ninguém vê o token dos outros');
reset role;

-- ---------------------------------------------------------------- página de links
set role authenticated;
select pg_temp.as_user('00000000-0000-0000-0000-00000000000c');
insert into links (group_id, title, url, position) select id, 'Instagram A', 'https://instagram.com/a', 1 from groups where slug = 'grupo-a';
insert into links (group_id, title, url, starts_at, position) select id, 'Futuro A', 'https://exemplo.org/futuro', now() + interval '1 day', 2 from groups where slug = 'grupo-a';
select pg_temp.denied($$insert into links (group_id, title, url) select id, 'x', 'https://x.org' from groups where slug = 'grupo-b'$$, 'link em outro grupo');
select pg_temp.denied($$insert into links (group_id, title, url) select id, 'x', 'javascript:alert(1)' from groups where slug = 'grupo-a'$$, 'link javascript:');
insert into link_page (group_id, hero_url) select id, 'https://exemplo.org/foto.jpg' from groups where slug = 'grupo-a';
select pg_temp.denied($$insert into link_page (group_id) select id from groups where slug = 'grupo-b'$$, 'aparência da página de outro grupo');
reset role;
set role anon;
select pg_temp.check((select count(*) = 2 from public.get_public_links((select id from groups where slug = 'grupo-a'))), 'visitante vê os links do grupo (e o agendado travado)');
select pg_temp.check((select url is null and not live from public.get_public_links((select id from groups where slug = 'grupo-a')) where title = 'Futuro A'), 'link agendado sai sem a URL');
select pg_temp.check((select count(*) = 0 from public.get_public_links((select id from groups where slug = 'grupo-b'))), 'links do A não aparecem no B');
select pg_temp.denied($$select count(*) from links$$, 'visitante lendo a tabela de links');
reset role;

-- ---------------------------------------------------------------- publicações nas redes
set role authenticated;
select pg_temp.as_user('00000000-0000-0000-0000-00000000000c');
select pg_temp.denied($$insert into social_posts (group_id, title, channels, pdf_url, status)
  select id, 'Direto', array['linkedin'], 'https://x.supabase.co/storage/v1/object/public/social/' || id || '/a.pdf', 'scheduled' from groups where slug = 'grupo-a'$$, 'core agendando direto');
insert into social_posts (group_id, title, channels, pdf_url, status)
  select id, 'Post social', array['linkedin'], 'https://x.supabase.co/storage/v1/object/public/social/' || id || '/a.pdf', 'pending_approval' from groups where slug = 'grupo-a';
select pg_temp.denied($$insert into social_posts (group_id, title, channels, pdf_url, status)
  select a.id, 'Mídia alheia', array['linkedin'], 'https://x.supabase.co/storage/v1/object/public/social/' || b.id || '/a.pdf', 'pending_approval'
  from groups a, groups b where a.slug = 'grupo-a' and b.slug = 'grupo-b'$$, 'post apontando para a pasta de outro grupo');
select pg_temp.denied($$update social_posts set status = 'scheduled' where title = 'Post social'$$, 'core aprovando o próprio post');
select pg_temp.as_user('00000000-0000-0000-0000-00000000000b');
update social_posts set status = 'scheduled' where title = 'Post social';
select pg_temp.check((select status = 'scheduled' and approved_by is not null from social_posts where title = 'Post social'), 'líder aprova o post');
select pg_temp.as_user('00000000-0000-0000-0000-00000000000d');
select pg_temp.check((select count(*) = 0 from social_posts), 'líder do B não vê a fila do A');
reset role;

reset role;
drop table public.t_pasta_b;

-- ---------------------------------------------------------------- arquivos (storage)
set role authenticated;
select pg_temp.as_user('00000000-0000-0000-0000-00000000000c');
insert into storage.objects (bucket_id, name) select 'social', id || '/capa.jpg' from groups where slug = 'grupo-a';
select pg_temp.denied($$insert into storage.objects (bucket_id, name) select 'social', id || '/capa.jpg' from groups where slug = 'grupo-b'$$, 'enviar mídia na pasta de outro grupo');
select pg_temp.denied($$insert into storage.objects (bucket_id, name) values ('social', 'solto.jpg')$$, 'enviar mídia fora da pasta de um grupo');
insert into storage.objects (bucket_id, name) select 'studio-tasks', id || '/print.png' from studio_tasks where title = 'Tarefa A';
reset role;
create table public.t_tarefa_a as select id from studio_tasks where title = 'Tarefa A';
grant select on public.t_tarefa_a to authenticated;
set role authenticated;
select pg_temp.as_user('00000000-0000-0000-0000-00000000000d');
select pg_temp.denied($$insert into storage.objects (bucket_id, name) select 'studio-tasks', id || '/invasao.png' from public.t_tarefa_a$$, 'anexo em tarefa de outro grupo');
select pg_temp.check((select count(*) = 0 from storage.objects where bucket_id = 'studio-tasks'), 'líder do B não lê anexos do A');
reset role;
drop table public.t_tarefa_a;

-- ---------------------------------------------------------------- administrador da plataforma
-- O administrador (a) não tem cargo em nenhum grupo: o seletor do Studio fica vazio (nada de lista gigante)
set role authenticated;
select pg_temp.as_user('00000000-0000-0000-0000-00000000000a');
select pg_temp.check((select count(*) = 0 from public.my_studio_groups()), 'administrador sem cargo não vê grupos no Studio');
select pg_temp.check(not public.has_group_staff_role(), 'administrador sem cargo não ganha o item Studio no menu');
select pg_temp.as_user('00000000-0000-0000-0000-00000000000c');
select pg_temp.check(public.has_group_staff_role(), 'core de algum grupo ganha o item Studio no menu');
select pg_temp.as_user('00000000-0000-0000-0000-00000000000e');
select pg_temp.check(not public.has_group_staff_role(), 'membro comum não ganha o item Studio no menu');
reset role;

-- ---------------------------------------------------------------- bucket brand
set role authenticated;
select pg_temp.as_user('00000000-0000-0000-0000-00000000000b');
select pg_temp.denied($$insert into storage.objects (bucket_id, name) values ('brand', 'site/sbg-icon.svg')$$, 'líder enviando arquivo da marca');
select pg_temp.as_user('00000000-0000-0000-0000-00000000000a');
insert into storage.objects (bucket_id, name) values ('brand', 'site/sbg-icon.svg');
select pg_temp.check((select count(*) = 1 from storage.objects where bucket_id = 'brand'), 'administrador envia arquivo da marca');
reset role;
set role anon;
select pg_temp.check((select count(*) = 1 from storage.objects where bucket_id = 'brand'), 'visitante lê os arquivos da marca');
reset role;
