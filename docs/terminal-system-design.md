# Terminal System Design

**Version:** 1.0  
**Epic:** Epic 14 - Immersive Terminal Interface & Three.js Integration  
**Created:** 2026-02-12

---

## Overview

This document defines the terminal system architecture for OxyCorp's bunker environment. The terminal system provides an immersive interface for interacting with various game systems through physical terminals located throughout the 3D bunker environment.

**Design Philosophy:**

- Group related functionality into thematic terminals
- Create natural player movement through the bunker
- Match terminal locations to their logical function
- Maintain immersion through retro-terminal aesthetics

---

## Terminal Categories

### 1. CRYOPOD_TERMINAL

**Purpose:** Character management and skill development  
**Theme:** Personal status, biometric data, skill training  
**UI Style:** Medical/diagnostic interface with green monochrome displays

**Components:**

- `SkillsWidget.tsx` - Skill trees, training progress, upgrade paths

**Typical User Journey:**

- Check skill progress after missions
- Allocate skill points
- Review character stats
- Plan skill development paths

---

### 2. CONTROL_CENTER_TERMINAL

**Purpose:** Core operations and resource management  
**Theme:** Command and control hub for mining and refining operations  
**UI Style:** Multi-panel tactical display with amber/orange highlights

**Components:**

- `MiningWidget.tsx` - Queue mining jobs, monitor extraction operations
- `RefiningWidget.tsx` - Process raw materials, manage refinement queue
- `MapGrid.tsx` - Sector overview, navigation, exploration planning
- `SectorDetailPanel.tsx` - Detailed sector information, resource analysis

**Typical User Journey:**

- Review sector map for mining opportunities
- Queue mining operations in resource-rich sectors
- Monitor mining job progress
- Process extracted materials through refinery
- Plan next exploration targets

**Workflow Note:** The mining→refining workflow is intentionally housed in a single terminal to streamline resource processing operations.

---

### 3. COMM_TERMINAL

**Purpose:** Missions, directives, and communication systems  
**Theme:** Communications hub for external contacts and mission briefings  
**UI Style:** Communication interface with cyan/blue accents

**Components:**

- `DirectivesWidget.tsx` - Daily directives, mission objectives, bounties
- `ChatDrawer.tsx` - Communication logs, incoming transmissions

**Typical User Journey:**

- Check daily directives
- Review mission requirements
- Read incoming communications
- Accept new objectives

---

### 4. BUNKER_MANAGEMENT_TERMINAL

**Purpose:** Infrastructure and facility management  
**Theme:** Engineering and maintenance control  
**UI Style:** Engineering schematic interface with white/gray technical diagrams

**Components:**

- `FacilitiesWidget.tsx` - Build/upgrade facilities, manage infrastructure
- Dashboard stats - Resource levels, facility status, bunker health

**Typical User Journey:**

- Review facility status
- Plan infrastructure upgrades
- Monitor resource consumption
- Manage bunker expansion

---

### 5. MARKET_TERMINAL

**Purpose:** Trade and commerce operations  
**Theme:** Galactic marketplace and logistics  
**UI Style:** Trading interface with gold/yellow economic indicators

**Components:**

- `MarketWidget.tsx` - Browse market listings, view prices, initiate trades
- `SellModal.tsx` - Sell resources, manage inventory sales

**Typical User Journey:**

- Check current market prices
- Sell refined materials
- Purchase needed resources
- Monitor trade opportunities

---

### 6. WAR_ROOM_TERMINAL

**Purpose:** Combat systems and tactical operations  
**Theme:** Military command center for drone warfare  
**UI Style:** Tactical display with red/orange combat indicators

**Components:**

- `DraggableDrone.tsx` - Drone deployment and configuration
- `BattleReplay.tsx` - Review combat encounters, analyze tactics
- `BattleResultModal.tsx` - Battle outcomes, damage reports, loot

**Typical User Journey:**

- Configure drone loadouts
- Review battle results
- Analyze combat replays
- Plan tactical improvements

---

## Terminal Interaction Flow

### Approach Sequence

1. **Navigation Phase**
   - Player navigates 3D bunker environment
   - Player approaches a terminal object (within interaction range)

2. **Proximity Detection**
   - System detects player within **3 units** of terminal
   - UI prompt appears: **"Press E to access [TERMINAL_NAME]"**
   - Prompt includes terminal type icon and name

3. **Activation**
   - Player presses **E key**
   - Screen transition effect (CRT flicker/static)
   - Full-screen terminal overlay opens
   - Relevant components load and display

4. **Active Session**
   - Player interacts with terminal components
   - Player movement **disabled** while terminal active
   - Camera locked to terminal view
   - Terminal background shows bunker environment (dimmed)

5. **Disconnection**
   - Player presses **ESC key** OR clicks **"DISCONNECT"** button
   - Screen transition effect (terminal shutdown)
   - Full-screen overlay closes
   - Player movement **re-enabled**
   - Player returns to 3D bunker navigation

### Interaction Constraints

| Constraint                     | Value                      | Rationale                      |
| ------------------------------ | -------------------------- | ------------------------------ |
| Maximum interaction distance   | 3 units                    | Enforces physical presence     |
| Player movement during session | Disabled                   | Prevents navigation conflicts  |
| Exit methods                   | ESC key, DISCONNECT button | Multiple exit options for UX   |
| Terminal cooldown              | None                       | Allow rapid terminal switching |

---

## Physical Terminal Placement Map

### Bunker Layout Considerations

The bunker is divided into functional zones, with terminals placed to encourage player movement and create a sense of a living, operational facility.

### Terminal Locations

#### 🛏️ **CRYOPOD_TERMINAL**

**Location:** Medical Bay / Cryosleep Area  
**Floor:** Lower Level (Personnel Quarters)  
**Environment:** Clean, clinical environment with soft blue lighting  
**Nearby Features:**

- Medical equipment
- Cryosleep pods
- Personal lockers
- Bio-monitoring displays

**Design Rationale:** Personal character development happens in the personal quarters area, separate from operational zones.

---

#### 🎛️ **CONTROL_CENTER_TERMINAL**

**Location:** Command Deck  
**Floor:** Upper Level (Command Zone)  
**Environment:** Multi-screen setup, tactical displays, central command position  
**Nearby Features:**

- Large sector map displays on walls
- Holographic projectors
- Communication arrays
- Status boards

**Design Rationale:** The nerve center of operations; commanding view of the bunker's activities.

---

#### 📡 **COMM_TERMINAL**

**Location:** Communications Room  
**Floor:** Upper Level (Adjacent to Command Deck)  
**Environment:** Communication equipment, antenna feeds, signal processors  
**Nearby Features:**

- Radio equipment racks
- Satellite uplink displays
- Transmission logs
- Signal strength monitors

**Design Rationale:** Dedicated communication space for receiving directives and external messages.

---

#### 🔧 **BUNKER_MANAGEMENT_TERMINAL**

**Location:** Engineering / Maintenance Area  
**Floor:** Lower Level (Industrial Zone)  
**Environment:** Industrial setting with exposed infrastructure, pipes, conduits  
**Nearby Features:**

- Facility schematics on walls
- Tool racks
- Maintenance logs
- Power distribution panels

**Design Rationale:** Infrastructure management happens where the infrastructure is visible and accessible.

---

#### 💰 **MARKET_TERMINAL**

**Location:** Logistics Bay / Cargo Area  
**Floor:** Lower Level (Loading Zone)  
**Environment:** Storage containers, resource stockpiles, loading equipment  
**Nearby Features:**

- Inventory displays
- Cargo manifests
- Resource containers
- Loading docks

**Design Rationale:** Trade terminal located where physical goods are stored and shipped.

---

#### ⚔️ **WAR_ROOM_TERMINAL**

**Location:** Tactical Operations Center  
**Floor:** Upper Level (Security Zone)  
**Environment:** Military setting with tactical displays, weapon racks, combat readiness  
**Nearby Features:**

- Battle maps
- Drone charging stations
- Tactical planning boards
- Armory access

**Design Rationale:** Combat operations managed in a dedicated tactical space, separate from civilian operations.

---

## Movement Flow & Player Journey

### Typical Play Session Flow

```
SPAWN → Cryopod Terminal (check skills)
   ↓
Command Deck → Control Center Terminal (review map, queue mining)
   ↓
Communications Room → Comm Terminal (check directives)
   ↓
Engineering → Bunker Management Terminal (upgrade facilities)
   ↓
Return to Command Deck → Control Center Terminal (collect mining results)
   ↓
Logistics Bay → Market Terminal (sell refined materials)
   ↓
Tactical Ops → War Room Terminal (configure drones, review battles)
```

### Floor Transition Points

- **Upper Level:** Command, communication, and tactical operations (strategic zones)
- **Lower Level:** Personal, industrial, and logistics (operational zones)
- **Vertical Movement:** Stairs, ladders, or elevators connect the two levels

---

## Component Distribution Summary

| Terminal          | Component Count | Primary Function        |
| ----------------- | --------------- | ----------------------- |
| Cryopod           | 1               | Character development   |
| Control Center    | 4               | Resource operations     |
| Comm              | 2               | Mission & communication |
| Bunker Management | 2               | Infrastructure          |
| Market            | 2               | Commerce                |
| War Room          | 3               | Combat systems          |
| **Total**         | **14**          | **All game systems**    |

**Note:** Dashboard stats are integrated into Bunker Management Terminal. Two components (Dashboard stats and potential future components) bring the total to 16 mapped components.

---

## Implementation Considerations

### For Developers

1. **Terminal State Management:**
   - Each terminal should maintain independent state
   - Terminal sessions persist until disconnection
   - Consider caching terminal data to reduce load times

2. **Component Loading:**
   - Lazy-load terminal components on activation
   - Pre-load adjacent terminal assets for faster transitions
   - Implement loading states for smooth UX

3. **3D Integration:**
   - Terminal objects should have interactive hitboxes
   - Proximity detection uses raycasting or distance checks
   - Terminal activation triggers camera transition animation

4. **UI Overlay:**
   - Full-screen overlay with escape handling
   - Dim/blur background 3D scene
   - Maintain consistent retro-terminal aesthetic across all terminals

5. **Accessibility:**
   - Ensure all terminals have clear visual indicators
   - Support keyboard navigation (Tab, Arrow keys)
   - Provide audio feedback for terminal activation/deactivation

---

## Future Expansion

### Potential Additional Terminals

- **LABORATORY_TERMINAL** - Research and technology upgrades
- **BARRACKS_TERMINAL** - Personnel management, crew assignments
- **SENSOR_ARRAY_TERMINAL** - Long-range scanning, threat detection

### Terminal Upgrade Paths

- Terminals could be upgraded to unlock additional features
- Visual improvements (better displays, additional screens)
- Faster processing (reduced loading times, batch operations)

---

## Conclusion

The terminal system creates an immersive, thematically consistent interface for OxyCorp's game systems. By distributing functionality across physical locations in the bunker, players experience natural movement through the environment while maintaining clear separation of concerns between different game systems.

**Next Steps:**

- Story 14.2: Implement 3D bunker environment with terminal placement
- Story 14.3: Create terminal interaction system and UI overlays
- Story 14.4: Integrate existing React components into terminal interfaces
