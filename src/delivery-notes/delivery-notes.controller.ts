import { Controller, Get, Patch, Param, Body, ParseIntPipe, UseGuards } from '@nestjs/common';
import { DeliveryNotesService } from './delivery-notes.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { IsOptional, IsString } from 'class-validator';

class UpdateBLDto {
  @IsOptional() @IsString() tracking_number?: string;
  @IsOptional() @IsString() delivery_date?: string;
  @IsOptional() @IsString() statut?: string;
}

@Controller('delivery-notes')
export class DeliveryNotesController {
  constructor(private service: DeliveryNotesService) {}

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @Get()
  findAll() { return this.service.findAll(); }

  @UseGuards(JwtAuthGuard)
  @Get('commande/:commandeId')
  findByCommande(@Param('commandeId', ParseIntPipe) commandeId: number) {
    return this.service.findByCommande(commandeId);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @Patch(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateBLDto) {
    return this.service.update(id, dto);
  }
}
