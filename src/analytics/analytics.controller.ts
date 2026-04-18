import { Controller, Get, UseGuards } from '@nestjs/common';
import { AnalyticsService } from './analytics.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@Controller('analytics')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN')
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get('dashboard')
  getDashboard() { return this.analyticsService.getDashboard(); }

  @Get('profitability/products')
  byProduct() { return this.analyticsService.getProfitabilityByProduct(); }

  @Get('profitability/clients')
  byClient() { return this.analyticsService.getProfitabilityByClient(); }

  @Get('profitability/suppliers')
  bySupplier() { return this.analyticsService.getProfitabilityBySupplier(); }

  @Get('losses')
  getLosses() { return this.analyticsService.getLosses(); }
}
