# Story 13.1: Battle Replay Visualization

**Epic:** Epic 13: Combat Refinement & Visualization
**Role:** Frontend Developer
**Goal:** I want to watch a replay of my drone battles, so that I can understand why I won or lost.

## Acceptance Criteria

1.  **Component Creation**:
    - Create `BattleReplay.tsx` component in `apps/web/src/components/combat`.
    - Component accepts `BattleLog` JSON prop (from API response).

2.  **Grid Visualization**:
    - Render a 5x5 grid.
    - Render icons for each drone in the formation at their starting positions.
    - Drones should be visually distinct (Red Team vs Blue Team).

3.  **Playback Controls**:
    - Include Play/Pause button.
    - Include Speed slider (0.5x, 1x, 2x).
    - Include "Skip to End" button.

4.  **Animation Logic**:
    - Using the `BattleLog` (tick-by-tick state), animate:
      - **Movement**: Lerp drone position from `(x1, y1)` to `(x2, y2)`.
      - **Attack**: Show simple laser line/projectile from attacker to defender.
      - **Damage**: Show floating damage number above target.
      - **Destruction**: Hide drone or show explosion icon when HP <= 0.
5.  **Integration**:
    - Add to `SwarmDetailPanel` or a new `BattleResultModal` triggered after a simulation.

## Technical Notes

- Use `framer-motion` for smooth movement animations if available, otherwise CSS transitions.
- State should be derived from current `tick` index.
- Ensure the replay is deterministic (same input always looks the same).

## Dev Agent Record

### Status

- [x] Component Creation
- [x] Grid Visualization
- [x] Playback Controls
- [x] Animation Logic
- [x] Integration

### Completion Notes

- Created `BattleReplay.tsx` component in `apps/web/src/components/combat/`
- Implemented 5x5 grid with team-colored drones (🔵 Team A, 🔴 Team B)
- Added playback controls: Play/Pause, Speed slider (0.5x-2x), Skip to End
- Implemented state derivation from `BattleLog` ticks
- Added HP bars with visual feedback
- Used scoped CSS-in-JS for cyber-industrial styling

### File List

- `apps/web/src/components/combat/BattleReplay.tsx` (NEW)
