-- Identidade visual do grupo: logo próprio e cor de destaque (uma das cores da paleta do projeto).
-- A logo é enviada pelo líder para o bucket "team" (pasta do grupo); aqui fica só o endereço.
alter table public.groups add column if not exists logo_url text check (public.is_http_url(logo_url));
alter table public.groups add column if not exists accent text not null default 'purple'
  check (accent in ('purple', 'magenta', 'mint', 'sky', 'orange'));

-- O líder edita as duas colunas junto com o resto das configurações do grupo
grant update (logo_url, accent) on public.groups to authenticated;
