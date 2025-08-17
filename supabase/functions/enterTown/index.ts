import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { getServiceClient, requireUser } from "../_shared/auth.ts";
import { corsHeaders } from "../_shared/cors.ts";

serve(async (req) => {
  // 1) Preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const user = await requireUser(req);
    const service = getServiceClient();

    const { data: snap } = await service
      .from("town_snapshots")
      .select("pos_x,pos_y,pos_z,rot_y")
      .eq("player_id", user.id)
      .maybeSingle();

    const spawn = snap
      ? { x: snap.pos_x, y: snap.pos_y, z: snap.pos_z, ry: snap.rot_y }
      : { x: 0, y: 0, z: 0, ry: 0 };

    if (!snap) {
      await service.from("town_snapshots").insert({
        player_id: user.id,
        pos_x: spawn.x, pos_y: spawn.y, pos_z: spawn.z, rot_y: spawn.ry,
      });
    }

    return new Response(JSON.stringify({ spawn }), {
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (e) {
    const status = e instanceof Response ? e.status : 500;
    const msg = e instanceof Response ? "Unauthorized" : (e?.message ?? "Internal Error");
    return new Response(JSON.stringify({ error: msg }), {
      status,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  }
});
