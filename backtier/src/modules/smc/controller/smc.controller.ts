import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  UseGuards,
} from '@nestjs/common';
import { JwtClaimsGuard } from '../../../core/auth/guard/jwt-claims.guard';
import { TenantAccessGuard } from '../../../core/auth/guard/tenant-access.guard';
import { CreateActivityLogDto, CreateDashboardStatDto } from '../dto/smc.dto';
import { SmcService } from '../service/smc.service';
import { RolesGuard } from '../../../core/auth/guard/roles.guard';
import { Roles } from '../../../core/auth/decorators/roles.decorator';
import { UserRole } from '../../../core/types/user-role.enum';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';

@ApiTags('SMC (Metrics & Logs)')
@ApiBearerAuth()
@UseGuards(JwtClaimsGuard, TenantAccessGuard, RolesGuard)
@Controller('tenants/:tenantId/smc')
export class SmcController {
  constructor(private readonly smcService: SmcService) {}

  @Get('dashboard-stats')
  @ApiOperation({ summary: 'Get dashboard stats' })
  getDashboardStats(@Param('tenantId', new ParseUUIDPipe()) tenantId: string) {
    return this.smcService.getDashboardStats(tenantId);
  }

  @Post('dashboard-stats')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Create dashboard stat (Admin Only)' })
  createDashboardStat(
    @Param('tenantId', new ParseUUIDPipe()) tenantId: string,
    @Body() body: CreateDashboardStatDto,
  ) {
    return this.smcService.createDashboardStat(tenantId, body);
  }

  @Get('activity-logs')
  @ApiOperation({ summary: 'Get activity logs' })
  getActivityLogs(@Param('tenantId', new ParseUUIDPipe()) tenantId: string) {
    return this.smcService.getActivityLogs(tenantId);
  }

  @Post('activity-logs')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Create activity log (Admin Only)' })
  createActivityLog(
    @Param('tenantId', new ParseUUIDPipe()) tenantId: string,
    @Body() body: CreateActivityLogDto,
  ) {
    return this.smcService.createActivityLog(tenantId, body);
  }
}
