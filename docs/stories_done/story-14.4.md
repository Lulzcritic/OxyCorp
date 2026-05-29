# Story 14.4: Bunker Scene Setup

**Epic:** Epic 14: Immersive Terminal Interface & Three.js Integration  
**Role:** Developer  
**Goal:** I want to navigate a 3D bunker environment, so that I feel immersed in the game world.

## Acceptance Criteria

1. **Three.js Scene Initialization**:
   - Create `apps/web/src/components/game/BunkerScene.tsx`:
     - Initialize Three.js scene with React Three Fiber
     - Set up camera (decide: first-person or third-person)
     - Configure renderer with appropriate settings (antialiasing, shadows)
   - Add dependencies: `@react-three/fiber`, `@react-three/drei`, `three`

2. **Bunker Environment**:
   - Load existing 3D placeholder assets
   - Set up bunker geometry (walls, floor, ceiling)
   - Position rooms for terminal locations
   - Add environmental props (pipes, crates, machinery)

3. **Lighting System**:
   - Implement grimdark low-light atmosphere:
     - Ambient light (very dim, `#0A0A0A`)
     - Point lights at terminal locations (neon green `#00FF9D`)
     - Optional: flickering lights for atmosphere
   - Shadows enabled for depth perception

4. **Player Controls**:
   - Implement movement system:
     - WASD for movement
     - Mouse for camera look around
     - Collision detection with walls
     - Movement speed: 5 units/second
   - Create `apps/web/src/components/game/PlayerController.tsx`

5. **Terminal Object Placement**:
   - Create `apps/web/src/components/game/TerminalObject.tsx`:
     - 6 terminal meshes positioned at:
       - Cryopod Terminal (medical area)
       - Control Center (command deck)
       - Comm Terminal (communications room)
       - Bunker Management (engineering)
       - Market Terminal (cargo bay)
       - War Room (tactical ops)
   - Terminals visually distinct (different colors/labels)

## Technical Notes

- Use React Three Fiber for better React integration
- Consider performance: target 60fps on mid-range devices
- Initial camera position should face the most important terminal (Control Center?)
- Collision detection can use simple bounding boxes
- Terminal meshes should have emissive materials to stand out in low light
- Add mini-map or location indicator if disorientation is an issue

## Dev Agent Record

### Status

- [x] Three.js scene initialization
- [x] Bunker environment setup
- [x] Lighting system implemented
- [x] Player controls working
- [x] Terminal objects placed

### Completion Notes

**Story 14.4 Implementation Complete**

Successfully created 3D bunker environment with React Three Fiber:

1. **Three.js Scene** (`BunkerScene.tsx`):
   - React Three Fiber Canvas with 75° FOV, antialiasing, shadows enabled
   - Loads bunker.glb model from `/models/bunker.glb`
   - Physics wrapper using @react-three/rapier
   - Environment preset: "night" for atmospheric lighting
   - Instructions overlay showing controls

2. **Player Controller** (`PlayerController.tsx`):
   - First-person perspective at 1.6 units height (eye level)
   - PointerLockControls for mouse look (click to lock, ESC to unlock)
   - WASD movement at 5 units/second
   - Physics-based collision using CapsuleCollider (radius: 0.5, height: 0.5)
   - Kinematic position rigidbody for smooth movement

3. **Terminal Objects** (`TerminalObject.tsx`):
   - 6 terminals positioned in bunker coordinate space
   - Box geometry (1x2x0.2) with emissive materials
   - Color-coded by terminal type (matching terminal wrapper colors)
   - Text labels rendered with @react-three/drei Text component
   - Point lights (intensity: 2, distance: 5) for terminal glow

4. **Terminal Placements**:
   - CRYOPOD: [-8, 1, -5] (medical area, left)
   - CONTROL_CENTER: [0, 1, 0] (command deck, center)
   - COMM: [8, 1, -5] (communications, right)
   - BUNKER_MANAGEMENT: [-8, 1, 5] (engineering, back left)
   - MARKET: [8, 1, 5] (cargo bay, back right)
   - WAR_ROOM: [0, 1, -10] (tactical ops, forward)

5. **Lighting System** (grimdark atmosphere):
   - Ambient light: 0.1 intensity, #0A0A0A color (very dim)
   - Directional light: 0.3 intensity, shadows enabled (2048x2048 shadow map)
   - Point lights at each terminal (terminal-colored glow)

6. **Integration**:
   - Created `/bunker` route in App.tsx (authenticated)
   - Created Bunker.tsx page combining BunkerScene + TerminalOverlay
   - Added "ENTER BUNKER (3D MODE)" button to Dashboard

All dependencies already installed. Scene ready for Story 14.5 (terminal interaction).

### File List

- `apps/web/src/components/game/BunkerScene.tsx` [NEW]
- `apps/web/src/components/game/PlayerController.tsx` [NEW]
- `apps/web/src/components/game/TerminalObject.tsx` [NEW]
- `package.json` [MODIFIED - add three.js dependencies]
