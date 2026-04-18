import { Controller, Get, Post, Put, Delete, Body, Param, Query, ParseIntPipe, UseGuards } from '@nestjs/common';
import { LivreursService } from './livreurs.service';
import { CreateLivreurDto, UpdateLivreurDto } from './dto/livreur.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN')
@Controller('livreurs')
export class LivreursController {
  constructor(private readonly livreursService: LivreursService) {}

  @Get()
  findAll(@Query('search') search?: string, @Query('all') all?: string) {
    return this.livreursService.findAll(search, all === '1');
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.livreursService.findOne(id);
  }

  @Post()
  create(@Body() dto: CreateLivreurDto) {
    return this.livreursService.create(dto);
  }

  @Put(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateLivreurDto) {
    return this.livreursService.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.livreursService.remove(id);
  }
}
