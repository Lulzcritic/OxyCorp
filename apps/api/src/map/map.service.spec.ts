import { Test, TestingModule } from '@nestjs/testing';
import { MapService } from './map.service';
import { PrismaService } from '../prisma/prisma.service';

describe('MapService', () => {
  let service: MapService;
  let prisma: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MapService,
        {
          provide: PrismaService,
          useValue: {
            sector: {
              findMany: jest.fn().mockResolvedValue([]),
            },
          },
        },
      ],
    }).compile();

    service = module.get<MapService>(MapService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should call prisma.sector.findMany with correct coordinates', async () => {
    const x = BigInt(0);
    const y = BigInt(0);
    const radius = 5;

    await service.getSectors(x, y, radius);

    // eslint-disable-next-line @typescript-eslint/unbound-method
    expect(prisma.sector.findMany).toHaveBeenCalledWith({
      where: {
        x: {
          gte: BigInt(-5),
          lte: BigInt(5),
        },
        y: {
          gte: BigInt(-5),
          lte: BigInt(5),
        },
      },
    });
  });
});
