// supabase/functions/_shared/auth.ts
import { createClient, SupabaseClient } from 'https://esm.sh/@supabase/supabase-js@2';

export function getAnonClient(authHeader?: string): SupabaseClient {
  const url = Deno.env.get('SUPABASE_URL')!;
  const anon = Deno.env.get('SUPABASE_ANON_KEY')!;
  return createClient(url, anon, { global: { headers: authHeader ? { Authorization: authHeader } : {} } });
}

export function getServiceClient(): SupabaseClient {
  const url = Deno.env.get('SUPABASE_URL')!;
  const service = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
  return createClient(url, service);
}

export async function requireUser(req: Request) {
  const authHeader = req.headers.get('Authorization') ?? '';
  const supa = getAnonClient(authHeader);
  const { data, error } = await supa.auth.getUser();
  if (error || !data.user) throw new Response('Unauthorized', { status: 401 });
  return data.user;
}
