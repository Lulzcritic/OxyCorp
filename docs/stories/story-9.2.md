# Story 9.2: Skill Point Application (The Cortex)

**Epic:** Epic 9: Neural Conditioning (Skills)
**Role:** Player
**Goal:** I want to spend my Skill Points to unlock bonuses.

## Acceptance Criteria

1.  **Unlock API**:
    - `POST /api/skills/unlock` with `{ skillId }`.
    - Validate: User has enough SP. Prerequisites met (e.g. parent skill unlocked).
    - Action: Deduct SP, Create/Update `UserSkills` record.
2.  **Effect Registry**:
    - Create a `SkillRegistry` constant defining: `id`, `name`, `cost`, `prereq`, `effect` (description).
    - Actual effect logic is applied in respective services (e.g. `RefiningService` checking for `MERCHANT_YIELD_1`).
3.  **Sync**:
    - Update `RefiningService.calculateYield` to check for these skills instead of hardcoded specialization check (deprecate MVP hack from 8.2).

## Technical Notes

- Refactoring 8.2: Replace `if (specialization == 'MERCHANT')` with `if (skills.has('MERCHANT_YIELD_1'))`.

## Dev Agent Record

### Status

- [x] Unlock API (`POST /api/skills/unlock`)
- [x] Effect Registry (`SKILL_REGISTRY` with skill definitions)
- [x] Sync (`RefiningService.calculateYield` refactored)

### Completion Notes

- Created `skill-registry.constants.ts` with MERCHANT, COGITATOR, FORGE trees.
- Implemented `unlockSkill` with SP validation, prerequisite checks, and transaction.
- Added `hasSkill` helper method for querying user skills.
- Refactored `RefiningService.calculateYield` to use `SkillsService.hasSkill('MERCHANT_YIELD_1')` and `MERCHANT_YIELD_2`.
- Build verified.

### File List

- `apps/api/src/skills/skill-registry.constants.ts`
- `apps/api/src/skills/skills.service.ts`
- `apps/api/src/skills/skills.controller.ts`
- `apps/api/src/refining/refining.service.ts`
- `apps/api/src/refining/refining.module.ts`
