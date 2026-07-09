import { QuestType } from '@prisma/client';

export interface QuestTemplate {
  id: string;
  type: QuestType;
  title: string;
  description: string;
  baseTarget: { item?: string; count: number }; // count is base, scales with level
  baseReward: { credits: number; xp: number };
}

export const QUEST_TEMPLATES: QuestTemplate[] = [
  {
    id: 'MINE_IRON',
    type: QuestType.MINING,
    title: 'Iron Harvest',
    description: 'Mine Iron from the Red Frontier.',
    baseTarget: { item: 'IRON', count: 50 },
    baseReward: { credits: 200, xp: 25 },
  },
  {
    id: 'MINE_COPPER',
    type: QuestType.MINING,
    title: 'Copper Extraction',
    description: 'Mine Copper from Martian veins.',
    baseTarget: { item: 'COPPER', count: 40 },
    baseReward: { credits: 250, xp: 30 },
  },
  {
    id: 'MINE_SILICA',
    type: QuestType.MINING,
    title: 'Silica Harvesting',
    description: 'Harvest raw Silica crystals.',
    baseTarget: { item: 'SILICA', count: 30 },
    baseReward: { credits: 350, xp: 40 },
  },
  {
    id: 'REFINE_STEEL',
    type: QuestType.REFINING,
    title: 'Steel Smelting',
    description: 'Smelt raw Iron into Steel Plating.',
    baseTarget: { item: 'STEEL_PLATING', count: 5 },
    baseReward: { credits: 300, xp: 40 },
  },
  {
    id: 'REFINE_FUEL',
    type: QuestType.REFINING,
    title: 'Fuel Synthesis',
    description: 'Synthesize raw Sludge into Crude Fuel.',
    baseTarget: { item: 'CRUDE_FUEL', count: 5 },
    baseReward: { credits: 300, xp: 40 },
  },
];
