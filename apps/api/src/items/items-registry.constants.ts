export enum ItemType {
  RESOURCE = 'RESOURCE',
  EQUIPMENT = 'EQUIPMENT',
  DRONE = 'DRONE',
  HARD_DRIVE = 'HARD_DRIVE',
}

export interface EquipmentModifiers {
  xpMultiplier?: number;
  miningMultiplier?: number;
  attackMultiplier?: number;
  defenseMultiplier?: number;
}

export interface ItemDefinition {
  id: string;
  name: string;
  type: ItemType;
  equipableSlot?: 'head' | 'body' | 'weapon' | 'tool';
  equipmentStats?: EquipmentModifiers;
  blueprintRecipeId?: string; // If type === ItemType.HARD_DRIVE, link to the recipe it unlocks
}

export const ITEMS_REGISTRY: Record<string, ItemDefinition> = {
  // Resources
  IRON: { id: 'IRON', name: 'Iron Ore', type: ItemType.RESOURCE },
  COPPER: { id: 'COPPER', name: 'Copper Ore', type: ItemType.RESOURCE },
  SILICA: { id: 'SILICA', name: 'Silica', type: ItemType.RESOURCE },
  SLUDGE: { id: 'SLUDGE', name: 'Sludge', type: ItemType.RESOURCE },
  STEEL_PLATING: { id: 'STEEL_PLATING', name: 'Steel Plating', type: ItemType.RESOURCE },
  CRUDE_FUEL: { id: 'CRUDE_FUEL', name: 'Crude Fuel', type: ItemType.RESOURCE },

  // Drones
  DRONE_ATTACK_V1: { id: 'DRONE_ATTACK_V1', name: 'Wasp I', type: ItemType.DRONE },
  DRONE_DEFENSE_V1: { id: 'DRONE_DEFENSE_V1', name: 'Guardian I', type: ItemType.DRONE },
  DRONE_SPEED_V1: { id: 'DRONE_SPEED_V1', name: 'Runner I', type: ItemType.DRONE },

  // Equipment
  NEURAL_RIG_V1: {
    id: 'NEURAL_RIG_V1',
    name: 'Neural Rig V1',
    type: ItemType.EQUIPMENT,
    equipableSlot: 'head',
    equipmentStats: { xpMultiplier: 0.15 }
  },
  EXOSUIT_V1: {
    id: 'EXOSUIT_V1',
    name: 'Exosuit Mk I',
    type: ItemType.EQUIPMENT,
    equipableSlot: 'body',
    equipmentStats: { defenseMultiplier: 0.15 }
  },
  AUTO_CANNON_V1: {
    id: 'AUTO_CANNON_V1',
    name: 'Auto-Cannon V1',
    type: ItemType.EQUIPMENT,
    equipableSlot: 'weapon',
    equipmentStats: { attackMultiplier: 0.15 }
  },
  MINING_LASER_V1: {
    id: 'MINING_LASER_V1',
    name: 'Mining Laser V1',
    type: ItemType.EQUIPMENT,
    equipableSlot: 'tool',
    equipmentStats: { miningMultiplier: 0.25 }
  },
  HARD_DRIVE_EXOSUIT_V1: {
    id: 'HARD_DRIVE_EXOSUIT_V1',
    name: 'Encrypted Hard Drive: Exosuit Mk I Blueprint',
    type: ItemType.HARD_DRIVE,
    blueprintRecipeId: 'CRAFT_EXOSUIT_V1'
  },
  HARD_DRIVE_AUTO_CANNON_V1: {
    id: 'HARD_DRIVE_AUTO_CANNON_V1',
    name: 'Encrypted Hard Drive: Auto-Cannon V1 Blueprint',
    type: ItemType.HARD_DRIVE,
    blueprintRecipeId: 'CRAFT_AUTO_CANNON_V1'
  }
};
