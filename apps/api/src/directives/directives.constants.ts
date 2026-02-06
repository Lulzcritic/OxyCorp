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
    description: 'Mine Iron Ore from the Red Frontier.',
    baseTarget: { item: 'IRON_ORE', count: 50 },
    baseReward: { credits: 200, xp: 25 },
  },
  {
    id: 'REFINE_STEEL',
    type: QuestType.REFINING,
    title: 'Steel Production',
    description: 'Refine Iron into Steel Plating.',
    baseTarget: { item: 'STEEL_PLATING', count: 5 },
    baseReward: { credits: 300, xp: 40 },
  },
  // Future: COMBAT templates
];
