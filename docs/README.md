# Moloch Project Codex

**Version:** 1.0
**Last Updated:** 2026-01-22

## 1. Core Documentation

| Document                                          | Description                                    | Audience       |
| :------------------------------------------------ | :--------------------------------------------- | :------------- |
| **[Product Requirements (PRD)](./prd.md)**        | The "Bible". Goals, Epics, and core mechanics. | PM, All        |
| **[Architecture](./architecture.md)**             | System design, Data Models, Tech Stack.        | Architect, Dev |
| **[Frontend Specification](./front-end-spec.md)** | UI/UX goals, Design System, Screens.           | UX, Frontend   |
| **[Project Brief](./brief.md)**                   | Original high-level pitch.                     | Stakeholders   |

## 2. Epics & Stories

### User Story Status Checklist

#### Epic 1: Project Genesis

- [x] **[1.1 Project Skeleton](./stories/story-1.1.md)**: Repo setup, CI/CD.
- [x] **[1.2 Authentication](./stories/story-1.2.md)**: Login/Signup.
- [x] **[1.3 User Profile](./stories/story-1.3.md)**: Bunker creation.

#### Epic 2: The Harvest Loop

- [x] **[2.1 Mining Drill](./stories/story-2.1.md)**: Start Job logic.
- [x] **[2.2 Claim Resources](./stories/story-2.2.md)**: Inventory update logic.

#### Epic 3: The Exchange

- [x] **[3.1 Market Sell](./stories/story-3.1.md)**: Listing items.
- [x] **[3.2 Market Buy](./stories/story-3.2.md)**: Purchase transaction.

#### Epic 4: Drone Command

- [x] **[4.1 Drone Config](./stories/story-4.1.md)**: Swarm Editor.
- [x] **[4.2 Combat Sim](./stories/story-4.2.md)**: Background battle worker.

#### Epic 5: The Comm-Link

- [x] **[5.1 Chat Infra](./stories/story-5.1.md)**: WebSocket Gateway.
- [x] **[5.2 Chat UI](./stories/story-5.2.md)**: Dashboard Drawer.

#### Epic 6: The Red Frontier (Map System)

- [x] **[6.1 Grid Coordinates]**: Infinite coordinate sector rendering.
- [x] **[6.2 Map Spawner]**: Procedural sector spawning.

#### Epic 7: Industrial Ownership (Map Claims)

- [x] **[7.1 Sector Claiming]**: Spend credits to own sectors.
- [x] **[7.2 Outpost Construction]**: Build outposts on owned resource sectors.

#### Epic 8: The Forge (Refining)

- [x] **[8.1 Refining Vats]**: Process raw ores into refined ingots.

#### Epic 9: Neural Conditioning (Skills)

- [x] **[9.1 Skill Unlock]**: Unlock cogitator/merchant skills.

#### Epic 10: Bunker Infrastructure

- [x] **[10.1 Facility Upgrades]**: Level up Command Center, Refining Vats.

#### Epic 11: Quest Engine (Directives)

- [x] **[11.1 Daily Contracts]**: Deliver items to earn credits.

#### Epic 12: Strategic Expansion

- [x] **[12.1 XP Earning]**: Gain XP from core gameplay loops.
- [x] **[12.2 Land Baron]**: Skill-gated plot ownership limits.

#### Epic 16: Outpost Forge & Item Crafting

- [x] **[16.1 Forge Terminal]**: Physical 3D terminal outside the bunker.
- [x] **[16.2 Item Crafting]**: Craft equipment from recipes.

#### Epic 17: Equipment Slots & Diablo Sets

- [x] **[17.1 Gear Equipment]**: Helmet, Chest, Boots, and Weapon slots.
- [x] **[17.2 Item Set Modifiers]**: Match gear sets for active multipliers (e.g. Excavator).
- [x] **[17.3 Item Registry]**: Unified admin configuration files.

#### Epic 18: Neural Blueprint Decryption

- [x] **[18.1 Blueprint Gates]**: Recipes require blueprints to craft.
- [x] **[18.2 Hard Drive Decrypt]**: Spend hard drives to discover hidden plans.

#### Epic 19: Martian Clock & Server Ticks

- [x] **[19.1 Server Ticks]**: Background hourly interval updates.
- [x] **[19.2 Depletion & Regen]**: Richness-capped resource nodes.
- [x] **[19.3 Martian Calendar Clock]**: Darian Calendar HUD widget.
- [x] **[19.4 Persistent Depletion]**: 3D crystal depletion states.

## 3. Quick Start for Developers

1.  **Read the PRD** to understand the game.
2.  **Read the Architecture** to understand the Modular Monolith info.
3.  **Start with Story 1.1** to initialize the repository.
    - Run `/dev` to activate the Developer Agent.
