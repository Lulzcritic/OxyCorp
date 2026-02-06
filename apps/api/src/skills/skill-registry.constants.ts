export interface SkillDefinition {
  id: string;
  name: string;
  description: string;
  cost: number; // Skill Points cost
  prereq?: string; // Parent skill ID, if any
  specialization?: 'COGITATOR' | 'FORGE' | 'MERCHANT'; // Optional affinity
}

/**
 * Master registry of all unlockable skills.
 * The Triangle of Efficiency:
 * - COGITATOR: Efficiency bonuses (faster jobs, lower costs)
 * - FORGE: Combat/Crafting bonuses
 * - MERCHANT: Yield/Trade bonuses
 */
export const SKILL_REGISTRY: SkillDefinition[] = [
  // MERCHANT Tree
  {
    id: 'MERCHANT_YIELD_1',
    name: 'Trade Savant I',
    description: 'Increases refining yield by 25%.',
    cost: 1,
    specialization: 'MERCHANT',
  },
  {
    id: 'MERCHANT_YIELD_2',
    name: 'Trade Savant II',
    description: 'Increases refining yield by 50%.',
    cost: 2,
    prereq: 'MERCHANT_YIELD_1',
    specialization: 'MERCHANT',
  },
  {
    id: 'MERCHANT_MARKET_FEE',
    name: 'Market Mogul',
    description: 'Reduces market listing fees by 10%.',
    cost: 2,
    prereq: 'MERCHANT_YIELD_1',
    specialization: 'MERCHANT',
  },
  {
    id: 'MERCHANT_LAND_1',
    name: 'Land Baron I',
    description: 'Increases max plot ownership by 2.',
    cost: 2,
    prereq: 'MERCHANT_YIELD_1',
    specialization: 'MERCHANT',
  },
  {
    id: 'MERCHANT_LAND_2',
    name: 'Land Baron II',
    description: 'Increases max plot ownership by 3 (total +5).',
    cost: 3,
    prereq: 'MERCHANT_LAND_1',
    specialization: 'MERCHANT',
  },
  {
    id: 'MERCHANT_LAND_3',
    name: 'Land Baron III',
    description: 'Increases max plot ownership by 4 (total +9).',
    cost: 4,
    prereq: 'MERCHANT_LAND_2',
    specialization: 'MERCHANT',
  },

  // COGITATOR Tree
  {
    id: 'COGITATOR_SPEED_1',
    name: 'Neural Boost I',
    description: 'Reduces job time by 10%.',
    cost: 1,
    specialization: 'COGITATOR',
  },
  {
    id: 'COGITATOR_SPEED_2',
    name: 'Neural Boost II',
    description: 'Reduces job time by 20%.',
    cost: 2,
    prereq: 'COGITATOR_SPEED_1',
    specialization: 'COGITATOR',
  },

  // FORGE Tree
  {
    id: 'FORGE_DRONE_HP_1',
    name: 'Hardened Chassis I',
    description: 'Increases drone HP by 10%.',
    cost: 1,
    specialization: 'FORGE',
  },
  {
    id: 'FORGE_DRONE_DMG_1',
    name: 'Overclocked Armaments I',
    description: 'Increases drone damage by 10%.',
    cost: 2,
    prereq: 'FORGE_DRONE_HP_1',
    specialization: 'FORGE',
  },
];

export function getSkillById(skillId: string): SkillDefinition | undefined {
  return SKILL_REGISTRY.find((s) => s.id === skillId);
}
