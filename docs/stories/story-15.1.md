# Story 15.1: Deterministic Combat Engine

**Epic:** Epic 15: Deterministic RTS Combat & Rendering
**Role:** Developer
**Goal:** I want a headless tick-based combat simulator that executes drone AST scripts and outputs a deterministic event log.

## Acceptance Criteria

1.  **Simulation Loop**:
    - Build a tick-based combat runner (`CombatSimulationService`).
    - Takes inputs: Swarm A (Drones, Stats, Cartridge AST), Swarm B, and a Grid/Map configuration.
    - Runs a continuous loop (e.g., 10 ticks per second simulation time) until one side is destroyed or a time limit is reached.

2.  **AST Execution**:
    - Build an interpreter that safely evaluates the JSON AST logic (from Epic 13) for each drone on every tick.
    - Resolve commands like `moveToTarget`, `aimAt`, `fire` based on drone stats (Speed, Range, Attack Rate).

3.  **Event Log Generation**:
    - Produce a detailed JSON event log output that records all state changes per tick.
    - Example events: `DroneMoved`, `WeaponFired`, `DamageTaken`, `DroneDestroyed`.

4.  **Security/Determinism**:
    - Absolutely no random numbers unless seeded identically for reproducibility.
    - Must resolve combat purely on the backend.

## Dev Agent Record

### Status
- [ ] Simulation Loop
- [ ] AST Execution
- [ ] Event Log Generation
- [ ] Security/Determinism
