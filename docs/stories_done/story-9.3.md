# Story 9.3: The Cortex UI (Skills)

**Epic:** Epic 9: Neural Conditioning (Skills)
**Role:** Player
**Goal:** I want to visualize my skills and unlock them in a "Skill Tree" interface.

## Acceptance Criteria

1.  **Cortex View**:
    - Create `SkillsView` page.
    - Visualize the 3 trees: COGITATOR (Blue), FORGE (Red), MERCHANT (Green).
    - Render nodes for each skill in `SKILL_REGISTRY`.
2.  **Unlock Interaction**:
    - Click on a node to see details (Description, Cost).
    - "Unlock" button active only if:
      - User has enough SP.
      - Prerequisite is unlocked.
    - Call `POST /api/skills/unlock`.
3.  **HUD Integration**:
    - Show current Level and Unspent SP in the main HUD/Sidebar.

## Technical Notes

- **Visualization**: Can be simple Grid/Flexbox for MVP or Canvas/SVG for lines between nodes using `react-flow` or custom SVG.
- **State**: Fetch `GET /api/skills` on mount.

## Dev Agent Record

### Status

- [x] Cortex View (SkillsWidget with 3 trees)
- [x] Unlock Interaction (modal with validation)
- [x] HUD Integration (Level, XP, SP display)

### Completion Notes

- Created `SkillsWidget.tsx` with:
  - 3 skill trees: COGITATOR (Cyan), FORGE (Red), MERCHANT (Green)
  - Skill nodes showing locked/unlocked/available states
  - Modal popup with description, cost, prerequisite info
  - "UNLOCK SKILL" button with SP/prereq validation
  - Level/XP/SP HUD bar at top of widget
- Integrated into `Dashboard.tsx`.
- TypeScript build verified.

### File List

- `apps/web/src/components/SkillsWidget.tsx`
- `apps/web/src/components/Dashboard.tsx`
