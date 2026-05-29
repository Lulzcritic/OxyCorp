import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  BattleLog,
  BattleDroneState,
  BattleTick,
  BattleEvent,
} from './battle-log.interface';

interface DroneInstance extends BattleDroneState {
  stats: {
    attack: number;
    defense: number;
    speed: number;
    range: number;
    health: number;
  };
  alive: boolean;
}

@Injectable()
export class CombatService {
  private droneStatsCache = new Map<string, any>();
  private readonly MAX_TICKS = 50;
  private readonly GRID_SIZE = 5;

  constructor(private prisma: PrismaService) {}

  private async getDroneStats(droneId: string) {
    if (this.droneStatsCache.has(droneId)) {
      return this.droneStatsCache.get(droneId);
    }

    const variant = await this.prisma.droneVariant.findUnique({
      where: { id: droneId },
    });

    if (!variant) {
      return {
        attack: 1,
        defense: 1,
        speed: 1,
        range: 1,
        health: 10,
      };
    }

    this.droneStatsCache.set(droneId, variant);
    return variant;
  }

  private chebyshevDistance(
    x1: number,
    y1: number,
    x2: number,
    y2: number,
  ): number {
    return Math.max(Math.abs(x2 - x1), Math.abs(y2 - y1));
  }

  private findNearestEnemy(
    drone: DroneInstance,
    enemies: DroneInstance[],
  ): DroneInstance | null {
    let nearest: DroneInstance | null = null;
    let minDist = Infinity;

    for (const enemy of enemies) {
      if (!enemy.alive) continue;
      const dist = this.chebyshevDistance(drone.x, drone.y, enemy.x, enemy.y);
      if (dist < minDist) {
        minDist = dist;
        nearest = enemy;
      }
    }

    return nearest;
  }

  private moveTowards(
    drone: DroneInstance,
    target: DroneInstance,
    occupiedTiles: Set<string>,
  ): { x: number; y: number } | null {
    const dx = target.x - drone.x;
    const dy = target.y - drone.y;

    // Greedy movement: prioritize axis with larger distance
    const moves: { x: number; y: number }[] = [];
    if (dx !== 0) moves.push({ x: drone.x + Math.sign(dx), y: drone.y });
    if (dy !== 0) moves.push({ x: drone.x, y: drone.y + Math.sign(dy) });

    for (const move of moves) {
      const tileKey = `${move.x},${move.y}`;
      if (
        move.x >= 0 &&
        move.x < this.GRID_SIZE &&
        move.y >= 0 &&
        move.y < this.GRID_SIZE &&
        !occupiedTiles.has(tileKey)
      ) {
        return move;
      }
    }

    return null;
  }

  async resolveBattle(swarmIdA: string, swarmIdB: string): Promise<BattleLog> {
    const swarms = await this.prisma.swarm.findMany({
      where: { id: { in: [swarmIdA, swarmIdB] } },
    });

    const swarmA = swarms.find((s) => s.id === swarmIdA);
    const swarmB = swarms.find((s) => s.id === swarmIdB);

    if (!swarmA || !swarmB)
      throw new BadRequestException('One or more swarms not found');

    // Initialize drone instances
    const formA = swarmA.formation as any[];
    const formB = swarmB.formation as any[];

    const drones: DroneInstance[] = [];

    for (let i = 0; i < formA.length; i++) {
      const p = formA[i];
      const stats = await this.getDroneStats(p.droneId);
      drones.push({
        id: `A-${i}`,
        variantId: p.droneId,
        teamId: 'A',
        x: p.x,
        y: p.y,
        hp: stats.health,
        maxHp: stats.health,
        stats: {
          attack: stats.attack,
          defense: stats.defense,
          speed: stats.speed,
          range: stats.range,
          health: stats.health,
        },
        alive: true,
      });
    }

    for (let i = 0; i < formB.length; i++) {
      const p = formB[i];
      const stats = await this.getDroneStats(p.droneId);
      drones.push({
        id: `B-${i}`,
        variantId: p.droneId,
        teamId: 'B',
        x: p.x,
        y: p.y,
        hp: stats.health,
        maxHp: stats.health,
        stats: {
          attack: stats.attack,
          defense: stats.defense,
          speed: stats.speed,
          range: stats.range,
          health: stats.health,
        },
        alive: true,
      });
    }

    const ticks: BattleTick[] = [];
    let winnerId: string | null = null;

    for (let tick = 0; tick < this.MAX_TICKS; tick++) {
      const events: BattleEvent[] = [];

      // Filter living drones
      const living = drones.filter((d) => d.alive);
      const teamA = living.filter((d) => d.teamId === 'A');
      const teamB = living.filter((d) => d.teamId === 'B');

      // Check end condition
      if (teamA.length === 0) {
        winnerId = swarmIdB;
        break;
      }
      if (teamB.length === 0) {
        winnerId = swarmIdA;
        break;
      }

      // Initiative phase: Sort by speed
      living.sort((a, b) => b.stats.speed - a.stats.speed);

      // Track occupied tiles for collision
      const occupiedTiles = new Set<string>(
        living.map((d) => `${d.x},${d.y}`),
      );

      for (const drone of living) {
        const enemies = living.filter((d) => d.teamId !== drone.teamId);

        // Find targets in range
        const targetsInRange = enemies.filter(
          (e) =>
            this.chebyshevDistance(drone.x, drone.y, e.x, e.y) <=
            drone.stats.range,
        );

        if (targetsInRange.length > 0) {
          // Attack phase
          // Prioritize: Lowest HP % -> Closest
          targetsInRange.sort((a, b) => {
            const hpRatioA = a.hp / a.maxHp;
            const hpRatioB = b.hp / b.maxHp;
            if (hpRatioA !== hpRatioB) return hpRatioA - hpRatioB;
            const distA = this.chebyshevDistance(drone.x, drone.y, a.x, a.y);
            const distB = this.chebyshevDistance(drone.x, drone.y, b.x, b.y);
            return distA - distB;
          });

          const target = targetsInRange[0];

          events.push({
            type: 'ATTACK',
            sourceId: drone.id,
            targetId: target.id,
            weapon: 'LASER',
          });

          const damage = Math.max(1, drone.stats.attack - target.stats.defense);
          target.hp -= damage;

          events.push({
            type: 'DAMAGE',
            targetId: target.id,
            amount: damage,
            remainingHp: target.hp,
            isCrit: false,
          });

          if (target.hp <= 0) {
            target.alive = false;
            events.push({
              type: 'DESTROY',
              targetId: target.id,
            });
          }
        } else {
          // Movement phase
          const nearest = this.findNearestEnemy(drone, enemies);
          if (nearest) {
            const newPos = this.moveTowards(drone, nearest, occupiedTiles);
            if (newPos) {
              const oldPos = { x: drone.x, y: drone.y };
              occupiedTiles.delete(`${drone.x},${drone.y}`);
              drone.x = newPos.x;
              drone.y = newPos.y;
              occupiedTiles.add(`${drone.x},${drone.y}`);

              events.push({
                type: 'MOVE',
                droneId: drone.id,
                from: oldPos,
                to: newPos,
              });
            }
          }
        }
      }

      ticks.push({ tick, events });
    }

    return {
      meta: {
        swarmAId: swarmIdA,
        swarmAName: swarmA.name,
        swarmBId: swarmIdB,
        swarmBName: swarmB.name,
        timestamp: new Date().toISOString(),
        totalTicks: ticks.length,
        winnerId,
      },
      initialState: {
        drones: drones.map((d) => ({
          id: d.id,
          variantId: d.variantId,
          teamId: d.teamId,
          x: d.x,
          y: d.y,
          hp: d.hp,
          maxHp: d.maxHp,
        })),
      },
      ticks,
    };
  }
}
