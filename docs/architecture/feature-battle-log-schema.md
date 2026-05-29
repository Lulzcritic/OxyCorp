# Feature Design: BattleLog Schema & TGR Logic (Epic 13)

## 1. Overview

This document defines the data structures and algorithms required to support **Story 13.1 (Battle Replay)** and **Story 13.2 (TGR Stat Integration)**. The goal is to produce a deterministic, tick-based combat log that the frontend can visualize.

## 2. BattleLog Schema

The `BattleLog` is a JSON object returned by `CombatService.resolveBattle()`. It contains the initial state and a chronological list of events.

### 2.1 JSON Structure

```typescript
interface BattleLog {
  meta: {
    swarmA: SwarmMetadata;
    swarmB: SwarmMetadata;
    timestamp: string;
    totalTicks: number;
    winnerId: string | null;
  };
  initialState: {
    drones: BattleDroneState[]; // Starting positions
  };
  ticks: BattleTick[];
}

interface BattleDroneState {
  id: string; // Unique instance ID
  variantId: string; // e.g., 'DRONE_ATTACK_V1'
  teamId: string; // 'A' or 'B'
  x: number; // 0-4
  y: number; // 0-4
  hp: number;
  maxHp: number;
}

interface BattleTick {
  tick: number;
  events: BattleEvent[];
}

type BattleEvent = MoveEvent | AttackEvent | DamageEvent | DestroyEvent;

interface MoveEvent {
  type: "MOVE";
  droneId: string;
  from: { x: number; y: number };
  to: { x: number; y: number };
}

interface AttackEvent {
  type: "ATTACK";
  sourceId: string;
  targetId: string;
  weapon: "LASER" | "MISSILE" | "KINETIC"; // Future proofing
}

interface DamageEvent {
  type: "DAMAGE";
  targetId: string;
  amount: number;
  remainingHp: number;
  isCrit: boolean;
}

interface DestroyEvent {
  type: "DESTROY";
  targetId: string;
}
```

## 3. Tactical Grid Resolver (TGR) Logic

The TGR loop runs on the backend. It processes the battle tick-by-tick.

### 3.1 Algorithm Checklist

For each Tick (0 to MaxTicks):

1.  **Initiative Phase**:
    - Filter living drones.
    - Sort by `Speed` (Descending).
    - If needed: Randomize ties using `droneId` hash or RNG.

2.  **Action Phase** (Iterate through sorted drones):
    - **Target Acquisition**:
      - Find all valid enemies.
      - Calculate distance: `dx + dy` (Manhattan) or Max(dx, dy) (Chebyshev). _Decision: Use Chebyshev for grid._
      - Filter by `Range`.
    - **Decision Tree**:
      - **IF** (Targets in Range):
        - Select Best Target (Lowest HP % -> Closest).
        - **ATTACK**:
          - Calc Damage: `Attacker.Attack - Target.Defense` (Min 1).
          - Record `ATTACK` and `DAMAGE` events.
          - If Target HP <= 0, record `DESTROY` event and mark dead.
      - **ELSE** (No Targets in Range):
        - **MOVE**:
          - Find nearest enemy (ignoring range).
          - Determine step towards enemy (Pathfinding: Simple A\* or Greedy).
          - Check collision (Target tile must be empty).
          - Update Position.
          - Record `MOVE` event.

3.  **End Condition**:
    - If one team has 0 living drones -> Winner declared.
    - If MaxTicks reached -> Draw (or Tiebreaker based on total HP).

## 4. Frontend Integration

The Frontend `BattleReplay` component will:

1.  Initialize grid with `initialState`.
2.  Use a `cursor` (tick index) to track playback.
3.  On `play()` loop:
    - Apply `events` for current `tick`.
    - Animate transitions (1 sec per tick?).
    - Update local state (HP bars, positions).

## 5. Migration Strategy

- **Phase 1 (Backend)**: Update `CombatService` to generate this structure. Temporary: Return dummy log to verify schema.
- **Phase 2 (Frontend)**: Build Replay UI with mock data.
- **Phase 3 (Integration)**: Connect real Service to UI.
