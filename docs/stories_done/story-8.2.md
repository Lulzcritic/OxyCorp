# Story 8.2: Yield Modifiers & Claiming

**Epic:** Epic 8: The Forge (Refining)
**Role:** Manufacturer
**Goal:** I want to claim my refined goods, potentially with a bonus based on my skills.

## Acceptance Criteria

1.  **Claim Endpoint**:
    - `POST /api/refine/claim` (or reuse generic claim if unified).
    - Validate Job is `COMPLETED`.
2.  **Yield Logic**:
    - Implement a basic `RefiningService.calculateYield(userId, recipe)`.
    - For MVP: Default is 100%. If `specialization` == 'MERCHANT', apply 5x bonus (hardcoded for now until Epic 9 Skills is ready).
    - Add Output Item to Inventory.
3.  **UI**:
    - Show "Ready to Claim" state.
    - Show actual output amount received.

## Technical Notes

- Prepare the service method `calculateYield` to be easily patched with the real Skill System later.

## Dev Agent Record

### Status

- [x] Claim Endpoint
- [x] Yield Logic
- [ ] UI (Frontend - Out of Scope for this Backend Story)

### Completion Notes

- Implemented `POST /api/refine/claim` endpoint.
- Added `calculateYield` method with MVP hardcoded MERCHANT 5x bonus.
- Added `specialization` field to User model in Prisma schema.
- Build verified successfully.

### File List

- `apps/api/prisma/schema.prisma`
- `apps/api/src/refining/refining.service.ts`
- `apps/api/src/refining/refining.controller.ts`
