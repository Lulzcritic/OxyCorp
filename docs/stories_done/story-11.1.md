# Story 11.1: Quest Schema & Generation

**Epic:** Epic 11: Directives (Quest Engine)
**Role:** Developer
**Goal:** I want a backend system to generate and store missions for players, so they can earn rewards.

## Acceptance Criteria

1.  **Schema Update**:
    - Create `Quest` model: `id`, `userId`, `type` (ENUM: MINING, REFINING, COMBAT), `target` (e.g. ItemID, Count), `reward` (Credits, SP), `status`, `expiresAt`.
    - Create `QuestTemplate` config/constant defining possible mission types and difficulty scaling.
2.  **Generation Service**:
    - `DirectiveService.generateDaily(userId)`: Creates 3 random quests for the user if they don't have active ones.
    - Logic: Pick random template, scale requirements by User Level / Bunker Level.
3.  **API**:
    - `GET /api/directives`: Returns active quests.
    - `POST /api/directives/refresh`: Uses a "Reroll Token" (or free daily) to generate new ones.

## Technical Notes

- Store `target` and `reward` as JSONB for flexibility.
- Example Target: `{ "item": "IRON_ORE", "count": 100 }`
- Example Reward: `{ "credits": 500, "xp": 50 }`

## Dev Agent Record

### Status

- [x] Schema Update (Quest model, Enums, User relation)
- [x] Generation Service (`generateDaily`, `refreshQuests`)
- [x] API (`GET /directives`, `POST /directives/refresh`, `POST /directives/daily`)

### Completion Notes

- Updated Prisma schema with `Quest` model, `QuestType` and `QuestStatus` enums.
- Added `xp`, `skillPoints`, and `quests` relation to User model (proactive for Story 9.1).
- Created `DirectivesModule` with randomized quest generation logic based on `QUEST_TEMPLATES`.
- Build verified.

### File List

- `apps/api/prisma/schema.prisma`
- `apps/api/src/directives/directives.module.ts`
- `apps/api/src/directives/directives.service.ts`
- `apps/api/src/directives/directives.controller.ts`
- `apps/api/src/directives/directives.constants.ts`
- `apps/api/src/app.module.ts`
