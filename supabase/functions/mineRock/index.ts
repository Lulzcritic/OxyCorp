import { serve } from 'https://deno.land/std/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

serve(async (req) => {
  const { rockId } = await req.json();
  const user = getUserFromRequest(req); // via headers/JWT

  const client = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

  await client.from('resources').insert({
    user_id: user.id,
    resource: 'iron',
    amount: 1,
    source: rockId,
  });

  return new Response('ok');
});
