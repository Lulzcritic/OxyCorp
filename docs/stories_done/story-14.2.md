# Story 14.2: Terminal System Architecture

**Epic:** Epic 14: Immersive Terminal Interface & Three.js Integration  
**Role:** Developer  
**Goal:** I want a terminal management system that handles UI overlays and Three.js integration, so that players can interact with terminals in the 3D world.

## Acceptance Criteria

1. **TerminalManager Service**:
   - Create `apps/web/src/services/TerminalManager.ts` with:
     - `openTerminal(type: TerminalType): void`
     - `closeTerminal(): void`
     - `getActiveTerminal(): TerminalType | null`
     - `canAccessTerminal(type: TerminalType): boolean` (for future facility gating)
   - Implement singleton pattern using Zustand store

2. **Terminal Overlay Component**:
   - Create `apps/web/src/components/terminals/TerminalOverlay.tsx`:
     - Full-screen modal system (z-index above 3D canvas)
     - Backdrop (darkened background)
     - Fade in/out animation
     - ESC key handler to close terminal
     - Accessibility (focus trap, aria-labels)

3. **Terminal Router**:
   - Create `apps/web/src/components/terminals/TerminalRouter.tsx`:
     - Maps `TerminalType` enum to component sets
     - Loads appropriate components based on active terminal
     - Passes through necessary props to wrapped components

4. **Terminal Types & State**:
   - Create `apps/web/src/types/terminal.ts`:

     ```typescript
     enum TerminalType {
       CRYOPOD,
       CONTROL_CENTER,
       COMM,
       BUNKER_MANAGEMENT,
       MARKET,
       WAR_ROOM,
     }

     interface TerminalState {
       activeTerminal: TerminalType | null;
       isOpen: boolean;
       canInteract: boolean;
     }
     ```

5. **Feature Flag Integration**:
   - Add `USE_TERMINALS` feature flag (default: false)
   - When disabled, existing Dashboard direct access works
   - When enabled, clicking widget buttons opens terminal overlay instead

## Technical Notes

- Use Zustand for terminal state management (matches existing state pattern)
- Terminal overlay should be a separate mount point from main React tree
- Component loading should be lazy (React.lazy) for better performance
- No Three.js integration yet - this story focuses on the overlay system architecture
- Terminal content should scroll if it exceeds viewport height

## Dev Agent Record

### Status

- [x] TerminalManager service created
- [x] TerminalOverlay component created
- [x] TerminalRouter component created
- [x] Terminal types & state defined
- [x] Feature flag integration complete

### Completion Notes

- Created terminal types using const object pattern for TypeScript compatibility (`terminal.ts`)
- Implemented `TerminalManager` Zustand store with `openTerminal`, `closeTerminal`, and `getActiveTerminal` methods
- Added global ESC key handler for closing terminals
- Created `TerminalOverlay` full-screen modal component with:
  - Darkened backdrop (95% opacity)
  - Fade in/out animations
  - DISCONNECT button and ESC key support
  - Focus trap and ARIA accessibility attributes
  - Proper TypeScript interfaces (UserProfile, SectorData)
- Implemented `TerminalRouter` component that maps 6 terminal types to their components:
  - CRYOPOD → SkillsWidget
  - CONTROL_CENTER → MiningWidget, RefiningWidget, MapGrid, SectorDetailPanel
  - COMM → DirectivesWidget
  - BUNKER_MANAGEMENT → FacilitiesWidget, Dashboard stats
  - MARKET → MarketWidget
  - WAR_ROOM → Link to /war-room
- Integrated terminal system into Dashboard with `VITE_USE_TERMINALS` feature flag
- Added terminal access buttons (6 styled buttons) when feature flag is enabled
- Widgets conditionally render: direct when flag=false, in terminals when flag=true
- Fixed all linting errors - no `any` types, all proper TypeScript interfaces
- Feature flag defaults to `false` - no breaking changes to existing functionality

### File List

- `apps/web/src/services/TerminalManager.ts` [NEW]
- `apps/web/src/components/terminals/TerminalOverlay.tsx` [NEW]
- `apps/web/src/components/terminals/TerminalRouter.tsx` [NEW]
- `apps/web/src/types/terminal.ts` [NEW]
- `apps/web/src/components/Dashboard.tsx` [MODIFIED - feature flag]
