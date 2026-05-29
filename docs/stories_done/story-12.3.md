# Story 12.3: Outpost Installation

**Epic:** Epic 12: Strategic Expansion & Progression Loop
**Role:** Developer
**Goal:** I want to install an advanced base (Outpost) on my resource sectors, so I can improve mining efficiency.

## Acceptance Criteria

1.  **Schema Update**:
    - Add `hasOutpost: Boolean @default(false)` to `Sector` model in Prisma schema.
    - Run migration.

2.  **Outpost Constants**:
    - Add to `apps/api/src/map/map.constants.ts`:
      - `OUTPOST_COST = { credits: 1000, materials: [{ item: 'STEEL_PLATING', qty: 50 }, { item: 'IRON_ORE', qty: 100 }] }`
      - `OUTPOST_YIELD_BONUS = 0.25` (25% increase)

3.  **Install Outpost API**:
    - Add `POST /api/map/install-outpost` endpoint with body `{ sectorId: string }`.
    - Validation:
      - User owns the sector
      - Sector type is `RESOURCE`
      - Sector does not already have outpost
      - User has required credits and materials
    - Action:
      - Deduct credits and materials from user inventory
      - Set `sector.hasOutpost = true`
    - Return: Updated sector data with outpost status.

4.  **Mining Yield Bonus**:
    - In `JobsService.claimJob()`, check if the sector has an outpost.
    - If `sector.hasOutpost === true`, apply `OUTPOST_YIELD_BONUS`:
      - Base yield: 10 → With outpost: 12 (or 13 if rounding up)
    - Formula: `yield = Math.floor(baseYield * (1 + OUTPOST_YIELD_BONUS))`

5.  **Frontend MapGrid Integration**:
    - When clicking on an owned `RESOURCE` sector:
      - If no outpost: Show "Install Outpost" button with cost tooltip
      - If has outpost: Show "⚡ Outpost Active" badge
    - Show outpost icon/indicator on map tiles with outposts.
    - On install success: Refresh sector, show success toast.
    - On install failure: Show error message with missing resources.

6.  **Sector Detail Panel Update**:
    - Display outpost status in sector info.
    - Show "+25% Mining Yield" bonus indicator when outpost active.

## Technical Notes

- The sector already has a `resources` JSON field; `hasOutpost` is a separate boolean for simplicity.
- Reuse `BunkerService.validateAndDeductResources()` pattern for material deduction.
- Consider showing material requirements in UI before attempting install.
- The mining job already stores `sectorId`, so we can look up outpost status.

## Dev Agent Record

### Status

- [x] Schema Update (hasOutpost field, migration)
- [x] Outpost Constants
- [x] Install Outpost API
- [x] Mining Yield Bonus Integration
- [x] Frontend MapGrid Integration
- [x] Sector Detail Panel Update

### Completion Notes

- Added `hasOutpost` boolean field to Sector model and ran migration.
- Defined `OUTPOST_COST` (1000 CR, 50 Steel, 100 Iron) and `OUTPOST_YIELD_BONUS` (25%).
- Implemented `POST /api/map/install-outpost` with validation and resource deduction.
- Updated `JobsService` to apply +25% yield bonus when mining sectors with outposts.
- Updated `SectorDetailPanel.tsx` to include "CONSTRUCT OUTPOST" button and status display.
- Updated `MapGrid.tsx` to show electrical bolt icon (⚡) on sectors with outposts.
- Verified TypeScript builds for API and Web.

### File List

- `apps/api/prisma/schema.prisma`
- `apps/api/src/map/map.constants.ts`
- `apps/api/src/map/map.service.ts`
- `apps/api/src/map/map.controller.ts`
- `apps/api/src/jobs/jobs.service.ts`
- `apps/web/src/components/MapGrid.tsx`
- `apps/web/src/components/SectorDetailPanel.tsx`
