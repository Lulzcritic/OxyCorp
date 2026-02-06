import 'dotenv/config';
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from './../src/app.module';

describe('MapController (e2e)', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterEach(async () => {
    await app.close();
  });

  it('/map/sectors (GET) should return an array', () => {
    return request(app.getHttpServer())
      .get('/map/sectors?x=0&y=0&radius=5')
      .expect(200)
      .expect((res) => {
        expect(Array.isArray(res.body)).toBe(true);
      });
  });

  it('/map/sectors (GET) should validate radius', () => {
    return request(app.getHttpServer())
      .get('/map/sectors?x=0&y=0&radius=-1')
      .expect(400);
  });
});
