# Story 12.2: Land Expansion Skill & Claiming

**Epic:** Epic 12: Strategic Expansion & Progression Loop
**Role:** Developer
**Goal:** I want to claim empty sectors on the map and expand my territory, so I can access more resources and grow my empire.

## Acceptance Criteria

1.  **Land Baron Skills in Registry**:
    - Add 3 new skills to `skill-registry.constants.ts` (MERCHANT branch):
      - `MERCHANT_LAND_1`: "Land Baron I", +2 max plots, cost 2 SP, prereq: `MERCHANT_YIELD_1`
      - `MERCHANT_LAND_2`: "Land Baron II", +3 max plots, cost 3 SP, prereq: `MERCHANT_LAND_1`
      - `MERCHANT_LAND_3`: "Land Baron III", +4 max plots, cost 4 SP, prereq: `MERCHANT_LAND_2`

2.  **Plot Limit Constants**:
    - Create `apps/api/src/map/map.constants.ts` with:
      - `BASE_PLOT_LIMIT = 3`
      - `CLAIM_COST_CREDITS = 500`
      - `PLOT_BONUS` map: `{ MERCHANT_LAND_1: 2, MERCHANT_LAND_2: 3, MERCHANT_LAND_3: 4 }`

3.  **Plot Limit Calculation**:
    - Add `SkillsService.getPlotLimit(userId)` method:
      - Start with `BASE_PLOT_LIMIT`
      - Add bonuses from unlocked Land Baron skills
      - Return total allowed plots

4.  **Claim Sector API**:
    - Add `POST /api/map/claim` endpoint with body `{ x: number, y: number }`.
    - Validation:
      - Sector exists (or is generatable at that coordinate)
      - Sector type is `EMPTY` or `RESOURCE`
      - Sector is not already owned
      - User has not exceeded plot limit
      - User has >= 500 credits
    - Action:
      - Deduct 500 credits from user
      - Set `sector.ownerId = userId`
    - Return: Updated sector data.

5.  **Frontend MapGrid Integration**:
    - When clicking on an unowned `EMPTY` or `RESOURCE` sector:
      - Show "Claim Sector (500 Credits)" button in sector detail panel
    - On claim success: Refresh map, show success toast
    - On claim failure: Show error message (e.g., "Plot limit reached")

6.  **Sector Count Endpoint**:
    - Add `GET /api/map/my-sectors` to return user's owned sectors count and limit.
    - Display in UI: "Sectors: 2/3" format.

## Technical Notes

- Inject `SkillsService` and `PrismaService` into `MapService`.
- For sectors that don't exist yet, may need to create them on claim (procedural generation).
- Consider adjacency validation as future enhancement (not required for MVP).
- The `ownerId` field already exists on `Sector` model.

## Dev Agent Record

### Status

- [x] Land Baron Skills in Registry
- [x] Plot Limit Constants
- [x] Plot Limit Calculation (`SkillsService`)
- [x] Claim Sector API (`MapController`, `MapService`)
- [x] Frontend MapGrid Integration
- [x] Sector Count Endpoint

### Completion Notes

- Added 3 Land Baron skills (MERCHANT_LAND_1/2/3) to skill-registry.constants.ts with stacking bonuses (+2/+3/+4).
- Created `map.constants.ts` with BASE_PLOT_LIMIT=3 and CLAIM_COST_CREDITS=500.
- Added `getPlotLimit()` to SkillsService calculating total plots from base + skill bonuses.
- Implemented `POST /api/map/claim` endpoint with validation (ownership, type, limit, credits).
- Implemented `GET /api/map/my-sectors` endpoint returning count/limit/sectors.
- Created `SectorDetailPanel.tsx` component with claim button and territory count display.
- Integrated SectorDetailPanel into Dashboard after MapGrid.
- API and Web TypeScript builds verified.

### File List

- `apps/api/src/skills/skill-registry.constants.ts`
- `apps/api/src/map/map.constants.ts` [NEW]
- `apps/api/src/skills/skills.service.ts`
- `apps/api/src/map/map.service.ts`
- `apps/api/src/map/map.controller.ts`
- `apps/api/src/map/map.module.ts`
- `apps/web/src/components/SectorDetailPanel.tsx` [NEW]
- `apps/web/src/components/Dashboard.tsx`
