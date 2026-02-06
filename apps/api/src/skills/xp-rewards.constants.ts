/**
 * XP Rewards Configuration
 * 
 * All XP values for action-based rewards. Easily tweakable for balance.
 */

export const BASE_XP = {
  MINING: 5,
  REFINING: 8,
  MARKET_BUY: 3,
  MARKET_SELL: 3,
} as const;

export const LEVEL_SCALING = {
  MINING: 1,        // +1 XP per player level
  REFINING: 2,      // +2 XP per player level
  MARKET: 0.5,      // +0.5 XP per player level
} as const;

/**
 * Calculate XP reward for an action based on player level.
 * 
 * @param baseXP - Base XP for the action (from BASE_XP)
 * @param levelScaling - Scaling factor per level (from LEVEL_SCALING)
 * @param playerLevel - Current player level
 * @returns Total XP to award (rounded down)
 */
export function calculateActionXP(
  baseXP: number,
  levelScaling: number,
  playerLevel: number
): number {
  return Math.floor(baseXP + (levelScaling * playerLevel));
}

/**
 * Helper functions for common XP calculations
 */
export function getMiningXP(playerLevel: number): number {
  return calculateActionXP(BASE_XP.MINING, LEVEL_SCALING.MINING, playerLevel);
}

export function getRefiningXP(playerLevel: number): number {
  return calculateActionXP(BASE_XP.REFINING, LEVEL_SCALING.REFINING, playerLevel);
}

export function getMarketBuyXP(playerLevel: number): number {
  return calculateActionXP(BASE_XP.MARKET_BUY, LEVEL_SCALING.MARKET, playerLevel);
}

export function getMarketSellXP(playerLevel: number): number {
  return calculateActionXP(BASE_XP.MARKET_SELL, LEVEL_SCALING.MARKET, playerLevel);
}
