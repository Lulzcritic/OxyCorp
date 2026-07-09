import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { SectorType } from '@prisma/client';
import {
  BattleLog,
  BattleDroneState,
  BattleTick,
  BattleEvent,
} from './battle-log.interface';
import { calculateEquipmentModifiers } from '../items/equipment-effects.util';
import * as fs from 'fs';
import * as path from 'path';
import init, { VirtualMachine } from 'risk16-vm';

export interface SwarmSlot {
  droneId: string;
  slotIndex: number;
  count: number;
}

export interface CalculatedSlotStats {
  slotIndex: number;
  droneId: string;
  count: number;
  baseHp: number;
  baseAtk: number;
  baseSpeed: number;
  baseRange: number;
  finalHp: number;
  finalAtk: number;
  finalSpeed: number;
  finalRange: number;
}

let wasmInitialized = false;
async function ensureWasmInitialized() {
  if (wasmInitialized) return;
  const pathsToTry = [
    path.resolve(process.cwd(), 'packages/risk16-vm/dist/risk16_vm_bg.wasm'),
    path.resolve(__dirname, '../../../../packages/risk16-vm/dist/risk16_vm_bg.wasm'),
    path.resolve(__dirname, '../packages/risk16-vm/dist/risk16_vm_bg.wasm'),
  ];
  let loaded = false;
  for (const p of pathsToTry) {
    if (fs.existsSync(p)) {
      const wasmBuffer = fs.readFileSync(p);
      await init({ module_or_path: wasmBuffer });
      loaded = true;
      break;
    }
  }
  if (!loaded) {
    throw new Error('Failed to locate and load risk16_vm_bg.wasm file.');
  }
  wasmInitialized = true;
}

interface DroneInstance extends BattleDroneState {
  stats: {
    attack: number;
    defense: number;
    speed: number;
    range: number;
    health: number;
  };
  alive: boolean;
  vm?: VirtualMachine;
  aimedTargetHandle?: number;
}

@Injectable()
export class CombatService {
  private droneStatsCache = new Map<string, any>();
  private readonly MAX_TICKS = 50;
  private readonly GRID_SIZE = 5;

  constructor(private prisma: PrismaService) {}

  async scheduleAttack(userId: string, targetSectorId: string) {
    const bunker = await this.prisma.sector.findFirst({
      where: { ownerId: userId, type: SectorType.BUNKER },
    });
    if (!bunker) {
      throw new BadRequestException('Bunker sector not found for player');
    }

    const targetSector = await this.prisma.sector.findUnique({
      where: { id: targetSectorId },
    });
    if (!targetSector) {
      throw new BadRequestException('Target sector not found');
    }

    if (targetSector.type === 'TOWN' || targetSector.type === 'POI') {
      throw new BadRequestException('Cannot attack protected zones (Town or Point of Interest)');
    }
    if (targetSector.ownerId === userId) {
      throw new BadRequestException('Cannot attack your own sector');
    }

    // Attacking cost validation (Optional, let's keep it free as not specified, but validate fleet presence)
    const attackerSwarm = await this.prisma.swarm.findFirst({
      where: { userId, name: 'Attack' },
    });
    if (!attackerSwarm || !Array.isArray(attackerSwarm.formation) || attackerSwarm.formation.length === 0) {
      throw new BadRequestException('Configure your OFFENSIVE SQUAD first in the Swarm Console.');
    }

    const targetX = Number(targetSector.x);
    const targetY = Number(targetSector.y);
    const bunkerX = Number(bunker.x);
    const bunkerY = Number(bunker.y);
    const distance = Math.max(Math.abs(targetX - bunkerX), Math.abs(targetY - bunkerY));
    
    // travel time proportional to distance (min 1 tick)
    const durationTicks = Math.max(1, Math.floor(distance / 2));

    const tickRecord = await this.prisma.gameTick.findUnique({ where: { id: 1 } });
    const currentTick = tickRecord ? tickRecord.current : 0;

    return this.prisma.battle.create({
      data: {
        attackerId: userId,
        defenderId: targetSector.ownerId || null,
        sectorId: targetSectorId,
        status: 'PENDING',
        startTick: currentTick,
        resolveTick: currentTick + durationTicks,
      },
    });
  }

  async processPendingBattles(currentTick: number) {
    const pendingBattles = await this.prisma.battle.findMany({
      where: {
        status: 'PENDING',
        resolveTick: { lte: currentTick },
      },
      include: {
        sector: true,
      },
    });

    for (const battle of pendingBattles) {
      try {
        const attackerSwarm = await this.prisma.swarm.findFirst({
          where: { userId: battle.attackerId, name: 'Attack' },
        });

        if (!attackerSwarm || !Array.isArray(attackerSwarm.formation) || attackerSwarm.formation.length === 0) {
          // Attacker has empty attack squad, automatic defeat
          await this.prisma.battle.update({
            where: { id: battle.id },
            data: {
              status: 'RESOLVED',
              battleLog: {
                meta: {
                  winnerId: battle.defenderId || 'SYSTEM',
                  swarmAName: 'Empty Attacker',
                  swarmBName: 'Defenders',
                  timestamp: new Date().toISOString(),
                  totalTicks: 0,
                },
                initialState: { drones: [] },
                ticks: [],
              },
            },
          });
          continue;
        }

        let defenderSwarmId: string;
        let createdTempSwarmId: string | null = null;

        if (battle.defenderId) {
          // Owned plot: look for defender's defense deck
          let defenderSwarm = await this.prisma.swarm.findFirst({
            where: { userId: battle.defenderId, name: 'Defense' },
          });
          if (!defenderSwarm) {
            // fallback to first active or default swarm
            defenderSwarm = await this.prisma.swarm.findFirst({
              where: { userId: battle.defenderId },
            });
          }

          if (defenderSwarm) {
            defenderSwarmId = defenderSwarm.id;
          } else {
            // No defense swarm, auto-defeat for defender
            // Create a small empty placeholder swarm so the fight engine resolves it
            const tempDefense = await this.prisma.swarm.create({
              data: {
                userId: battle.defenderId,
                name: 'Defenders',
                formation: [],
                isActive: false,
              },
            });
            defenderSwarmId = tempDefense.id;
            createdTempSwarmId = tempDefense.id;
          }
        } else {
          // Wild plot: procedurally generate a defender swarm
          const richness = battle.sector.resources ? (battle.sector.resources as any).richness || 0.5 : 0.5;
          const totalWildDrones = Math.max(3, Math.floor(15 * richness));
          const guardianCount = Math.max(1, Math.floor(totalWildDrones * 0.7));
          const kamikazeCount = Math.max(1, totalWildDrones - guardianCount);

          const tempSwarm = await this.prisma.swarm.create({
            data: {
              userId: '00000000-0000-0000-0000-000000000000',
              name: 'Wild Guardians',
              formation: [
                { slotIndex: 0, droneId: 'DRONE_GUARDIAN', count: guardianCount },
                { slotIndex: 2, droneId: 'DRONE_KAMIKAZE', count: kamikazeCount },
              ],
              isActive: false,
            },
          });
          defenderSwarmId = tempSwarm.id;
          createdTempSwarmId = tempSwarm.id;
        }

        // Run pre-rendered battle
        const battleLog = await this.resolveBattle(attackerSwarm.id, defenderSwarmId);

        // Update battle history
        await this.prisma.battle.update({
          where: { id: battle.id },
          data: {
            status: 'RESOLVED',
            battleLog: JSON.parse(JSON.stringify(battleLog)),
          },
        });

        // Apply ownership transition if attacker won
        if (battleLog.meta.winnerId === attackerSwarm.id) {
          await this.prisma.sector.update({
            where: { id: battle.sectorId },
            data: { ownerId: battle.attackerId },
          });

          // Cancel any jobs running on this sector
          await this.prisma.job.deleteMany({
            where: { sectorId: battle.sectorId },
          });
        }

        // Cleanup temporary generated swarms
        if (createdTempSwarmId) {
          await this.prisma.swarm.delete({
            where: { id: createdTempSwarmId },
          });
        }

      } catch (err) {
        console.error(`Failed to process pending battle ${battle.id}:`, err);
      }
    }
  }

  async getUserBattles(userId: string) {
    return this.prisma.battle.findMany({
      where: {
        OR: [
          { attackerId: userId },
          { defenderId: userId }
        ]
      },
      include: {
        attacker: { select: { id: true, username: true } },
        defender: { select: { id: true, username: true } },
        sector: true
      },
      orderBy: { createdAt: 'desc' }
    });
  }

  async getBattleById(id: string) {
    return this.prisma.battle.findUnique({
      where: { id },
      include: {
        attacker: { select: { id: true, username: true } },
        defender: { select: { id: true, username: true } },
        sector: true
      }
    });
  }

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

  async calculateSwarmStats(formation: SwarmSlot[], mods: any): Promise<CalculatedSlotStats[]> {
    const resolvedSlots: CalculatedSlotStats[] = [];
    
    let totalGuardians = 0;
    let totalCarriers = 0;
    let totalKamikazes = 0;
    let totalJammers = 0;
    let totalCommandos = 0;

    for (const slot of formation) {
      const stats = await this.getDroneStats(slot.droneId);
      resolvedSlots.push({
        slotIndex: slot.slotIndex,
        droneId: slot.droneId,
        count: slot.count,
        baseHp: stats.health,
        baseAtk: stats.attack,
        baseSpeed: stats.speed,
        baseRange: stats.range,
        finalHp: stats.health,
        finalAtk: stats.attack,
        finalSpeed: stats.speed,
        finalRange: stats.range,
      });

      if (slot.droneId === 'DRONE_GUARDIAN') totalGuardians += slot.count;
      else if (slot.droneId === 'DRONE_CARRIER') totalCarriers += slot.count;
      else if (slot.droneId === 'DRONE_KAMIKAZE') totalKamikazes += slot.count;
      else if (slot.droneId === 'DRONE_JAMMER') totalJammers += slot.count;
      else if (slot.droneId === 'DRONE_COMMANDO') totalCommandos += slot.count;
    }

    const addedHp = 15 * totalGuardians;
    const addedMult = 0.5 * totalCarriers;
    const speedMultiplier = Math.pow(1.1, totalJammers);

    for (const slot of resolvedSlots) {
      let hp = slot.baseHp + addedHp;
      let mult = 1.0 + addedMult;

      if (slot.droneId === 'DRONE_KAMIKAZE') {
        if (totalKamikazes >= 5 && totalCarriers >= 1) {
          mult *= 2.0;
        }
      }

      let atk = slot.baseAtk * mult;
      let speed = slot.baseSpeed * speedMultiplier;
      let range = slot.baseRange;

      if (slot.droneId === 'DRONE_COMMANDO') {
        range = Math.max(3, Math.floor(slot.baseRange * mult));
        if (totalCommandos === 1) {
          range = Math.max(range, Math.floor(range * 2.0));
        }
      }

      slot.finalHp = Math.floor(hp);
      slot.finalAtk = Math.floor(atk * mods.attackMultiplier);
      slot.finalSpeed = Number((speed).toFixed(2));
      slot.finalRange = range;
    }

    return resolvedSlots;
  }

  async resolveBattle(swarmIdA: string, swarmIdB: string): Promise<BattleLog> {
    await ensureWasmInitialized();

    const swarms = await this.prisma.swarm.findMany({
      where: { id: { in: [swarmIdA, swarmIdB] } },
      include: { cartridge: true },
    });

    const swarmA = swarms.find((s) => s.id === swarmIdA);
    const swarmB = swarms.find((s) => s.id === swarmIdB);

    if (!swarmA || !swarmB)
      throw new BadRequestException('One or more swarms not found');

    const userA = await this.prisma.user.findUnique({
      where: { id: swarmA.userId },
      select: { equipment: true }
    });
    const userB = await this.prisma.user.findUnique({
      where: { id: swarmB.userId },
      select: { equipment: true }
    });

    const eqA = (userA?.equipment as Record<string, string>) || {};
    const eqB = (userB?.equipment as Record<string, string>) || {};

    const modsA = calculateEquipmentModifiers(eqA).modifiers;
    const modsB = calculateEquipmentModifiers(eqB).modifiers;

    const formA = (swarmA.formation as any[]) || [];
    const formB = (swarmB.formation as any[]) || [];

    const resolvedA = await this.calculateSwarmStats(formA, modsA);
    const resolvedB = await this.calculateSwarmStats(formB, modsB);

    const drones: DroneInstance[] = [];

    for (const slot of resolvedA) {
      const hp = slot.finalHp * slot.count;
      drones.push({
        id: `A-${slot.slotIndex}`,
        variantId: slot.droneId,
        teamId: 'A',
        x: slot.slotIndex,
        y: 0,
        hp,
        maxHp: hp,
        stats: {
          attack: slot.finalAtk,
          defense: 0,
          speed: slot.finalSpeed,
          range: slot.finalRange,
          health: slot.finalHp,
        },
        alive: true,
      });
    }

    for (const slot of resolvedB) {
      const hp = slot.finalHp * slot.count;
      drones.push({
        id: `B-${slot.slotIndex}`,
        variantId: slot.droneId,
        teamId: 'B',
        x: 4 - slot.slotIndex,
        y: 2,
        hp,
        maxHp: hp,
        stats: {
          attack: slot.finalAtk,
          defense: 0,
          speed: slot.finalSpeed,
          range: slot.finalRange,
          health: slot.finalHp,
        },
        alive: true,
      });
    }

    const initialDronesLog = drones.map((d) => ({
      id: d.id,
      variantId: d.variantId,
      teamId: d.teamId,
      x: d.x,
      y: d.y,
      hp: d.hp,
      maxHp: d.maxHp,
    }));

    const ticks: BattleTick[] = [];
    let winnerId: string | null = null;

    for (let tick = 0; tick < this.MAX_TICKS; tick++) {
      const events: BattleEvent[] = [];

      const living = drones.filter((d) => d.alive);
      const teamA = living.filter((d) => d.teamId === 'A');
      const teamB = living.filter((d) => d.teamId === 'B');

      if (teamA.length === 0) {
        winnerId = swarmIdB;
        break;
      }
      if (teamB.length === 0) {
        winnerId = swarmIdA;
        break;
      }

      living.sort((a, b) => b.stats.speed - a.stats.speed);

      const occupiedTiles = new Set<string>(living.map((d) => `${d.x},${d.y}`));

      for (const drone of living) {
        if (!drone.alive) continue;

        const targetEnemyList = drones.filter((d) => d.alive && d.teamId !== drone.teamId);
        if (targetEnemyList.length === 0) continue;

        // Sort by Chebyshev distance to find nearest enemy
        targetEnemyList.sort((a, b) => {
          const distA = this.chebyshevDistance(drone.x, drone.y, a.x, a.y);
          const distB = this.chebyshevDistance(drone.x, drone.y, b.x, b.y);
          return distA - distB;
        });

        const target = targetEnemyList[0];
        const distance = this.chebyshevDistance(drone.x, drone.y, target.x, target.y);

        if (distance <= drone.stats.range) {
          // Attacking inside range
          events.push({
            type: 'ATTACK',
            sourceId: drone.id,
            targetId: target.id,
            weapon: 'LASER',
          });

          const attackerCount = Math.ceil(drone.hp / drone.stats.health);
          const damage = attackerCount * drone.stats.attack;

          if (drone.variantId === 'DRONE_KAMIKAZE') {
            // Kamikaze self-destructs at CaC (Melee range)
            target.hp -= damage;
            events.push({
              type: 'DAMAGE',
              targetId: target.id,
              amount: damage,
              remainingHp: Math.max(0, target.hp),
              isCrit: false,
            });

            // Kamikaze stack explodes and dies
            drone.hp = 0;
            drone.alive = false;
            events.push({
              type: 'DESTROY',
              targetId: drone.id,
            });

            if (target.hp <= 0) {
              target.alive = false;
              events.push({
                type: 'DESTROY',
                targetId: target.id,
              });
            }
          } else {
            // Standard ranged attack
            target.hp -= damage;
            events.push({
              type: 'DAMAGE',
              targetId: target.id,
              amount: damage,
              remainingHp: Math.max(0, target.hp),
              isCrit: false,
            });

            if (target.hp <= 0) {
              target.alive = false;
              events.push({
                type: 'DESTROY',
                targetId: target.id,
              });
            }
          }
        } else {
          // Out of range: Move towards target enemy
          const oldTileKey = `${drone.x},${drone.y}`;
          occupiedTiles.delete(oldTileKey);

          const nextMove = this.moveTowards(drone, target, occupiedTiles);
          if (nextMove) {
            const oldX = drone.x;
            const oldY = drone.y;
            drone.x = nextMove.x;
            drone.y = nextMove.y;

            occupiedTiles.add(`${drone.x},${drone.y}`);

            events.push({
              type: 'MOVE',
              droneId: drone.id,
              from: { x: oldX, y: oldY },
              to: { x: drone.x, y: drone.y },
            });
          } else {
            // Cannot move (blocked), maintain tile claim
            occupiedTiles.add(oldTileKey);
          }
        }
      }

      ticks.push({ tick, events });
    }

    if (winnerId) {
      const winningSwarm = winnerId === swarmIdA ? swarmA : swarmB;
      const tickRecord = await this.prisma.gameTick.findUnique({ where: { id: 1 } });
      const season = tickRecord ? tickRecord.season : 1;

      await this.prisma.userSeasonStats.upsert({
        where: {
          userId_season: {
            userId: winningSwarm.userId,
            season,
          },
        },
        update: {
          wins: { increment: 1 },
        },
        create: {
          userId: winningSwarm.userId,
          season,
          wins: 1,
          credits: 0n,
          sectors: 0,
        },
      });
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
        drones: initialDronesLog,
      },
      ticks,
    };
  }
}

