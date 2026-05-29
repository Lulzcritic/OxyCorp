# Story 10.1: Facility Management Metadata

**Epic:** Epic 10: Infrastructure (Bunker Upgrades)
**Role:** Player
**Goal:** I want to upgrade my facilities (e.g. Storage Hopper Lvl 2), so that I can unlock new capabilities.

## Acceptance Criteria

1.  **Schema Update**:
    - Create `BunkerFacility` model: `id`, `userId`, `type` (ENUM: REFINING_VAT, LOGISTICS_HUB, COMMAND_ARRAY), `level`.
    - Seed initial Level 1 facilities for new users (update User Creation trigger).
2.  **Upgrade Config**:
    - Define a constant/config `FACILITY_COSTS` mapping `(Type, Level) -> Cost (Credits, Items)`.
3.  **API Endpoint**:
    - `GET /api/bunker/facilities` returns current levels.
    - `POST /api/bunker/upgrade` with `{ type }`.
    - Validation: Check Inventory/Credits for cost.
    - Action: Deduct cost, increment Level.

## Technical Notes

- Store the Upgrade Config in a shared library or service constant for easy tweaking.

## Dev Agent Record

### Status

- [x] Schema Update
- [x] Upgrade Config
- [x] API Endpoints

### Completion Notes

- Created `BunkerFacility` model with `FacilityType` enum in Prisma schema.
- Added relation to User model.
- Implemented `FACILITY_COSTS` configuration for upgrade requirements.
- Created `BunkerModule`, `BunkerService`, and `BunkerController`.
- Endpoints: `GET /api/bunker/facilities` and `POST /api/bunker/upgrade`.
- Build verified successfully.

### File List

- `apps/api/prisma/schema.prisma`
- `apps/api/src/bunker/bunker.module.ts`
- `apps/api/src/bunker/bunker.controller.ts`
- `apps/api/src/bunker/bunker.service.ts`
- `apps/api/src/bunker/bunker.constants.ts`
- `apps/api/src/app.module.ts`
