import { Injectable } from '@nestjs/common';
import { ActivityLogRepository } from '../repository/activity-log.repository';

@Injectable()
export class ActivityLogService {
  constructor(private readonly activityLogRepository: ActivityLogRepository) {}

  getActivityLogs(tenantId: string) {
    return this.activityLogRepository.findAllByTenant(tenantId);
  }

  getVendorKycDocuments(tenantId: string) {
    return this.activityLogRepository.getVendorKycDocuments(tenantId);
  }
}
