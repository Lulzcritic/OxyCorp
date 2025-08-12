// src/game/useTownChannel.ts
import { useEffect, useRef, useState } from 'react';
import type { SupabaseClient } from '@supabase/supabase-js';

export type Peer = {
  id: string;
  username: string;
  skin: string;
  p: [number, number, number];
  ry: number;
  // timestamps (pour extrapolation éventuelle)
  _t?: number;
};

type SelfMeta = { id: string; username: string; skin: string };

export function useTownChannel(
  supabase: SupabaseClient,
  self: SelfMeta,
  getSelfPose: () => { p: [number, number, number]; ry: number },
  room: string = 'town:global',
  hz = 10
) {
  const [connected, setConnected] = useState(false);
  const [peers, setPeers] = useState<Map<string, Peer>>(new Map());
  const peersRef = useRef<Map<string, Peer>>(new Map());
  const lastSend = useRef(0);
  const periodMs = 1000 / Math.max(1, hz);

  useEffect(() => {
    const ch = supabase.channel(room, { config: { presence: { key: self.id } } });

    ch.on('presence', { event: 'join' }, ({ newPresences }) => {
      newPresences.forEach((p: any) => {
        if (p.key === self.id) return;
        peersRef.current.set(p.key, {
          id: p.key,
          username: p.username,
          skin: p.skin,
          p: [0, 0, 0],
          ry: 0,
          _t: performance.now(),
        });
      });
      setPeers(new Map(peersRef.current));
    });

    ch.on('presence', { event: 'leave' }, ({ leftPresences }) => {
      leftPresences.forEach((p: any) => peersRef.current.delete(p.key));
      setPeers(new Map(peersRef.current));
    });

    ch.on('broadcast', { event: 'pos' }, ({ payload }) => {
      const { id, p, ry } = payload as { id: string; p: [number, number, number]; ry: number };
      if (id === self.id) return;
      const now = performance.now();
      const prev = peersRef.current.get(id);
      if (!prev) return;
      prev.p = p;
      prev.ry = ry;
      prev._t = now;
      setPeers(new Map(peersRef.current));
    });

    ch.subscribe(async (status) => {
      if (status === 'SUBSCRIBED') {
        await ch.track(self); // visible pour les autres
        setConnected(true);
      }
    });

    let raf = 0;
    const tick = () => {
      const now = performance.now();
      if (connected && now - lastSend.current >= periodMs) {
        lastSend.current = now;
        const pose = getSelfPose();
        ch.send({ type: 'broadcast', event: 'pos', payload: { id: self.id, ...pose } });
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(raf);
      ch.untrack();
      supabase.removeChannel(ch);
    };
  }, [supabase, self.id, self.username, self.skin, room, connected, periodMs]);

  return { connected, peers };
}
