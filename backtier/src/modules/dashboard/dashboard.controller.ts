import { Controller, Get, Request, UseGuards } from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { JwtClaimsGuard } from '../../core/auth/guard/jwt-claims.guard';

@Controller('dashboard')
@UseGuards(JwtClaimsGuard)
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('stats')
  getStats(@Request() req: any) {
    // The JwtClaimsGuard typically attaches the decoded payload to req.user
    return this.dashboardService.getStats(req.user);
  }

  @Get('revenue')
  getRevenueData(@Request() req: any) {
    return this.dashboardService.getRevenueData(req.user);
  }
}
