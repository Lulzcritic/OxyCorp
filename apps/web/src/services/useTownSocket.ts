import { useEffect, useState, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuthStore } from '../stores/authStore';

export interface TownPlayer {
  userId: string;
  username: string;
  posX: number;
  posY: number;
  posZ: number;
  rotY: number;
}

export function useTownSocket(townId: string) {
  const token = useAuthStore((state) => state.accessToken);
  const [socket, setSocket] = useState<Socket | null>(null);
  const [players, setPlayers] = useState<Record<string, TownPlayer>>({});
  const [isConnected, setIsConnected] = useState(false);
  const lastUpdateRef = useRef<number>(0);

  useEffect(() => {
    if (!token || !townId) return;

    // Connect to NestJS Town Namespace
    const socketInstance = io('http://localhost:3000/town', {
      extraHeaders: { Authorization: `Bearer ${token}` },
      query: { token },
    });

    socketInstance.on('connect', () => {
      console.log(`[TownSocket] Connected to town: ${townId}`);
      setIsConnected(true);
      socketInstance.emit('town:join', { townId });
    });

    socketInstance.on('disconnect', () => {
      console.log('[TownSocket] Disconnected');
      setIsConnected(false);
    });

    socketInstance.on('town:players_list', (list: TownPlayer[]) => {
      const dict: Record<string, TownPlayer> = {};
      list.forEach((p) => {
        dict[p.userId] = p;
      });
      setPlayers(dict);
    });

    socketInstance.on('town:player_joined', (p: TownPlayer) => {
      console.log(`[TownSocket] Player joined: ${p.username}`);
      setPlayers((prev) => ({
        ...prev,
        [p.userId]: p,
      }));
    });

    socketInstance.on('town:player_moved', (p: Omit<TownPlayer, 'username'>) => {
      setPlayers((prev) => {
        if (!prev[p.userId]) return prev;
        return {
          ...prev,
          [p.userId]: {
            ...prev[p.userId],
            posX: p.posX,
            posY: p.posY,
            posZ: p.posZ,
            rotY: p.rotY,
          },
        };
      });
    });

    socketInstance.on('town:player_left', (payload: { userId: string }) => {
      setPlayers((prev) => {
        const next = { ...prev };
        delete next[payload.userId];
        return next;
      });
    });

    setSocket(socketInstance);

    return () => {
      socketInstance.emit('town:leave');
      socketInstance.disconnect();
    };
  }, [townId, token]);

  // Throttled function to update local player coordinates on the socket gateway
  const updateLocalPosition = (posX: number, posY: number, posZ: number, rotY: number) => {
    if (!socket || !isConnected) return;

    const now = Date.now();
    if (now - lastUpdateRef.current < 50) return; // Limit to 20 updates per second (50ms throttle)

    lastUpdateRef.current = now;
    socket.emit('town:move', { posX, posY, posZ, rotY });
  };

  return {
    players: Object.values(players),
    updateLocalPosition,
    isConnected,
  };
}
