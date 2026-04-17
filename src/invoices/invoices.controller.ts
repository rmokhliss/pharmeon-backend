import { Controller, Get, Patch, Param, Body, ParseIntPipe, UseGuards } from '@nestjs/common';
import { InvoicesService } from './invoices.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { IsString } from 'class-validator';

class UpdateStatutDto {
  @IsString() statut: string;
}

@UseGuards(JwtAuthGuard)
@Controller('invoices')
export class InvoicesController {
  constructor(private service: InvoicesService) {}

  @UseGuards(RolesGuard)
  @Roles('ADMIN')
  @Get()
  findAll() { return this.service.findAll(); }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) { return this.service.findOne(id); }

  @Get('commande/:commandeId')
  findByCommande(@Param('commandeId', ParseIntPipe) commandeId: number) {
    return this.service.findByCommande(commandeId);
  }

  @UseGuards(RolesGuard)
  @Roles('ADMIN')
  @Patch(':id/statut')
  updateStatut(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateStatutDto) {
    return this.service.updateStatut(id, dto.statut);
  }
}
