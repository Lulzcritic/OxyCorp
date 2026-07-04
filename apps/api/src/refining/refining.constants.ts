export interface RefiningRecipe {
  id: string;
  name: string;
  inputItem: string;
  inputQty: number;
  outputItem: string;
  outputQty: number;
  durationSeconds: number;
}

export const REFINING_RECIPES: Record<string, RefiningRecipe> = {
  IRON_TO_STEEL: {
    id: 'IRON_TO_STEEL',
    name: 'Smelt Iron to Steel',
    inputItem: 'IRON',
    inputQty: 10,
    outputItem: 'STEEL_PLATING',
    outputQty: 1,
    durationSeconds: 60,
  },
  SLUDGE_TO_FUEL: {
    id: 'SLUDGE_TO_FUEL',
    name: 'Refine Sludge to Fuel',
    inputItem: 'SLUDGE',
    inputQty: 10,
    outputItem: 'CRUDE_FUEL',
    outputQty: 1,
    durationSeconds: 60,
  },
};
