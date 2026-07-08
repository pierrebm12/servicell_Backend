import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ReportsService } from './reports.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('reports')
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Get('received')
  received(@Query('period') period: 'day' | 'week' | 'month' | 'year' = 'day', @Query('date') date?: string) {
    return this.reportsService.receivedEquipment(period, date);
  }

  @Get('delivered')
  delivered(@Query('period') period: 'day' | 'week' | 'month' | 'year' = 'day', @Query('date') date?: string) {
    return this.reportsService.deliveredEquipment(period, date);
  }

  @Get('pending')
  pending() {
    return this.reportsService.pending();
  }

  @Get('income')
  income(@Query('period') period: 'day' | 'week' | 'month' | 'year' = 'day', @Query('date') date?: string) {
    return this.reportsService.income(period, date);
  }

  @Get('tech-productivity')
  techProductivity(@Query('period') period: 'day' | 'week' | 'month' | 'year' = 'day', @Query('date') date?: string) {
    return this.reportsService.techProductivity(period, date);
  }

  @Get('parts-used')
  partsUsed(@Query('period') period: 'day' | 'week' | 'month' | 'year' = 'day', @Query('date') date?: string) {
    return this.reportsService.partsUsed(period, date);
  }

  @Get('frequent-clients')
  frequentClients(@Query('period') period: 'day' | 'week' | 'month' | 'year' = 'day', @Query('date') date?: string) {
    return this.reportsService.frequentClients(period, date);
  }
}
