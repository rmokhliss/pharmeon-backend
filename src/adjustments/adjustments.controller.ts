import { Controller, Get, Post, Patch, Param, Body, ParseIntPipe, UseGuards } from '@nestjs/common';
import { AdjustmentsService } from './adjustments.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { IsArray, IsInt, IsNumber, IsOptional, IsPositive, IsString } from 'class-validator';
import { Type } from 'class-transformer';

class AdjItemDto {
  @IsInt() @IsPositive() productId: number;
  @IsInt() @IsPositive() quantite: number;
  @IsNumber() @IsPositive() cost_price: number;
}

class CreateAdjDto {
  @IsString() type: string;
  @IsOptional() @IsString() note?: string;
  @IsArray() @Type(() => AdjItemDto) items: AdjItemDto[];
}

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN')
@Controller('adjustments')
export class AdjustmentsController {
  constructor(private service: AdjustmentsService) {}

  @Get() findAll() { return this.service.findAll(); }
  @Get(':id') findOne(@Param('id', ParseIntPipe) id: number) { return this.service.findOne(id); }
  @Post() create(@Body() dto: CreateAdjDto) { return this.service.create(dto); }
  @Patch(':id/validate') validate(@Param('id', ParseIntPipe) id: number) { return this.service.validate(id); }
  @Patch(':id/reject') reject(@Param('id', ParseIntPipe) id: number) { return this.service.reject(id); }
}
