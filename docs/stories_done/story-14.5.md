# Story 14.5: Terminal Interaction System

**Epic:** Epic 14: Immersive Terminal Interface & Three.js Integration  
**Role:** Developer  
**Goal:** I want to approach and interact with terminals, so that I can access game systems naturally.

## Acceptance Criteria

1. **Raycasting Detection**:
   - Implement raycasting from camera center
   - Detect when player looks at a terminal mesh
   - Check distance: player must be within 3 units
   - Update terminal hover state when looking at terminal

2. **Interaction Prompt UI**:
   - Create `apps/web/src/components/game/InteractionPrompt.tsx`:
     - HTML overlay (not part of 3D scene)
     - Shows "Press E to access [TERMINAL_NAME]"
     - Positioned at screen center
     - Only visible when looking at accessible terminal
   - Terminal names:
     - CRYO_TERMINAL → "NEURAL CONDITIONING STATION"
     - CONTROL_CENTER → "OPERATIONS COMMAND"
     - COMM_TERMINAL → "COMMUNICATIONS ARRAY"
     - BUNKER_MGT → "INFRASTRUCTURE CONTROL"
     - MARKET → "LOGISTICS & TRADE"
     - WAR_ROOM → "TACTICAL COMMAND"

3. **Keyboard Interaction**:
   - Listen for 'E' key press
   - Only trigger if looking at terminal within range
   - Call `TerminalManager.openTerminal(terminalType)`
   - Disable player movement when terminal overlay opens

4. **Transition Behavior**:
   - When terminal opens:
     - Pause/hide 3D scene rendering (performance)
     - Show TerminalOverlay with fade-in animation
     - Lock mouse cursor (exit pointer lock)
   - When terminal closes (ESC):
     - Hide TerminalOverlay with fade-out
     - Resume 3D scene rendering
     - Re-enable player movement
     - Re-lock mouse (enter pointer lock)

5. **Audio Feedback**:
   - Play sound effect on terminal access (boot-up sound)
   - Play sound on terminal disconnect
   - Sound files can be placeholder beeps initially

## Technical Notes

- Raycasting should run on every frame (use useFrame from R3F)
- Interaction distance check: `distance < 3` where distance is player-to-terminal
- Consider adding visual feedback on terminal when in range (glow effect?)
- Pointer lock API for FPS-style mouse look
- Terminal overlay z-index must be higher than Canvas (e.g., z-index: 1000)

## Dev Agent Record

### Status

- [x] Raycasting detection implemented
- [x] Interaction prompt UI created
- [x] Keyboard interaction working
- [x] Transition behavior smooth
- [x] Audio feedback added

### Completion Notes

**Story 14.5 Implementation Complete**

1. **Raycasting Detection** (`PlayerController.tsx`):
   - Per-frame raycasting from camera center using `Raycaster`
   - Detects terminal meshes via `userData.isTerminal` flag
   - Distance check: interaction within 3 units
   - Updates `InteractionStore` with hovered terminal state

2. **Interaction Prompt** (`InteractionPrompt.tsx`):
   - HTML overlay positioned at screen center
   - Shows terminal name and "PRESS E TO ACCESS"
   - Only visible when within interaction range
   - Styled with grimdark terminal theme

3. **Keyboard Interaction** (`PlayerController.tsx`):
   - E key opens terminal via `TerminalManager.openTerminal()`
   - Movement locked while terminal is open
   - Pointer unlocks for terminal UI interaction
   - Pointer re-locks when terminal closes

4. **Terminal Object Hover** (`TerminalObject.tsx`):
   - `userData` tagging for raycast identification
   - Animated emissive intensity (0.5 → 1.5) on hover
   - Point light brightens (2 → 5 intensity) on hover

5. **Audio Feedback** (`PlayerController.tsx`):
   - Web Audio API square wave beeps
   - Terminal open: ascending two-tone beep (800Hz → 1200Hz)
   - Terminal close: descending beep (400Hz)

6. **Bunker Page** (`Bunker.tsx`):
   - Crosshair HUD (+ shape, green, always visible)
   - Scene hidden during terminal use (performance)
   - InteractionPrompt integrated

7. **New Files**:
   - `InteractionStore.ts` - Zustand store for hover/range/movement state
   - `InteractionPrompt.tsx` - HTML overlay prompt component

### File List

- `apps/web/src/components/game/InteractionPrompt.tsx` [NEW]
- `apps/web/src/components/game/BunkerScene.tsx` [MODIFIED - raycasting]
- `apps/web/src/components/game/PlayerController.tsx` [MODIFIED - movement lock]
- `apps/web/src/components/game/TerminalObject.tsx` [MODIFIED - hover states]
- `apps/web/src/services/TerminalManager.ts` [MODIFIED - open/close integration]
