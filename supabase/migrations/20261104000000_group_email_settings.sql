-- Envio de e-mail POR GRUPO: cada líder cadastra o próprio servidor de e-mail (SMTP) no painel, e os
-- comunicados saem pela conta dele. Não existe mais um e-mail único da plataforma.
--
-- A senha SMTP nunca fica em tabela legível: vai para o Supabase Vault (criptografada). O navegador não
-- consegue ler a senha de volta; só a Edge Function send-announcement (chave de serviço) lê, via get_group_smtp.

create table if not exists public.group_email_settings (
  group_id uuid primary key references public.groups (id) on delete cascade,
  smtp_host text not null check (smtp_host ~ '^[a-z0-9]([a-z0-9.-]*[a-z0-9])?$' and length(smtp_host) <= 200),
  smtp_port integer not null default 465 check (smtp_port in (25, 465, 587, 2525)),
  smtp_user text not null check (length(smtp_user) between 1 and 200),
  -- id do segredo no Vault (a senha em si)
  smtp_pass_secret uuid not null,
  from_email text not null check (from_email ~ '^[^\s@<>()"'',;]+@[^\s@<>()"'',;]+\.[^\s@<>()"'',;]{2,}$' and length(from_email) <= 200),
  from_name text check (from_name is null or length(from_name) <= 100),
  updated_at timestamptz not null default now()
);

-- Sem policy nenhuma: o navegador nunca lê a tabela. Tudo passa pelas funções abaixo.
alter table public.group_email_settings enable row level security;
revoke all on public.group_email_settings from anon, authenticated;

-- Servidores internos não valem (evita usar a função para sondar a rede do projeto)
create or replace function public.is_public_smtp_host(h text)
returns boolean language sql immutable set search_path = '' as $$
  select h ~ '\.' 
    and h !~ '^(localhost|0\.|10\.|127\.|169\.254\.|192\.168\.|172\.(1[6-9]|2[0-9]|3[01])\.)'
    and h !~ '\.(local|internal|localhost|lan|home|corp)$'
    and h !~ '^[0-9.]+$';
$$;

-- Configuração sem a senha: staff do grupo vê (para saber se o envio está pronto); só o líder altera
create or replace function public.get_group_email_settings(g uuid)
returns table (smtp_host text, smtp_port integer, smtp_user text, from_email text, from_name text, configured boolean)
language plpgsql stable security definer set search_path = '' as $$
begin
  if not public.is_group_staff(g) then raise exception 'Apenas a equipe do grupo' using errcode = '42501'; end if;
  return query
    select s.smtp_host, s.smtp_port, s.smtp_user, s.from_email, s.from_name, true
    from public.group_email_settings s where s.group_id = g;
  if not found then
    return query select null::text, 465, null::text, null::text, null::text, false;
  end if;
end;
$$;

-- Salva a configuração. Senha vazia = mantém a que já existe (obrigatória na primeira vez).
create or replace function public.set_group_email_settings(
  g uuid, p_host text, p_port integer, p_user text, p_pass text, p_from_email text, p_from_name text
) returns void
language plpgsql security definer set search_path = '' as $$
declare
  host text := lower(trim(p_host));
  existing uuid;
  secret_id uuid;
begin
  if not public.is_group_leader(g) then raise exception 'Apenas o líder pode configurar o envio de e-mail' using errcode = '42501'; end if;
  if not public.is_public_smtp_host(host) then raise exception 'Servidor de e-mail inválido' using errcode = '22023'; end if;

  select smtp_pass_secret into existing from public.group_email_settings where group_id = g;

  if coalesce(p_pass, '') <> '' then
    if existing is null then
      secret_id := vault.create_secret(p_pass, 'smtp-' || g::text, 'Senha SMTP do grupo');
    else
      perform vault.update_secret(existing, p_pass);
      secret_id := existing;
    end if;
  elsif existing is null then
    raise exception 'Informe a senha do servidor de e-mail' using errcode = '22023';
  else
    secret_id := existing;
  end if;

  insert into public.group_email_settings (group_id, smtp_host, smtp_port, smtp_user, smtp_pass_secret, from_email, from_name, updated_at)
  values (g, host, p_port, trim(p_user), secret_id, lower(trim(p_from_email)), nullif(trim(coalesce(p_from_name, '')), ''), now())
  on conflict (group_id) do update
    set smtp_host = excluded.smtp_host, smtp_port = excluded.smtp_port, smtp_user = excluded.smtp_user,
        smtp_pass_secret = excluded.smtp_pass_secret, from_email = excluded.from_email,
        from_name = excluded.from_name, updated_at = now();
end;
$$;

create or replace function public.clear_group_email_settings(g uuid)
returns void language plpgsql security definer set search_path = '' as $$
declare existing uuid;
begin
  if not public.is_group_leader(g) then raise exception 'Apenas o líder pode configurar o envio de e-mail' using errcode = '42501'; end if;
  select smtp_pass_secret into existing from public.group_email_settings where group_id = g;
  delete from public.group_email_settings where group_id = g;
  if existing is not null then delete from vault.secrets where id = existing; end if;
end;
$$;

-- Só a Edge Function (chave de serviço) lê a configuração completa, com a senha
create or replace function public.get_group_smtp(g uuid)
returns table (smtp_host text, smtp_port integer, smtp_user text, smtp_pass text, from_email text, from_name text)
language sql stable security definer set search_path = '' as $$
  select s.smtp_host, s.smtp_port, s.smtp_user, d.decrypted_secret, s.from_email, s.from_name
  from public.group_email_settings s
  join vault.decrypted_secrets d on d.id = s.smtp_pass_secret
  where s.group_id = g;
$$;

revoke execute on function public.is_public_smtp_host(text) from public, anon, authenticated;
revoke execute on function public.get_group_email_settings(uuid) from public, anon;
revoke execute on function public.set_group_email_settings(uuid, text, integer, text, text, text, text) from public, anon;
revoke execute on function public.clear_group_email_settings(uuid) from public, anon;
revoke execute on function public.get_group_smtp(uuid) from public, anon, authenticated;
grant execute on function public.get_group_email_settings(uuid) to authenticated;
grant execute on function public.set_group_email_settings(uuid, text, integer, text, text, text, text) to authenticated;
grant execute on function public.clear_group_email_settings(uuid) to authenticated;
grant execute on function public.get_group_smtp(uuid) to service_role;
