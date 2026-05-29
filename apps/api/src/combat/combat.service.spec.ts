import { Test, TestingModule } from '@nestjs/testing';
import { CombatService } from './combat.service';
import { PrismaService } from '../prisma/prisma.service';
import { BadRequestException } from '@nestjs/common';

describe('CombatService', () => {
  let service: CombatService;
  let prisma: PrismaService;

  const mockDroneVariant = {
    id: 'DRONE_ATTACK_V1',
    name: 'Wasp I',
    attack: 10,
    defense: 2,
    health: 50,
  };

  const mockSwarmA = {
    id: 'swarm-a',
    name: 'Swarm A',
    formation: [{ droneId: 'DRONE_ATTACK_V1' }],
  };

  const mockSwarmB = {
    id: 'swarm-b',
    name: 'Swarm B',
    formation: [{ droneId: 'DRONE_ATTACK_V1' }],
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CombatService,
        {
          provide: PrismaService,
          useValue: {
            droneVariant: {
              findUnique: jest.fn().mockResolvedValue(mockDroneVariant),
            },
            swarm: {
              findMany: jest.fn().mockResolvedValue([mockSwarmA, mockSwarmB]),
            },
          },
        },
      ],
    }).compile();

    service = module.get<CombatService>(CombatService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should resolve a battle between two swarms', async () => {
    const result = await service.resolveBattle('swarm-a', 'swarm-b');
    expect(result).toBeDefined();
    expect(result.log.length).toBeGreaterThan(0);
    expect(prisma.droneVariant.findUnique).toHaveBeenCalledWith({
      where: { id: 'DRONE_ATTACK_V1' },
    });
  });

  it('should throw error if swarm not found', async () => {
    jest.spyOn(prisma.swarm, 'findMany').mockResolvedValue([]);
    await expect(service.resolveBattle('swarm-a', 'swarm-b')).rejects.toThrow(
      BadRequestException,
    );
  });
});
