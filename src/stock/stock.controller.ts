import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { StockService } from './stock.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@Controller('stock')
export class StockController {
  constructor(private readonly stockService: StockService) {}

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @Get()
  findAll(@Query('productId') productId?: string) {
    return this.stockService.findAll(productId ? parseInt(productId) : undefined);
  }
}
