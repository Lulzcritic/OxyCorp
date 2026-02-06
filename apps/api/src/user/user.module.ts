import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { MapModule } from '../map/map.module';

@Module({
  imports: [PrismaModule, MapModule],
  providers: [UserService],
  controllers: [UserController],
})
export class UserModule {}
