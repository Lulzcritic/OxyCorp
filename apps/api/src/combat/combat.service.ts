import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

interface DroneStats {
  attack: number;
  defense: number;
}

@Injectable()
export class CombatService {
  constructor(private prisma: PrismaService) {}

  private getDroneStats(droneId: string): DroneStats {
    // Mock Data for MVP
    switch (droneId) {
      case 'DRONE_ATTACK_V1':
        return { attack: 10, defense: 2 };
      case 'DRONE_DEFENSE_V1':
        return { attack: 2, defense: 10 };
      case 'DRONE_SPEED_V1':
        return { attack: 5, defense: 5 };
      default:
        return { attack: 1, defense: 1 };
    }
  }

  async resolveBattle(swarmIdA: string, swarmIdB: string) {
    const swarms = await this.prisma.swarm.findMany({
      where: { id: { in: [swarmIdA, swarmIdB] } },
    });

    const swarmA = swarms.find((s) => s.id === swarmIdA);
    const swarmB = swarms.find((s) => s.id === swarmIdB);

    if (!swarmA || !swarmB)
      throw new BadRequestException('One or more swarms not found');

    // Parse Formations
    const formA = swarmA.formation as any[];
    const formB = swarmB.formation as any[];

    // Calculate Scores
    let scoreA = 0;
    let scoreB = 0;

    formA.forEach((p: any) => {
      const stats = this.getDroneStats(p.droneId);
      scoreA += stats.attack + stats.defense;
    });

    formB.forEach((p: any) => {
      const stats = this.getDroneStats(p.droneId);
      scoreB += stats.attack + stats.defense;
    });

    // RNG Variance +/- 10%
    const varianceA = 0.9 + Math.random() * 0.2;
    const varianceB = 0.9 + Math.random() * 0.2;

    const finalScoreA = scoreA * varianceA;
    const finalScoreB = scoreB * varianceB;

    const log: string[] = [
      `Battle Started: ${swarmA.name} vs ${swarmB.name}`,
      `${swarmA.name} Base Score: ${scoreA} (Variance: ${varianceA.toFixed(2)}) -> Final: ${finalScoreA.toFixed(2)}`,
      `${swarmB.name} Base Score: ${scoreB} (Variance: ${varianceB.toFixed(2)}) -> Final: ${finalScoreB.toFixed(2)}`,
    ];

    let winnerId: string | null = null;
    if (finalScoreA > finalScoreB) {
      winnerId = swarmIdA;
      log.push(`Winner: ${swarmA.name}`);
    } else {
      winnerId = swarmIdB;
      log.push(`Winner: ${swarmB.name}`);
    }

    return {
      winnerId,
      log,
    };
  }
}
