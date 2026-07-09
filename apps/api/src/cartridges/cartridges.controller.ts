import { Controller, Post, Get, Request, Body, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { compile } from 'risk16-vm/compiler';

interface AuthenticatedRequest extends Request {
  user: {
    userId: string;
    email: string;
  };
}

@Controller('cartridges')
export class CartridgesController {
  constructor(private prisma: PrismaService) {}

  @Post('compile')
  async compileAndBurn(
    @Request() req: AuthenticatedRequest,
    @Body() body: { name: string; code: string },
  ) {
    const { name, code } = body;
    if (!name || typeof name !== 'string') {
      throw new BadRequestException('Invalid name');
    }
    if (!code || typeof code !== 'string') {
      throw new BadRequestException('Invalid code');
    }

    // 1. Compile
    const compRes = compile(code);
    if (!compRes.success || !compRes.bytecode) {
      throw new BadRequestException(`Compilation failed: ${compRes.error}`);
    }

    const bytecodeBase64 = Buffer.from(compRes.bytecode).toString('base64');

    // 2. Consume Blank Cartridge from user inventory
    const userId = req.user.userId;

    return this.prisma.$transaction(async (tx) => {
      const inv = await tx.inventory.findUnique({
        where: {
          userId_item: {
            userId,
            item: 'CARTRIDGE_BLANK',
          },
        },
      });

      if (!inv || inv.quantity <= 0n) {
        throw new BadRequestException('No blank cartridges available in inventory.');
      }

      const nextQty = inv.quantity - 1n;
      if (nextQty === 0n) {
        await tx.inventory.delete({
          where: {
            userId_item: {
              userId,
              item: 'CARTRIDGE_BLANK',
            },
          },
        });
      } else {
        await tx.inventory.update({
          where: {
            userId_item: {
              userId,
              item: 'CARTRIDGE_BLANK',
            },
          },
          data: {
            quantity: nextQty,
          },
        });
      }

      // 3. Create Programmed Cartridge
      const cartridge = await tx.cartridge.create({
        data: {
          userId,
          name,
          bytecode: bytecodeBase64,
        },
      });

      return {
        success: true,
        cartridgeId: cartridge.id,
        name: cartridge.name,
      };
    });
  }

  @Get('my')
  async getMyCartridges(@Request() req: AuthenticatedRequest) {
    const cartridges = await this.prisma.cartridge.findMany({
      where: { userId: req.user.userId },
      orderBy: { createdAt: 'desc' },
    });
    return cartridges;
  }
}