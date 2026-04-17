import { Controller, Get, Post, Put, Delete, Body, Param, Query, ParseIntPipe } from '@nestjs/common';
import { FournisseursService } from './fournisseurs.service';
import { CreateFournisseurDto, UpdateFournisseurDto } from './dto/fournisseur.dto';

@Controller('fournisseurs')
export class FournisseursController {
  constructor(private readonly fournisseursService: FournisseursService) {}

  @Get()
  findAll(@Query('search') search?: string) {
    return this.fournisseursService.findAll(search);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.fournisseursService.findOne(id);
  }

  @Post()
  create(@Body() dto: CreateFournisseurDto) {
    return this.fournisseursService.create(dto);
  }

  @Put(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateFournisseurDto) {
    return this.fournisseursService.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.fournisseursService.remove(id);
  }
}
