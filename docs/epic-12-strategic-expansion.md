# Epic 12: Strategic Expansion & Progression Loop - Brownfield Enhancement

## Epic Goal

Enable meaningful progression by defining SP earning actions, implementing skill-gated land expansion, and allowing players to install advanced bases from the tactical map interface.

## Existing System Context

**Current Architecture:**

- **Skills Backend:** `SkillsService` with XP award via `awardXP()`, skill unlock via `unlockSkill()`, level-based SP calculation
- **Skills Registry:** 7 skills across 3 specializations (Cogitator, Forge, Merchant) with prereq chains
- **Map System:** `MapService` with sector fetching, no claiming mechanism
- **Directives:** Quest system grants XP on completion, but XP is not granted from core actions (mining, refining, trading)
- **Bunker System:** `BunkerService` with facility upgrades, resource cost validation
- **Frontend:** `MapGrid.tsx` shows sectors, `MiningWidget.tsx` allows mining on owned sectors

**Technology Stack:**

- NestJS modular monolith (API)
- React (Web frontend)
- Prisma ORM + PostgreSQL
- EventEmitter2 for domain events

**Integration Points:**

- `JobsService.claimJob()` → Need to emit XP gain event
- `RefiningService.claimRefining()` → Need to emit XP gain event
- `MarketService.buyListing()` → Need to emit XP gain event
- `SkillsService` → Need new skill for plot limit expansion
- `MapService` → Need `claimPlot()` method with skill validation
- `MapGrid.tsx` → Need "Claim" and "Install Base" UI actions

---

## Enhancement Details

### Feature 1: Action-Based XP/SP Earning

**What:**  
Grant XP from core gameplay actions (mining, refining, trading) so players can level up and earn SP organically.

**XP Scale by Player Level:**
| Action | Base XP | Level Scaling |
|--------|---------|---------------|
| Claim Mining Job | 5 XP | +1 per player level |
| Claim Refining Job | 8 XP | +2 per player level |
| Buy Market Listing | 3 XP | +0.5 per player level |
| Sell Market Listing | 3 XP | +0.5 per player level (when someone buys your listing) |

> **Note:** All XP values MUST be defined in `apps/api/src/skills/xp-rewards.constants.ts` for easy tweaking.

**Implementation:**

- Create `xp-rewards.constants.ts` with all base values and scaling formulas
- Inject `SkillsService` into `JobsService`, `RefiningService`, `MarketService`
- Call `skillsService.awardXP(userId, scaledAmount)` on successful action completion

---

### Feature 2: Land Expansion Skill & Claiming

**What:**  
Add "Land Baron" skills to the **MERCHANT** branch that increases the number of plots a player can own. Players start with a base limit of **3 plots** (1 Bunker + 2 Resource).

**New Skills (MERCHANT Branch):**
| Skill ID | Name | Description | Cost | Prereq | Effect |
|----------|------|-------------|------|--------|--------|
| `MERCHANT_LAND_1` | Land Baron I | +2 max plots | 2 SP | `MERCHANT_YIELD_1` | plotLimit: 5 |
| `MERCHANT_LAND_2` | Land Baron II | +3 max plots | 3 SP | `MERCHANT_LAND_1` | plotLimit: 8 |
| `MERCHANT_LAND_3` | Land Baron III | +4 max plots | 4 SP | `MERCHANT_LAND_2` | plotLimit: 12 |

> **Note:** These skills extend the existing MERCHANT tree (3-branch system preserved). Land Baron I requires Trade Savant I as prerequisite.

**Claiming Logic:**

- `POST /api/map/claim { x, y }` claims an empty/resource sector
- Validates: sector exists, type is EMPTY or RESOURCE, not already owned
- Validates: player has not exceeded their plot limit (base 3 + skill bonuses)
- Cost: 500 Credits per claim (flat rate)

---

### Feature 3: Advanced Base Installation (Outpost)

**What:**  
Allow players to "install an advanced base" (Outpost) on a claimed resource sector from the tactical map. This upgrades the sector for better yields.

**Outpost Installation:**

- Cost: 50 Steel Plating + 100 Iron Ore + 1000 Credits
- Effect: Sector gains `hasOutpost: true`, mining yields +25%
- Validation: Player owns sector, resources check

**UI Integration (MapGrid.tsx):**

- When clicking an owned RESOURCE sector:
  - Show "Install Outpost" button if no outpost
  - Show "Outpost Active" badge if installed
- When clicking an empty unowned sector adjacent to player territory:
  - Show "Claim Sector" button

---

## Stories

### Story 12.1: Implement Action-Based XP Rewards

**As a** Player,  
**I want** to earn XP from mining, refining, and trading,  
**So that** I can level up and unlock skills through normal gameplay.

**Acceptance Criteria:**

1. Claiming mining job awards base XP + level scaling
2. Claiming refining job awards base XP + level scaling
3. Buying a market listing awards XP
4. XP gain is displayed in claim success message
5. Level-up notification when threshold crossed

---

### Story 12.2: Implement Land Expansion Skill & Claiming

**As a** Warlord,  
**I want** to claim empty sectors on the map and expand my territory,  
**So that** I can access more resources and grow my empire.

**Acceptance Criteria:**

1. New MERCHANT skills (LAND_BARON_1/2/3) added to skill registry
2. `POST /api/map/claim` endpoint validates plot limit against skill
3. Claim deducts credits, assigns sector ownership
4. MapGrid shows "Claim" button for valid expansion targets
5. Error message if plot limit exceeded

---

### Story 12.3: Implement Outpost Installation

**As a** Industrialist,  
**I want** to install an advanced base (Outpost) on my resource sectors,  
**So that** I can improve mining efficiency.

**Acceptance Criteria:**

1. `POST /api/map/install-outpost` validates ownership & resources
2. Deducts materials, sets `hasOutpost: true` on sector
3. Mining yield on outpost sectors is +25%
4. MapGrid shows "Install Outpost" button for owned sectors without outpost
5. Outpost badge displayed on sector with outpost

---

## Compatibility Requirements

- [x] Existing Mining/Refining claims remain unchanged (additive XP)
- [x] Market buy/sell still works (just adds XP award)
- [x] Skill registry extended, not replaced
- [x] Sector schema extended with `hasOutpost` field (nullable boolean)
- [x] UI changes follow existing component patterns

## Risk Mitigation

**Primary Risk:** XP formula imbalance causing too fast/slow progression
**Mitigation:** Use conservative base values; can tune multipliers via constants file

**Primary Risk:** Plot claiming exploits or conflicts
**Mitigation:** Server-side validation of adjacency and limits; no client-side trust

**Rollback Plan:**

- Feature flags can disable XP gains
- Skill definitions can be reverted
- Sector claiming can be disabled at API level

## Definition of Done

- [x] All 3 stories completed with acceptance criteria met
- [x] Existing mining/refining/trading verified working
- [x] XP/SP flow tested end-to-end
- [x] Plot claiming with skill validation tested
- [x] Outpost installation tested with yield verification
- [x] UI updates for MapGrid tested on desktop/mobile

---

## Story Manager Handoff

Please develop detailed user stories for this brownfield epic. Key considerations:

- This is an enhancement to an existing NestJS + React system with Prisma
- Integration points: `JobsService`, `RefiningService`, `MarketService`, `SkillsService`, `MapService`, `MapGrid.tsx`
- Existing patterns to follow: Event emitter for cross-module communication, transaction blocks for atomic operations
- Critical compatibility requirements: No breaking changes to existing endpoints
- Each story must include verification that existing functionality remains intact

The epic should maintain system integrity while delivering meaningful skill-gated progression and territory expansion.
