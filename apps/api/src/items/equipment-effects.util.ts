import { ITEMS_REGISTRY, EquipmentModifiers } from './items-registry.constants';
import { EQUIPMENT_SETS_REGISTRY } from './equipment-sets-registry.constants';

export interface ActiveSetInfo {
  name: string;
  count: number;
  maxCount: number;
  activeBonuses: string[];
}

const BASE_MODIFIERS: Required<EquipmentModifiers> = {
  xpMultiplier: 1.0,
  miningMultiplier: 1.0,
  attackMultiplier: 1.0,
  defenseMultiplier: 1.0,
};

export function calculateEquipmentModifiers(equipment: Record<string, string>): {
  modifiers: Required<EquipmentModifiers>;
  activeSets: ActiveSetInfo[];
} {
  const mods = { ...BASE_MODIFIERS };
  const activeSets: ActiveSetInfo[] = [];

  // 1. Apply individual item stats dynamically
  for (const [slot, itemId] of Object.entries(equipment)) {
    if (!itemId) continue;
    const itemDef = ITEMS_REGISTRY[itemId];
    if (itemDef && itemDef.equipableSlot === slot && itemDef.equipmentStats) {
      const stats = itemDef.equipmentStats;
      if (stats.xpMultiplier) mods.xpMultiplier += stats.xpMultiplier;
      if (stats.miningMultiplier) mods.miningMultiplier += stats.miningMultiplier;
      if (stats.attackMultiplier) mods.attackMultiplier += stats.attackMultiplier;
      if (stats.defenseMultiplier) mods.defenseMultiplier += stats.defenseMultiplier;
    }
  }

  // 2. Apply Set Bonuses dynamically
  for (const set of EQUIPMENT_SETS_REGISTRY) {
    const equippedCount = Object.values(equipment).filter(itemId => set.items.includes(itemId)).length;
    if (equippedCount > 0) {
      const activeBonuses: string[] = [];
      
      // Sort bonuses by threshold to apply them in ascending order
      const sortedBonuses = [...set.bonuses].sort((a, b) => a.threshold - b.threshold);
      
      for (const bonus of sortedBonuses) {
        if (equippedCount >= bonus.threshold) {
          activeBonuses.push(bonus.description);
          if (bonus.stats.xpMultiplier) mods.xpMultiplier += bonus.stats.xpMultiplier;
          if (bonus.stats.miningMultiplier) mods.miningMultiplier += bonus.stats.miningMultiplier;
          if (bonus.stats.attackMultiplier) mods.attackMultiplier += bonus.stats.attackMultiplier;
          if (bonus.stats.defenseMultiplier) mods.defenseMultiplier += bonus.stats.defenseMultiplier;
        }
      }

      activeSets.push({
        name: set.name,
        count: equippedCount,
        maxCount: set.items.length,
        activeBonuses,
      });
    }
  }

  return {
    modifiers: mods,
    activeSets,
  };
}
