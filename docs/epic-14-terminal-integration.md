# Epic 14: Immersive Terminal Interface & Three.js Integration

## Epic Goal

Transform the existing 2D UI-only game into an immersive 3D bunker experience where players interact with functional terminals to access game systems, while redesigning all UI components to match a sci-fi gothic grimdark post-apocalyptic aesthetic inspired by old minitel terminals.

## Background Context

**Current State:**

- 16 existing React components providing full game functionality (Mining, Skills, Market, Combat, Facilities, Directives, Refining, Map)
- All components currently accessible from a single Dashboard view
- UI uses modern cyber-industrial aesthetic (Neon green `#00FF9D`, dark backgrounds)
- 3D visualization was deferred to Phase 2 per original PRD

**User Need:**
The player wants to:

1. Navigate a Three.js 3D bunker environment with existing 3D placeholder assets
2. Interact with terminals placed in thematic locations (cryopod area, control center, com room, etc.)
3. Access relevant game systems through terminal interfaces that match the location
4. Experience a more immersive, diegetic UI that feels like operating old, rugged military equipment

**Vision:**
Players walk through their bunker in first-person (or third-person), approach a terminal, press 'E' to interact, and the terminal opens a full-screen UI overlay showing the relevant game interface (e.g., Skills terminal near cryopod, Mining terminal at control center). The UI aesthetic shifts from modern cyber-industrial to grimdark retro-futuristic terminal (think Fallout terminals meets WH40K machine spirits).

## Epic Scope

### Phase 1: Component Organization & Terminal Architecture (Stories 14.1-14.3)

**Goal:** Reorganize existing components into logical terminal categories and create the terminal system architecture.

#### Story 14.1: Terminal Categories & Component Mapping

**As a** Product Manager, **I want** to define clear terminal categories and map existing components, **so that** developers can implement a logical terminal system.

**Terminal Categories:**

1. **CRYOPOD_TERMINAL** (Skills & Character)
   - `SkillsWidget.tsx` - Neural conditioning interface
2. **CONTROL_CENTER_TERMINAL** (Operations & Resources)
   - `MiningWidget.tsx` - Resource extraction operations
   - `RefiningWidget.tsx` - Material processing
   - `MapGrid.tsx` - Tactical map overview
   - `SectorDetailPanel.tsx` - Sector management
3. **COMM_TERMINAL** (Missions & Communication)
   - `DirectivesWidget.tsx` - Quest/missions interface
   - `ChatDrawer.tsx` - Communications channel
4. **BUNKER_MANAGEMENT_TERMINAL** (Infrastructure)
   - `FacilitiesWidget.tsx` - Bunker upgrades
   - Dashboard stats (Credits, Username, Bunker Level)
5. **MARKET_TERMINAL** (Trade & Commerce)
   - `MarketWidget.tsx` - Trading interface
   - `SellModal.tsx` - Item listing interface
6. **WAR_ROOM_TERMINAL** (Combat Systems)
   - `DraggableDrone.tsx` - Swarm configuration
   - `BattleReplay.tsx` - Battle analysis
   - `BattleResultModal.tsx` - Combat results

**Acceptance Criteria:**

- [x] Terminal categories defined with clear purposes
- [ ] All existing components mapped to appropriate terminals
- [ ] Document created showing component organization
- [ ] Terminal interaction flow designed

#### Story 14.2: Terminal System Architecture

**As a** Developer, **I want** a terminal management system that handles UI overlays and Three.js integration, **so that** players can interact with terminals in the 3D world.

**Technical Requirements:**

- Terminal State Management (which terminal is active, terminal interaction range)
- UI Overlay System (full-screen modal that displays terminal content)
- Three.js Integration Layer (raycasting for terminal interaction, "Press E to access" prompts)
- Terminal Component Router (loads appropriate React components based on terminal type)

**Acceptance Criteria:**

- [ ] `TerminalManager` service created to handle terminal state
- [ ] `TerminalOverlay` component that displays terminal UIs
- [ ] Three.js interaction system (raycast detection, interaction prompts)
- [ ] Terminal routing system that loads correct components
- [ ] ESC key closes terminal overlay and returns to 3D view

#### Story 14.3: Terminal Component Wrapper System

**As a** Developer, **I want** to wrap existing components with terminal-specific layouts, **so that** each terminal feels unique while reusing existing logic.

**Requirements:**

- Create `TerminalContainer` component with terminal-specific styling
- Each terminal type has its own header/footer design
- Terminals display location-specific flavor text
- Preserve all existing component functionality

**Acceptance Criteria:**

- [ ] `TerminalContainer` component created with terminal theme props
- [ ] Each terminal category has custom header design
- [ ] Existing components render within terminal containers
- [ ] No loss of existing functionality

### Phase 2: Three.js Bunker Environment (Stories 14.4-14.5)

#### Story 14.4: Bunker Scene Setup

**As a** Player, **I want** to navigate a 3D bunker environment, **so that** I feel immersed in the game world.

**Requirements:**

- Three.js scene initialization with bunker environment
- Player camera controls (first-person or third-person)
- Lighting (grimdark, low-light atmosphere)
- Integration of existing 3D placeholder assets
- Terminal objects positioned in thematic locations

**Terminal Placements:**

- Cryopod Terminal: Near medical/休眠 area
- Control Center: Command deck with multiple screens
- Comm Terminal: Communications room
- Bunker Management: Engineering/maintenance area
- Market Terminal: Logistics/cargo bay
- War Room: Tactical operations center

**Acceptance Criteria:**

- [ ] Three.js scene loads with bunker environment
- [ ] Player can move through bunker (WASD + mouse)
- [ ] All 6 terminal locations positioned appropriately
- [ ] Terminals are visually distinct and identifiable
- [ ] Lighting creates appropriate grimdark atmosphere

#### Story 14.5: Terminal Interaction System

**As a** Player, **I want** to approach and interact with terminals, **so that** I can access game systems naturally.

**Requirements:**

- Raycasting to detect when player is looking at a terminal
- Distance check (must be within interaction range)
- UI prompt "Press E to access [TERMINAL_NAME]"
- Smooth transition from 3D view to terminal overlay
- Audio feedback (terminal boot-up sound, keypress sounds)

**Acceptance Criteria:**

- [ ] Raycast detects terminal when player looks at it within 3 units
- [ ] UI prompt appears with terminal name
- [ ] Pressing 'E' opens terminal overlay with correct component
- [ ] Character movement disabled while terminal is active
- [ ] ESC or clicking "DISCONNECT" closes terminal
- [ ] Audio feedback plays on interaction

### Phase 3: Grimdark UI Redesign (Stories 14.6-14.8)

#### Story 14.6: Grimdark Terminal Theme Design System

**As a** UX Designer, **I want** a comprehensive grimdark terminal theme, **so that** all UI feels cohesive and atmospheric.

**Design Requirements:**

- **Color Palette Update:**
  - Background: `#0A0A0A` (deeper black)
  - Surface: `#1C1C1C` → `#161616` (darker terminals)
  - Primary: `#00FF9D` → `#00CC66` (dimmer, sickly green)
  - Secondary: `#00F3FF` → `#FFA500` (amber warning lights)
  - Accent: `#FF0055` → `#CC0000` (blood red)
  - Text: Add scanline/CRT distortion effects
- **Typography:**
  - Replace with more "chunky" monospace (VT323, Press Start 2P, or Courier)
  - Add text flickering/glitch effects
  - Increased letter-spacing for retro terminal feel
- **Visual Effects:**
  - CRT scanlines overlay
  - Screen border vignette (rounded CRT edges)
  - Phosphor glow on text
  - Occasional screen flicker
  - Boot-up sequence animation
  - Static/noise on transitions

**Acceptance Criteria:**

- [ ] Updated color tokens defined in CSS/theme
- [ ] Typography system updated with grimdark fonts
- [ ] CRT effect shaders/CSS created
- [ ] Terminal boot sequence animation created
- [ ] Design system documented

#### Story 14.7: Component UI Conversion - Phase 1 (Core Systems)

**As a** Frontend Developer, **I want** to convert core UI components to grimdark theme, **so that** they match the new aesthetic.

**Components to Convert (Priority 1):**

- `TerminalContainer` (base template)
- `Dashboard.tsx` stats display
- `SkillsWidget.tsx`
- `MiningWidget.tsx`
- `DirectivesWidget.tsx`

**Conversion Checklist per Component:**

- [ ] Apply new color palette
- [ ] Update font families
- [ ] Add CRT scanline effects
- [ ] Replace modern UI elements with chunky buttons
- [ ] Add terminal-style borders and brackets `[>>>  MINING_OPS  <<<]`
- [ ] Implement glitch effects on state changes
- [ ] Add retro progress bars (ASCII-style: `[####----]`)

**Acceptance Criteria:**

- [ ] All Priority 1 components use grimdark theme
- [ ] CRT effects applied consistently
- [ ] Functionality preserved during conversion
- [ ] Visual regression testing completed

#### Story 14.8: Component UI Conversion - Phase 2 (Secondary Systems)

**As a** Frontend Developer, **I want** to complete UI conversion for remaining components, **so that** the entire game has a unified aesthetic.

**Components to Convert (Priority 2):**

- `FacilitiesWidget.tsx`
- `MarketWidget.tsx` & `SellModal.tsx`
- `RefiningWidget.tsx`
- `MapGrid.tsx` & `SectorDetailPanel.tsx`
- `BattleReplay.tsx` & `BattleResultModal.tsx`
- `ChatDrawer.tsx`

**Battle Replay Special Requirements:**

- Make the 5x5 grid look like a tactical display
- Use scanline effects on the battle grid
- Damage numbers appear as corrupted terminal text
- HP bars styled as ASCII: `[||||    ]`

**Acceptance Criteria:**

- [ ] All remaining components converted to grimdark theme
- [ ] Battle visualization maintains tactical clarity
- [ ] Market interface remains functionally clear despite aesthetic changes
- [ ] Chat maintains readability
- [ ] Full UI consistency across all terminals

## Technical Architecture Notes

### Three.js Integration Points

```typescript
// Terminal interaction state
interface TerminalState {
  activeTerminal: TerminalType | null;
  isTerminalOpen: boolean;
  playerPosition: Vector3;
  terminalPositions: Map<TerminalType, Vector3>;
}

enum TerminalType {
  CRYOPOD,
  CONTROL_CENTER,
  COMM,
  BUNKER_MANAGEMENT,
  MARKET,
  WAR_ROOM,
}
```

### Component Organization

```
apps/web/src/
  ├── components/
  │   ├── terminals/
  │   │   ├── TerminalContainer.tsx      # Base terminal wrapper
  │   │   ├── TerminalOverlay.tsx        # Full-screen overlay system
  │   │   ├── TerminalRouter.tsx         # Routes to correct components
  │   │   └── terminal-types/
  │   │       ├── CryopodTerminal.tsx
  │   │       ├── ControlCenterTerminal.tsx
  │   │       ├── CommTerminal.tsx
  │   │       ├── BunkerManagementTerminal.tsx
  │   │       ├── MarketTerminal.tsx
  │   │       └── WarRoomTerminal.tsx
  │   ├── game/
  │   │   ├── BunkerScene.tsx            # Three.js scene
  │   │   ├── TerminalObject.tsx         # Interactive terminal meshes
  │   │   └── PlayerController.tsx       # Movement controls
  │   └── [existing components...]
  └── styles/
      └── grimdark-theme.css             # New theme system
```

## Risk Assessment & Mitigation

### Risk 1: Performance Impact (Three.js + React)

**Severity:** High  
**Mitigation:**

- Use React Three Fiber for better integration
- Lazy load terminal components
- Suspend 3D rendering when terminal is active
- Profile performance on target devices

### Risk 2: Breaking Existing Functionality

**Severity:** High  
**Mitigation:**

- Wrap existing components, don't modify them initially
- Comprehensive testing of all game loops
- Feature flag system to toggle between old/new UI
- Staged rollout (3D environment first, UI redesign second)

### Risk 3: UI Readability with Grimdark Theme

**Severity:** Medium  
**Mitigation:**

- Maintain WCAG AA contrast ratios
- User testing for readability
- Toggle option for "high contrast mode"
- Avoid overdoing CRT distortion effects

### Risk 4: Scope Creep

**Severity:** Medium  
**Mitigation:**

- Clear phase boundaries
- Can ship Phase 1 + 2 without Phase 3 (UI redesign optional)
- Each story is independently valuable
- Regular check-ins on progress vs scope

## Success Criteria

### MVP (Phase 1 + 2 Complete):

- [ ] Player can navigate 3D bunker environment
- [ ] All 6 terminals are interactive
- [ ] All existing game functionality accessible through terminals
- [ ] Smooth transitions between 3D world and UI overlays
- [ ] ESC key reliably exits terminals

### Full Vision (All Phases Complete):

- [ ] All above MVP criteria met
- [ ] UI matches grimdark post-apocalyptic aesthetic
- [ ] CRT effects enhance immersion without hurting readability
- [ ] Terminal boot sequences feel satisfying
- [ ] Players report increased immersion in user testing
- [ ] No regression in game functionality
- [ ] Performance maintains 60fps in 3D environment

## Dependencies

- Three.js library integration
- React Three Fiber (recommended)
- Existing 3D placeholder assets (user mentions having these)
- Font assets (VT323, Press Start 2P, or similar retro fonts)
- Sound effects (terminal beeps, boot sounds - can be sourced later)

## Rollout Strategy

### Phase 1: Invisible Foundation (Stories 14.1-14.3)

- Set up architecture without changing user experience
- Can be developed and tested independently
- No UI changes visible to users

### Phase 2: 3D Environment Launch (Stories 14.4-14.5)

- Enable 3D bunker with feature flag
- A/B test with subset of users
- Gather feedback on controls and terminal placement

### Phase 3: Visual Transformation (Stories 14.6-14.8)

- Roll out UI redesign incrementally by terminal
- Offer "classic theme" toggle during transition
- Gather feedback on readability and aesthetics

## Timeline Estimate

**Phase 1:** 2-3 weeks (Architecture & Organization)  
**Phase 2:** 3-4 weeks (Three.js Integration)  
**Phase 3:** 3-4 weeks (UI Redesign)

**Total:** 8-11 weeks for complete epic

## Next Steps

1. **User Approval:** Review this epic with stakeholders
2. **Story Breakdown:** Create detailed user stories for Phase 1
3. **Asset Audit:** Catalog existing 3D assets and identify gaps
4. **Technical Spike:** Prototype Three.js + React integration approach
5. **Design Mockups:** Create grimdark terminal UI mockups for approval
