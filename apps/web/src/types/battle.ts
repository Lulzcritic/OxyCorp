// Shared BattleLog types for frontend (duplicated from backend)
// TODO: Consider moving to a shared package in future

export interface BattleLog {
  meta: {
    swarmAId: string;
    swarmAName: string;
    swarmBId: string;
    swarmBName: string;
    timestamp: string;
    totalTicks: number;
    winnerId: string | null;
  };
  initialState: {
    drones: BattleDroneState[];
  };
  ticks: BattleTick[];
}

export interface BattleDroneState {
  id: string;
  variantId: string;
  teamId: string;
  x: number;
  y: number;
  hp: number;
  maxHp: number;
}

export interface BattleTick {
  tick: number;
  events: BattleEvent[];
}

export type BattleEvent =
  | MoveEvent
  | AttackEvent
  | DamageEvent
  | DestroyEvent;

export interface MoveEvent {
  type: 'MOVE';
  droneId: string;
  from: { x: number; y: number };
  to: { x: number; y: number };
}

export interface AttackEvent {
  type: 'ATTACK';
  sourceId: string;
  targetId: string;
  weapon: 'LASER' | 'MISSILE' | 'KINETIC';
}

export interface DamageEvent {
  type: 'DAMAGE';
  targetId: string;
  amount: number;
  remainingHp: number;
  isCrit: boolean;
}

export interface DestroyEvent {
  type: 'DESTROY';
  targetId: string;
}
