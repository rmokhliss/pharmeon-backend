import { Controller, Get, Post, Patch, Param, Body, ParseIntPipe, UseGuards, Request } from '@nestjs/common';
import { CommandesService } from './commandes.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { IsArray, IsInt, IsNumber, IsOptional, IsPositive, IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

class CommandeItemDto {
  @IsInt() @IsPositive() productId: number;
  @IsInt() @IsPositive() quantite: number;
}

class CreateCommandeDto {
  @IsOptional() @IsString() note?: string;
  @IsArray() @ValidateNested({ each: true }) @Type(() => CommandeItemDto) items: CommandeItemDto[];
}

class UpdateStatutDto {
  @IsString() statut: string;
  @IsOptional() @IsString() tracking_number?: string;
  @IsOptional() @IsString() delivery_date?: string;
}

class UpdateItemPriceDto {
  @IsNumber() @IsPositive() final_price: number;
}

@Controller('commandes')
export class CommandesController {
  constructor(private service: CommandesService) {}

  // Client routes (JWT required)
  @UseGuards(JwtAuthGuard)
  @Post()
  create(@Request() req: any, @Body() dto: CreateCommandeDto) {
    return this.service.create(req.user.id, dto, req.user.role || 'CLIENT_PUBLIC');
  }

  @UseGuards(JwtAuthGuard)
  @Get('mes-commandes')
  mesCommandes(@Request() req: any) {
    return this.service.findByClient(req.user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Get('mes-commandes/:id')
  maCommande(@Param('id', ParseIntPipe) id: number, @Request() req: any) {
    return this.service.findOne(id, req.user.id);
  }

  // Admin routes
  @Get('pending-count')
  pendingCount() { return this.service.pendingCount(); }

  @Get()
  findAll() { return this.service.findAll(); }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) { return this.service.findOne(id); }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @Patch(':id/statut')
  updateStatut(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateStatutDto) {
    return this.service.updateStatut(id, dto.statut, dto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @Patch(':commandeId/items/:itemId/price')
  updateItemPrice(
    @Param('commandeId', ParseIntPipe) commandeId: number,
    @Param('itemId', ParseIntPipe) itemId: number,
    @Body() dto: UpdateItemPriceDto,
  ) {
    return this.service.updateItemPrice(commandeId, itemId, dto.final_price);
  }
}
