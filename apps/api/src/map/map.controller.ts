import {
  Controller,
  Get,
  Post,
  Query,
  Body,
  BadRequestException,
  UseInterceptors,
  Req,
} from '@nestjs/common';
import { MapService } from './map.service';
import { MapSpawningService } from './map.spawning.service';
import { Public } from '../auth/public.decorator';
import { BigIntInterceptor } from '../common/bigint.interceptor';

interface ClaimSectorDto {
  x: number;
  y: number;
}

@Controller('map')
@UseInterceptors(BigIntInterceptor)
export class MapController {
  constructor(
    private readonly mapService: MapService,
    private readonly mapSpawningService: MapSpawningService,
  ) {}

  @Public()
  @Get('sectors')
  async getSectors(
    @Query('x') x: string,
    @Query('y') y: string,
    @Query('radius') radius: string = '10',
  ) {
    const xBig = BigInt(x || '0');
    const yBig = BigInt(y || '0');
    const rVal = parseInt(radius, 10);

    if (isNaN(rVal) || rVal < 0) {
      throw new BadRequestException('Radius must be a positive number');
    }

    // Max radius check
    const MAX_RADIUS = 20;
    const finalRadius = Math.min(rVal, MAX_RADIUS);

    const sectors = await this.mapService.getSectors(xBig, yBig, finalRadius);

    return sectors;
  }

  @Get('my-sectors')
  async getMySectors(@Req() req: any) {
    const userId = req.user?.userId;
    if (!userId) {
      throw new BadRequestException('User not authenticated');
    }
    return this.mapService.getMySectors(userId);
  }

  @Post('claim')
  async claimSector(@Req() req: any, @Body() dto: ClaimSectorDto) {
    const userId = req.user?.userId;
    if (!userId) {
      throw new BadRequestException('User not authenticated');
    }
    
    if (typeof dto.x !== 'number' || typeof dto.y !== 'number') {
      throw new BadRequestException('x and y coordinates are required');
    }

    return this.mapService.claimSector(userId, dto.x, dto.y);
  }

  @Post('generate-territory')
  async generateTerritory(@Req() req: any) {
    const userId = req.user?.userId;
    if (!userId) {
      throw new BadRequestException('User not authenticated');
    }
    return this.mapSpawningService.generateSectorsAroundBunker(userId, 3);
  }

  @Post('install-outpost')
  async installOutpost(@Req() req: any, @Body() dto: { sectorId: string }) {
    const userId = req.user?.userId;
    if (!userId) {
      throw new BadRequestException('User not authenticated');
    }
    if (!dto.sectorId) {
      throw new BadRequestException('sectorId is required');
    }
    return this.mapService.installOutpost(userId, dto.sectorId);
  }


  /* Debug/Admin Endpoints (Disabled for Prod)
  @Public()
  @Get('backfill-debug')
  async triggerBackfill() {
     return this.mapService.backfillResources();
  }

  @Public()
  @Get('check-resources')
  async checkResources() {
      return this.mapService.getDebugResources();
  }
  
  @Public()
  @Get('wipe-world')
  async wipeWorld() {
      return this.mapService.wipeWorld();
  }
  */
}
