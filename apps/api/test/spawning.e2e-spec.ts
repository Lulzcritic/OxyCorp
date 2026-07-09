import 'dotenv/config';
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { AppModule } from './../src/app.module';
import { PrismaService } from './../src/prisma/prisma.service';
import { UserService } from './../src/user/user.service';

describe('Map Spawning & User Integration (e2e)', () => {
  let app: INestApplication;
  let userService: UserService;
  let prisma: PrismaService;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    userService = moduleFixture.get<UserService>(UserService);
    prisma = moduleFixture.get<PrismaService>(PrismaService);
  });

  afterAll(async () => {
    await app.close();
  });

  it('should assign distinct bunker sectors to new users', async () => {
    const id1 = `test-user-${Date.now()}-1`;
    const id2 = `test-user-${Date.now()}-2`;
    const email1 = `p1-${Date.now()}@test.com`;
    const email2 = `p2-${Date.now()}@test.com`;

    await userService.onboardUser(id1, email1);
    await userService.onboardUser(id2, email2);

    const user1 = await prisma.user.findUnique({
      where: { id: id1 },
      include: { sectors: true },
    });
    const user2 = await prisma.user.findUnique({
      where: { id: id2 },
      include: { sectors: true },
    });

    // @ts-expect-error - Prisma include types are complex for manual checking
    expect(user1.sectors.length).toBe(2);
    // @ts-expect-error - Prisma include types are complex for manual checking
    expect(user2.sectors.length).toBe(2);

    // @ts-expect-error - Prisma include types are complex for manual checking
    const s1Bunker = user1.sectors.find((s) => s.type === 'BUNKER');
    // @ts-expect-error - Prisma include types are complex for manual checking
    const s1Resource = user1.sectors.find((s) => s.type === 'RESOURCE');

    expect(s1Bunker).toBeDefined();
    expect(s1Resource).toBeDefined();

    console.log(`User 1 Bunker: (${s1Bunker!.x}, ${s1Bunker!.y})`);
    console.log(`User 1 Resource: (${s1Resource!.x}, ${s1Resource!.y})`);

    // Ensure adjacency
    const dx = BigInt(s1Bunker!.x) - BigInt(s1Resource!.x);
    const dy = BigInt(s1Bunker!.y) - BigInt(s1Resource!.y);
    // Manhattan distance should be 1
    const dist = (dx > 0 ? dx : -dx) + (dy > 0 ? dy : -dy);
    expect(dist).toBe(1n);

    // Check second user
    // @ts-expect-error - Prisma include types are complex
    const s2Bunker = user2.sectors.find((s) => s.type === 'BUNKER');
    // @ts-expect-error - Prisma include types are complex
    const s2Resource = user2.sectors.find((s) => s.type === 'RESOURCE');
    expect(s2Bunker).toBeDefined();
    expect(s2Resource).toBeDefined();

    // Ensure distinct from User 1
    const distinct = s1Bunker!.x !== s2Bunker!.x || s1Bunker!.y !== s2Bunker!.y;
    expect(distinct).toBe(true);
  });
});
