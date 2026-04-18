import { Controller, Get, Post, Put, Patch, Delete, Body, Param, Query, ParseIntPipe, UseGuards } from '@nestjs/common';
import { ClientsService } from './clients.service';
import { CreateClientDto, UpdateClientDto, RegisterClientDto } from './dto/client.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@Controller('clients')
export class ClientsController {
  constructor(private readonly clientsService: ClientsService) {}

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @Get('pending-count')
  pendingCount() { return this.clientsService.pendingCount(); }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @Get('pending-approval-count')
  pendingApprovalCount() { return this.clientsService.pendingApprovalCount(); }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @Get('pending')
  findPending() { return this.clientsService.findPending(); }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @Get('pending-approval')
  findPendingApproval() { return this.clientsService.findPendingApproval(); }

  @Post('register')
  register(@Body() dto: RegisterClientDto) { return this.clientsService.register(dto); }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @Get()
  findAll(@Query('search') search?: string) { return this.clientsService.findAll(search); }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) { return this.clientsService.findOne(id); }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @Post()
  create(@Body() dto: CreateClientDto) { return this.clientsService.create(dto); }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @Patch(':id/approve')
  approve(@Param('id', ParseIntPipe) id: number) { return this.clientsService.approve(id); }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @Put(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateClientDto) {
    return this.clientsService.update(id, dto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) { return this.clientsService.remove(id); }
}
