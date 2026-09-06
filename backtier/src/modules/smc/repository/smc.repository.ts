import { Injectable } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { Document } from 'mongodb';
import { MongoDbService } from '../../../core/mongodb/mongodb.service';
import { TenantCollectionService } from '../../../core/mongodb/tenant-collection.service';
import {
  stripMongoId,
  stripMongoIds,
} from '../../../core/mongodb/mongo-document.util';

export interface CreateDashboardStatInput {
  metricName: string;
  value: number;
}

export interface CreateActivityLogInput {
  action: string;
  description?: string;
  userId?: string;
}

export interface DashboardStatEntity extends Document {
  id: string;
  metricName: string;
  value: number;
  tenantId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ActivityLogEntity extends Document {
  id: string;
  action: string;
  description?: string;
  tenantId: string;
  userId?: string;
  createdAt: Date;
}

@Injectable()
export class SmcRepository {
  constructor(
    private readonly mongoDbService: MongoDbService,
    private readonly tenantCollectionService: TenantCollectionService,
  ) {}

  async getDashboardStats(tenantId: string) {
    const dashboardStatsCollection =
      await this.dashboardStatsCollection(tenantId);
    const stats = await dashboardStatsCollection
      .find({ tenantId })
      .sort({ createdAt: -1 })
      .toArray();

    return stripMongoIds(stats);
  }

  async createDashboardStat(
    tenantId: string,
    payload: CreateDashboardStatInput,
  ) {
    const now = new Date();
    const stat: DashboardStatEntity = {
      id: randomUUID(),
      tenantId,
      metricName: payload.metricName,
      value: payload.value,
      createdAt: now,
      updatedAt: now,
    };

    const dashboardStatsCollection =
      await this.dashboardStatsCollection(tenantId);
    await dashboardStatsCollection.insertOne(stat);
    return stripMongoId(stat);
  }

  async getActivityLogs(tenantId: string) {
    const activityLogsCollection = await this.activityLogsCollection(tenantId);
    const logs = await activityLogsCollection
      .find({ tenantId })
      .sort({ createdAt: -1 })
      .toArray();

    return stripMongoIds(logs);
  }

  async createActivityLog(tenantId: string, payload: CreateActivityLogInput) {
    const log: ActivityLogEntity = {
      id: randomUUID(),
      tenantId,
      action: payload.action,
      description: payload.description,
      userId: payload.userId,
      createdAt: new Date(),
    };

    const activityLogsCollection = await this.activityLogsCollection(tenantId);
    await activityLogsCollection.insertOne(log);
    return stripMongoId(log);
  }

  private async dashboardStatsCollection(tenantId: string) {
    return this.tenantCollectionService.getCollection<DashboardStatEntity>(
      tenantId,
      'dashboardStats',
    );
  }

  private async activityLogsCollection(tenantId: string) {
    return this.tenantCollectionService.getCollection<ActivityLogEntity>(
      tenantId,
      'activityLogs',
    );
  }
}
