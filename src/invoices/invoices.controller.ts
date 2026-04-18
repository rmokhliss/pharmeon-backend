import { Controller, Get, Patch, Param, Body, ParseIntPipe, Res, UseGuards } from '@nestjs/common';
import { Response } from 'express';
import { InvoicesService } from './invoices.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@Controller('invoices')
export class InvoicesController {
  constructor(private readonly invoicesService: InvoicesService) {}

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @Get()
  findAll() { return this.invoicesService.findAll(); }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) { return this.invoicesService.findOne(id); }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @Get(':id/pdf')
  async getPdf(@Param('id', ParseIntPipe) id: number, @Res() res: Response) {
    const html = await this.invoicesService.generatePdf(id);
    res.set({
      'Content-Type': 'text/html; charset=utf-8',
      'Content-Disposition': `inline; filename="facture-${id}.html"`,
    });
    res.send(html);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @Patch(':id/statut')
  updateStatut(@Param('id', ParseIntPipe) id: number, @Body('statut') statut: string) {
    return this.invoicesService.updateStatut(id, statut);
  }
}
