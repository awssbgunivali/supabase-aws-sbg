// Servidor de e-mail do PRÓPRIO grupo (o líder cadastra na aba Comunicados). A senha só é lida aqui, no servidor,
// com a chave de serviço (get_group_smtp é restrita a ela).
import { createClient } from 'npm:@supabase/supabase-js@2';

export interface GroupSmtp {
  host: string;
  port: number;
  user: string;
  pass: string;
  from: string;
  fromName: string;
}

export const SMTP_NOT_CONFIGURED =
  'O envio de e-mail deste grupo ainda não foi configurado. O líder cadastra o servidor de e-mail na aba Comunicados.';

export async function loadGroupSmtp(groupId: string, groupName: string): Promise<GroupSmtp | null> {
  const admin = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!, { auth: { persistSession: false } });
  const { data } = await admin.rpc('get_group_smtp', { g: groupId });
  const row = (data as { smtp_host: string; smtp_port: number; smtp_user: string; smtp_pass: string; from_email: string; from_name: string | null }[] | null)?.[0];
  if (!row) return null;
  return {
    host: row.smtp_host,
    port: row.smtp_port,
    user: row.smtp_user,
    pass: row.smtp_pass,
    from: row.from_email,
    fromName: String(row.from_name || groupName).replace(/["\r\n]/g, ''),
  };
}
