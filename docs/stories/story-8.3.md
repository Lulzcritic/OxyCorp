# Story 8.3: Refining UI

**Epic:** Epic 8: The Forge (Refining)
**Role:** Manufacturer
**Goal:** I want a visual interface to manage my refining batches and see when they are ready.

## Acceptance Criteria

1.  **Refining Panel**:
    - Create `RefiningPanel` component reachable from Dashboard or Sidebar.
    - Display list of available recipes (`REFINING_RECIPES` from backend, or hardcoded if static).
    - Input for `quantity` (batches).
    - "Start Job" button (calls `POST /api/refine/start`).
2.  **Job Status**:
    - List active jobs.
    - Show countdown timer/progress bar for each job.
    - Show "Ready" state when timer ends.
3.  **Claim Interaction**:
    - "Claim" button for completed jobs (calls `POST /api/refine/claim` or generic claim).
    - Optimistic update: Remove job from list immediately, show toast with results.

## Technical Notes

- **Components**: `RefiningPanel`, `JobCard`.
- **State**: Use React Query for polling active jobs or listen for WebSocket updates (if available).
- **Design**: Industrial aesthetic, "Heat" indicators.

## Dev Agent Record

### Status

- [x] Refining Panel (RefiningWidget component)
- [x] Job Status (timer, progress bar, "Ready" state)
- [x] Claim Interaction (optimistic with alert)

### Completion Notes

- Created `RefiningWidget.tsx` with recipe dropdown, batch quantity input, and "IGNITE FORGE" button.
- Job list displays countdown timers with progress bars.
- "COLLECT" button appears when job is ready, calls `/api/refine/claim`.
- Integrated into `Dashboard.tsx`.
- TypeScript build verified.

### File List

- `apps/web/src/components/RefiningWidget.tsx`
- `apps/web/src/components/Dashboard.tsx`
