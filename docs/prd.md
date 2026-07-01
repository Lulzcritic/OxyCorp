# Moloch Product Requirements Document (PRD)

## 1. Goals and Background Context

### Goals

- **Launch a playable Alpha** of the "Triangle of Efficiency" economy loop within 4 weeks.
- **Validate the "Lunch Break Warlord" niche** by achieving high retention in short sessions (<15 mins).
- **Prove technical viability** of a browser-based MMORPG with complex economy and asynchronous combat mechanics.

### Background Context

The browser MMORPG market is bifurcated between accessible but shallow "clickers" and deep but inaccessible simulations like _Prosperous Universe_. _Moloch_ aims to bridge this gap by offering _Eve Online_-level economic depth with modern UX and "respect for player time." The core hook is allowing busy adults to run an industrial empire and program automated drone fleets during their lunch break, checking the results later.

### Change Log

| Date       | Version | Description   | Author |
| :--------- | :------ | :------------ | :----- |
| 2026-01-22 | 1.0     | Initial Draft | PM     |

## 2. Requirements

### Functional

- **FR1:** Users must be able to authenticate via OAuth and persistent sessions.
- **FR2:** Users must be able to harvest resources (Iron, Copper, Silica) using time-based "Mining Drills."
- **FR3:** Users must be able to list items for sale and buy items on a global, player-driven market.
- **FR4:** Users must be able to configure "Drone Swarms" with simple logic (formation, target priority) and deploy them to claim territory.
- **FR5:** The system must resolve combat asynchronously and report results (Audit Log) to the user.
- **FR6:** Inventory must support high-volume storage without performance degradation.

### Non Functional

- **NFR1:** **Session Speed:** Critical actions (Harvest, Trade) must be performable within 3 clicks.
- **NFR2:** **Performance:** The "Dashboard" must load in < 1s on 4G mobile networks.
- **NFR3:** **Data Integrity:** Market transactions must be ACID compliant (no item duplication).
- **NFR4:** **Responsiveness:** UI must be fully functional on mobile browsers (touch targets > 44px).

## 3. User Interface Design Goals

### Overall UX Vision

"Diegetic Cyber-Industrial." The UI should feel like a piece of high-tech but rusted Martian equipment. Dark mode by default, high contrast neon accents (Green = Profit, Red = Danger), and "glitch" effects for transitions.

### Key Interaction Paradigms

- **Dashboard First:** The main view is a "Command Center" summarizing net worth, active jobs, and threats.
- **Optimistic Actions:** Clicks act immediately visually; spinners are banned unless absolutely necessary.
- **Mobile Cards:** on Mobile, complex tables turn into swipeable cards.

### Core Screens

- **The Bunker (Home):** Overview of resources and active mining operations.
- **The Exchange (Market):** Candlestick charts and order books (Buy/Sell).
- **The War Room (Combat):** Grid-based editor for Drone Swarm programming.

## 4. Technical Assumptions

### Repository Structure

- **Monorepo:** Using Turborepo to house Client (`/web`) and Server (`/api`) to share types (DTOs).

### Service Architecture

- **Modular Monolith:** Single NestJS instance with strict module boundaries (User, Economy, Combat).

### Testing Requirements

- **Unit + Integration:** Jest for logic, Supertest for API endpoints. Manual QA for UI "feel."

### Additional Assumptions

- **3D Deferred:** MVP will use 2D/UI only. Three.js scenes are Phase 2.
- **Self-Hosted Game Server:** While DB is managed, the game logic runs on persistent Node.js instances (Railway/VPS) to handle WebSockets.

## 5. Epic List

- **Epic 1: Project Genesis & User Identity:** Establish the project foundation, CI/CD, and User Authentication/Profile system.
- **Epic 2: The Harvest Loop:** Implement the core resource gathering mechanic, Inventory management, and mining timers.
- **Epic 3: The Exchange:** Create the Global Marketplace, enabling Buy/Sell orders and credit transactions.
- **Epic 4: Drone Command:** Implement the asynchronous "Auto-Battler" foundation, enabling drone configuration and basic combat resolution.
- **Epic 5: The Comm-Link (Chat):** Enable real-time social interaction via a global chat system.
- **Epic 6: The Red Frontier (Map System):** Implement an infinite, procedural grid system for Mars.
- **Epic 7: Industrial Ownership (Advanced Harvest):** Bind harvesting to specific Plots on the Map.
- **Epic 8: The Forge (Refining):** Implement resource conversion queues and yield mechanics.
- **Epic 9: Neural Conditioning (Skills):** Implement the "Triangle of Efficiency" skill trees and XP system.
- **Epic 10: Infrastructure (Bunker Upgrades):** Create the facility upgrade system to gate progression.
- **Epic 11: The Directives (Quest Engine):** Implement the mission system for Service Credits and Skill Points.
- **Epic 12: Strategic Expansion & Progression Loop:** XP from core actions, skill-gated land expansion, and outpost installation from tactical map.

## 6. Epic Details

### Epic 1: Project Genesis & User Identity

**Goal:** Create a deployable, secure application where users can sign up, log in, and see their persistent "Bunker" profile. This sets the stage for all future features.

#### Story 1.1: Project Skeleton & CI/CD

**As a** Developer, **I want** a configured Monorepo (NestJS/React) with a working deployment pipeline, **so that** we can ship code continuously.
**Acceptance Criteria:**

1.  Turborepo initialized with `apps/web` and `apps/api`.
2.  GitHub Actions pipeline builds and tests both apps on push.
3.  Deploy script pushes to Railway/Vercel successfully (Staging Environment).

#### Story 1.2: Authentication Integration

**As a** Player, **I want** to sign up using Email/Password or Discord, **so that** I can secure my account.
**Acceptance Criteria:**

1.  Frontend Login page implements Authentication UI.
2.  Backend guards (NestJS) verify the JWT token on protected endpoints.
3.  User is redirected to `/dashboard` upon successful login.

#### Story 1.3: User Profile & Bunker Creation

**As a** Player, **I want** my "Bunker" to be created automatically when I sign up, **so that** I have a home base.
**Acceptance Criteria:**

1.  On User creation trigger (Hook or API call), create a `User` and `Inventory` record in Postgres.
2.  Grant the user 1000 starter Credits.
3.  Dashboard displays Username, Credits, and Bunker Level.

---

### Epic 2: The Harvest Loop

**Goal:** Enable the first economic activity—generating value from nothing (Mining) to bootstrap the economy.

#### Story 2.1: Mining Drill Implementation

**As a** Player, **I want** to start a "Mining Job" that takes time to complete, **so that** I can gather resources while AFK.
**Acceptance Criteria:**

1.  UI shows "Start Mining Iron" button.
2.  Clicking it starts a backend timer (or Timestamp check).
3.  After X minutes, the job is "Complete."

#### Story 2.2: Claiming Resources

**As a** Player, **I want** to "Claim" the results of my mining job, **so that** the ore appears in my inventory.
**Acceptance Criteria:**

1.  UI shows "Claim" button when job is done.
2.  Clicking Claim adds +10 Iron Ore to User Inventory.
3.  Job status resets to IDLE.

---

### Epic 3: The Exchange

**Goal:** Allow players to trade resources, establishing the "Market Price" and enabling specialization.

#### Story 3.1: Market Listing (Sell)

**As a** Seller, **I want** to list my excess Iron Ore for sale, **so that** I can earn Credits.
**Acceptance Criteria:**

1.  User can select Item -> Quantity -> Price per Unit.
2.  System deducts Item from User Inventory and moves to "Escrow."
3.  Listing appears in the Global Market feed.

#### Story 3.2: Market Purchase (Buy)

**As a** Buyer, **I want** to browse listings and buy cheap ore, **so that** I can stockpile resources.
**Acceptance Criteria:**

1.  User can view list of active Sell Orders.
2.  Buying an item transfers Credits from Buyer to Seller.
3.  Item moves from Escrow to Buyer Inventory.
4.  Transaction is logged in History.

---

### Epic 4: Drone Command

**Goal:** Implement the "Sink" for resources and the conflict driver using the **Tactical Grid Resolver (TGR)**.

#### Story 4.1: Drone Configuration (The 5x5 Grid)

**As a** Tactician, **I want** to configure a Drone Swarm on a 5x5 Grid, **so that** I can employ spatial strategies.
**Acceptance Criteria:**

1.  **Grid Editor:** UI allows placing Drones on a 5x5 grid.
2.  **Validation:** Cannot overlap drones. Must own the specific Drone Item (NFT/Row).
3.  **Behavior Logic:** Assign AI Chips (Attack/Defend) to each drone.

#### Story 4.2: Tactical Grid Resolver (TGR) Logic

**As a** Developer, **I want** a deterministic combat resolver that processes turns on the grid, **so that** we can have deep auto-battles.
**Acceptance Criteria:**

1.  **Turn-Based:** The simulation runs X ticks.
2.  **Movement:** Drones move according to their Chip logic (e.g., "Seek Nearest Enemy").
3.  **Collision:** If two drones hit the same tile, both take Collision Damage.
4.  **Damage:** Attack logic applies damage to target HP.
5.  **Output:** Returns a full `BattleLog` JSON of every tick for replay.

---

### Epic 5: The Comm-Link (Chat)

**Goal:** Create a global chat channel so players can negotiate trades, form alliances, and trash-talk in true MMO fashion.

#### Story 5.1: WebSocket Chat Infrastructure

**As a** Developer, **I want** a Socket.io namespace for chat, **so that** players can send and receive messages in real-time.
**Acceptance Criteria:**

1.  NestJS Gateway handles `chat:join` and `chat:message` events.
2.  Server broadcasts messages to all connected users in the "global" room.
3.  Connection auth via JWT.

#### Story 5.2: Chat UI Component

**As a** Player, **I want** a chat panel on my dashboard, **so that** I can talk to other players.
**Acceptance Criteria:**

1.  Collapsible chat drawer on the bottom-right of the Dashboard.
2.  Shows last 50 messages with username + timestamp.
3.  Input field sends message on Enter key.
4.  Optimistic update: message appears instantly before server ack.

#### Story 5.3: Basic Moderation (Admin)

**As an** Admin, **I want** to be able to mute or ban a user, **so that** I can maintain a civil environment.
**Acceptance Criteria:**

1.  Admin role flag on User table.
2.  Admin-only API endpoint `POST /api/admin/mute/:userId`.
3.  Muted users can see chat but cannot send messages.

### Epic 6: The Red Frontier (Map System)

**Goal:** Implement an infinite, procedural grid system for Mars to provide spatial context and exploration.

#### Story 6.1: Grid System & Coordinates

**As a** Developer, **I want** a database structure to store the world map as a Grid, **so that** we can place players and resources in specific locations.
**Acceptance Criteria:**

1.  **Grid Model:** DB Table `Sector` or `Plot` with X, Y coordinates (BigInt for infinite scale).
2.  **Types:** Supports types: `BUNKER` (Player Base), `RESOURCE` (Mining), `EMPTY` (Wild), `POI` (Artifacts).
3.  **API:** `GET /api/map/sector?x=0&y=0&radius=5` returns a chunk of the map.

#### Story 6.2: Map Spawning Logic

**As a** Game Designer, **I want** new players to spawn in unoccupied plots at the "Frontier" edge, **so that** they are not overcrowded and have room to expand.
**Acceptance Criteria:**

1.  **Spawn Algorithm:** On user registration, find the optimal `(X, Y)` coordinate.
2.  **Distance Rule:** Ensure minimum distance `D` between any two Bunkers.
3.  **Expansion:** Spawning follows a spiral or ring pattern outward from `(0,0)`.

#### Story 6.3: Map Visualization

**As a** Explorer, **I want** to view a map of my surroundings, **so that** I can see where I am and what's around me.
**Acceptance Criteria:**

1.  **Map UI:** A 2D Grid view on the Dashboard (Canvas or HTML Grid).
2.  **Navigation:** Buttons to Pan (North, South, East, West).
3.  **Fog of War:** Information is hidden for sectors the player hasn't "scanned" (optional for MVP, maybe just visible radius).

---

### Epic 7: Industrial Ownership (Advanced Harvest)

**Goal:** Bind the economy to the map, forcing players to claim land to harvest resources.

#### Story 7.1: Plot Claiming

**As a** Warlord, **I want** to "Claim" an empty plot of land, **so that** I can extract its resources.
**Acceptance Criteria:**

1.  **Claim Action:** `POST /api/map/claim` with target `(X, Y)`.
2.  **Cost:** Claiming costs Credits (or specific "Colony Ship" item).
3.  **Validation:** Must be adjacent to existing territory OR within range.
4.  **Ownership:** Plot status updates to `OWNED` by `UserId`.

#### Story 7.2: Resource Distribution

**As a** Miner, **I want** different plots to have different resource concentrations (e.g., "Iron Rich" sector), **so that** location matters.
**Acceptance Criteria:**

1.  **Procedural Gen:** Map generation algorithm assigns resource values (Iron, Copper, Silica) to coordinates based on Perlin noise or hashing.
2.  **Survey:** Players can "Scan" a plot to reveal its potential yield.

#### Story 7.3: Logistics & Travel

**As a** Manager, **I want** mining drills to take time to travel to remote plots, **so that** expanding too far has a cost.
**Acceptance Criteria:**

1.  **Travel Time:** Deploying a drone/drill to a plot at `(X, Y)` takes time = `Distance * Speed`.
2.  **Recall:** Returning resources to the Bunker also takes travel time.

---

### Epic 8: The Forge (Refining System)

**Goal:** Implement the "Production" leg of the economy. Convert raw materials into refined goods to create value.

#### Story 8.1: Refining Queue

**As a** Manufacturer, **I want** to queue up a refining job (e.g., 10 Iron -> 1 Steel), **so that** I can process materials over time.
**Acceptance Criteria:**

1.  **Input/Output:** Recipe system defines inputs and outputs.
2.  **Time:** Processing takes X minutes per batch.
3.  **Queue:** Can queue multiple batches up to slot limit.

#### Story 8.2: Yield Modifiers (Skill Hooks)

**As a** Specialist, **I want** my skills to improve my refining yield, **so that** I am more efficient than others.
**Acceptance Criteria:**

1.  **Formula:** `Output = BaseOutput * (1 + SkillModifier)`.
2.  **Display:** UI shows the "Bonus Yield" clearly.

---

### Epic 9: Neural Conditioning (Skill System)

**Goal:** Implement the "Triangle of Efficiency" classes (Cogitator, Forge, Tharsis) via a flexible Skill Point system.

#### Story 9.1: Skill Tree Backend

**As a** Player, **I want** to spend Skill Points (SP) to unlock nodes, **so that** I can specialize.
**Acceptance Criteria:**

1.  **Data Structure:** `UserSkills` table tracking unlocked nodes.
2.  **Validation:** Must have required parent node and enough SP.
3.  **Branches:** Implement 3 distinct trees (Cogitator, Forge, Tharsis).

#### Story 9.2: Apply Skill Effects

**As a** Developer, **I want** a service that calculates final stats based on skills, **so that** gameplay reflects choices.
**Acceptance Criteria:**

1.  **Service:** `SkillService.getHarvestSpeed(userId)` checks for "Rapid Extraction".
2.  **Caching:** Cache the modifiers to avoid DB lookups on every action.

---

### Epic 10: Infrastructure (Bunker Upgrades)

**Goal:** Provide the primary resource sink and permanent progression mechanics.

#### Story 10.1: Facility Management

**As a** Player, **I want** to upgrade my facilities (e.g. Storage Hopper Lvl 2), **so that** I can unlock new capabilities.
**Acceptance Criteria:**

1.  **Upgrade Cost:** Deduct Resources and Credits.
2.  **Gating:** Some upgrades require specific Player Level or other Facilities.
3.  **Visuals:** UI updates to show the new Level.

#### Story 10.2: Progression Gates

**As a** Designer, **I want** to block features until facilities are upgraded, **so that** players feel progression.
**Acceptance Criteria:**

1.  **Check:** e.g., "Cannot access Global Market until Logistics Hub Lvl 1".

---

### Epic 11: The Directives (Quest Engine)

**Goal:** Implement the source of Service Credits (SC) and Skill Points.

#### Story 11.1: Logistics Contracts

**As a** Player, **I want** to accept delivery jobs, **so that** I can earn Credits.
**Acceptance Criteria:**

1.  **Generation:** Procedural generation of demands (e.g., "Company needs 500 Iron").
2.  **Completion:** Deduct items, Add Credits.

#### Story 11.2: Narrative Directives

**As a** Player, **I want** one-time milestones, **so that** I have long-term goals.
**Acceptance Criteria:**

1.  **Trigger:** Event-based (e.g., "Craft your first Drone").
2.  **Reward:** Grants Skill Points (SP).

## 7. Checklist Results Report

### PM Checklist Results

- [x] **Clear Goals:** Launch Alpha, Validate Niche.
- [x] **User Value:** "Time Respect" + "Deep Economy" defined.
- [x] **Feasibility:** Tech assumptions (NestJS/PostgreSQL/2D) align with MVP timeline.
- [x] **Scope:** Limited to 5 focused Epics. No "Nice to Haves" masquerading as core.
- [x] **Success Metrics:** Retention and Session Frequency defined.

## 8. Next Steps

### UX Expert Prompt

_To the UX Expert:_
Review the "Diegetic Cyber-Industrial" vision in Section 3.
**Action:** Create a Style Guide (Colors/Typography) and high-fidelity wireframes for the **Dashboard** and **Market List** views. Ensure high contrast and mobile responsiveness.

### Architect Prompt

_To the Architect:_
Proceed with providing the technical blueprint for the **Modular Monolith** in NestJS.
**Criticial Focus:**

1.  **WebSocket Architecture:** How to scale sockets if we hit 10k users? (Redis Adapter).
2.  **Market Escrow:** Define the exact transaction flow to prevent race conditions.
3.  **Authentication:** finalizing the JWT <-> NestJS guard/strategy.
