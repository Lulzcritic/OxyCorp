/**
 * Map Constants
 * 
 * Configuration for sector claiming and land ownership.
 */

// Base number of plots all players can own (before skills)
export const BASE_PLOT_LIMIT = 3;

// Cost in credits to claim a sector
export const CLAIM_COST_CREDITS = 500;

// Plot bonus granted by each Land Baron skill
export const PLOT_BONUS: Record<string, number> = {
  MERCHANT_LAND_1: 2,
  MERCHANT_LAND_2: 3,
  MERCHANT_LAND_3: 4,
};

// All Land Baron skill IDs for iteration
export const LAND_BARON_SKILLS = ['MERCHANT_LAND_1', 'MERCHANT_LAND_2', 'MERCHANT_LAND_3'];

// ============================================
// Outpost Installation Constants
// ============================================

// Cost to install an outpost on a resource sector
export const OUTPOST_COST = {
  credits: 1000,
  materials: [
    { item: 'STEEL_PLATING', qty: 50 },
    { item: 'IRON_ORE', qty: 100 },
  ],
};

// Mining yield bonus when sector has an outpost (25% increase)
export const OUTPOST_YIELD_BONUS = 0.25;

