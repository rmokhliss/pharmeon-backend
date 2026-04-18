import { Body, Controller, Get, Param, ParseIntPipe, Patch, Res, UseGuards } from '@nestjs/common';
import type { Response } from 'express';
import { DeliveryNotesService } from './delivery-notes.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@Controller('delivery-notes')
export class DeliveryNotesController {
  constructor(private readonly deliveryNotesService: DeliveryNotesService) {}

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @Get()
  findAll() { return this.deliveryNotesService.findAll(); }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) { return this.deliveryNotesService.findOne(id); }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: { delivery_date?: string; tracking_number?: string; statut?: string; livreurId?: number | null },
  ) {
    return this.deliveryNotesService.update(id, body);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @Patch(':id/livreur')
  assignLivreur(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: { livreurId: number | null },
  ) {
    return this.deliveryNotesService.assignLivreur(id, body.livreurId);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @Get(':id/pdf')
  async getPdf(@Param('id', ParseIntPipe) id: number, @Res() res: Response) {
    const html = await this.deliveryNotesService.generatePdf(id);
    res.set({
      'Content-Type': 'text/html; charset=utf-8',
      'Content-Disposition': `inline; filename="bl-${id}.html"`,
    });
    res.send(html);
  }
}
