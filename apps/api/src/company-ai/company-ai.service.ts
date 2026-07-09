import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { QuestStatus, QuestType, SectorType } from '@prisma/client';

export interface CompanyAIDirective {
  type: 'MINING' | 'REFINING';
  item: string;
  count: number;
  rewardServiceCredits: number;
}

export interface SimulationResult {
  eventType: string;
  eventName: string;
  description: string;
  effects: Record<string, number>;
  directives: CompanyAIDirective[];
}

@Injectable()
export class CompanyAIService {
  private readonly logger = new Logger(CompanyAIService.name);

  constructor(private prisma: PrismaService) {}

  async triggerTick(): Promise<SimulationResult> {
    this.logger.log('Triggering Company AI simulation tick...');

    // 1. Gather economic statistics
    const stats = await this.gatherMarketStats();

    // 2. Query LLM (Ollama or Gemini) or fall back to rules
    let result: SimulationResult;
    try {
      const provider = (process.env.LLM_PROVIDER || 'gemini').toLowerCase();
      if (provider === 'ollama') {
        result = await this.queryOllama(stats);
      } else if (provider === 'lmstudio') {
        result = await this.queryLMStudio(stats);
      } else if (provider === 'gemini' && process.env.GEMINI_API_KEY) {
        result = await this.queryGemini(stats);
      } else {
        result = this.generateRuleBasedFallback(stats);
      }
    } catch (err: any) {
      this.logger.warn(`LLM inference failed, falling back to rule-based engine: ${err.message || err}`);
      result = this.generateRuleBasedFallback(stats);
    }

    // 3. Save event to database and clear prior active events
    await this.prisma.$transaction(async (tx) => {
      // Deactivate current events
      await tx.globalEvent.updateMany({
        where: { active: true },
        data: { active: false },
      });

      // Save new global event
      await tx.globalEvent.create({
        data: {
          eventType: result.eventType,
          eventName: result.eventName,
          description: result.description,
          effects: result.effects,
          active: true,
        },
      });

      // Inject directives as Quests for ALL active users
      const users = await tx.user.findMany({ select: { id: true } });
      const newQuests: any[] = [];

      for (const user of users) {
        // Clear active seasonal quests for this user
        await tx.quest.deleteMany({
          where: {
            userId: user.id,
            status: QuestStatus.ACTIVE,
            type: { in: [QuestType.MINING, QuestType.REFINING] }, // only clear seasonal tasks
          },
        });

        for (const directive of result.directives) {
          newQuests.push({
            userId: user.id,
            type: directive.type === 'MINING' ? QuestType.MINING : QuestType.REFINING,
            target: { item: directive.item, count: directive.count },
            reward: { serviceCredits: directive.rewardServiceCredits, xp: 100 },
            status: QuestStatus.ACTIVE,
            expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // expires in 24h
          });
        }
      }

      if (newQuests.length > 0) {
        await tx.quest.createMany({ data: newQuests });
      }
    });

    this.logger.log(`Company AI simulation tick completed successfully. Event: ${result.eventName}`);
    return result;
  }

  async getActiveEvent() {
    const event = await this.prisma.globalEvent.findFirst({
      where: { active: true },
    });
    if (!event) return null;
    return {
      ...event,
      effects: event.effects as Record<string, number>,
    };
  }

  private async gatherMarketStats() {
    const activePlayers = await this.prisma.user.count();
    
    // Average listing prices on exchange
    const listings = await this.prisma.marketListing.findMany({
      where: { expiresAt: { gt: new Date() } },
      select: { itemId: true, pricePerUnit: true },
    });

    const prices: Record<string, { sum: number; count: number }> = {};
    for (const l of listings) {
      if (!prices[l.itemId]) prices[l.itemId] = { sum: 0, count: 0 };
      prices[l.itemId].sum += Number(l.pricePerUnit);
      prices[l.itemId].count += 1;
    }

    const averagePrices: Record<string, number> = {};
    for (const key of Object.keys(prices)) {
      averagePrices[key] = Math.round(prices[key].sum / prices[key].count);
    }

    // Past 24h volume
    const pastDay = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const transactions = await this.prisma.transactionHistory.findMany({
      where: { date: { gte: pastDay } },
      select: { itemId: true, quantity: true },
    });

    const volumes: Record<string, number> = {};
    for (const t of transactions) {
      volumes[t.itemId] = (volumes[t.itemId] || 0) + Number(t.quantity);
    }

    return {
      activePlayers,
      averagePrices,
      volumes,
    };
  }

  private async queryOllama(stats: any): Promise<SimulationResult> {
    const ollamaUrl = process.env.OLLAMA_URL || 'http://127.0.0.1:11434';
    const model = process.env.OLLAMA_MODEL || 'gemma2:2b';

    const systemPrompt = this.getSystemPrompt(stats);

    const response = await fetch(`${ollamaUrl}/api/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model,
        prompt: systemPrompt + '\n\nGenerate the JSON output:',
        format: 'json',
        stream: false,
      }),
    });

    if (!response.ok) {
      throw new Error(`Ollama returned status ${response.status}`);
    }

    const data = await response.json();
    return JSON.parse(data.response) as SimulationResult;
  }

  private async queryGemini(stats: any): Promise<SimulationResult> {
    const apiKey = process.env.GEMINI_API_KEY;
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;

    const systemPrompt = this.getSystemPrompt(stats);

    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [
          {
            parts: [{ text: systemPrompt }],
          },
        ],
        generationConfig: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: 'OBJECT',
            properties: {
              eventType: { type: 'STRING' },
              eventName: { type: 'STRING' },
              description: { type: 'STRING' },
              effects: {
                type: 'OBJECT',
                properties: {
                  miningDurationMultiplier: { type: 'NUMBER' },
                  refiningDurationMultiplier: { type: 'NUMBER' },
                },
                additionalProperties: { type: 'NUMBER' },
              },
              directives: {
                type: 'ARRAY',
                items: {
                  type: 'OBJECT',
                  properties: {
                    type: { type: 'STRING', enum: ['MINING', 'REFINING'] },
                    item: { type: 'STRING' },
                    count: { type: 'NUMBER' },
                    rewardServiceCredits: { type: 'NUMBER' },
                  },
                  required: ['type', 'item', 'count', 'rewardServiceCredits'],
                },
              },
            },
            required: ['eventType', 'eventName', 'description', 'effects', 'directives'],
          },
        },
      }),
    });

    if (!response.ok) {
      throw new Error(`Gemini API returned status ${response.status}`);
    }

    const data = await response.json();
    const jsonText = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!jsonText) throw new Error('Empty response from Gemini');
    return JSON.parse(jsonText) as SimulationResult;
  }

  private getSystemPrompt(stats: any): string {
    return `You are Company Arbitrator-01, the AI Director for the Mars colony simulation.
Analyze the current market state and generate a global lore event and Company directives.

---
CURRENT MARKET STATS:
- Active Players: ${stats.activePlayers}
- Resource prices: ${JSON.stringify(stats.averagePrices)}
- 24h Transaction volumes: ${JSON.stringify(stats.volumes)}
---

Generate a structured JSON output with these properties:
1. "eventType": One of "SOLAR_STORM", "MILITARY_DEMAND", "RESOURCE_SCARCITY", "ECONOMIC_BOOM".
2. "eventName": Short title for the event (e.g. "Solar Storm Discharge", "Silica Scarcity").
3. "description": Immersive narrative message in a retro, grimdark, techno-goth tone.
4. "effects": Modifiers applying to the game mechanics. Supported effects:
   - "miningDurationMultiplier": e.g. 1.5 (makes mining slower), or 0.8 (faster).
   - "refiningDurationMultiplier": e.g. 1.3.
5. "directives": An array of 2 directives for players to fulfill to help the Company. Directives must have:
   - "type": "MINING" or "REFINING".
   - "item": Resource ID. For MINING, must be one of "IRON", "COPPER", or "SILICA". For REFINING, must be "STEEL_PLATING" or "CRUDE_FUEL".
   - "count": Target quantity (between 10 and 100).
   - "rewardServiceCredits": Service Credits reward (between 5 and 30).

Return ONLY raw JSON matching the schema.`;
  }

  private generateRuleBasedFallback(stats: any): SimulationResult {
    // Determine scarcity based on prices or default to standard events
    const siliconPrice = stats.averagePrices['SILICA'] || 0;
    const ironPrice = stats.averagePrices['IRON'] || 0;

    if (siliconPrice > 50) {
      return {
        eventType: 'RESOURCE_SCARCITY',
        eventName: 'Silicium Crisis',
        description: 'Deep mantle thermal conduits have ruptured, halting orbital silica mining. The Company requests local miners harvest raw Silica nodes to prevent assembly lines from shutting down.',
        effects: { miningDurationMultiplier: 1.3 },
        directives: [
          { type: 'MINING', item: 'SILICA', count: 30, rewardServiceCredits: 15 },
          { type: 'MINING', item: 'IRON', count: 50, rewardServiceCredits: 8 },
        ],
      };
    }

    if (Math.random() > 0.5) {
      return {
        eventType: 'SOLAR_STORM',
        eventName: 'Helios Flare Interference',
        description: 'A major coronal mass ejection is impacting the Martian magnetosphere. Radio interference slows down automated sensor scanners, increasing drone mining cycles.',
        effects: { miningDurationMultiplier: 1.5 },
        directives: [
          { type: 'MINING', item: 'IRON', count: 60, rewardServiceCredits: 10 },
          { type: 'MINING', item: 'COPPER', count: 40, rewardServiceCredits: 12 },
        ],
      };
    }

    return {
      eventType: 'MILITARY_DEMAND',
      eventName: 'Cohort Resupply Command',
      description: 'orbital garrison vessels require immediate armor plating reinforcements. Warlords are ordered to submit refined steel assets.',
      effects: { refiningDurationMultiplier: 1.2 },
      directives: [
        { type: 'REFINING', item: 'IRON_PLATE', count: 20, rewardServiceCredits: 15 },
        { type: 'MINING', item: 'COPPER', count: 50, rewardServiceCredits: 8 },
      ],
    };
  }

  private async queryLMStudio(stats: any): Promise<SimulationResult> {
    const lmstudioUrl = process.env.LMSTUDIO_URL || 'http://127.0.0.1:1234';
    const model = process.env.LMSTUDIO_MODEL || 'meta-llama-3-8b-instruct';
    const apiKey = process.env.LMSTUDIO_API_KEY || 'lm-studio';

    const systemPrompt = this.getSystemPrompt(stats);

    const response = await fetch(`${lmstudioUrl}/v1/chat/completions`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model,
        messages: [
          { role: 'system', content: 'You are a helpful assistant that outputs only raw JSON.' },
          { role: 'user', content: systemPrompt + '\n\nGenerate the JSON output:' },
        ],
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      throw new Error(`LM Studio returned status ${response.status}`);
    }

    const data = await response.json();
    let jsonText = data.choices?.[0]?.message?.content;
    if (!jsonText) throw new Error('Empty response from LM Studio');

    // Strip any leading/trailing conversational text or markdown code blocks
    const firstBrace = jsonText.indexOf('{');
    const lastBrace = jsonText.lastIndexOf('}');
    if (firstBrace !== -1 && lastBrace !== -1) {
      jsonText = jsonText.substring(firstBrace, lastBrace + 1);
    }

    return JSON.parse(jsonText) as SimulationResult;
  }
}