-- Studio (editor de materiais) por GRUPO: projetos, pastas, tarefas, página de links, publicações nas redes e
-- tokens do Claude (MCP). Tudo tem `group_id`: quem é do grupo A nunca vê nada do grupo B.
--
-- Cargos (group_members.role) no Studio:
--   líder / core team -> todos os formatos, tarefas, links e posts do grupo
--   palestrante       -> só apresentações, e só as dele
--   membro            -> sem acesso
-- O administrador da plataforma age como líder em qualquer grupo.

-- ---------------------------------------------------------------- funções de apoio
-- Cargo de quem está logado NO GRUPO g, se tiver acesso ao Studio (null = sem acesso)
create or replace function public.studio_role(g uuid)
returns text language sql stable security definer set search_path = '' as $$
  select case
    when public.is_platform_admin() then 'leader'
    else (select m.role from public.group_members m
          where m.group_id = g and m.user_id = (select auth.uid()) and m.role in ('speaker', 'core', 'leader'))
  end;
$$;
revoke execute on function public.studio_role(uuid) from public, anon;
grant execute on function public.studio_role(uuid) to authenticated;

-- Grupos em que a pessoa usa o Studio (para o seletor de grupo do app)
create or replace function public.my_studio_groups()
returns table (id uuid, slug text, name text, short_name text, logo_url text, accent text, role text)
language sql stable security definer set search_path = '' as $$
  select g.id, g.slug, g.name, g.short_name, g.logo_url, g.accent, public.studio_role(g.id)
  from public.groups g
  where g.status = 'active' and public.studio_role(g.id) is not null
  order by g.name;
$$;
revoke execute on function public.my_studio_groups() from public, anon;
grant execute on function public.my_studio_groups() to authenticated;

-- Algum Studio de algum grupo? (arquivos exportados ficam na pasta de quem os criou)
create or replace function public.has_studio_access()
returns boolean language sql stable security definer set search_path = '' as $$
  select public.is_platform_admin()
    or exists (select 1 from public.group_members where user_id = (select auth.uid()) and role in ('speaker', 'core', 'leader'));
$$;
revoke execute on function public.has_studio_access() from public, anon;
grant execute on function public.has_studio_access() to authenticated;

-- Converte texto em uuid sem dar erro (caminhos de arquivo no storage)
create or replace function public.safe_uuid(value text)
returns uuid language plpgsql immutable set search_path = '' as $$
begin
  return value::uuid;
exception when others then
  return null;
end;
$$;

-- Todos os itens do array batem com o padrão (usado para só aceitar arquivos do nosso bucket)
create or replace function public.all_match(arr text[], pattern text)
returns boolean language sql immutable set search_path = '' as $$
  select coalesce(bool_and(x ~ pattern), true) from unnest(arr) as x;
$$;

-- ---------------------------------------------------------------- pastas
create table public.studio_folders (
  id uuid primary key default gen_random_uuid(),
  group_id uuid not null references public.groups (id) on delete cascade,
  owner_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  name text not null check (length(name) between 1 and 80),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index studio_folders_owner_idx on public.studio_folders (group_id, owner_id, updated_at desc);
create index studio_folders_owner_fk_idx on public.studio_folders (owner_id);

-- Pasta da equipe = criada por líder ou core team do grupo
create or replace function public.studio_is_team_folder(folder uuid)
returns boolean language sql stable security definer set search_path = '' as $$
  select exists (
    select 1 from public.studio_folders f
    join public.group_members m on m.group_id = f.group_id and m.user_id = f.owner_id
    where f.id = folder and m.role in ('core', 'leader')
  );
$$;
revoke execute on function public.studio_is_team_folder(uuid) from public, anon;
grant execute on function public.studio_is_team_folder(uuid) to authenticated;

-- A pasta é do mesmo grupo e é minha ou da equipe?
create or replace function public.studio_can_use_folder(folder uuid, g uuid)
returns boolean language sql stable security definer set search_path = '' as $$
  select exists (
    select 1 from public.studio_folders f
    where f.id = folder and f.group_id = g
      and (f.owner_id = (select auth.uid()) or (public.is_group_staff(g) and public.studio_is_team_folder(f.id)))
  );
$$;
revoke execute on function public.studio_can_use_folder(uuid, uuid) from public, anon;
grant execute on function public.studio_can_use_folder(uuid, uuid) to authenticated;

create or replace function public.studio_folder_guard()
returns trigger language plpgsql set search_path = '' as $$
begin
  if new.owner_id is distinct from old.owner_id then raise exception 'O dono do projeto não pode ser trocado'; end if;
  if new.group_id is distinct from old.group_id then raise exception 'O grupo da pasta não pode ser trocado'; end if;
  return new;
end;
$$;
create trigger studio_folders_guard before update on public.studio_folders
  for each row execute function public.studio_folder_guard();

alter table public.studio_folders enable row level security;

create policy "studio_folders: ver as próprias ou da equipe" on public.studio_folders for select to authenticated
  using (
    (owner_id = (select auth.uid()) and (select public.studio_role(group_id)) is not null)
    or ((select public.is_group_staff(group_id)) and public.studio_is_team_folder(id))
  );
create policy "studio_folders: criar" on public.studio_folders for insert to authenticated
  with check (owner_id = (select auth.uid()) and (select public.studio_role(group_id)) is not null);
create policy "studio_folders: editar as próprias ou da equipe" on public.studio_folders for update to authenticated
  using (
    (owner_id = (select auth.uid()) and (select public.studio_role(group_id)) is not null)
    or ((select public.is_group_staff(group_id)) and public.studio_is_team_folder(id))
  )
  with check (
    (owner_id = (select auth.uid()) and (select public.studio_role(group_id)) is not null)
    or (select public.is_group_staff(group_id))
  );
create policy "studio_folders: excluir as próprias ou da equipe" on public.studio_folders for delete to authenticated
  using (
    (owner_id = (select auth.uid()) and (select public.studio_role(group_id)) is not null)
    or ((select public.is_group_leader(group_id)) and public.studio_is_team_folder(id))
  );

revoke all on public.studio_folders from anon;
revoke truncate, references, trigger on public.studio_folders from authenticated;
grant select, insert, update, delete on public.studio_folders to authenticated;

-- ---------------------------------------------------------------- projetos (arquivos)
create table public.studio_projects (
  id uuid primary key default gen_random_uuid(),
  group_id uuid not null references public.groups (id) on delete cascade,
  owner_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  title text not null check (length(title) between 1 and 120),
  mode text not null check (mode in ('event', 'content', 'club', 'waiting', 'presentation', 'certificate', 'meetup')),
  -- O projeto inteiro (slides + visual), inclusive imagens enviadas em Base64
  data jsonb not null check (octet_length(data::text) <= 8 * 1024 * 1024),
  folder_id uuid references public.studio_folders (id) on delete set null,
  -- Arquivos exportados (PDF, PowerPoint, .zip) no bucket privado: [{ kind, path, size, at }]
  exports jsonb not null default '[]'::jsonb check (
    jsonb_typeof(exports) = 'array' and jsonb_array_length(exports) <= 10 and octet_length(exports::text) <= 8000
  ),
  deleted_at timestamptz,
  updated_by uuid references public.profiles (id) on delete set null,
  approval text not null default 'draft' check (approval in ('draft', 'review', 'approved')),
  approved_by uuid references public.profiles (id) on delete set null,
  approved_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index studio_projects_owner_idx on public.studio_projects (group_id, owner_id, updated_at desc);
create index studio_projects_owner_fk_idx on public.studio_projects (owner_id);
create index studio_projects_folder_idx on public.studio_projects (folder_id);
create index studio_projects_trash_idx on public.studio_projects (group_id, owner_id, deleted_at);
create index studio_projects_updated_by_idx on public.studio_projects (updated_by);
create index studio_projects_approved_by_idx on public.studio_projects (approved_by);
create index studio_projects_approval_idx on public.studio_projects (group_id, approval) where approval <> 'draft';

-- Quem criou não muda, o grupo não muda, a pasta é do mesmo grupo, quem editou por último é preenchido pelo
-- banco (ninguém falsifica) e a aprovação segue as regras abaixo.
--   * só o líder aprova, e só o líder reabre um arquivo aprovado;
--   * se alguém que não é o líder editar o conteúdo de um arquivo aprovado, ele volta para rascunho;
--   * arquivo novo sempre nasce como rascunho.
create or replace function public.studio_project_guard()
returns trigger language plpgsql set search_path = '' as $$
begin
  if tg_op = 'UPDATE' then
    if new.owner_id is distinct from old.owner_id then raise exception 'O dono do arquivo não pode ser trocado'; end if;
    if new.group_id is distinct from old.group_id then raise exception 'O grupo do arquivo não pode ser trocado'; end if;
    new.updated_at := now();
  end if;
  if auth.uid() is not null then new.updated_by := auth.uid(); end if;

  if new.folder_id is not null and not exists (select 1 from public.studio_folders f where f.id = new.folder_id and f.group_id = new.group_id) then
    raise exception 'A pasta é de outro grupo';
  end if;

  if tg_op = 'INSERT' then
    new.approval := 'draft';
    new.approved_by := null;
    new.approved_at := null;
    return new;
  end if;

  if new.approval is distinct from old.approval then
    if (new.approval = 'approved' or old.approval = 'approved') and auth.uid() is not null and not public.is_group_leader(new.group_id) then
      raise exception 'Só o líder aprova ou reabre um arquivo aprovado';
    end if;
    if new.approval = 'approved' then
      new.approved_by := auth.uid();
      new.approved_at := now();
    else
      new.approved_by := null;
      new.approved_at := null;
    end if;
  elsif old.approval = 'approved' and new.data is distinct from old.data and auth.uid() is not null and not public.is_group_leader(new.group_id) then
    new.approval := 'draft';
    new.approved_by := null;
    new.approved_at := null;
  end if;
  return new;
end;
$$;
create trigger studio_projects_guard before insert or update on public.studio_projects
  for each row execute function public.studio_project_guard();

alter table public.studio_projects enable row level security;

-- ver: o dono, ou líder/core nos arquivos que não são apresentação
create policy "studio_projects: ver os próprios ou da equipe" on public.studio_projects for select to authenticated
  using (
    (owner_id = (select auth.uid()) and (select public.studio_role(group_id)) is not null)
    or (mode <> 'presentation' and (select public.is_group_staff(group_id)))
  );
-- criar: cada pessoa cria os próprios. Palestrante só apresentações; líder/core qualquer formato
create policy "studio_projects: criar" on public.studio_projects for insert to authenticated
  with check (
    owner_id = (select auth.uid())
    and ((mode = 'presentation' and (select public.studio_role(group_id)) is not null) or (select public.is_group_staff(group_id)))
    and (folder_id is null or public.studio_can_use_folder(folder_id, group_id))
  );
create policy "studio_projects: editar os próprios ou da equipe" on public.studio_projects for update to authenticated
  using (
    (owner_id = (select auth.uid()) and (select public.studio_role(group_id)) is not null)
    or (mode <> 'presentation' and (select public.is_group_staff(group_id)))
  )
  with check (
    (
      (owner_id = (select auth.uid()) and ((mode = 'presentation' and (select public.studio_role(group_id)) is not null) or (select public.is_group_staff(group_id))))
      or (mode <> 'presentation' and (select public.is_group_staff(group_id)))
    )
    and (folder_id is null or public.studio_can_use_folder(folder_id, group_id))
  );
create policy "studio_projects: excluir os próprios ou da equipe" on public.studio_projects for delete to authenticated
  using (
    (owner_id = (select auth.uid()) and (select public.studio_role(group_id)) is not null)
    or (mode <> 'presentation' and (select public.is_group_leader(group_id)))
  );

revoke all on public.studio_projects from anon;
revoke truncate, references, trigger on public.studio_projects from authenticated;
grant select, insert, update, delete on public.studio_projects to authenticated;

-- ---------------------------------------------------------------- exportações (bucket privado)
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('studio-exports', 'studio-exports', false, 52428800,
  array['application/pdf', 'application/vnd.openxmlformats-officedocument.presentationml.presentation', 'application/zip'])
on conflict (id) do update
  set public = false, file_size_limit = excluded.file_size_limit, allowed_mime_types = excluded.allowed_mime_types;

-- Caminho: <uid>/<id do projeto>/<arquivo>. Só o dono, e só enquanto tiver acesso ao Studio de algum grupo.
create policy "studio-exports: dono lê" on storage.objects for select to authenticated
  using (bucket_id = 'studio-exports' and (storage.foldername(name))[1] = (select auth.uid())::text and (select public.has_studio_access()));
create policy "studio-exports: dono envia" on storage.objects for insert to authenticated
  with check (bucket_id = 'studio-exports' and (storage.foldername(name))[1] = (select auth.uid())::text and (select public.has_studio_access()));
create policy "studio-exports: dono substitui" on storage.objects for update to authenticated
  using (bucket_id = 'studio-exports' and (storage.foldername(name))[1] = (select auth.uid())::text and (select public.has_studio_access()))
  with check (bucket_id = 'studio-exports' and (storage.foldername(name))[1] = (select auth.uid())::text and (select public.has_studio_access()));
create policy "studio-exports: dono remove" on storage.objects for delete to authenticated
  using (bucket_id = 'studio-exports' and (storage.foldername(name))[1] = (select auth.uid())::text and (select public.has_studio_access()));

-- ---------------------------------------------------------------- tarefas
-- Quadro simples para o líder e o core team combinarem o trabalho (todo -> doing -> review -> done).
--   * só líder e core do grupo veem e mexem; só o líder conclui (aprova) e só ele reabre;
--   * o responsável precisa ser do core ou o líder DO MESMO grupo; quem criou não muda.
create table public.studio_tasks (
  id uuid primary key default gen_random_uuid(),
  group_id uuid not null references public.groups (id) on delete cascade,
  title text not null check (length(title) between 1 and 140),
  description text not null default '' check (length(description) <= 5000),
  kind text not null default 'task' check (kind in ('task', 'fix', 'idea')),
  category text not null default 'other' check (category in ('design', 'content', 'social', 'event', 'studio', 'other')),
  status text not null default 'todo' check (status in ('todo', 'doing', 'review', 'done')),
  priority text not null default 'medium' check (priority in ('low', 'medium', 'high')),
  due_date date,
  assignee_id uuid references public.profiles (id) on delete set null,
  folder_id uuid references public.studio_folders (id) on delete set null,
  created_by uuid not null default auth.uid() references public.profiles (id) on delete cascade,
  approved_by uuid references public.profiles (id) on delete set null,
  approved_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index studio_tasks_status_idx on public.studio_tasks (group_id, status, updated_at desc);
create index studio_tasks_assignee_idx on public.studio_tasks (assignee_id);
create index studio_tasks_folder_idx on public.studio_tasks (folder_id);
create index studio_tasks_created_by_idx on public.studio_tasks (created_by);
create index studio_tasks_approved_by_idx on public.studio_tasks (approved_by);

create or replace function public.studio_guard_task()
returns trigger language plpgsql set search_path = '' as $$
begin
  if new.assignee_id is not null
     and (tg_op = 'INSERT' or new.assignee_id is distinct from old.assignee_id)
     and not exists (select 1 from public.group_members m where m.group_id = new.group_id and m.user_id = new.assignee_id and m.role in ('core', 'leader')) then
    raise exception 'O responsável precisa ser do core team ou o líder do grupo';
  end if;
  if new.folder_id is not null and not exists (select 1 from public.studio_folders f where f.id = new.folder_id and f.group_id = new.group_id) then
    raise exception 'A pasta é de outro grupo';
  end if;

  if tg_op = 'INSERT' then
    if auth.uid() is not null then new.created_by := auth.uid(); end if;
    if new.status = 'done' and auth.uid() is not null and not public.is_group_leader(new.group_id) then
      raise exception 'Só o líder conclui (aprova) uma tarefa';
    end if;
  else
    if new.created_by is distinct from old.created_by then raise exception 'Quem criou a tarefa não pode ser trocado'; end if;
    if new.group_id is distinct from old.group_id then raise exception 'O grupo da tarefa não pode ser trocado'; end if;
    new.updated_at := now();
  end if;

  if tg_op = 'INSERT' or new.status is distinct from old.status then
    if tg_op = 'UPDATE' and (new.status = 'done' or old.status = 'done') and auth.uid() is not null and not public.is_group_leader(new.group_id) then
      raise exception 'Só o líder conclui (aprova) ou reabre uma tarefa';
    end if;
    if new.status = 'done' then
      if auth.uid() is null then
        -- Chave de serviço (MCP): o aprovador vem do servidor e precisa ser o líder deste grupo
        if new.approved_by is null or not exists (select 1 from public.group_members m where m.group_id = new.group_id and m.user_id = new.approved_by and m.role = 'leader') then
          raise exception 'Só o líder conclui (aprova) uma tarefa';
        end if;
      else
        new.approved_by := auth.uid();
      end if;
      new.approved_at := now();
    else
      new.approved_by := null;
      new.approved_at := null;
    end if;
  else
    new.approved_by := old.approved_by;
    new.approved_at := old.approved_at;
  end if;
  return new;
end;
$$;
create trigger studio_tasks_guard before insert or update on public.studio_tasks
  for each row execute function public.studio_guard_task();

alter table public.studio_tasks enable row level security;

create policy "studio_tasks: equipe vê" on public.studio_tasks for select to authenticated
  using ((select public.is_group_staff(group_id)));
create policy "studio_tasks: equipe cria" on public.studio_tasks for insert to authenticated
  with check ((select public.is_group_staff(group_id)) and created_by = (select auth.uid()));
create policy "studio_tasks: equipe edita" on public.studio_tasks for update to authenticated
  using ((select public.is_group_staff(group_id))) with check ((select public.is_group_staff(group_id)));
create policy "studio_tasks: quem criou ou o líder exclui" on public.studio_tasks for delete to authenticated
  using ((select public.is_group_staff(group_id)) and (created_by = (select auth.uid()) or (select public.is_group_leader(group_id))));

revoke all on public.studio_tasks from anon;
revoke truncate, references, trigger on public.studio_tasks from authenticated;
grant select, insert, update, delete on public.studio_tasks to authenticated;

-- Grupo de uma tarefa (para as políticas de comentários, anexos e do bucket)
create or replace function public.studio_task_group(t uuid)
returns uuid language sql stable security definer set search_path = '' as $$
  select group_id from public.studio_tasks where id = t;
$$;
revoke execute on function public.studio_task_group(uuid) from public, anon;
grant execute on function public.studio_task_group(uuid) to authenticated;

-- ---------------------------------------------------------------- comentários e imagens das tarefas
create table public.studio_task_comments (
  id uuid primary key default gen_random_uuid(),
  task_id uuid not null references public.studio_tasks (id) on delete cascade,
  author_id uuid not null default auth.uid() references public.profiles (id) on delete cascade,
  body text not null check (length(body) between 1 and 4000),
  created_at timestamptz not null default now()
);
create index studio_task_comments_task_idx on public.studio_task_comments (task_id, created_at);
create index studio_task_comments_author_idx on public.studio_task_comments (author_id);

alter table public.studio_task_comments enable row level security;
create policy "studio_task_comments: equipe vê" on public.studio_task_comments for select to authenticated
  using ((select public.is_group_staff(public.studio_task_group(task_id))));
create policy "studio_task_comments: equipe comenta" on public.studio_task_comments for insert to authenticated
  with check ((select public.is_group_staff(public.studio_task_group(task_id))) and author_id = (select auth.uid()));
create policy "studio_task_comments: autor ou líder apaga" on public.studio_task_comments for delete to authenticated
  using ((select public.is_group_staff(public.studio_task_group(task_id))) and (author_id = (select auth.uid()) or (select public.is_group_leader(public.studio_task_group(task_id)))));

revoke all on public.studio_task_comments from anon;
revoke truncate, references, trigger, update on public.studio_task_comments from authenticated;
grant select, insert, delete on public.studio_task_comments to authenticated;

create table public.studio_task_files (
  id uuid primary key default gen_random_uuid(),
  task_id uuid not null references public.studio_tasks (id) on delete cascade,
  path text not null unique check (length(path) <= 300),
  name text not null default '' check (length(name) <= 200),
  size integer not null default 0,
  created_by uuid not null default auth.uid() references public.profiles (id) on delete cascade,
  created_at timestamptz not null default now()
);
create index studio_task_files_task_idx on public.studio_task_files (task_id, created_at);
create index studio_task_files_created_by_idx on public.studio_task_files (created_by);

alter table public.studio_task_files enable row level security;
create policy "studio_task_files: equipe vê" on public.studio_task_files for select to authenticated
  using ((select public.is_group_staff(public.studio_task_group(task_id))));
create policy "studio_task_files: equipe anexa" on public.studio_task_files for insert to authenticated
  with check ((select public.is_group_staff(public.studio_task_group(task_id))) and created_by = (select auth.uid()) and split_part(path, '/', 1) = task_id::text);
create policy "studio_task_files: quem anexou ou o líder remove" on public.studio_task_files for delete to authenticated
  using ((select public.is_group_staff(public.studio_task_group(task_id))) and (created_by = (select auth.uid()) or (select public.is_group_leader(public.studio_task_group(task_id)))));

revoke all on public.studio_task_files from anon;
revoke truncate, references, trigger, update on public.studio_task_files from authenticated;
grant select, insert, delete on public.studio_task_files to authenticated;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('studio-tasks', 'studio-tasks', false, 10485760, array['image/png', 'image/jpeg', 'image/webp', 'image/gif'])
on conflict (id) do update
  set public = false, file_size_limit = excluded.file_size_limit, allowed_mime_types = excluded.allowed_mime_types;

-- Caminho: <id da tarefa>/<arquivo>. A equipe DO GRUPO da tarefa lê e envia; apaga quem enviou ou o líder do grupo.
create policy "studio-tasks: equipe lê" on storage.objects for select to authenticated
  using (bucket_id = 'studio-tasks' and (select public.is_group_staff(public.studio_task_group(public.safe_uuid((storage.foldername(name))[1])))));
create policy "studio-tasks: equipe envia" on storage.objects for insert to authenticated
  with check (bucket_id = 'studio-tasks' and (select public.is_group_staff(public.studio_task_group(public.safe_uuid((storage.foldername(name))[1])))));
create policy "studio-tasks: quem enviou ou o líder remove" on storage.objects for delete to authenticated
  using (bucket_id = 'studio-tasks' and (select public.is_group_staff(public.studio_task_group(public.safe_uuid((storage.foldername(name))[1]))))
         and (owner_id = (select auth.uid())::text or (select public.is_group_leader(public.studio_task_group(public.safe_uuid((storage.foldername(name))[1]))))));

-- Tempo real: o quadro se atualiza sozinho (o Realtime respeita o RLS: só a equipe do grupo recebe)
do $$
begin
  if exists (select 1 from pg_publication where pubname = 'supabase_realtime') then
    alter publication supabase_realtime add table public.studio_tasks, public.studio_task_comments, public.studio_task_files;
  end if;
end $$;

-- ---------------------------------------------------------------- tokens do Claude (servidor MCP)
-- Cada pessoa gera um token pessoal PARA UM GRUPO; o Claude cria materiais naquele grupo, em nome dela. O token aparece
-- uma vez só: o banco guarda só o hash SHA-256. Perder o cargo no grupo corta o acesso (a função confere a cada chamada).
create table public.studio_mcp_tokens (
  id uuid primary key default gen_random_uuid(),
  group_id uuid not null references public.groups (id) on delete cascade,
  user_id uuid not null default auth.uid() references public.profiles (id) on delete cascade,
  name text not null default 'Claude' check (length(name) between 1 and 60),
  token_hash text not null unique check (token_hash ~ '^[0-9a-f]{64}$'),
  created_at timestamptz not null default now(),
  last_used_at timestamptz,
  revoked_at timestamptz
);
create index studio_mcp_tokens_user_idx on public.studio_mcp_tokens (user_id, created_at desc);
create index studio_mcp_tokens_group_idx on public.studio_mcp_tokens (group_id);

alter table public.studio_mcp_tokens enable row level security;
create policy "studio_mcp_tokens: ver os próprios" on public.studio_mcp_tokens for select to authenticated
  using (user_id = (select auth.uid()));
create policy "studio_mcp_tokens: criar" on public.studio_mcp_tokens for insert to authenticated
  with check (user_id = (select auth.uid()) and (select public.studio_role(group_id)) is not null);
create policy "studio_mcp_tokens: revogar os próprios" on public.studio_mcp_tokens for update to authenticated
  using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));
create policy "studio_mcp_tokens: excluir os próprios" on public.studio_mcp_tokens for delete to authenticated
  using (user_id = (select auth.uid()));

revoke all on public.studio_mcp_tokens from anon;
revoke truncate, references, trigger, update on public.studio_mcp_tokens from authenticated;
grant select, insert, delete on public.studio_mcp_tokens to authenticated;
grant update (name, revoked_at) on public.studio_mcp_tokens to authenticated;

-- ---------------------------------------------------------------- página de links
-- Agregador de links do grupo ("link na bio"), gerenciado no Studio. O público lê só pelas funções abaixo, que
-- aplicam o horário (starts_at / ends_at) AQUI no banco: a URL de um link que ainda não abriu nunca sai daqui.
create table public.links (
  id uuid primary key default gen_random_uuid(),
  group_id uuid not null references public.groups (id) on delete cascade,
  title text not null check (length(title) between 1 and 80),
  url text not null check (public.is_http_url(url)),
  description text check (description is null or length(description) <= 160),
  group_label text check (group_label is null or length(group_label) <= 40),
  position integer not null default 0,
  enabled boolean not null default true,
  highlight boolean not null default false,
  -- Antes de abrir: aparece travado com contagem regressiva (true) ou fica totalmente oculto
  countdown boolean not null default true,
  starts_at timestamptz,
  ends_at timestamptz,
  created_by uuid default auth.uid() references auth.users (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint links_window check (starts_at is null or ends_at is null or ends_at > starts_at)
);
create index links_position_idx on public.links (group_id, position, created_at);
create index links_created_by_idx on public.links (created_by);

alter table public.links enable row level security;
create policy "links: equipe lê" on public.links for select to authenticated using ((select public.is_group_staff(group_id)));
create policy "links: equipe cria" on public.links for insert to authenticated with check ((select public.is_group_staff(group_id)));
create policy "links: equipe edita" on public.links for update to authenticated
  using ((select public.is_group_staff(group_id))) with check ((select public.is_group_staff(group_id)));
create policy "links: equipe remove" on public.links for delete to authenticated using ((select public.is_group_staff(group_id)));

revoke all on public.links from anon;
revoke truncate, references, trigger on public.links from authenticated;
grant select, insert, update, delete on public.links to authenticated;

create or replace function public.get_public_links(g uuid)
returns table (
  id uuid, title text, description text, group_label text, "position" integer, highlight boolean,
  starts_at timestamptz, ends_at timestamptz, url text, live boolean
)
language sql stable security definer set search_path = '' as $$
  select l.id, l.title, l.description, l.group_label, l.position, l.highlight, l.starts_at, l.ends_at,
         case when l.starts_at is null or l.starts_at <= now() then l.url end,
         (l.starts_at is null or l.starts_at <= now())
  from public.links l
  where l.group_id = g
    and l.enabled
    and (l.ends_at is null or l.ends_at > now())
    and (l.starts_at is null or l.starts_at <= now() or l.countdown)
  order by l.position, l.created_at;
$$;
revoke execute on function public.get_public_links(uuid) from public;
grant execute on function public.get_public_links(uuid) to anon, authenticated;

-- Aparência da página: foto de fundo e foto abaixo do nome do grupo (uma linha por grupo)
create table public.link_page (
  group_id uuid primary key references public.groups (id) on delete cascade,
  background_url text check (background_url is null or (public.is_http_url(background_url) and length(background_url) <= 500)),
  hero_url text check (hero_url is null or (public.is_http_url(hero_url) and length(hero_url) <= 500)),
  updated_at timestamptz not null default now(),
  updated_by uuid default auth.uid() references auth.users (id) on delete set null
);
create index link_page_updated_by_idx on public.link_page (updated_by);

alter table public.link_page enable row level security;
create policy "link_page: leitura pública" on public.link_page for select to anon, authenticated using (true);
create policy "link_page: equipe cria" on public.link_page for insert to authenticated with check ((select public.is_group_staff(group_id)));
create policy "link_page: equipe edita" on public.link_page for update to authenticated
  using ((select public.is_group_staff(group_id))) with check ((select public.is_group_staff(group_id)));

revoke all on public.link_page from anon;
revoke truncate, references, trigger, delete on public.link_page from authenticated;
grant select on public.link_page to anon;
grant select, insert, update on public.link_page to authenticated;

-- ---------------------------------------------------------------- publicações nas redes
-- Fila de posts (Instagram e LinkedIn). O Studio envia as mídias ao bucket "social" (pasta do grupo) e grava uma
-- linha aqui com o horário; um workflow externo (n8n, opcional) publica o que venceu e grava o resultado de volta com
-- a chave de serviço. As chaves das redes ficam só nesse workflow.
create table public.social_posts (
  id uuid primary key default gen_random_uuid(),
  group_id uuid not null references public.groups (id) on delete cascade,
  title text not null check (length(title) between 1 and 120),
  caption text not null default '' check (length(caption) <= 3000),
  linkedin_caption text,
  channels text[] not null check (cardinality(channels) between 1 and 2 and channels <@ array['instagram', 'linkedin']),
  -- Instagram: 1 a 10 imagens JPG. LinkedIn: um PDF. Só arquivos da PASTA DO PRÓPRIO GRUPO no bucket "social"
  image_urls text[] not null default '{}' check (
    cardinality(image_urls) <= 10
    and public.all_match(image_urls, '^https://[A-Za-z0-9.-]+/storage/v1/object/public/social/' || group_id::text || '/[A-Za-z0-9._/-]+$')
  ),
  pdf_url text check (
    pdf_url is null or pdf_url ~ ('^https://[A-Za-z0-9.-]+/storage/v1/object/public/social/' || group_id::text || '/[A-Za-z0-9._/-]+$')
  ),
  publish_at timestamptz not null default now(),
  status text not null default 'scheduled' check (status in ('pending_approval', 'rejected', 'scheduled', 'publishing', 'published', 'partial', 'failed', 'canceled')),
  -- { instagram: { status, url, error, at }, linkedin: { ... } } preenchido pelo workflow
  results jsonb not null default '{}'::jsonb,
  approved_by uuid references public.profiles (id) on delete set null,
  approved_at timestamptz,
  rejected_reason text check (rejected_reason is null or length(rejected_reason) <= 500),
  -- Quais e-mails de aviso já saíram (requested / approved / rejected): evita aviso repetido
  notify_log jsonb not null default '{}'::jsonb,
  created_by uuid default auth.uid() references auth.users (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint social_posts_instagram_media check (not ('instagram' = any (channels)) or cardinality(image_urls) between 1 and 10),
  constraint social_posts_linkedin_media check (not ('linkedin' = any (channels)) or pdf_url is not null)
);
create index social_posts_due_idx on public.social_posts (publish_at) where status = 'scheduled';
create index social_posts_group_idx on public.social_posts (group_id, created_at desc);
create index social_posts_pending_idx on public.social_posts (group_id, created_at desc) where status = 'pending_approval';
create index social_posts_created_by_idx on public.social_posts (created_by);
create index social_posts_approved_by_idx on public.social_posts (approved_by);

-- Aprovação: o core prepara o post e envia ao líder; o líder aprova (entra na fila) ou recusa com um motivo, e também
-- pode publicar/agendar direto.
--   * core: cria só como pending_approval; edita o próprio post enquanto pendente ou recusado; cancela o próprio
--           pendente/recusado; reenvia o recusado; tenta de novo um post que falhou
--   * líder do grupo: tudo isso + cria direto como scheduled, aprova, recusa
-- A chave de serviço (workflow, SQL Editor) não tem auth.uid(): fica fora destas regras.
create or replace function public.social_posts_guard()
returns trigger language plpgsql set search_path = '' as $$
declare
  leader boolean;
  mine boolean;
  content_changed boolean;
begin
  if auth.uid() is null then return new; end if;
  if tg_op = 'UPDATE' and new.group_id is distinct from old.group_id then raise exception 'O grupo do post não pode ser trocado'; end if;
  leader := public.is_group_leader(new.group_id);

  if tg_op = 'INSERT' then
    if not leader and new.status <> 'pending_approval' then raise exception 'O core team envia o post para o líder aprovar'; end if;
    new.created_by := auth.uid();
    new.rejected_reason := null;
    new.notify_log := '{}'::jsonb;
    if new.status = 'scheduled' then
      new.approved_by := auth.uid();
      new.approved_at := now();
    else
      new.approved_by := null;
      new.approved_at := null;
    end if;
    return new;
  end if;

  mine := old.created_by is not distinct from auth.uid();

  if new.status is distinct from old.status then
    if old.status = 'pending_approval' and new.status = 'scheduled' then
      if not leader then raise exception 'Só o líder aprova'; end if;
      new.approved_by := auth.uid();
      new.approved_at := now();
      new.rejected_reason := null;
    elsif old.status = 'pending_approval' and new.status = 'rejected' then
      if not leader then raise exception 'Só o líder recusa'; end if;
      new.approved_by := null;
      new.approved_at := null;
    elsif old.status = 'rejected' and new.status = 'pending_approval' then
      if not (mine or leader) then raise exception 'Só quem criou o post reenvia'; end if;
      new.notify_log := '{}'::jsonb;
      new.rejected_reason := null;
    elsif old.status in ('pending_approval', 'rejected') and new.status = 'canceled' then
      if not (mine or leader) then raise exception 'Só quem criou o post cancela'; end if;
    elsif old.status = 'scheduled' and new.status = 'canceled' then
      null;
    elsif old.status in ('failed', 'partial') and new.status = 'scheduled' then
      null;
    else
      raise exception 'Mudança de situação não permitida (% -> %)', old.status, new.status;
    end if;
  end if;

  content_changed :=
    new.title is distinct from old.title or new.caption is distinct from old.caption
    or new.channels is distinct from old.channels or new.image_urls is distinct from old.image_urls
    or new.pdf_url is distinct from old.pdf_url or new.publish_at is distinct from old.publish_at;
  if content_changed and not leader then
    if old.status in ('failed', 'partial') and new.status = 'scheduled' then
      null;
    elsif not (mine and old.status in ('pending_approval', 'rejected')) then
      raise exception 'Este post não pode mais ser editado';
    end if;
  end if;
  return new;
end;
$$;
create trigger social_posts_guard before insert or update on public.social_posts
  for each row execute function public.social_posts_guard();

alter table public.social_posts enable row level security;
create policy "social_posts: equipe lê" on public.social_posts for select to authenticated using ((select public.is_group_staff(group_id)));
create policy "social_posts: equipe cria" on public.social_posts for insert to authenticated with check ((select public.is_group_staff(group_id)));
create policy "social_posts: equipe edita" on public.social_posts for update to authenticated
  using ((select public.is_group_staff(group_id))) with check ((select public.is_group_staff(group_id)));
create policy "social_posts: equipe remove" on public.social_posts for delete to authenticated using ((select public.is_group_staff(group_id)));

revoke all on public.social_posts from anon;
revoke truncate, references, trigger on public.social_posts from authenticated;
grant select, insert, update, delete on public.social_posts to authenticated;

-- Bucket público para leitura (a Meta e o LinkedIn buscam as mídias por URL); só JPG e PDF.
-- Caminho: <id do grupo>/<arquivo>. Só a equipe do grupo envia e remove na pasta do grupo.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('social', 'social', true, 31457280, array['image/jpeg', 'application/pdf'])
on conflict (id) do update
  set public = excluded.public, file_size_limit = excluded.file_size_limit, allowed_mime_types = excluded.allowed_mime_types;

create policy "social bucket: leitura pública" on storage.objects for select using (bucket_id = 'social');
create policy "social bucket: equipe do grupo envia" on storage.objects for insert to authenticated
  with check (bucket_id = 'social' and (select public.is_group_staff(public.safe_uuid((storage.foldername(name))[1]))));
create policy "social bucket: equipe do grupo remove" on storage.objects for delete to authenticated
  using (bucket_id = 'social' and (select public.is_group_staff(public.safe_uuid((storage.foldername(name))[1]))));
