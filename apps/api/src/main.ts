import * as fs from 'fs';
import * as path from 'path';
import * as dotenv from 'dotenv';

// Trigger automatic NestJS watch reload to pick up env configuration updates

// Traverse upwards to find monorepo root directory
let rootDir = __dirname;
while (rootDir !== path.dirname(rootDir)) {
  if (fs.existsSync(path.join(rootDir, 'turbo.json')) || fs.existsSync(path.join(rootDir, 'package.json'))) {
    // Double check we're not inside apps/api
    if (!rootDir.endsWith('apps' + path.sep + 'api') && !rootDir.endsWith('api')) {
      break;
    }
  }
  rootDir = path.dirname(rootDir);
}

// Load workspace-level .env configurations
dotenv.config({ path: path.join(rootDir, '.env') });
// Load app-specific credentials
dotenv.config({ path: path.join(rootDir, 'apps/api/.env') });

import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { BigIntInterceptor } from './common/bigint.interceptor';
import { ValidationPipe } from '@nestjs/common';

import { RedisIoAdapter } from './common/adapters/redis-io.adapter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(new ValidationPipe({ transform: true }));
  app.useGlobalInterceptors(new BigIntInterceptor());
  app.setGlobalPrefix('api');
  app.enableCors(); // Allow Frontend

  const redisIoAdapter = new RedisIoAdapter(app);
  await redisIoAdapter.connectToRedis();
  app.useWebSocketAdapter(redisIoAdapter);

  await app.listen(process.env.PORT ?? 3000);
}
void bootstrap();
