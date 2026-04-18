import { Controller, Get, Post, Patch, Delete, Body, Param, ParseIntPipe, UseGuards } from '@nestjs/common';
import { PurchaseOrdersService } from './purchase-orders.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { IsArray, IsInt, IsNumber, IsOptional, IsPositive, IsString } from 'class-validator';
import { Type } from 'class-transformer';

class POItemDto {
  @IsInt() @IsPositive() productId: number;
  @IsInt() @IsPositive() quantite: number;
  @IsNumber() @IsPositive() prix_achat: number;
}

class CreatePODto {
  @IsInt() @IsPositive() fournisseurId: number;
  @IsOptional() @IsString() note?: string;
  @IsOptional() @IsString() expected_date?: string;
  @IsArray() @Type(() => POItemDto) items: POItemDto[];
}

class UpdateStatutDto {
  @IsString() statut: string;
}

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN')
@Controller('purchase-orders')
export class PurchaseOrdersController {
  constructor(private service: PurchaseOrdersService) {}

  @Get() findAll() { return this.service.findAll(); }
  @Get(':id') findOne(@Param('id', ParseIntPipe) id: number) { return this.service.findOne(id); }
  @Post() create(@Body() dto: CreatePODto) { return this.service.create(dto); }
  @Patch(':id/statut') updateStatut(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateStatutDto) { return this.service.updateStatut(id, dto.statut); }
  @Delete(':id') remove(@Param('id', ParseIntPipe) id: number) { return this.service.remove(id); }
}
