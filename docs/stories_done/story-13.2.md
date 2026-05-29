# Story 13.2: TGR Stat Integration (Speed & Range)

**Epic:** Epic 13: Combat Refinement & Visualization
**Role:** Backend Developer
**Goal:** I want Speed and Range stats to matter in combat, so that different drone types have distinct roles.

## Acceptance Criteria

1.  **Speed (Initiative) Logic**:
    - In `CombatService.resolveBattle()`, sort the turn order based on `drone.speed`.
    - Faster drones move/act first in the tick.

2.  **Range Logic**:
    - In `CombatService`, update targeting:
    - A drone can only attack if `Distance(attacker, target) <= drone.range`.
    - If no target in range, move towards nearest enemy.
    - If multiple targets in range, prioritize: 1. Lowest HP, 2. Closest.

3.  **Movement Logic Update**:
    - Drones can move 1 tile per turn (orthogonal).
    - If `Speed` > 10 (hypothetical threshold for upgrades), maybe move 2 tiles? (Stick to 1 for now).
    - Drones should not move into occupied tiles (Collision logic already exists, refine it).

4.  **BattleLog Schema Update**:
    - Ensure `BattleLog` JSON includes explicit events for: `MOVE`, `ATTACK`, `DAMAGE`, `DESTROY`.
    - Example: `{ type: 'ATTACK', source: 'd1', target: 'd2', value: 10, tick: 5 }`.
    - This schema is critical for the Frontend Replay (Story 13.1).

## Technical Notes

- Refactor `CombatService` loop to handle the phases: Initiative -> Move -> Action.
- Verify that `DroneVariant` DB values are correctly influencing the simulation.

## Dev Agent Record

### Status

- [x] Speed (Initiative) Logic
- [x] Range Logic
- [x] Movement Logic Update
- [x] BattleLog Schema Update

### Completion Notes

- Completely refactored `CombatService.resolveBattle()` to implement tick-based TGR logic
- Implemented Initiative Phase: drones sorted by `speed` stat
- Implemented Range-based targeting with Chebyshev distance calculation
- Implemented Movement: drones move 1 tile towards nearest enemy when no targets in range
- Created `BattleEvent` types: `MOVE`, `ATTACK`, `DAMAGE`, `DESTROY`
- `BattleLog` now returns complete tick-by-tick event history for frontend replay

### File List

- `apps/api/src/combat/battle-log.interface.ts` (NEW)
- `apps/api/src/combat/combat.service.ts` (MODIFIED)
