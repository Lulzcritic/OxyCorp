export interface LevelRequirement {
  level: number;
  xpRequired: bigint;
  skillPointsAwarded: number;
}

/**
 * XP thresholds for leveling up.
 * When user's XP exceeds the threshold, they level up and receive SP.
 */
export const LEVEL_XP_REQUIREMENTS: LevelRequirement[] = [
  { level: 1, xpRequired: BigInt(0), skillPointsAwarded: 0 },
  { level: 2, xpRequired: BigInt(100), skillPointsAwarded: 1 },
  { level: 3, xpRequired: BigInt(300), skillPointsAwarded: 1 },
  { level: 4, xpRequired: BigInt(600), skillPointsAwarded: 2 },
  { level: 5, xpRequired: BigInt(1000), skillPointsAwarded: 2 },
  { level: 6, xpRequired: BigInt(1500), skillPointsAwarded: 3 },
  { level: 7, xpRequired: BigInt(2100), skillPointsAwarded: 3 },
  { level: 8, xpRequired: BigInt(2800), skillPointsAwarded: 4 },
  { level: 9, xpRequired: BigInt(3600), skillPointsAwarded: 4 },
  { level: 10, xpRequired: BigInt(4500), skillPointsAwarded: 5 },
];

/**
 * Calculate user level based on XP.
 */
export function calculateLevel(xp: bigint): number {
  let level = 1;
  for (const req of LEVEL_XP_REQUIREMENTS) {
    if (xp >= req.xpRequired) {
      level = req.level;
    } else {
      break;
    }
  }
  return level;
}

/**
 * Calculate total SP earned from level 1 to current level.
 */
export function calculateTotalSPFromLevel(level: number): number {
  let totalSP = 0;
  for (const req of LEVEL_XP_REQUIREMENTS) {
    if (req.level <= level && req.level > 1) {
      totalSP += req.skillPointsAwarded;
    }
  }
  return totalSP;
}
