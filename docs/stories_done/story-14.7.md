# Story 14.7: Component UI Conversion - Phase 1 (Core Systems)

**Epic:** Epic 14: Immersive Terminal Interface & Three.js Integration  
**Role:** Frontend Developer  
**Goal:** I want to convert core UI components to grimdark theme, so that they match the new aesthetic.

## Acceptance Criteria

1. **TerminalContainer Conversion**:
   - Apply grimdark theme to base terminal layout:
     - Use new color palette from grimdark-theme.css
     - Add CRT scanline overlay
     - Update header with chunky retro font
     - Add terminal borders with brackets
   - Ensure all wrapped components inherit theme

2. **Dashboard Stats Conversion**:
   - Update `Dashboard.tsx` stats display:
     - Credits, Username, Bunker Level use grimdark styling
     - Format numbers with monospace font
     - Add retro terminal brackets: `[CREDITS: 1,234]`

3. **SkillsWidget Conversion**:
   - Apply grimdark theme:
     - Skill tree nodes use new color palette
     - Progress bars become ASCII-style `[####----]`
     - Buttons use `GrimdarkButton` component
     - Add scanline effects to background
   - Preserve all functionality (allocate points, level up)

4. **MiningWidget Conversion**:
   - Apply grimdark theme:
     - Job cards use `GrimdarkCard`
     - "Start Mining" button uses chunky style
     - Progress indicators as ASCII bars
     - Resource icons with phosphor glow
   - Maintain existing mining job workflow

5. **DirectivesWidget Conversion**:
   - Apply grimdark theme:
     - Directive cards with terminal borders
     - Progress tracking as ASCII `[50/100]`
     - "Accept" buttons in grimdark style
     - Add "INCOMING TRANSMISSION" header
   - Keep quest functionality intact

6. **Regression Testing**:
   - Verify no loss of functionality:
     - Skills can be allocated
     - Mining jobs can be started/claimed
     - Directives can be accepted/completed
   - Verify readability (contrast ratios meet WCAG AA)
   - Test on mobile browsers (touch targets still >44px)

## Technical Notes

- Apply theme CSS classes, don't rewrite component logic
- Use CSS custom properties (CSS variables) for theme colors
- Gradual conversion: components can have "legacy" and "grimdark" modes via prop
- Preserve all existing TypeScript interfaces
- Maintain optimistic UI patterns
- Consider wrapping in `<GrimdarkThemeProvider>` context

## Dev Agent Record

### Status

- [x] TerminalContainer converted
- [x] Dashboard stats converted
- [x] SkillsWidget converted
- [x] MiningWidget converted
- [x] DirectivesWidget converted
- [x] Regression testing complete

### Completion Notes

**Story 14.7 Implementation Complete**

1. **TerminalContainer** — Full grimdark overhaul:
   - CRT scanlines + vignette overlays via CSS classes
   - VT323 font throughout, bracket-styled header `[ TITLE ]`
   - Status dot with pulse animation, [X] DISCONNECT button
   - Bottom status bar with terminal path + flicker signal
   - Grimdark error boundary with bracket-styled RETRY button

2. **Dashboard** — Stats now use bracket format:
   - `[CREDITS: ₡1,234]` with amber glow
   - `[BUNKER LVL 3]` with cyan glow
   - VT323 font, `.grimdark` class applied
   - TerminalButton with phosphor glow, bracket titles, hover glow effects

3. **SkillsWidget** — Converted with grimdark components:
   - GrimdarkCard wrapper with ONLINE status
   - Bracket-styled tree headers `[ COGITATOR ]` with text glow
   - GrimdarkProgressBar for neural integration progress
   - GrimdarkButton for UNLOCK/CLOSE actions
   - GrimdarkCard for skill detail modal with status indicators

4. **MiningWidget** — Converted with grimdark components:
   - GrimdarkCard wrapper with ONLINE status
   - GrimdarkProgressBar for extraction timer
   - GrimdarkButton for COLLECT/INITIATE actions
   - Phosphor glow on T-MINUS countdown

5. **DirectivesWidget** — Converted with grimdark components:
   - GrimdarkCard with "INCOMING TRANSMISSION" title
   - GrimdarkProgressBar for quest progress (ASCII style)
   - GrimdarkButton for CLAIM/GENERATE actions
   - Quest type shown with `>` terminal prefix

### File List

- `apps/web/src/components/terminals/TerminalContainer.tsx` [MODIFIED]
- `apps/web/src/components/Dashboard.tsx` [MODIFIED]
- `apps/web/src/components/SkillsWidget.tsx` [MODIFIED]
- `apps/web/src/components/MiningWidget.tsx` [MODIFIED]
- `apps/web/src/components/DirectivesWidget.tsx` [MODIFIED]
