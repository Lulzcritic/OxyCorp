# Story 9.1: Skill Tree Schema & XP

**Epic:** Epic 9: Neural Conditioning (Skills)
**Role:** Developer
**Goal:** I want to store player experience points and skill unlocks so that they can progress in the "Triangle of Efficiency".

## Acceptance Criteria

1.  **Schema Update**:
    - Update `User` model: Add `xp` (BigInt), `specialization` (already added in 8.2, ensure it's used).
    - Create `UserSkills` model: `userId`, `skillId` (String/Enum), `level` (Int).
2.  **XP Logic**:
    - `SkillService.awardXP(userId, amount)`: Increments XP.
    - Define XP Table (e.g. constant `LEVEL_XP_REQUIREMENTS`).
    - When XP > Threshold -> Grant Skill Points (store in User model: `skillPoints`).
3.  **API**:
    - `GET /api/skills`: Returns current skills, XP, and available SP.

## Technical Notes

- Specializations: `COGITATOR` (Efficiency), `FORGE` (Combat/Crafting), `MERCHANT` (Trade/Logistics).

## Dev Agent Record

### Status

- [x] Schema Update (`UserSkills` model, relation to User)
- [x] XP Logic (`LEVEL_XP_REQUIREMENTS`, `awardXP`, `calculateLevel`)
- [x] API (`GET /api/skills`)

### Completion Notes

- Created `UserSkills` model in Prisma with unique constraint on `[userId, skillId]`.
- Defined `LEVEL_XP_REQUIREMENTS` constant with XP thresholds and SP awards.
- Implemented `SkillsService` with `getSkillsData` and `awardXP` methods.
- User model already has `xp` and `skillPoints` from Story 11.1.
- Build verified.

### File List

- `apps/api/prisma/schema.prisma`
- `apps/api/src/skills/skills.module.ts`
- `apps/api/src/skills/skills.service.ts`
- `apps/api/src/skills/skills.controller.ts`
- `apps/api/src/skills/skills.constants.ts`
- `apps/api/src/app.module.ts`
