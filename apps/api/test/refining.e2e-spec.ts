import 'dotenv/config';
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from './../src/app.module';
import { PrismaService } from './../src/prisma/prisma.service';

describe('RefiningController (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let userId: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
    prisma = app.get<PrismaService>(PrismaService);
  });

  beforeEach(async () => {
    // Cleanup and Setup
    // Create a test user
    const user = await prisma.user.create({
      data: {
        username: `testuser_${Date.now()}`,
        credits: 1000,
      },
    });
    userId = user.id;

    // Grant Inventory
    await prisma.inventory.create({
      data: {
        userId,
        item: 'IRON_ORE',
        quantity: 100n,
      },
    });
  });
  
  afterEach(async () => {
      // Clean up user will cascade delete inventory/jobs usually or we leave it for potential inspection if fails
      // But for atomic tests better clean up.
      // Assuming cascade delete or manual cleanup.
      // For now, let's just leave it, DB reset is better.
      try {
          // clean up job
          await prisma.job.deleteMany({ where: { userId }});
          await prisma.inventory.deleteMany({ where: { userId }});
          await prisma.user.delete({ where: { id: userId }});
      } catch(e) {}
  });

  afterAll(async () => {
    await app.close();
  });

  it('/refine/start (POST) - Success', async () => {
    const response = await request(app.getHttpServer())
      .post('/refine/start')
      .set('x-user-id', userId) // Assuming our simple mock auth in controller accepts this header
      .send({
        recipeId: 'IRON_TO_STEEL',
        quantity: 1,
      })
      .expect(201);

    expect(response.body.userId).toBe(userId);
    expect(response.body.status).toBe('ACTIVE');
    expect(response.body.durationSeconds).toBe(60); 

    // Verify Inventory Deducted
    const inventory = await prisma.inventory.findUnique({
      where: { userId_item: { userId, item: 'IRON_ORE' } },
    });
    // 100 - 10 = 90
    expect(Number(inventory?.quantity)).toBe(90);
  });

  it('/refine/start (POST) - Insufficient Funds', async () => {
    // Try to refine sludge (we have 0)
    await request(app.getHttpServer())
      .post('/refine/start')
      .set('x-user-id', userId)
      .send({
        recipeId: 'SLUDGE_TO_FUEL',
        quantity: 1,
      })
      .expect(400);
  });
  
  it('/refine/jobs (GET)', async () => {
      // Create a job first
      await request(app.getHttpServer())
      .post('/refine/start')
      .set('x-user-id', userId)
      .send({
        recipeId: 'IRON_TO_STEEL',
        quantity: 1,
      })
      .expect(201);

      const res = await request(app.getHttpServer())
        .get('/refine/jobs')
        .set('x-user-id', userId)
        .expect(200);
        
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBeGreaterThan(0);
      expect(res.body[0].type).toBe('REFINING');
  });
});
