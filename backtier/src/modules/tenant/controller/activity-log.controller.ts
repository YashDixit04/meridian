import {
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  UseGuards,
} from '@nestjs/common';
import { JwtClaimsGuard } from '../../../core/auth/guard/jwt-claims.guard';
import { TenantAccessGuard } from '../../../core/auth/guard/tenant-access.guard';
import { ActivityLogService } from '../service/activity-log.service';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';

@ApiTags('Activity Logs')
@ApiBearerAuth()
@UseGuards(JwtClaimsGuard, TenantAccessGuard)
@Controller('tenants/:tenantId/activity-logs')
export class ActivityLogController {
  constructor(private readonly activityLogService: ActivityLogService) {}

  @Get()
  @ApiOperation({ summary: 'Get activity logs for a tenant' })
  getActivityLogs(@Param('tenantId', new ParseUUIDPipe()) tenantId: string) {
    return this.activityLogService.getActivityLogs(tenantId);
  }

  @Get('vendor-kyc-documents')
  @ApiOperation({ summary: 'Get vendor KYC documents for a tenant' })
  getVendorKycDocuments(
    @Param('tenantId', new ParseUUIDPipe()) tenantId: string,
  ) {
    return this.activityLogService.getVendorKycDocuments(tenantId);
  }
}
