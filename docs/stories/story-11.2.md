# Story 11.2: Quest Tracking & Completion

**Epic:** Epic 11: Directives (Quest Engine)
**Role:** Player
**Goal:** I want my actions to count towards my missions and to claim rewards when done.

## Acceptance Criteria

1.  **Event Listeners**:
    - Implement an event bus or hooks in `MiningService` and `RefiningService`.
    - When `MiningJob` completes, emit `MiningCompleteEvent`.
    - `DirectiveService` listens and increments progress on matching active quests.
2.  **Claim API**:
    - `POST /api/directives/claim` with `{ questId }`.
    - Validates progress >= target.
    - Awards Credits and Skill Points (XP) to User.
    - Sets Quest status to `COMPLETED`.

## Technical Notes

- Users need a `skillPoints` field (Story 9.1 dependency).
- Use `EventEmitter2` (NestJS built-in) for decoupling.

## Dev Agent Record

### Status

- [x] Event Listeners (`@OnEvent('mining.complete')`, `@OnEvent('refining.complete')`)
- [x] Claim API (`POST /api/directives/claim`)
- [x] Progress Tracking (`incrementQuestProgress`)

### Completion Notes

- Added `progress` field to `Quest` model.
- Registered `@nestjs/event-emitter` module in `AppModule`.
- Implemented `handleMiningComplete` and `handleRefiningComplete` event listeners.
- Implemented `claimQuest` method with reward logic (Credits, XP).
- Build verified.

### File List

- `apps/api/prisma/schema.prisma`
- `apps/api/src/app.module.ts`
- `apps/api/src/directives/directives.service.ts`
- `apps/api/src/directives/directives.controller.ts`
