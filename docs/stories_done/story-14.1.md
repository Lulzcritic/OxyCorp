# Story 14.1: Terminal Categories & Component Mapping

**Epic:** Epic 14: Immersive Terminal Interface & Three.js Integration  
**Role:** Product Manager  
**Goal:** I want to define clear terminal categories and map existing components, so that developers can implement a logical terminal system.

## Acceptance Criteria

1. **Terminal Categories Defined**:
   - Create `docs/terminal-system-design.md` with 6 terminal categories:
     - `CRYOPOD_TERMINAL` - Skills & Character
     - `CONTROL_CENTER_TERMINAL` - Operations & Resources
     - `COMM_TERMINAL` - Missions & Communication
     - `BUNKER_MANAGEMENT_TERMINAL` - Infrastructure
     - `MARKET_TERMINAL` - Trade & Commerce
     - `WAR_ROOM_TERMINAL` - Combat Systems

2. **Component Mapping Complete**:
   - Map all 16 existing React components to terminal categories:
     - Cryopod: `SkillsWidget.tsx`
     - Control Center: `MiningWidget.tsx`, `RefiningWidget.tsx`, `MapGrid.tsx`, `SectorDetailPanel.tsx`
     - Comm: `DirectivesWidget.tsx`, `ChatDrawer.tsx`
     - Bunker Management: `FacilitiesWidget.tsx`, Dashboard stats
     - Market: `MarketWidget.tsx`, `SellModal.tsx`
     - War Room: `DraggableDrone.tsx`, `BattleReplay.tsx`, `BattleResultModal.tsx`

3. **Terminal Interaction Flow**:
   - Document the user interaction flow:
     - Player navigates 3D bunker → Approaches terminal → Sees "Press E to access [TERMINAL_NAME]" → Presses E → Full-screen overlay opens with relevant components
   - Specify interaction constraints:
     - Maximum interaction distance: 3 units
     - Player movement disabled while terminal active
     - ESC key or "DISCONNECT" button closes terminal

4. **Physical Terminal Placement Map**:
   - Define where each terminal is located in the bunker:
     - Cryopod Terminal → Near medical/cryosleep area
     - Control Center → Command deck with screens
     - Comm Terminal → Communications room
     - Bunker Management → Engineering/maintenance area
     - Market Terminal → Logistics/cargo bay
     - War Room → Tactical operations center

## Technical Notes

- This is a documentation and design story - no code implementation
- Focus on logical grouping: components used together should be in the same terminal
- Consider user workflows: mining → refining flow is split across terminals intentionally (Control Center)
- Terminal placement should create a sense of movement through the bunker (not all in one room)

## Dev Agent Record

### Status

- [x] Terminal categories defined
- [x] Component mapping complete
- [x] Interaction flow documented
- [x] Physical placement map created

### Completion Notes

- Created comprehensive `docs/terminal-system-design.md` (450+ lines)
- Defined all 6 terminal categories with clear purposes and themes:
  - CRYOPOD_TERMINAL - Character management
  - CONTROL_CENTER_TERMINAL - Operations & resources
  - COMM_TERMINAL - Missions & communication
  - BUNKER_MANAGEMENT_TERMINAL - Infrastructure
  - MARKET_TERMINAL - Trade & commerce
  - WAR_ROOM_TERMINAL - Combat systems
- Mapped all 16 React components to appropriate terminals
- Documented complete interaction flow (approach → activation → session → disconnect)
- Defined physical placement with 2-level bunker layout (Upper: strategic, Lower: operational)
- Included typical user journey flow and movement patterns
- Added implementation considerations for developers
- Document ready for Epic 14 implementation stories

### File List

- `docs/terminal-system-design.md` [NEW]
