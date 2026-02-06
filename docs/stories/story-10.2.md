# Story 10.2: Progression Gates

**Epic:** Epic 10: Infrastructure (Bunker Upgrades)
**Role:** Designer
**Goal:** I want to block features until facilities are upgraded, so that players feel progression.

## Acceptance Criteria

1.  **Gate Logic**:
    - Implement a guard/check method `checkFacilityLevel(userId, type, minLevel)`.
2.  **Apply Gates**:
    - **Refining**: Can only start Tier 2 recipes if `REFINING_VAT >= 2`.
    - **Market**: Can only List Items if `LOGISTICS_HUB >= 1` (already implied, but maybe increase limits).
    - **Drones**: Max Drone count = `COMMAND_ARRAY` level.
3.  **Frontend Feedback**:
    - UI should show "Requires Level X" on locked buttons.

## Technical Notes

- This is a cross-cutting concern. Create a `FacilityGuard` or helper service to be used in other modules.

## Dev Agent Record

### Status

- [x] Gate Logic (`checkFacilityLevel`, `getMaxDroneCount`)
- [x] Apply Gates - Drones (COMMAND_ARRAY)
- [ ] Apply Gates - Refining (REFINING_VAT) - (Deferred - Tier 2 recipes not yet defined)
- [ ] Apply Gates - Market (LOGISTICS_HUB) - (Already Level 1, future expansion)
- [ ] Frontend Feedback (Out of Scope for Backend)

### Completion Notes

- Added `checkFacilityLevel(userId, type, minLevel)` method to `BunkerService`.
- Added `getMaxDroneCount(userId)` method to `BunkerService`.
- Wired `BunkerModule` into `SwarmsModule`.
- Integrated max drone count validation into `SwarmsService.saveSwarm()`.
- Build verified successfully.

### File List

- `apps/api/src/bunker/bunker.service.ts`
- `apps/api/src/swarms/swarms.module.ts`
- `apps/api/src/swarms/swarms.service.ts`
