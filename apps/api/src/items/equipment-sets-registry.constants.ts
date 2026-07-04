import { EquipmentModifiers } from './items-registry.constants';

export interface EquipmentSetBonus {
  threshold: number; // Number of items needed to activate
  stats: EquipmentModifiers;
  description: string;
}

export interface EquipmentSet {
  id: string;
  name: string;
  items: string[]; // List of item IDs in the set
  bonuses: EquipmentSetBonus[];
}

export const EQUIPMENT_SETS_REGISTRY: EquipmentSet[] = [
  {
    id: 'IRON_VANGUARD',
    name: 'Iron Vanguard',
    items: ['NEURAL_RIG_V1', 'EXOSUIT_V1', 'AUTO_CANNON_V1', 'MINING_LASER_V1'],
    bonuses: [
      {
        threshold: 2,
        stats: { xpMultiplier: 0.10 },
        description: '2-Set: +10% Experience Gain'
      },
      {
        threshold: 4,
        stats: {
          attackMultiplier: 0.15,
          defenseMultiplier: 0.15,
          miningMultiplier: 0.20
        },
        description: '4-Set: +15% Swarm ATK & DEF, +20% Mining Yield'
      }
    ]
  }
];
