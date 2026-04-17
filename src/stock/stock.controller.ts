import { Controller, Get, Post, Body, Query, ParseIntPipe, Optional } from '@nestjs/common';
import { StockService } from './stock.service';
import { CreateMovementDto } from './dto/create-movement.dto';

@Controller('stock')
export class StockController {
  constructor(private readonly stockService: StockService) {}

  @Get()
  findAll(@Query('productId') productId?: string) {
    return this.stockService.findAll(productId ? parseInt(productId) : undefined);
  }

  @Post()
  create(@Body() dto: CreateMovementDto) {
    return this.stockService.create(dto);
  }
}
