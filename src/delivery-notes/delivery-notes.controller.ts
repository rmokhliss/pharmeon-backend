import { Controller, Get, Param, ParseIntPipe, Res, UseGuards } from '@nestjs/common';
import { Response } from 'express';
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
