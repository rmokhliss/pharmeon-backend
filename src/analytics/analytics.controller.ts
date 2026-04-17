import { Controller, Get, UseGuards } from '@nestjs/common';
import { AnalyticsService } from './analytics.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN')
@Controller('analytics')
export class AnalyticsController {
  constructor(private service: AnalyticsService) {}

  @Get('dashboard') getDashboard() { return this.service.getDashboard(); }
  @Get('products') getProducts() { return this.service.getProfitabilityByProduct(); }
  @Get('clients') getClients() { return this.service.getProfitabilityByClient(); }
  @Get('suppliers') getSuppliers() { return this.service.getProfitabilityBySupplier(); }
  @Get('losses') getLosses() { return this.service.getLosses(); }
}
