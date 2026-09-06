import { Injectable } from '@nestjs/common';
import { Document } from 'mongodb';
import { MongoDbService } from '../../../core/mongodb/mongodb.service';
import { TenantCollectionService } from '../../../core/mongodb/tenant-collection.service';
import {
  stripMongoId,
  stripMongoIds,
} from '../../../core/mongodb/mongo-document.util';

export interface ActivityLogEntity extends Document {
  id: string;
  action: string;
  description?: string;
  tenantId: string;
  userId?: string;
  createdAt: Date;
}

export interface UserEntity extends Document {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
}

interface VendorEntity extends Document {
  id: string;
  name?: string;
  tenantId: string;
  basicInfo?: {
    companyName?: string;
  };
  kyc?: {
    kycStatus?: string;
    documents?: Record<string, string | undefined>;
  };
  createdAt?: Date | string;
  updatedAt?: Date | string;
}

export interface VendorKycDocumentRecord {
  id: string;
  tenantId: string;
  vendorId: string;
  vendorName: string;
  documentType: string;
  documentValue: string;
  kycStatus: string;
  uploadedAt: string;
}

@Injectable()
export class ActivityLogRepository {
  constructor(
    private readonly mongoDbService: MongoDbService,
    private readonly tenantCollectionService: TenantCollectionService,
  ) {}

  async findAllByTenant(tenantId: string) {
    const activityLogsCollection = await this.activityLogsCollection(tenantId);
    const usersCollection = await this.usersCollection(tenantId);

    const logs = await activityLogsCollection
      .find({ tenantId })
      .sort({ createdAt: -1 })
      .limit(100)
      .toArray();

    if (logs.length === 0) {
      return [];
    }

    const userIds = logs
      .map((log) => log.userId)
      .filter((userId): userId is string => typeof userId === 'string');

    const users =
      userIds.length > 0
        ? await usersCollection.find({ id: { $in: userIds } }).toArray()
        : [];

    const userMap = new Map(
      stripMongoIds(users).map((user) => [user.id, user]),
    );

    return stripMongoIds(logs).map((log) => ({
      ...log,
      user: log.userId ? (userMap.get(log.userId) ?? null) : null,
    }));
  }

  async getVendorKycDocuments(
    tenantId: string,
  ): Promise<VendorKycDocumentRecord[]> {
    const vendorsCollection = await this.vendorsCollection(tenantId);
    const vendors = await vendorsCollection
      .find({ tenantId })
      .sort({ updatedAt: -1, createdAt: -1 })
      .toArray();

    const records: VendorKycDocumentRecord[] = [];

    for (const vendor of stripMongoIds(vendors)) {
      const docs = vendor.kyc?.documents;
      if (!docs || typeof docs !== 'object') {
        continue;
      }

      for (const [documentType, rawValue] of Object.entries(docs)) {
        if (typeof rawValue !== 'string' || rawValue.trim().length === 0) {
          continue;
        }

        const timestamp = vendor.updatedAt ?? vendor.createdAt;
        const uploadedAt =
          timestamp instanceof Date
            ? timestamp.toISOString()
            : typeof timestamp === 'string' && timestamp.trim().length > 0
              ? timestamp
              : new Date().toISOString();

        records.push({
          id: `${vendor.id}:${documentType}`,
          tenantId,
          vendorId: vendor.id,
          vendorName:
            vendor.basicInfo?.companyName || vendor.name || 'Unknown Vendor',
          documentType,
          documentValue: rawValue,
          kycStatus: vendor.kyc?.kycStatus || 'Pending',
          uploadedAt,
        });
      }
    }

    return records;
  }

  private async activityLogsCollection(tenantId: string) {
    return this.tenantCollectionService.getCollection<ActivityLogEntity>(
      tenantId,
      'activityLogs',
    );
  }

  private async usersCollection(tenantId: string) {
    return this.tenantCollectionService.getCollection<UserEntity>(
      tenantId,
      'users',
    );
  }

  private async vendorsCollection(tenantId: string) {
    return this.tenantCollectionService.getCollection<VendorEntity>(
      tenantId,
      'vendors',
    );
  }
}
