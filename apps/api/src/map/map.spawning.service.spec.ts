import { Test, TestingModule } from '@nestjs/testing';
import { MapSpawningService } from './map.spawning.service';
import { PrismaService } from '../prisma/prisma.service';

describe('MapSpawningService', () => {
  let service: MapSpawningService;
  let prisma: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MapSpawningService,
        {
          provide: PrismaService,
          useValue: {
            sector: {
              count: jest.fn().mockResolvedValue(0), // Default: all spots empty
            },
          },
        },
      ],
    }).compile();

    service = module.get<MapSpawningService>(MapSpawningService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should return (0,0) primary and adjacent secondary if empty', async () => {
    const loc = await service.findSpawnLocation();
    expect(loc.primary.x).toBe(0n);
    expect(loc.primary.y).toBe(0n);
    // Should find first neighbor (Up: 0, 1)
    expect(loc.secondary.x).toBe(0n);
    expect(loc.secondary.y).toBe(1n);
  });

  it('should skip occupied spots', async () => {
    // Mock: (0,0) is occupied (count > 0)
    (prisma.sector.count as jest.Mock)
      .mockResolvedValueOnce(1) // (0,0) occupied
      .mockResolvedValueOnce(0) // (1,0) empty (next spiral)
      .mockResolvedValueOnce(0); // Neighbor of (1,0) empty

    const loc = await service.findSpawnLocation();
    expect(loc.primary.x).toBe(1n);
    expect(loc.primary.y).toBe(0n);
  });

  it('should find valid secondary even if some neighbors occupied', async () => {
    // Primary (0,0) valid
    // Neighbor 1 (0,1) occupied
    // Neighbor 2 (0,-1) empty
    (prisma.sector.count as jest.Mock)
      .mockResolvedValueOnce(0) // (0,0) valid
      .mockResolvedValueOnce(1) // Neighbor 1 occupied
      .mockResolvedValueOnce(0); // Neighbor 2 empty

    const loc = await service.findSpawnLocation();
    expect(loc.primary.x).toBe(0n);
    expect(loc.primary.y).toBe(0n);
    expect(loc.secondary.x).toBe(0n);
    expect(loc.secondary.y).toBe(-1n);
  });
});
