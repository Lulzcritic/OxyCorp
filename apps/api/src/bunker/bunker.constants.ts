import { FacilityType } from '@prisma/client';

export interface FacilityCost {
  credits: number;
  items?: { item: string; quantity: number }[];
}

/**
 * FACILITY_COSTS maps (FacilityType, targetLevel) -> Cost
 * Key format: `${FacilityType}_${level}`
 */
export const FACILITY_COSTS: Record<string, FacilityCost> = {
  // REFINING_VAT
  REFINING_VAT_2: { credits: 500, items: [{ item: 'STEEL_PLATING', quantity: 5 }] },
  REFINING_VAT_3: { credits: 1500, items: [{ item: 'STEEL_PLATING', quantity: 15 }] },

  // LOGISTICS_HUB
  LOGISTICS_HUB_2: { credits: 750, items: [{ item: 'STEEL_PLATING', quantity: 3 }] },
  LOGISTICS_HUB_3: { credits: 2000, items: [{ item: 'STEEL_PLATING', quantity: 10 }] },

  // COMMAND_ARRAY
  COMMAND_ARRAY_2: { credits: 1000, items: [{ item: 'STEEL_PLATING', quantity: 5 }] },
  COMMAND_ARRAY_3: { credits: 3000, items: [{ item: 'STEEL_PLATING', quantity: 20 }] },
};

export function getFacilityCost(type: FacilityType, targetLevel: number): FacilityCost | null {
  const key = `${type}_${targetLevel}`;
  return FACILITY_COSTS[key] || null;
}
