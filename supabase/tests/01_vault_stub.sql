-- Simula o Supabase Vault (sem criptografia de verdade), só para os testes.
create schema vault;
create table vault.secrets (id uuid primary key default gen_random_uuid(), name text, description text, secret text);
create view vault.decrypted_secrets as select id, name, secret as decrypted_secret from vault.secrets;
create function vault.create_secret(new_secret text, new_name text default null, new_description text default '') returns uuid language sql as $$ insert into vault.secrets(name,description,secret) values (new_name,new_description,new_secret) returning id $$;
create function vault.update_secret(secret_id uuid, new_secret text default null, new_name text default null, new_description text default null) returns void language sql as $$ update vault.secrets set secret = coalesce(new_secret, secret) where id = secret_id $$;
