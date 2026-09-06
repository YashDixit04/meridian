import { Module } from '@nestjs/common';
import { TenantController } from './controller/tenant.controller';
import { ActivityLogController } from './controller/activity-log.controller';
import { TenantRepository } from './repository/tenant.repository';
import { ActivityLogRepository } from './repository/activity-log.repository';
import { TenantService } from './service/tenant.service';
import { ActivityLogService } from './service/activity-log.service';
import { TenantAdminProvisioningHandler } from './application/handlers/tenant-admin-provisioning.handler';

@Module({
  controllers: [TenantController, ActivityLogController],
  providers: [
    TenantService,
    TenantRepository,
    ActivityLogService,
    ActivityLogRepository,
    TenantAdminProvisioningHandler,
  ],
  exports: [TenantService],
})
export class TenantModule {}
