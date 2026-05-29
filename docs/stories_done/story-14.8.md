# Story 14.8: Component UI Conversion - Phase 2 (Secondary Systems)

**Epic:** Epic 14: Immersive Terminal Interface & Three.js Integration  
**Role:** Frontend Developer  
**Goal:** I want to complete UI conversion for remaining components, so that the entire game has a unified aesthetic.

## Acceptance Criteria

1. **FacilitiesWidget Conversion**:
   - Apply grimdark theme:
     - Facility upgrade cards with terminal styling
     - "Upgrade" buttons in chunky retro style
     - Facility levels shown as `[LVL: 3]`
     - Cost displayed with brackets `[COST: 500 CR]`

2. **Market Components Conversion**:
   - `MarketWidget.tsx`:
     - Order book table with monospace numbers
     - Buy/Sell buttons in grimdark style
     - Price charts with green/red terminal colors
   - `SellModal.tsx`:
     - Modal background with CRT effects
     - Input fields use `GrimdarkInput`
     - "List Item" button chunky style

3. **RefiningWidget Conversion**:
   - Apply grimdark theme:
     - Recipe cards as terminal panels
     - Progress timers as ASCII bars with countdown
     - "Start Refining" button retro style
     - Input/Output resources with phosphor glow

4. **Map Components Conversion**:
   - `MapGrid.tsx`:
     - Grid cells with terminal-style borders
     - Sector colors use new palette (claimed, unclaimed, outpost)
     - Grid lines in dim green
   - `SectorDetailPanel.tsx`:
     - Panel uses `GrimdarkCard`
     - Resource percentages as `[IRON: 80%]`
     - "Claim Sector" button chunky

5. **Combat Components Conversion**:
   - `BattleReplay.tsx`:
     - 5x5 tactical grid with scanlines
     - Drones represented with ASCII symbols
     - HP bars as `[||||    ]`
     - Damage numbers appear as corrupted terminal text
   - `BattleResultModal.tsx`:
     - Victory/Defeat shown with large ASCII art
     - Stats in monospace with brackets

6. **ChatDrawer Conversion**:
   - Apply grimdark theme:
     - Chat messages in monospace
     - Input field as terminal prompt `> _`
     - User names in dim amber color
     - Timestamps in gray
   - Ensure readability is maintained

7. **Full UI Consistency Check**:
   - All components use grimdark color palette
   - All interactive elements use grimdark components
   - CRT effects applied consistently
   - No "orphaned" modern UI elements remain

## Technical Notes

- Battle visualization clarity is critical - don't sacrifice readability for aesthetics
- Market numbers must remain clearly readable (monospace helps)
- Chat messages should have adequate contrast
- Map grid performance: check that additional styling doesn't impact render speed
- Consider providing theme toggle for user testing

## Dev Agent Record

### Status

- [ ] FacilitiesWidget converted
- [ ] Market components converted
- [ ] RefiningWidget converted
- [ ] Map components converted
- [ ] Combat components converted
- [ ] ChatDrawer converted
- [ ] Full consistency check complete

### Completion Notes

_To be filled by Dev agent_

### File List

- `apps/web/src/components/FacilitiesWidget.tsx` [MODIFIED]
- `apps/web/src/components/MarketWidget.tsx` [MODIFIED]
- `apps/web/src/components/SellModal.tsx` [MODIFIED]
- `apps/web/src/components/RefiningWidget.tsx` [MODIFIED]
- `apps/web/src/components/MapGrid.tsx` [MODIFIED]
- `apps/web/src/components/SectorDetailPanel.tsx` [MODIFIED]
- `apps/web/src/components/combat/BattleReplay.tsx` [MODIFIED]
- `apps/web/src/components/BattleResultModal.tsx` [MODIFIED]
- `apps/web/src/components/ChatDrawer.tsx` [MODIFIED]
