import { Controller, Post, Get, Body, Param, Request } from '@nestjs/common';
import { MarketService } from './market.service';
import { CreateListingDto } from './dto/create-listing.dto';

interface RequestWithUser {
  user: {
    userId: string;
    email: string;
  };
}

@Controller('market')
export class MarketController {
  constructor(private readonly marketService: MarketService) {}

  @Post('orders')
  createListing(
    @Request() req: RequestWithUser,
    @Body() dto: CreateListingDto,
  ) {
    return this.marketService.createListing(req.user.userId, dto);
  }

  @Get('listings')
  getActiveListings() {
    return this.marketService.getActiveListings();
  }

  @Post('buy/:id')
  buyListing(@Request() req: RequestWithUser, @Param('id') id: string) {
    return this.marketService.buyListing(req.user.userId, id);
  }
}
