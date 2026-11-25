-- AWS Student Builder Groups: conteúdo de cada grupo (parte 2 de 2).
-- Eventos, inscrições, galeria, equipe, apoiadores e comunicados. Tudo tem `group_id`.
-- Leitura pública só do que é público; escrita pela equipe (core/líder) do próprio grupo.

-- ---------------------------------------------------------------- eventos
create table if not exists public.events (
  id uuid primary key default gen_random_uuid(),
  group_id uuid not null references public.groups (id) on delete cascade,
  title text not null check (length(title) between 1 and 150),
  description text check (description is null or length(description) <= 5000),
  date timestamptz not null,
  location text check (location is null or length(location) <= 200),
  video_url text check (public.is_http_url(video_url)),
  meetup_url text check (public.is_http_url(meetup_url)),
  -- Tipo: meetup, ou Student Community Day (o próximo "scd" liga o destaque na Home e em Eventos)
  kind text not null default 'meetup' check (kind in ('meetup', 'scd')),
  cfp_url text check (public.is_http_url(cfp_url)),
  -- [{ "name", "role", "topic", "linkedin", "photo", "profile_id" }]
  speakers jsonb not null default '[]'::jsonb check (
    jsonb_typeof(speakers) = 'array' and jsonb_array_length(speakers) <= 12 and octet_length(speakers::text) <= 20000
  ),
  agenda text check (agenda is null or length(agenda) <= 3000),
  -- Oculto: só a equipe enxerga (prepara o evento antes de divulgar)
  is_hidden boolean not null default false,
  -- Apoiadores do evento: ids de public.sponsors (sem FK de propósito: um removido some na leitura)
  sponsor_ids uuid[] not null default '{}'::uuid[],
  created_at timestamptz not null default now()
);
create index if not exists events_group_date_idx on public.events (group_id, date);

alter table public.events enable row level security;

drop policy if exists "events: leitura pública" on public.events;
create policy "events: leitura pública" on public.events for select to anon, authenticated
  using (not is_hidden);
drop policy if exists "events: equipe lê todos" on public.events;
create policy "events: equipe lê todos" on public.events for select to authenticated
  using ((select public.is_group_staff(group_id)));
drop policy if exists "events: equipe insere" on public.events;
create policy "events: equipe insere" on public.events for insert to authenticated
  with check ((select public.is_group_staff(group_id)));
drop policy if exists "events: equipe edita" on public.events;
create policy "events: equipe edita" on public.events for update to authenticated
  using ((select public.is_group_staff(group_id))) with check ((select public.is_group_staff(group_id)));
drop policy if exists "events: equipe remove" on public.events;
create policy "events: equipe remove" on public.events for delete to authenticated
  using ((select public.is_group_staff(group_id)));

-- ---------------------------------------------------------------- inscrições
create table if not exists public.registrations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references public.profiles (id) on delete cascade,
  event_id uuid not null references public.events (id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (user_id, event_id)
);
create index if not exists registrations_event_idx on public.registrations (event_id);

alter table public.registrations enable row level security;

create or replace function public.event_group_id(ev uuid)
returns uuid language sql stable security definer set search_path = '' as $$
  select group_id from public.events where id = ev;
$$;

drop policy if exists "registrations: ver as próprias ou equipe" on public.registrations;
create policy "registrations: ver as próprias ou equipe" on public.registrations for select to authenticated
  using (user_id = (select auth.uid()) or (select public.is_group_staff(public.event_group_id(event_id))));
drop policy if exists "registrations: inscrever a si mesmo" on public.registrations;
create policy "registrations: inscrever a si mesmo" on public.registrations for insert to authenticated
  with check (user_id = (select auth.uid()));
drop policy if exists "registrations: cancelar a própria ou equipe" on public.registrations;
create policy "registrations: cancelar a própria ou equipe" on public.registrations for delete to authenticated
  using (user_id = (select auth.uid()) or (select public.is_group_staff(public.event_group_id(event_id))));

-- ---------------------------------------------------------------- galeria
create table if not exists public.gallery_photos (
  id uuid primary key default gen_random_uuid(),
  group_id uuid not null references public.groups (id) on delete cascade,
  storage_path text not null unique check (storage_path !~ '\.\.' and length(storage_path) <= 300), -- no bucket "gallery": <group_id>/arquivo
  caption text check (caption is null or length(caption) <= 300),
  taken_at date,
  -- false = foto guardada, fora da galeria pública
  show_on_site boolean not null default true,
  created_by uuid default auth.uid() references auth.users (id) on delete set null,
  created_at timestamptz not null default now()
);
create index if not exists gallery_photos_order_idx on public.gallery_photos (group_id, taken_at desc nulls last, created_at desc);

alter table public.gallery_photos enable row level security;

drop policy if exists "gallery_photos: leitura pública" on public.gallery_photos;
create policy "gallery_photos: leitura pública" on public.gallery_photos for select to anon, authenticated
  using (show_on_site);
drop policy if exists "gallery_photos: equipe lê todas" on public.gallery_photos;
create policy "gallery_photos: equipe lê todas" on public.gallery_photos for select to authenticated
  using ((select public.is_group_staff(group_id)));
drop policy if exists "gallery_photos: equipe insere" on public.gallery_photos;
create policy "gallery_photos: equipe insere" on public.gallery_photos for insert to authenticated
  with check ((select public.is_group_staff(group_id)));
drop policy if exists "gallery_photos: equipe edita" on public.gallery_photos;
create policy "gallery_photos: equipe edita" on public.gallery_photos for update to authenticated
  using ((select public.is_group_staff(group_id))) with check ((select public.is_group_staff(group_id)));
drop policy if exists "gallery_photos: equipe remove" on public.gallery_photos;
create policy "gallery_photos: equipe remove" on public.gallery_photos for delete to authenticated
  using ((select public.is_group_staff(group_id)));

-- ---------------------------------------------------------------- equipe do site
create table if not exists public.team_years (
  group_id uuid not null references public.groups (id) on delete cascade,
  year integer not null check (year between 2020 and 2100),
  -- Gestão oculta: o líder prepara a próxima antes da virada
  is_hidden boolean not null default false,
  updated_at timestamptz not null default now(),
  primary key (group_id, year)
);

create table if not exists public.team_members (
  id uuid primary key default gen_random_uuid(),
  group_id uuid not null references public.groups (id) on delete cascade,
  year int not null check (year between 2020 and 2100),
  is_leader boolean not null default false,
  name text not null check (length(name) between 1 and 80),
  role jsonb not null default '{}'::jsonb check (length(role::text) <= 600),   -- {"pt": "...", "en": "...", "es": "..."}
  bio jsonb check (bio is null or length(bio::text) <= 4000),
  photo_url text check (public.is_http_url(photo_url)),
  certifications text[] not null default '{}' check (coalesce(array_length(certifications, 1), 0) <= 30),
  linkedin text check (public.is_http_url(linkedin)),
  github text check (public.is_http_url(github)),
  builder_center text check (public.is_http_url(builder_center)),
  sort_order int not null default 0,
  -- Com vínculo, a página mostra os dados ATUAIS do perfil (foto, bio, redes, certificações)
  profile_id uuid references public.profiles (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists team_members_group_year_idx on public.team_members (group_id, year desc, is_leader desc, sort_order);
create index if not exists team_members_profile_id_idx on public.team_members (profile_id);

alter table public.team_years enable row level security;
alter table public.team_members enable row level security;

create or replace function public.team_year_hidden(g uuid, y integer)
returns boolean language sql stable security definer set search_path = '' as $$
  select exists (select 1 from public.team_years ty where ty.group_id = g and ty.year = y and ty.is_hidden);
$$;

drop policy if exists "team_years: equipe lê" on public.team_years;
create policy "team_years: equipe lê" on public.team_years for select to authenticated
  using ((select public.is_group_staff(group_id)));
drop policy if exists "team_years: líder insere" on public.team_years;
create policy "team_years: líder insere" on public.team_years for insert to authenticated
  with check ((select public.is_group_leader(group_id)));
drop policy if exists "team_years: líder edita" on public.team_years;
create policy "team_years: líder edita" on public.team_years for update to authenticated
  using ((select public.is_group_leader(group_id))) with check ((select public.is_group_leader(group_id)));
drop policy if exists "team_years: líder remove" on public.team_years;
create policy "team_years: líder remove" on public.team_years for delete to authenticated
  using ((select public.is_group_leader(group_id)));

drop policy if exists "team_members: leitura pública" on public.team_members;
create policy "team_members: leitura pública" on public.team_members for select to anon, authenticated
  using (not public.team_year_hidden(group_id, year));
drop policy if exists "team_members: equipe lê todos" on public.team_members;
create policy "team_members: equipe lê todos" on public.team_members for select to authenticated
  using ((select public.is_group_staff(group_id)));
drop policy if exists "team_members: líder insere" on public.team_members;
create policy "team_members: líder insere" on public.team_members for insert to authenticated
  with check ((select public.is_group_leader(group_id)));
drop policy if exists "team_members: líder edita" on public.team_members;
create policy "team_members: líder edita" on public.team_members for update to authenticated
  using ((select public.is_group_leader(group_id))) with check ((select public.is_group_leader(group_id)));
drop policy if exists "team_members: líder remove" on public.team_members;
create policy "team_members: líder remove" on public.team_members for delete to authenticated
  using ((select public.is_group_leader(group_id)));

-- Dados públicos de quem está na Equipe com vínculo (não revela gestões ocultas)
create or replace function public.get_team_profiles(g uuid)
returns table (
  id uuid, full_name text, headline text, bio text, avatar_url text,
  linkedin text, github text, instagram text, website text, certifications jsonb
)
language sql stable security definer set search_path = '' as $$
  select distinct p.id, p.full_name, p.headline, p.bio, p.avatar_url, p.linkedin, p.github, p.instagram, p.website, p.certifications
  from public.team_members tm
  join public.profiles p on p.id = tm.profile_id
  where tm.group_id = g and (not public.team_year_hidden(tm.group_id, tm.year) or public.is_group_staff(g));
$$;

-- Perfil público dos palestrantes vinculados aos eventos do grupo
create or replace function public.get_event_speaker_profiles(g uuid)
returns table (id uuid, full_name text, headline text, avatar_url text, linkedin text, github text, instagram text, website text)
language sql stable security definer set search_path = '' as $$
  select distinct p.id, p.full_name, p.headline, p.avatar_url, p.linkedin, p.github, p.instagram, p.website
  from public.events e
  cross join lateral jsonb_array_elements(e.speakers) s
  join public.profiles p on p.id::text = s->>'profile_id'
  where e.group_id = g and not e.is_hidden;
$$;

-- ---------------------------------------------------------------- apoiadores
-- group_id nulo = apoiador do PROGRAMA (aparece em todos os grupos; só o administrador da plataforma edita)
create table if not exists public.sponsors (
  id uuid primary key default gen_random_uuid(),
  group_id uuid references public.groups (id) on delete cascade,
  name text not null check (char_length(name) between 1 and 80),
  -- Logo: URL completa, caminho do site (/sponsors/x.svg) ou caminho no bucket "sponsors" (<group_id>/arquivo)
  logo text not null check (char_length(logo) between 1 and 300),
  logo_bg text check (logo_bg is null or logo_bg ~ '^#[0-9a-fA-F]{6}$'),
  url text check (url is null or url ~* '^https?://'),
  tier text not null default 'apoio' check (tier in ('principal', 'apoio')),
  description jsonb not null default '{}'::jsonb check (length(description::text) <= 3000),
  sort_order integer not null default 0,
  active boolean not null default true,
  in_posts boolean not null default true,
  post_scale integer not null default 100 check (post_scale between 40 and 160),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists sponsors_order_idx on public.sponsors (group_id, tier, sort_order, created_at);

alter table public.sponsors enable row level security;

drop policy if exists "sponsors: leitura pública" on public.sponsors;
create policy "sponsors: leitura pública" on public.sponsors for select to anon, authenticated using (active);
drop policy if exists "sponsors: equipe lê tudo" on public.sponsors;
create policy "sponsors: equipe lê tudo" on public.sponsors for select to authenticated
  using ((select public.is_group_staff(group_id)));
drop policy if exists "sponsors: equipe insere" on public.sponsors;
create policy "sponsors: equipe insere" on public.sponsors for insert to authenticated
  with check ((select public.is_group_staff(group_id)));
drop policy if exists "sponsors: equipe edita" on public.sponsors;
create policy "sponsors: equipe edita" on public.sponsors for update to authenticated
  using ((select public.is_group_staff(group_id))) with check ((select public.is_group_staff(group_id)));
drop policy if exists "sponsors: equipe remove" on public.sponsors;
create policy "sponsors: equipe remove" on public.sponsors for delete to authenticated
  using ((select public.is_group_staff(group_id)));

-- A AWS como apoiador padrão de todos os grupos (a logo fica no bucket sponsors, global/aws.svg: veja a migration do bucket brand)
insert into public.sponsors (group_id, name, logo, url, tier, description, sort_order)
select null, 'AWS', 'global/aws.svg', 'https://aws.amazon.com/', 'principal',
  '{"pt":"A Amazon Web Services criou o programa AWS Student Builder Groups, que oferece créditos, vouchers de certificação e o AWS Builder Center para estudantes.","en":"Amazon Web Services created the AWS Student Builder Groups program, which offers credits, certification vouchers and AWS Builder Center for students.","es":"Amazon Web Services creó el programa AWS Student Builder Groups, que ofrece créditos, vouchers de certificación y AWS Builder Center para estudiantes."}'::jsonb,
  0
where not exists (select 1 from public.sponsors where group_id is null and name = 'AWS');

-- ---------------------------------------------------------------- comunicados por e-mail
create table if not exists public.announcements (
  id uuid primary key default gen_random_uuid(),
  group_id uuid not null references public.groups (id) on delete cascade,
  subject text not null check (length(subject) between 1 and 200),
  message text not null check (length(message) between 1 and 5000),
  link text check (public.is_http_url(link)),
  recipients integer not null default 0 check (recipients >= 0),
  sent_by uuid default auth.uid() references auth.users (id) on delete set null,
  created_at timestamptz not null default now()
);
create index if not exists announcements_group_created_idx on public.announcements (group_id, created_at desc);
create index if not exists announcements_sent_by_idx on public.announcements (sent_by);

alter table public.announcements enable row level security;

drop policy if exists "announcements: equipe lê" on public.announcements;
create policy "announcements: equipe lê" on public.announcements for select to authenticated
  using ((select public.is_group_staff(group_id)));
drop policy if exists "announcements: equipe registra" on public.announcements;
create policy "announcements: equipe registra" on public.announcements for insert to authenticated
  with check ((select public.is_group_staff(group_id)) and sent_by = (select auth.uid()));

-- ---------------------------------------------------------------- Storage
-- Buckets públicos para leitura. Cada arquivo fica numa pasta com o id do grupo: "<group_id>/arquivo.webp".
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types) values
  ('gallery',  'gallery',  true, 5242880, array['image/jpeg', 'image/png', 'image/webp']),
  ('team',     'team',     true, 3145728, array['image/jpeg', 'image/png', 'image/webp']),
  ('speakers', 'speakers', true, 3145728, array['image/jpeg', 'image/png', 'image/webp']),
  ('sponsors', 'sponsors', true, 3145728, array['image/png', 'image/jpeg', 'image/webp', 'image/svg+xml']),
  ('avatars',  'avatars',  true, 2097152, array['image/jpeg', 'image/png', 'image/webp'])
on conflict (id) do update
  set public = excluded.public, file_size_limit = excluded.file_size_limit, allowed_mime_types = excluded.allowed_mime_types;

do $$
declare b text;
begin
  foreach b in array array['gallery', 'team', 'speakers', 'sponsors', 'avatars'] loop
    execute format('drop policy if exists %I on storage.objects', b || ' bucket: leitura pública');
    execute format('create policy %I on storage.objects for select using (bucket_id = %L)', b || ' bucket: leitura pública', b);
  end loop;
end $$;

-- Galeria, apoiadores e fotos de palestrantes: core team e líder do grupo
drop policy if exists "gallery bucket: equipe envia" on storage.objects;
create policy "gallery bucket: equipe envia" on storage.objects for insert to authenticated
  with check (bucket_id = 'gallery' and (select public.is_group_staff(public.storage_group_id(name))));
drop policy if exists "gallery bucket: equipe remove" on storage.objects;
create policy "gallery bucket: equipe remove" on storage.objects for delete to authenticated
  using (bucket_id = 'gallery' and (select public.is_group_staff(public.storage_group_id(name))));

drop policy if exists "sponsors bucket: equipe envia" on storage.objects;
create policy "sponsors bucket: equipe envia" on storage.objects for insert to authenticated
  with check (bucket_id = 'sponsors' and (select public.is_group_staff(public.storage_group_id(name))));
drop policy if exists "sponsors bucket: equipe remove" on storage.objects;
create policy "sponsors bucket: equipe remove" on storage.objects for delete to authenticated
  using (bucket_id = 'sponsors' and (select public.is_group_staff(public.storage_group_id(name))));

drop policy if exists "speakers bucket: equipe envia" on storage.objects;
create policy "speakers bucket: equipe envia" on storage.objects for insert to authenticated
  with check (bucket_id = 'speakers' and (select public.is_group_staff(public.storage_group_id(name))));
drop policy if exists "speakers bucket: equipe remove" on storage.objects;
create policy "speakers bucket: equipe remove" on storage.objects for delete to authenticated
  using (bucket_id = 'speakers' and (select public.is_group_staff(public.storage_group_id(name))));

-- Fotos da equipe: só o líder
drop policy if exists "team bucket: líder envia" on storage.objects;
create policy "team bucket: líder envia" on storage.objects for insert to authenticated
  with check (bucket_id = 'team' and (select public.is_group_leader(public.storage_group_id(name))));
drop policy if exists "team bucket: líder remove" on storage.objects;
create policy "team bucket: líder remove" on storage.objects for delete to authenticated
  using (bucket_id = 'team' and (select public.is_group_leader(public.storage_group_id(name))));

-- Fotos de perfil: cada pessoa na própria pasta (avatars/<uid>/arquivo.webp)
drop policy if exists "avatars: envia na própria pasta" on storage.objects;
create policy "avatars: envia na própria pasta" on storage.objects for insert to authenticated
  with check (bucket_id = 'avatars' and (storage.foldername(name))[1] = (select auth.uid())::text);
drop policy if exists "avatars: atualiza na própria pasta" on storage.objects;
create policy "avatars: atualiza na própria pasta" on storage.objects for update to authenticated
  using (bucket_id = 'avatars' and (storage.foldername(name))[1] = (select auth.uid())::text);
drop policy if exists "avatars: remove da própria pasta" on storage.objects;
create policy "avatars: remove da própria pasta" on storage.objects for delete to authenticated
  using (bucket_id = 'avatars' and (storage.foldername(name))[1] = (select auth.uid())::text);

-- ---------------------------------------------------------------- privilégios (defesa em profundidade)
-- O RLS é a regra principal; aqui tiramos o que a API não precisa ter.
revoke all on all tables in schema public from anon, authenticated;
grant select on public.groups, public.events, public.gallery_photos, public.team_members, public.sponsors to anon;
grant select on public.groups, public.events, public.gallery_photos, public.team_members, public.sponsors,
  public.profiles, public.group_members, public.registrations, public.team_years, public.announcements to authenticated;
grant insert, update, delete on public.events, public.gallery_photos, public.team_members, public.team_years, public.sponsors to authenticated;
grant insert, delete on public.registrations to authenticated;
grant insert on public.announcements to authenticated;
grant delete on public.group_members to authenticated;
-- Colunas editáveis: o próprio perfil; o mural do próprio membro; os dados do grupo (líder). O cargo nunca.
grant update (full_name, avatar_url, headline, bio, linkedin, github, instagram, website, certifications, email_news)
  on public.profiles to authenticated;
grant update (show_in_wall) on public.group_members to authenticated;
grant update (name, short_name, institution, city, country, founded_year, default_lang, tagline, about, mascot,
              socials, urls, features, updated_at)
  on public.groups to authenticated;

alter default privileges in schema public revoke all on tables from anon, authenticated;

-- Funções: ninguém chama pela API o que não precisa
revoke execute on all functions in schema public from public, anon, authenticated;
grant execute on function
  public.is_http_url(text), public.valid_url_map(jsonb), public.valid_localized(jsonb, integer), public.valid_certifications(jsonb),
  public.storage_group_id(text), public.team_year_hidden(uuid, integer),
  public.get_member_wall(uuid), public.get_team_profiles(uuid), public.get_event_speaker_profiles(uuid)
  to anon, authenticated;
grant execute on function
  public.is_platform_admin(), public.group_role(uuid), public.is_group_staff(uuid), public.is_group_leader(uuid),
  public.is_staff_of_user(uuid), public.event_group_id(uuid),
  public.join_group(uuid), public.set_member_role(uuid, uuid, text), public.set_member_wall(uuid, uuid, boolean),
  public.remove_member(uuid, uuid), public.add_member_by_email(uuid, text, text), public.list_group_members(uuid),
  public.count_group_recipients(uuid), public.group_announcement_emails(uuid),
  public.create_group(text, text, text, text), public.set_group_leader(uuid, text), public.set_group_status(uuid, text),
  public.admin_list_groups()
  to authenticated;
