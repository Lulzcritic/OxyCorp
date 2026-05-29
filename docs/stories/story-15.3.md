# Story 15.3: Combat Visual Effects (VFX)

**Epic:** Epic 15: Deterministic RTS Combat & Rendering
**Role:** Developer
**Goal:** I want the RTS battle viewer to feature visceral effects for attacks and explosions to make programming feel rewarding.

## Acceptance Criteria

1.  **Weapon Effects**:
    - When a `WeaponFired` event is processed, render a laser beam or projectile moving from the attacker to the target.
    - Projectile speed should match the visual timing of the next tick.

2.  **Impact Effects**:
    - When a `DamageTaken` event occurs, spawn a small particle burst or flash on the target drone.
    - Display floating damage numbers that fade upwards.

3.  **Destruction**:
    - When a `DroneDestroyed` event occurs, trigger a larger explosion particle effect and swap the drone model for a "wreckage" model (leaving scrap on the battlefield).

4.  **Retro Grimdark Aesthetic**:
    - Apply CRT scanline shaders, phosphor glow, or color-grading to the Three.js canvas to ensure the battle viewer looks like an in-universe retro tactical terminal.

## Dev Agent Record

### Status
- [ ] Weapon Effects
- [ ] Impact Effects
- [ ] Destruction
- [ ] Retro Grimdark Aesthetic
