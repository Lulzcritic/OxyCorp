# Story 10.3: Facilities Management UI

**Epic:** Epic 10: Infrastructure (Bunker Upgrades)
**Role:** Player
**Goal:** I want to view and manage my bunker facilities in the dashboard, so that I can upgrade them and see their current levels.

## Acceptance Criteria

1.  **Facilities Widget Component**:
    - Create `apps/web/src/components/FacilitiesWidget.tsx`.
    - Fetch facilities data from `GET /api/bunker/facilities` on mount.
    - Display all 3 facility types with current levels:
      - **Refining Vat** - Affects refining speed/slots
      - **Logistics Hub** - Affects market/trading capabilities
      - **Command Array** - Affects drone/combat capabilities

2.  **Facility Card Display**:
    - Each facility shows:
      - Icon and name
      - Current level (e.g., "Level 2")
      - Progress bar or visual level indicator
      - "Upgrade" button

3.  **Upgrade Cost Display**:
    - Before upgrading, show cost tooltip/modal:
      - Credits required
      - Materials required (with current inventory count)
    - Disable upgrade button if max level reached (Level 3).
    - Disable upgrade button if insufficient resources.

4.  **Upgrade Action**:
    - Call `POST /api/bunker/upgrade { type }`.
    - On success: Refresh facilities, show success toast, refresh profile (credits/inventory).
    - On failure: Show error message with missing requirements.

5.  **Dashboard Integration**:
    - Add `<FacilitiesWidget />` to Dashboard.tsx.
    - Position in the command center layout (suggest: after SkillsWidget).

6.  **Visual Design**:
    - Follow existing "Diegetic Cyber-Industrial" theme.
    - Use facility-specific colors:
      - Refining Vat: Orange/amber
      - Logistics Hub: Blue/cyan
      - Command Array: Purple
    - Show upgrade arrow animation on hover.

## Technical Notes

- Backend APIs already exist: `GET /api/bunker/facilities`, `POST /api/bunker/upgrade`.
- Facilities response structure: `[{ type: 'REFINING_VAT', level: 1 }, ...]`.
- Cost structure from constants: `{ credits: number, items?: [{ item, quantity }] }`.
- Consider adding a `GET /api/bunker/upgrade-cost?type=X` endpoint if cost preview is needed (or hardcode client-side).

## Dev Agent Record

### Status

- [x] Facilities Widget Component
- [x] Facility Card Display
- [x] Upgrade Cost Display
- [x] Upgrade Action Integration
- [x] Dashboard Integration
- [x] Visual Design Implementation

### Completion Notes

- Created `FacilitiesWidget.tsx` with color-coded facility cards for all 3 types (Refining Vat, Logistics Hub, Command Array).
- Implemented upgrade modal with cost display showing credits and materials (with inventory count comparison).
- Added hover effects and progress bars matching cyber-industrial theme.
- Integrated into Dashboard after SkillsWidget with `onUpgrade` callback for profile refresh.
- TypeScript build verified.

### File List

- `apps/web/src/components/FacilitiesWidget.tsx` [NEW]
- `apps/web/src/components/Dashboard.tsx`
