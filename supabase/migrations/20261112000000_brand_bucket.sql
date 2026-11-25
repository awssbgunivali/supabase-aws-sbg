-- Bucket público "brand": ícones, favicons, logos e fundos da marca usados pelo site e pelo Studio. Ficam NO SUPABASE,
-- fora dos repositórios (alguns são da Amazon). Leitura pública; quem envia e troca é só o administrador da plataforma
-- (pelo painel do Supabase, com a chave de serviço ou logado como administrador).
--   brand/site/        sbg-icon.svg, favicon.ico, apple-touch-icon.png   (site)
--   brand/studio/      studio-icon.svg                                   (Studio)
--   brand/icons/ ...   ícones do kit, logos e fundos (opcionais, docs/PRIMEIROS-PASSOS.md)
-- Logo do apoiador padrão da AWS: bucket "sponsors", em global/aws.svg.

insert into storage.buckets (id, name, public, file_size_limit)
values ('brand', 'brand', true, 20971520)
on conflict (id) do update set public = excluded.public, file_size_limit = excluded.file_size_limit;

drop policy if exists "brand bucket: leitura pública" on storage.objects;
create policy "brand bucket: leitura pública" on storage.objects for select using (bucket_id = 'brand');

drop policy if exists "brand bucket: administrador envia" on storage.objects;
create policy "brand bucket: administrador envia" on storage.objects for insert to authenticated
  with check (bucket_id = 'brand' and (select public.is_platform_admin()));
drop policy if exists "brand bucket: administrador troca" on storage.objects;
create policy "brand bucket: administrador troca" on storage.objects for update to authenticated
  using (bucket_id = 'brand' and (select public.is_platform_admin()))
  with check (bucket_id = 'brand' and (select public.is_platform_admin()));
drop policy if exists "brand bucket: administrador remove" on storage.objects;
create policy "brand bucket: administrador remove" on storage.objects for delete to authenticated
  using (bucket_id = 'brand' and (select public.is_platform_admin()));

-- Apoiador padrão da AWS: a logo sai do repositório (vai para o bucket) e o texto não afirma apoio a este grupo
update public.sponsors
set logo = 'global/aws.svg',
    description = '{"pt":"A Amazon Web Services criou o programa AWS Student Builder Groups, que oferece créditos, vouchers de certificação e o AWS Builder Center para estudantes.","en":"Amazon Web Services created the AWS Student Builder Groups program, which offers credits, certification vouchers and AWS Builder Center for students.","es":"Amazon Web Services creó el programa AWS Student Builder Groups, que ofrece créditos, vouchers de certificación y AWS Builder Center para estudiantes."}'::jsonb
where group_id is null and name = 'AWS' and logo = '/sponsors/aws.svg';
