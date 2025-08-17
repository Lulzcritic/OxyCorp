// useTownChannel.ts
import { useEffect, useRef, useState } from 'react';
import type { SupabaseClient } from '@supabase/supabase-js';

export type Peer = {
  id: string;
  username: string;
  skin: string;
  p: [number, number, number];
  ry: number;
  _t?: number;
};

type SelfMeta = { id: string; username: string; skin: string };

export function useTownChannel(
  supabase: SupabaseClient,
  self: SelfMeta | null | undefined,
  getSelfPose: () => { p: [number, number, number]; ry: number },
  room = 'town:global',
  hz = 10
) {
  const [connected, setConnected] = useState(false);
  const [peers, setPeers] = useState<Map<string, Peer>>(new Map());

  const peersRef = useRef(new Map<string, Peer>());
  const lastSend = useRef(0);
  const rafRef = useRef<number | null>(null);
  const getSelfPoseRef = useRef(getSelfPose);
  useEffect(() => { getSelfPoseRef.current = getSelfPose; }, [getSelfPose]);

  const periodMs = 1000 / Math.max(1, hz);

  useEffect(() => {
    if (!self?.id) {
      setConnected(false);
      peersRef.current.clear();
      setPeers(new Map());
      return;
    }

    // pour donner une clé de présence unique par onglet :
    const presenceKey = `${self.id}:${Math.random().toString(36).slice(2,8)}`;
    //const presenceKey = self.id;

    let intervalId: number | null = null;

    const ch = supabase.channel(room, { config: { presence: { key: presenceKey }, broadcast: { self: false } } });

    // 1) SYNC: prendre l’état courant des présences (important au montage)
    ch.on('presence', { event: 'sync' }, () => {
      const state = ch.presenceState() as Record<string, any[]>;
      const map = new Map<string, Peer>();
      for (const [key, presList] of Object.entries(state)) {
        if (!presList?.length) continue;
        const latest = presList[presList.length - 1];
        if (key === presenceKey) continue;
        map.set(key, {
          id: key,
          username: latest.username ?? 'anon',
          skin: latest.skin ?? 'default',
          p: [0, 0, 0],
          ry: 0,
          _t: performance.now(),
        });
      }
      peersRef.current = map;
      setPeers(new Map(map));
    });

    // 2) JOIN / LEAVE diff
    ch.on('presence', { event: 'join' }, ({ newPresences }) => {
      let changed = false;
      newPresences.forEach((p: any) => {
        const key = String(p.key ?? '');
        if (!key || key === presenceKey) return;
        if (!peersRef.current.has(key)) {
          peersRef.current.set(key, {
            id: key, username: p.username ?? 'anon', skin: p.skin ?? 'default',
            p: [0,0,0], ry: 0, _t: performance.now(),
          });
          changed = true;
        }
      });
      if (changed) setPeers(new Map(peersRef.current));
    });

    ch.on('presence', { event: 'leave' }, ({ leftPresences }) => {
      let changed = false;
      leftPresences.forEach((p: any) => {
        const key = String(p.key ?? '');
        if (key && peersRef.current.delete(key)) changed = true;
      });
      if (changed) setPeers(new Map(peersRef.current));
    });

    // 3) Positions : auto-créer le peer s'il arrive avant 'sync'/'join'
    ch.on('broadcast', { event: 'pos' }, ({ payload }) => {
      const { id, p, ry } = payload as { id?: string; p: [number,number,number]; ry: number };
      if (!id || id === presenceKey) return;
    
      let peer = peersRef.current.get(id);
      if (!peer) {
        // auto-create minimal peer
        peer = { id, username: 'anon', skin: 'default', p: [0,0,0], ry: 0 };
        peersRef.current.set(id, peer);
      }
      peer.p = p;
      peer.ry = ry;
      peer._t = performance.now();
      setPeers(new Map(peersRef.current));
    });

    ch.subscribe(async (status) => {
      if (status === 'SUBSCRIBED') {
        await ch.track({ id: self.id, username: self.username, skin: self.skin });
    
        // 1) Envoi immédiat d’un snapshot
        const pose0 = getSelfPoseRef.current();
        ch.send({ type: 'broadcast', event: 'pos', payload: { id: presenceKey, ...pose0 } });
    
        // 2) Tick 10 Hz stable (même onglet en arrière-plan)
        intervalId = setInterval(() => {
          const pose = getSelfPoseRef.current();
          ch.send({ type: 'broadcast', event: 'pos', payload: { id: presenceKey, ...pose } });
        }, 100) as unknown as number;
      }
    });

    const tick = () => {
      const now = performance.now();
      if (connected && now - lastSend.current >= periodMs) {
        lastSend.current = now;
        const pose = getSelfPoseRef.current();
        ch.send({ type: 'broadcast', event: 'pos', payload: { id: presenceKey, ...pose } });
      }
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);

    return () => {
      if (intervalId) clearInterval(intervalId);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      ch.untrack();
      supabase.removeChannel(ch);
      peersRef.current.clear();
      setPeers(new Map());
      setConnected(false);
    };
  }, [supabase, room, hz, periodMs, self?.id, self?.username, self?.skin]);

  return { connected, peers };
}
