import { ConflictException, Injectable } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { Document, Filter } from 'mongodb';
import { PaginationQueryDto } from '../../../core/dto/pagination-query.dto';
import { paginate, PaginatedResult } from '../../../core/dto/pagination.helper';
import { MongoDbService } from '../../../core/mongodb/mongodb.service';
import { TenantCollectionService } from '../../../core/mongodb/tenant-collection.service';
import {
  stripMongoId,
  stripMongoIds,
} from '../../../core/mongodb/mongo-document.util';

export interface CreateTenantInput {
  name: string;
  collectionPrefix?: string;
  databaseName?: string;
  domain?: string;
  status?: string;
  tenantCode?: string;
  contactEmail?: string;
  contactPhone?: string;
  website?: string;
  industry?: string;
  country?: string;
  timezone?: string;
  planName?: string;
  planType?: string;
  amountPaid?: string;

  requisitionManagement?: boolean;
  catalogueServices?: boolean;
  subUsersCreation?: boolean;
  vesselsAdditions?: boolean;
  catalogueManagement?: boolean;
  mealsCreation?: boolean;
  victuallingManagementServices?: boolean;
  activeLogsMapping?: boolean;
  ordersManagement?: boolean;
  invoiceManagement?: boolean;

  address?: string;
  currency?: string;
  maxUserCreations?: number;
  maxSubUsers?: number;
  maxStorageGB?: number;
  apiRequestsTier?: string;
  userTypeSelection?: string;
  canViewOtherTenantVendors?: boolean;
  baseUsersCount?: number;
  totalVendorUsersCount?: number;
  companySpecificCatalogueCount?: number;
  productAvailability?: string;
  specificPorts?: string;
  profilePhoto?: string;
  tenantAdminName?: string;
  tenantAdminEmail?: string;
  tenantAdminPassword?: string;
}

export interface UpdateTenantInput extends Partial<CreateTenantInput> {
  status?: string;
}

export interface TenantEntity extends Document, CreateTenantInput {
  id: string;
  status: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserEntity extends Document {
  id: string;
  tenantId: string;
  [key: string]: unknown;
}

export interface SubUserEntity extends Document {
  id: string;
  userId: string;
  [key: string]: unknown;
}

@Injectable()
export class TenantRepository {
  private readonly tenantCollectionName = 'tenants';

  constructor(
    private readonly mongoDbService: MongoDbService,
    private readonly tenantCollectionService: TenantCollectionService,
  ) {}

  async findAll(
    query: PaginationQueryDto,
  ): Promise<PaginatedResult<TenantEntity>> {
    const where = this.buildTenantFilter(query);
    const sortBy = query.sortBy ?? 'createdAt';
    const sortDirection = query.sortOrder === 'asc' ? 1 : -1;

    const [data, total] = await Promise.all([
      this.tenantsCollection()
        .find(where)
        .sort({ [sortBy]: sortDirection })
        .skip(query.skip)
        .limit(query.take)
        .toArray(),
      this.tenantsCollection().countDocuments(where),
    ]);

    return paginate(
      stripMongoIds(data),
      total,
      query.page ?? 1,
      query.limit ?? 20,
    );
  }

  async findById(id: string) {
    return stripMongoId(await this.tenantsCollection().findOne({ id }));
  }

  async findByContactEmail(contactEmail: string) {
    return stripMongoId(
      await this.tenantsCollection().findOne({
        contactEmail,
      }),
    );
  }

  async getTenantUsers(id: string) {
    const usersCollection = await this.usersCollection(id);
    const users = await usersCollection
      .find({})
      .sort({ createdAt: -1 })
      .toArray();

    if (users.length === 0) {
      return [];
    }

    const userIds = users.map((user) => user.id);
    const subUsersCollection = await this.subUsersCollection(id);
    const subUsers = await subUsersCollection
      .find({ userId: { $in: userIds } })
      .sort({ createdAt: -1 })
      .toArray();

    const groupedSubUsers = new Map<string, SubUserEntity[]>();
    for (const subUser of subUsers) {
      const bucket = groupedSubUsers.get(subUser.userId) ?? [];
      bucket.push(subUser);
      groupedSubUsers.set(subUser.userId, bucket);
    }

    return stripMongoIds(users).map((user) => ({
      ...user,
      subUsers: stripMongoIds(groupedSubUsers.get(user.id) ?? []),
    }));
  }

  async countVessels(id: string) {
    const vessels = await this.tenantCollectionService.getCollection(
      id,
      'vessels',
    );
    return vessels.countDocuments({});
  }

  async countCatalogs(id: string) {
    const collection = await this.tenantCollectionService.getCollection(
      id,
      'tenantCatalogues',
    );
    return collection.countDocuments({ type: 'catalog' });
  }

  async countVendors(id: string) {
    const vendors = await this.tenantCollectionService.getCollection(
      id,
      'vendors',
    );
    return vendors.countDocuments({});
  }

  async countOrders(id: string) {
    const orders = await this.tenantCollectionService.getCollection(
      id,
      'requisitionOrders',
    );
    return orders.countDocuments({});
  }

  async create(data: CreateTenantInput) {
    if (data.domain) {
      const existingByDomain = await this.tenantsCollection().findOne({
        domain: data.domain,
      });
      if (existingByDomain) {
        throw new ConflictException(
          'A record with this domain already exists.',
        );
      }
    }

    if (data.databaseName) {
      const existingByDatabaseName = await this.tenantsCollection().findOne({
        databaseName: data.databaseName,
      });
      if (existingByDatabaseName) {
        throw new ConflictException(
          'A record with this tenant name already exists.',
        );
      }
    }

    const now = new Date();
    const tenant = this.removeUndefined({
      id: randomUUID(),
      status: data.status ?? 'Active',
      planName: data.planName ?? 'Enterprise Plan',
      planType: data.planType ?? 'Annual',
      amountPaid: data.amountPaid ?? '$259.00',
      createdAt: now,
      updatedAt: now,
      ...data,
    }) as TenantEntity;

    await this.tenantsCollection().insertOne(tenant);
    return stripMongoId(tenant);
  }

  async update(id: string, data: UpdateTenantInput) {
    if (data.domain) {
      const existingByDomain = await this.tenantsCollection().findOne({
        domain: data.domain,
        id: { $ne: id },
      });

      if (existingByDomain) {
        throw new ConflictException(
          'A record with this domain already exists.',
        );
      }
    }

    const updates = this.removeUndefined(data) as Record<string, unknown>;
    if (Object.keys(updates).length === 0) {
      return this.findById(id);
    }

    await this.tenantsCollection().updateOne(
      { id },
      {
        $set: {
          ...updates,
          updatedAt: new Date(),
        },
      },
    );

    return this.findById(id);
  }

  async delete(id: string) {
    const tenant = await this.findById(id);
    if (!tenant) {
      return null;
    }

    await this.tenantCollectionService.dropTenantCollections({
      id,
      name: tenant.name,
      collectionPrefix: tenant.collectionPrefix,
      databaseName: tenant.databaseName,
    });

    await this.tenantsCollection().deleteOne({ id });
    return tenant;
  }

  syncMongoFields(id: string, fields: Record<string, unknown>) {
    return this.mongoDbService.updateFields(
      this.tenantCollectionName,
      { id },
      fields,
    );
  }

  countTenants() {
    return this.tenantsCollection().countDocuments();
  }

  /** Stamps the `databaseName` field on an existing tenant document. */
  async setDatabaseName(id: string, databaseName: string): Promise<void> {
    await this.tenantsCollection().updateOne(
      { id },
      { $set: { databaseName, updatedAt: new Date() } },
    );
  }

  private buildTenantFilter(query: PaginationQueryDto): Filter<TenantEntity> {
    const trimmedSearch = query.search?.trim();

    if (!trimmedSearch) {
      return { domain: { $ne: 'global.platform' } };
    }

    return {
      domain: { $ne: 'global.platform' },
      $or: [
        { name: { $regex: trimmedSearch, $options: 'i' } },
        { domain: { $regex: trimmedSearch, $options: 'i' } },
      ],
    };
  }

  private tenantsCollection() {
    return this.mongoDbService.collection<TenantEntity>(
      this.tenantCollectionName,
    );
  }

  private async usersCollection(tenantId: string) {
    return this.tenantCollectionService.getCollection<UserEntity>(
      tenantId,
      'users',
    );
  }

  private async subUsersCollection(tenantId: string) {
    return this.tenantCollectionService.getCollection<SubUserEntity>(
      tenantId,
      'subUsers',
    );
  }

  private removeUndefined<T extends object>(input: T): Partial<T> {
    const result: Record<string, unknown> = {};

    for (const [key, value] of Object.entries(
      input as Record<string, unknown>,
    )) {
      if (value !== undefined) {
        result[key] = value;
      }
    }

    return result as Partial<T>;
  }
}
