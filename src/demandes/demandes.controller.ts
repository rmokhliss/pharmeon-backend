import { Controller, Get, Post, Patch, Param, Body, UseGuards, ParseIntPipe } from '@nestjs/common';
import { DemandesService, CreateDemandeDto } from './demandes.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('demandes')
export class DemandesController {
  constructor(private readonly service: DemandesService) {}

  @Post()
  create(@Body() dto: CreateDemandeDto) {
    return this.service.create(dto);
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  findAll() {
    return this.service.findAll();
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id/approve')
  approve(@Param('id', ParseIntPipe) id: number) {
    return this.service.approve(id);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id/reject')
  reject(@Param('id', ParseIntPipe) id: number) {
    return this.service.reject(id);
  }
}
