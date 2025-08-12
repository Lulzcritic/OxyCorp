import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { getServiceClient, requireUser } from "../_shared/auth.ts";

type Body = { p: [number, number, number]; ry: number };

serve(async (req) => {
  try {
    const user = await requireUser(req);
    const { p, ry } = (await req.json()) as Body;
    if (!Array.isArray(p) || p.length !== 3 || typeof ry !== 'number') {
      return new Response(JSON.stringify({ error: 'Invalid body' }), { status: 400 });
    }

    const service = getServiceClient();
    await service.from('town_snapshots').upsert({
      player_id: user.id,
      pos_x: p[0], pos_y: p[1], pos_z: p[2], rot_y: ry,
    });

    return new Response(JSON.stringify({ ok: true }), { headers: { "Content-Type": "application/json" } });
  } catch (e) {
    const status = e instanceof Response ? e.status : 500;
    const msg = e instanceof Response ? "Unauthorized" : (e?.message ?? "Internal Error");
    return new Response(JSON.stringify({ error: msg }), { status, headers: { "Content-Type": "application/json" } });
  }
});
