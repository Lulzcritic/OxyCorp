export interface CraftingRecipe {
  id: string;
  name: string;
  inputMaterials: Array<{ item: string; qty: number }>;
  outputItem: string;
  outputQty: number;
  durationSeconds: number;
  requiredSkill?: string;
  requiredBlueprintItemId?: string;
}

export const CRAFTING_RECIPES: Record<string, CraftingRecipe> = {
  CRAFT_NEURAL_RIG_V1: {
    id: 'CRAFT_NEURAL_RIG_V1',
    name: 'Assemble Neural Rig V1',
    inputMaterials: [
      { item: 'STEEL_PLATING', qty: 5 },
      { item: 'SILICA', qty: 10 },
    ],
    outputItem: 'NEURAL_RIG_V1',
    outputQty: 1,
    durationSeconds: 30,
  },
  CRAFT_EXOSUIT_V1: {
    id: 'CRAFT_EXOSUIT_V1',
    name: 'Assemble Exosuit Mk I',
    inputMaterials: [
      { item: 'STEEL_PLATING', qty: 15 },
      { item: 'COPPER', qty: 10 },
    ],
    outputItem: 'EXOSUIT_V1',
    outputQty: 1,
    durationSeconds: 45,
    requiredSkill: 'FORGE_DRONE_HP_1',
    requiredBlueprintItemId: 'HARD_DRIVE_EXOSUIT_V1',
  },
  CRAFT_AUTO_CANNON_V1: {
    id: 'CRAFT_AUTO_CANNON_V1',
    name: 'Assemble Auto-Cannon V1',
    inputMaterials: [
      { item: 'STEEL_PLATING', qty: 10 },
      { item: 'IRON', qty: 20 },
    ],
    outputItem: 'AUTO_CANNON_V1',
    outputQty: 1,
    durationSeconds: 40,
    requiredSkill: 'FORGE_DRONE_DMG_1',
    requiredBlueprintItemId: 'HARD_DRIVE_AUTO_CANNON_V1',
  },
  CRAFT_MINING_LASER_V1: {
    id: 'CRAFT_MINING_LASER_V1',
    name: 'Assemble Mining Laser V1',
    inputMaterials: [
      { item: 'STEEL_PLATING', qty: 5 },
      { item: 'SILICA', qty: 20 },
      { item: 'COPPER', qty: 10 },
    ],
    outputItem: 'MINING_LASER_V1',
    outputQty: 1,
    durationSeconds: 35,
  },
};
