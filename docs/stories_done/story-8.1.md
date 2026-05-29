# Story 8.1: Refining Schema & Queue

**Epic:** Epic 8: The Forge (Refining)
**Role:** Manufacturer
**Goal:** I want to queue up a refining job (e.g., 10 Iron -> 1 Steel), so that I can process materials over time.

## Acceptance Criteria

1.  **Schema Update**:
    - Create `RefiningJob` model in Prisma.
    - Fields: `id`, `userId`, `recipeId` (ENUM or String), `startTime`, `endTime`, `status`.
    - Create `RefiningRecipe` config/constant (or DB table if dynamic) defining Inputs (Item, Qty) and Outputs (Item, Qty, Time).
2.  **API Endpoint - Start**:
    - `POST /api/refine/start` with `{ recipeId, quantity }`.
    - Validation: User has enough Input Inventory.
    - Action: Deduct Input Inventory, Create Job record.
3.  **API Endpoint - List**:
    - `GET /api/refine/jobs` returns active jobs.

## Technical Notes

- Reuse the `Job` pattern if possible, but refining might run in parallel batches unlike mining (single focus).

## Dev Agent Record

### Status

- [x] Schema Update
- [x] API Endpoint - Start
- [x] API Endpoint - List

### Completion Notes

- Implemented `RefiningJob` logic using the `Job` model with `type: REFINING` and `data` JSON field.
- Created `RefiningModule`, `Service`, and `Controller`.
- Defined `REFINING_RECIPES` constant for MVP.
- **Note:** E2E tests were created (`refining.e2e-spec.ts`) but failed to connect to the database environment (`127.0.0.1:5432`). Verify `DATABASE_URL` connectivity in the deployment environment. Code build passed.

### File List

- `apps/api/prisma/schema.prisma`
- `apps/api/src/refining/refining.module.ts`
- `apps/api/src/refining/refining.controller.ts`
- `apps/api/src/refining/refining.service.ts`
- `apps/api/src/refining/refining.constants.ts`
- `apps/api/src/refining/dto/start-refining.dto.ts`
- `apps/api/src/app.module.ts`
- `apps/api/test/refining.e2e-spec.ts`
