import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { MapService } from '../map/map.service';

const TICK_DURATION_MS = 3600000; // 1 hour

@Injectable()
export class GameTickService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(GameTickService.name);
  private timer: NodeJS.Timeout | null = null;

  constructor(
    private prisma: PrismaService,
    private mapService: MapService,
  ) {}

  async onModuleInit() {
    // 1. Ensure global tick singleton exists
    const tick = await this.prisma.gameTick.findUnique({
      where: { id: 1 },
    });

    if (!tick) {
      await this.prisma.gameTick.create({
        data: { id: 1, current: 0, lastTick: new Date() },
      });
      this.logger.log('Initialized global game tick singleton.');
    }

    // 2. Start hourly tick loop
    this.startTickLoop();
  }

  onModuleDestroy() {
    this.stopTickLoop();
  }

  private startTickLoop() {
    this.stopTickLoop();
    this.timer = setInterval(async () => {
      try {
        await this.triggerTick();
      } catch (err) {
        this.logger.error('Failed to trigger automatic hourly tick:', err);
      }
    }, TICK_DURATION_MS);
    this.logger.log(`Hourly game tick loop engaged (Interval: ${TICK_DURATION_MS}ms).`);
  }

  private stopTickLoop() {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
  }

  async triggerTick() {
    return this.prisma.$transaction(async (tx) => {
      const tick = await tx.gameTick.findUnique({
        where: { id: 1 },
      });

      const currentTick = tick ? tick.current : 0;
      const nextTick = currentTick + 1;
      const now = new Date();

      await tx.gameTick.upsert({
        where: { id: 1 },
        update: { current: nextTick, lastTick: now },
        create: { id: 1, current: nextTick, lastTick: now },
      });

      // Trigger hourly resources regeneration
      const regenCount = await this.mapService.regenerateResources();

      this.logger.log(
        `[TICK TRIGGERED] Tick #${nextTick} at ${now.toISOString()}. Regenerated ${regenCount} sectors.`
      );

      return {
        tick: nextTick,
        timestamp: now,
        regeneratedSectors: regenCount,
      };
    });
  }

  async getTickStatus() {
    const tick = await this.prisma.gameTick.findUnique({
      where: { id: 1 },
    });

    const current = tick ? tick.current : 0;
    const lastTick = tick ? tick.lastTick : new Date();
    
    const nextTickTime = lastTick.getTime() + TICK_DURATION_MS;
    const msRemaining = Math.max(0, nextTickTime - Date.now());

    const martianDate = convertTicksToMartianDate(current);

    return {
      current,
      lastTick,
      msRemaining,
      durationMs: TICK_DURATION_MS,
      martianDate,
    };
  }
}

const MONTH_NAMES = [
  'Sagittarius', 'Dhanus', 'Capricornus', 'Makara',
  'Aquarius', 'Kumbha', 'Pisces', 'Mina',
  'Aries', 'Mesha', 'Taurus', 'Vrishabha',
  'Gemini', 'Mithuna', 'Cancer', 'Karka',
  'Leo', 'Simha', 'Virgo', 'Kanya',
  'Libra', 'Tula', 'Scorpius', 'Vrishchika'
];

export function convertTicksToMartianDate(totalTicks: number) {
  const START_YEAR = 3615;
  const totalSols = Math.floor(totalTicks / 24);
  const hour = totalTicks % 24;

  let remainingSols = totalSols;
  let year = START_YEAR;

  // Calculate year based on sols (leap years are 669, non-leap 668)
  while (true) {
    const isLeap = year % 2 !== 0; // Simple Darian rule: odd years are leap years
    const solsInYear = isLeap ? 669 : 668;
    if (remainingSols < solsInYear) {
      break;
    }
    remainingSols -= solsInYear;
    year++;
  }

  const isLeap = year % 2 !== 0;
  let month = 1;
  let dayOfMonth = 1;

  // Darian calendar month division: 24 months, quarters of 6 months
  // Standard months: 28 sols. Quarters ends (6, 12, 18, 24) have 27 sols (except month 24 in leap year = 28 sols)
  for (let m = 1; m <= 24; m++) {
    let solsInMonth = 28;
    if (m % 6 === 0) {
      solsInMonth = 27;
      if (m === 24 && isLeap) {
        solsInMonth = 28;
      }
    }

    if (remainingSols < solsInMonth) {
      month = m;
      dayOfMonth = remainingSols + 1; // 1-indexed days
      break;
    }
    remainingSols -= solsInMonth;
  }

  return {
    year,
    month,
    monthName: MONTH_NAMES[month - 1],
    day: dayOfMonth,
    hour,
  };
}
