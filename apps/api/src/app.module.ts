import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { JwtAuthGuard } from './auth/jwt-auth.guard';
import { PrismaModule } from './prisma/prisma.module';
import { UserModule } from './user/user.module';
import { JobsModule } from './jobs/jobs.module';
import { MarketModule } from './market/market.module';
import { SwarmsModule } from './swarms/swarms.module';
import { CombatModule } from './combat/combat.module';
import { ChatModule } from './chat/chat.module';
import { MapModule } from './map/map.module';
import { RefiningModule } from './refining/refining.module';
import { BunkerModule } from './bunker/bunker.module';
import { DirectivesModule } from './directives/directives.module';
import { SkillsModule } from './skills/skills.module';

@Module({
  imports: [
    EventEmitterModule.forRoot(),
    AuthModule,
    PrismaModule,
    UserModule,
    JobsModule,
    MarketModule,
    SwarmsModule,
    CombatModule,
    ChatModule,
    MapModule,
    RefiningModule,
    BunkerModule,
    DirectivesModule,
    SkillsModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
  ],
})
export class AppModule {}
