import { Injectable } from '@nestjs/common';
import {
  CreateActivityLogInput,
  CreateDashboardStatInput,
  SmcRepository,
} from '../repository/smc.repository';

@Injectable()
export class SmcService {
  constructor(private readonly smcRepository: SmcRepository) {}

  getDashboardStats(tenantId: string) {
    return this.smcRepository.getDashboardStats(tenantId);
  }

  createDashboardStat(tenantId: string, payload: CreateDashboardStatInput) {
    return this.smcRepository.createDashboardStat(tenantId, payload);
  }

  getActivityLogs(tenantId: string) {
    return this.smcRepository.getActivityLogs(tenantId);
  }

  createActivityLog(tenantId: string, payload: CreateActivityLogInput) {
    return this.smcRepository.createActivityLog(tenantId, payload);
  }
}
