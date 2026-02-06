# Story 12.1: Action-Based XP Rewards

**Epic:** Epic 12: Strategic Expansion & Progression Loop
**Role:** Developer
**Goal:** I want players to earn XP from core gameplay actions (mining, refining, trading), so they can level up and earn SP organically.

## Acceptance Criteria

1.  **XP Constants File**:
    - Create `apps/api/src/skills/xp-rewards.constants.ts` with:
      - `BASE_XP.MINING = 5`
      - `BASE_XP.REFINING = 8`
      - `BASE_XP.MARKET_BUY = 3`
      - `BASE_XP.MARKET_SELL = 3`
      - `LEVEL_SCALING.MINING = 1`
      - `LEVEL_SCALING.REFINING = 2`
      - `LEVEL_SCALING.MARKET = 0.5`
    - Export `calculateActionXP(baseXP, levelScaling, playerLevel)` helper function.

2.  **Mining XP Integration**:
    - In `JobsService.claimJob()`, after emitting `mining.complete`, call `skillsService.awardXP()`.
    - XP amount = `BASE_XP.MINING + (LEVEL_SCALING.MINING * playerLevel)`.
    - Return XP awarded in the claim response.

3.  **Refining XP Integration**:
    - In `RefiningService.claimRefining()`, call `skillsService.awardXP()`.
    - XP amount = `BASE_XP.REFINING + (LEVEL_SCALING.REFINING * playerLevel)`.
    - Return XP awarded in the claim response.

4.  **Market XP Integration**:
    - In `MarketService.buyListing()`, award XP to buyer.
    - In `MarketService.buyListing()`, also award XP to seller (the listing owner).
    - XP amount = `BASE_XP.MARKET_BUY/SELL + (LEVEL_SCALING.MARKET * playerLevel)`.

5.  **Frontend Display**:
    - Update `MiningWidget` claim success message to show XP gained.
    - Update `RefiningWidget` claim success message to show XP gained.
    - Show level-up notification toast when user levels up.

## Technical Notes

- Inject `SkillsService` into `JobsService`, `RefiningService`, `MarketService` via module imports.
- The `awardXP()` method already handles level-up detection and SP grants.
- For market sales, fetch seller's level for scaling (or use a simpler flat rate).
- Consider adding `xpAwarded` field to claim responses.

## Dev Agent Record

### Status

- [x] XP Constants File (`xp-rewards.constants.ts`)
- [x] Mining XP Integration (`JobsService`)
- [x] Refining XP Integration (`RefiningService`)
- [x] Market XP Integration (`MarketService`)
- [x] Frontend Display Updates

### Completion Notes

- Created `xp-rewards.constants.ts` with BASE_XP, LEVEL_SCALING, and helper functions (getMiningXP, getRefiningXP, getMarketBuyXP, getMarketSellXP).
- Updated `JobsService.claimJob()` to award XP based on player level, returns xpAwarded/levelUp/newLevel.
- Updated `RefiningService.claimRefining()` to award XP after claim.
- Updated `MarketService.buyListing()` to award XP to both buyer AND seller.
- Added `getUserLevel()` to SkillsService for level lookup.
- Updated JobsModule and MarketModule to import SkillsModule.
- Updated MiningWidget and RefiningWidget to display XP/level-up in claim alerts.
- API and Web TypeScript builds verified.

### File List

- `apps/api/src/skills/xp-rewards.constants.ts` [NEW]
- `apps/api/src/skills/skills.service.ts`
- `apps/api/src/jobs/jobs.service.ts`
- `apps/api/src/jobs/jobs.module.ts`
- `apps/api/src/refining/refining.service.ts`
- `apps/api/src/market/market.service.ts`
- `apps/api/src/market/market.module.ts`
- `apps/web/src/components/MiningWidget.tsx`
- `apps/web/src/components/RefiningWidget.tsx`
