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
- [x] **[1.2 Supabase Auth](./stories/story-1.2.md)**: Login/Signup.
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

## 3. Quick Start for Developers

1.  **Read the PRD** to understand the game.
2.  **Read the Architecture** to understand the Modular Monolith info.
3.  **Start with Story 1.1** to initialize the repository.
    - Run `/dev` to activate the Developer Agent.
