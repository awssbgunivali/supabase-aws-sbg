-- Badges das certificações AWS (imagem de cada certificação que a pessoa marca no perfil).
-- Bucket público "certs": <id-da-certificação>.webp (o catálogo de ids fica no site, src/data/awsCerts.ts).
-- Leitura pública; só o administrador da plataforma envia, troca ou apaga (pelo /admin).
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('certs', 'certs', true, 204800, array['image/webp', 'image/png'])
on conflict (id) do update
  set public = excluded.public, file_size_limit = excluded.file_size_limit, allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "certs bucket: leitura pública" on storage.objects;
create policy "certs bucket: leitura pública" on storage.objects for select using (bucket_id = 'certs');
drop policy if exists "certs bucket: admin envia" on storage.objects;
create policy "certs bucket: admin envia" on storage.objects for insert to authenticated
  with check (bucket_id = 'certs' and (select public.is_platform_admin()));
drop policy if exists "certs bucket: admin troca" on storage.objects;
create policy "certs bucket: admin troca" on storage.objects for update to authenticated
  using (bucket_id = 'certs' and (select public.is_platform_admin()))
  with check (bucket_id = 'certs' and (select public.is_platform_admin()));
drop policy if exists "certs bucket: admin remove" on storage.objects;
create policy "certs bucket: admin remove" on storage.objects for delete to authenticated
  using (bucket_id = 'certs' and (select public.is_platform_admin()));
