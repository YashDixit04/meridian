import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Collection, Document } from 'mongodb';
import { MongoDbService } from './mongodb.service';

export type TenantScopedResourceType =
  | 'users'
  | 'subUsers'
  | 'userResourcePermissions'
  | 'vendors'
  | 'vessels'
  | 'catalogueMappings'
  | 'tenantCatalogues'
  | 'requisitionOrders'
  | 'activityLogs'
  | 'dashboardStats';

interface TenantEntity extends Document {
  id: string;
  name?: string;
  collectionPrefix?: string;
  databaseName?: string;
}

export interface TenantCollectionTarget {
  tenantId: string;
  collectionName: string;
  databaseName?: string;
  usesSharedDatabase: boolean;
}

interface TenantStorageTarget {
  tenantId: string;
  collectionPrefix?: string;
  databaseName?: string;
  usesSharedDatabase: boolean;
}

interface UserEntity extends Document {
  id: string;
  email?: string;
  username?: string;
  tenantId: string;
}

interface IndexSpec {
  key: Document;
  options?: {
    unique?: boolean;
    sparse?: boolean;
    name?: string;
  };
}

interface CollectionSpec {
  suffix: string;
  indexes: IndexSpec[];
}

interface EnsureTenantCollectionsOptions {
  includeSubUsers?: boolean;
  includeVendors?: boolean;
  includeVessels?: boolean;
}

export interface EnsureTenantCollectionsResult {
  collectionPrefix?: string;
  databaseName?: string;
  usesSharedDatabase: boolean;
}

const TENANT_SCOPED_COLLECTION_SPECS: Record<
  TenantScopedResourceType,
  CollectionSpec
> = {
  users: {
    suffix: 'users',
    indexes: [
      { key: { id: 1 }, options: { unique: true, name: 'users_id_unique' } },
      {
        key: { email: 1 },
        options: { unique: true, name: 'users_email_unique' },
      },
      {
        key: { username: 1 },
        options: { unique: true, sparse: true, name: 'users_username_unique' },
      },
      { key: { roleType: 1 }, options: { name: 'users_role_type_idx' } },
      { key: { createdAt: -1 }, options: { name: 'users_created_at_idx' } },
    ],
  },
  subUsers: {
    suffix: 'sub_users',
    indexes: [
      {
        key: { id: 1 },
        options: { unique: true, name: 'sub_users_id_unique' },
      },
      { key: { userId: 1 }, options: { name: 'sub_users_user_id_idx' } },
      { key: { createdAt: -1 }, options: { name: 'sub_users_created_at_idx' } },
    ],
  },
  userResourcePermissions: {
    suffix: 'user_resource_permissions',
    indexes: [
      {
        key: { id: 1 },
        options: { unique: true, name: 'user_resource_permissions_id_unique' },
      },
      {
        key: { userId: 1, type: 1 },
        options: { name: 'user_resource_permissions_user_type_idx' },
      },
    ],
  },
  vendors: {
    suffix: 'vendors',
    indexes: [
      { key: { id: 1 }, options: { unique: true, name: 'vendors_id_unique' } },
      {
        key: { 'basicInfo.registrationNumber': 1 },
        options: {
          unique: true,
          sparse: true,
          name: 'vendors_registration_number_unique',
        },
      },
      {
        key: { 'basicInfo.taxId': 1 },
        options: { unique: true, sparse: true, name: 'vendors_tax_id_unique' },
      },
      {
        key: { 'systemFlags.isApproved': 1 },
        options: { name: 'vendors_is_approved_idx' },
      },
      {
        key: { 'systemFlags.isBlacklisted': 1 },
        options: { name: 'vendors_is_blacklisted_idx' },
      },
      {
        key: { 'kyc.kycStatus': 1 },
        options: { name: 'vendors_kyc_status_idx' },
      },
      { key: { createdAt: -1 }, options: { name: 'vendors_created_at_idx' } },
    ],
  },
  vessels: {
    suffix: 'vessels',
    indexes: [
      { key: { id: 1 }, options: { unique: true, name: 'vessels_id_unique' } },
      {
        key: { 'coreInfo.imoNumber': 1 },
        options: { unique: true, sparse: true, name: 'vessels_imo_unique' },
      },
      { key: { createdAt: -1 }, options: { name: 'vessels_created_at_idx' } },
    ],
  },

  catalogueMappings: {
    suffix: 'catalogue_mappings',
    indexes: [
      {
        key: { id: 1 },
        options: { unique: true, name: 'catalogue_mappings_id_unique' },
      },
      {
        key: { offeringId: 1 },
        options: {
          unique: true,
          name: 'catalogue_mappings_offering_id_unique',
        },
      },
      {
        key: { superadminProductId: 1 },
        options: { name: 'catalogue_mappings_superadmin_product_idx' },
      },
      {
        key: { catalogId: 1 },
        options: { name: 'catalogue_mappings_catalog_id_idx' },
      },
      {
        key: { createdAt: -1 },
        options: { name: 'catalogue_mappings_created_at_idx' },
      },
    ],
  },

  tenantCatalogues: {
    suffix: 'tenant_catalogues',
    indexes: [
      {
        key: { id: 1 },
        options: { unique: true, name: 'tenant_catalogues_id_unique' },
      },
      {
        key: { tenantId: 1 },
        options: { name: 'tenant_catalogues_tenant_id_idx' },
      },
      {
        key: { type: 1 },
        options: { name: 'tenant_catalogues_type_idx' },
      },
      {
        key: { catalogId: 1 },
        options: { sparse: true, name: 'tenant_catalogues_catalog_id_idx' },
      },
      {
        key: { superadminProductId: 1 },
        options: {
          sparse: true,
          name: 'tenant_catalogues_superadmin_product_idx',
        },
      },
      {
        key: { productId: 1 },
        options: { sparse: true, name: 'tenant_catalogues_product_id_idx' },
      },
      {
        key: { createdAt: -1 },
        options: { name: 'tenant_catalogues_created_at_idx' },
      },
    ],
  },

  requisitionOrders: {
    suffix: 'requisition_orders',
    indexes: [
      {
        key: { id: 1 },
        options: { unique: true, name: 'requisition_orders_id_unique' },
      },
      {
        key: { orderNumber: 1 },
        options: { unique: true, name: 'requisition_orders_number_unique' },
      },
      {
        key: { createdAt: -1 },
        options: { name: 'requisition_orders_created_at_idx' },
      },
    ],
  },
  activityLogs: {
    suffix: 'activity_logs',
    indexes: [
      {
        key: { id: 1 },
        options: { unique: true, name: 'activity_logs_id_unique' },
      },
      { key: { userId: 1 }, options: { name: 'activity_logs_user_id_idx' } },
      {
        key: { createdAt: -1 },
        options: { name: 'activity_logs_created_at_idx' },
      },
    ],
  },
  dashboardStats: {
    suffix: 'dashboard_stats',
    indexes: [
      {
        key: { id: 1 },
        options: { unique: true, name: 'dashboard_stats_id_unique' },
      },
      {
        key: { createdAt: -1 },
        options: { name: 'dashboard_stats_created_at_idx' },
      },
    ],
  },
};

@Injectable()
export class TenantCollectionService {
  private readonly tenantCollectionName = 'tenants';
  private readonly storageTargetCache = new Map<string, TenantStorageTarget>();

  constructor(private readonly mongoDbService: MongoDbService) {}

  createCollectionPrefix(tenantName: string): string {
    const normalized = tenantName
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '_')
      .replace(/^_+|_+$/g, '')
      .slice(0, 42);

    return normalized.length > 0 ? normalized : 'tenant';
  }

  createDatabaseName(tenantName: string): string {
    const normalized = tenantName.trim();

    if (normalized.length === 0) {
      throw new BadRequestException(
        'Tenant name is required for database selection.',
      );
    }

    this.validateDatabaseName(normalized);
    return normalized;
  }

  buildCollectionName(
    prefix: string,
    resourceType: TenantScopedResourceType,
  ): string {
    return `${prefix}_${TENANT_SCOPED_COLLECTION_SPECS[resourceType].suffix}`;
  }

  async getCollectionPrefix(tenantId: string): Promise<string> {
    const target = await this.getTenantStorageTarget(tenantId);
    if (target.collectionPrefix) {
      return target.collectionPrefix;
    }

    if (target.databaseName) {
      return this.createCollectionPrefix(target.databaseName);
    }

    throw new NotFoundException('Tenant storage target could not be resolved');
  }

  async getCollectionName(
    tenantId: string,
    resourceType: TenantScopedResourceType,
  ): Promise<string> {
    const target = await this.getTenantStorageTarget(tenantId);
    return this.resolveCollectionNameForTarget(target, resourceType);
  }

  async getCollection<TSchema extends Document = Document>(
    tenantId: string,
    resourceType: TenantScopedResourceType,
  ): Promise<Collection<TSchema>> {
    const target = await this.getTenantStorageTarget(tenantId);
    const collectionName = this.resolveCollectionNameForTarget(
      target,
      resourceType,
    );
    return this.collectionForStorageTarget<TSchema>(target, collectionName);
  }

  getCollectionForTarget<TSchema extends Document = Document>(
    target: TenantCollectionTarget,
  ): Collection<TSchema> {
    if (target.usesSharedDatabase) {
      return this.mongoDbService.collection<TSchema>(target.collectionName);
    }

    if (!target.databaseName) {
      throw new NotFoundException(
        'Tenant database name was not resolved for a database-scoped target',
      );
    }

    return this.mongoDbService.collection<TSchema>(
      target.collectionName,
      target.databaseName,
    );
  }

  async ensureTenantCollections(
    tenant: {
      id: string;
      name?: string;
      collectionPrefix?: string;
      databaseName?: string;
    },
    options?: EnsureTenantCollectionsOptions,
  ): Promise<EnsureTenantCollectionsResult> {
    const target = await this.ensureTenantStorageTarget(tenant);

    for (const [resourceType, spec] of Object.entries(
      TENANT_SCOPED_COLLECTION_SPECS,
    ) as Array<[TenantScopedResourceType, CollectionSpec]>) {
      if (resourceType === 'subUsers' && options?.includeSubUsers === false) {
        continue;
      }

      if (resourceType === 'vendors' && options?.includeVendors === false) {
        continue;
      }

      if (resourceType === 'vessels' && options?.includeVessels === false) {
        continue;
      }

      const collectionName = this.resolveCollectionNameForTarget(
        target,
        resourceType,
      );
      await this.mongoDbService.ensureCollection(
        collectionName,
        target.databaseName,
      );

      const collection = this.collectionForStorageTarget(
        target,
        collectionName,
      );
      for (const index of spec.indexes) {
        await collection.createIndex(index.key, index.options);
      }
    }

    return {
      collectionPrefix: target.collectionPrefix,
      databaseName: target.databaseName,
      usesSharedDatabase: target.usesSharedDatabase,
    };
  }

  async dropTenantCollections(tenant: {
    id: string;
    name?: string;
    collectionPrefix?: string;
    databaseName?: string;
  }): Promise<void> {
    const target = await this.resolveTargetForDrop(tenant);

    const dropOperations = (
      Object.keys(TENANT_SCOPED_COLLECTION_SPECS) as TenantScopedResourceType[]
    )
      .map((resourceType) =>
        this.resolveCollectionNameForTarget(target, resourceType),
      )
      .map((collectionName) =>
        this.mongoDbService.dropCollectionIfExists(
          collectionName,
          target.databaseName,
        ),
      );

    await Promise.all(dropOperations);
    this.storageTargetCache.delete(tenant.id);
  }

  async listTenantCollectionTargets(
    resourceType: TenantScopedResourceType,
  ): Promise<TenantCollectionTarget[]> {
    const tenants = await this.tenantsCollection()
      .find(
        {},
        {
          projection: { id: 1, name: 1, collectionPrefix: 1, databaseName: 1 },
        },
      )
      .toArray();

    const targets: TenantCollectionTarget[] = [];

    for (const tenant of tenants) {
      const storageTarget = await this.ensureTenantStorageTarget(tenant);

      targets.push({
        tenantId: tenant.id,
        collectionName: this.resolveCollectionNameForTarget(
          storageTarget,
          resourceType,
        ),
        databaseName: storageTarget.databaseName,
        usesSharedDatabase: storageTarget.usesSharedDatabase,
      });
    }

    return targets;
  }

  async findUserByLogin(
    login: string,
  ): Promise<{ tenantId: string; user: UserEntity } | null> {
    const normalizedLogin = login.trim().toLowerCase();
    const targets = await this.listTenantCollectionTargets('users');

    for (const target of targets) {
      const user = await this.getCollectionForTarget<UserEntity>(
        target,
      ).findOne({
        $or: [{ email: normalizedLogin }, { username: normalizedLogin }],
      });

      if (user) {
        return { tenantId: target.tenantId, user };
      }
    }

    return null;
  }

  async findUserById(
    userId: string,
    tenantIdHint?: string,
  ): Promise<{ tenantId: string; user: UserEntity } | null> {
    if (tenantIdHint) {
      try {
        const hintedCollection = await this.getCollection<UserEntity>(
          tenantIdHint,
          'users',
        );
        const hintedUser = await hintedCollection.findOne({ id: userId });
        if (hintedUser) {
          return { tenantId: tenantIdHint, user: hintedUser };
        }
      } catch (error) {
        // Backward compatibility: legacy/superadmin users can carry tenant hints
        // that are not present in current tenant metadata. In that case, skip hint.
        if (!(error instanceof NotFoundException)) {
          throw error;
        }
      }
    }

    const targets = await this.listTenantCollectionTargets('users');

    for (const target of targets) {
      if (tenantIdHint && target.tenantId === tenantIdHint) {
        continue;
      }

      const user = await this.getCollectionForTarget<UserEntity>(
        target,
      ).findOne({ id: userId });

      if (user) {
        return { tenantId: target.tenantId, user };
      }
    }

    return null;
  }

  private tenantsCollection() {
    return this.mongoDbService.collection<TenantEntity>(
      this.tenantCollectionName,
    );
  }

  private async getTenantStorageTarget(
    tenantId: string,
  ): Promise<TenantStorageTarget> {
    const cached = this.storageTargetCache.get(tenantId);
    if (cached) {
      return cached;
    }

    const tenant = await this.tenantsCollection().findOne(
      { id: tenantId },
      {
        projection: { id: 1, name: 1, collectionPrefix: 1, databaseName: 1 },
      },
    );

    if (!tenant) {
      throw new NotFoundException(
        'Tenant not found while resolving storage target',
      );
    }

    return this.ensureTenantStorageTarget(tenant);
  }

  private async ensureTenantStorageTarget(tenant: {
    id: string;
    name?: string;
    collectionPrefix?: string;
    databaseName?: string;
  }): Promise<TenantStorageTarget> {
    const normalizedDatabaseName = this.normalizeOptionalString(
      tenant.databaseName,
    );
    if (normalizedDatabaseName) {
      // Auto-compact legacy database names that exceed the Atlas 38-byte limit.
      // Existing records may have tenant_<full-uuid-with-hyphens> (43 chars).
      const effectiveDbName = this.compactDatabaseNameIfNeeded(
        normalizedDatabaseName,
        tenant.id,
      );

      this.validateDatabaseName(effectiveDbName);

      // Persist the compacted name if it changed — self-healing migration.
      if (effectiveDbName !== normalizedDatabaseName) {
        await this.tenantsCollection().updateOne(
          { id: tenant.id },
          {
            $set: {
              databaseName: effectiveDbName,
              updatedAt: new Date(),
            },
          },
        );
      } else {
        await this.tenantsCollection().updateOne(
          { id: tenant.id, databaseName: { $exists: false } },
          {
            $set: {
              databaseName: effectiveDbName,
              updatedAt: new Date(),
            },
          },
        );
      }

      // Keep database-scoped tenants clean from legacy shared-db prefix metadata.
      await this.tenantsCollection().updateOne(
        { id: tenant.id, collectionPrefix: { $exists: true } },
        {
          $unset: {
            collectionPrefix: '',
          },
          $set: {
            updatedAt: new Date(),
          },
        },
      );

      const target: TenantStorageTarget = {
        tenantId: tenant.id,
        databaseName: effectiveDbName,
        usesSharedDatabase: false,
      };

      this.storageTargetCache.set(tenant.id, target);
      return target;
    }

    const normalizedPrefix = this.normalizeOptionalString(
      tenant.collectionPrefix,
    );
    if (normalizedPrefix) {
      const target: TenantStorageTarget = {
        tenantId: tenant.id,
        collectionPrefix: normalizedPrefix,
        usesSharedDatabase: true,
      };

      this.storageTargetCache.set(tenant.id, target);
      return target;
    }

    const uniquePrefix = await this.resolveUniquePrefix(
      tenant.id,
      tenant.name ?? tenant.id,
    );

    await this.tenantsCollection().updateOne(
      { id: tenant.id, collectionPrefix: { $exists: false } },
      {
        $set: {
          collectionPrefix: uniquePrefix,
          updatedAt: new Date(),
        },
      },
    );

    const target: TenantStorageTarget = {
      tenantId: tenant.id,
      collectionPrefix: uniquePrefix,
      usesSharedDatabase: true,
    };

    this.storageTargetCache.set(tenant.id, target);
    return target;
  }

  /**
   * Auto-compacts legacy database names that exceed the Atlas 38-byte limit.
   *
   * Legacy format: tenant_<full-uuid-with-hyphens> (43 chars)
   * Compacted:     tenant_<31-hex-chars>           (38 chars)
   *
   * Non-tenant-prefixed names or names already ≤ 38 chars pass through unchanged.
   */
  private compactDatabaseNameIfNeeded(
    databaseName: string,
    tenantId: string,
  ): string {
    if (databaseName.length <= 38) {
      return databaseName;
    }

    // Compact using the tenantId (strip hyphens, take 31 hex chars).
    const compactId = tenantId.replace(/-/g, '').slice(0, 31);
    return `tenant_${compactId}`;
  }

  private resolveCollectionNameForTarget(
    target: TenantStorageTarget,
    resourceType: TenantScopedResourceType,
  ): string {
    if (target.usesSharedDatabase) {
      const prefix =
        target.collectionPrefix ?? this.createCollectionPrefix(target.tenantId);
      return this.buildCollectionName(prefix, resourceType);
    }

    return TENANT_SCOPED_COLLECTION_SPECS[resourceType].suffix;
  }

  private collectionForStorageTarget<TSchema extends Document = Document>(
    target: TenantStorageTarget,
    collectionName: string,
  ): Collection<TSchema> {
    if (target.usesSharedDatabase || !target.databaseName) {
      return this.mongoDbService.collection<TSchema>(collectionName);
    }

    return this.mongoDbService.collection<TSchema>(
      collectionName,
      target.databaseName,
    );
  }

  private async resolveTargetForDrop(tenant: {
    id: string;
    name?: string;
    collectionPrefix?: string;
    databaseName?: string;
  }): Promise<TenantStorageTarget> {
    const hasExplicitStorage =
      this.normalizeOptionalString(tenant.databaseName) ||
      this.normalizeOptionalString(tenant.collectionPrefix);

    if (hasExplicitStorage) {
      return this.ensureTenantStorageTarget(tenant);
    }

    try {
      return await this.getTenantStorageTarget(tenant.id);
    } catch (error) {
      if (!(error instanceof NotFoundException)) {
        throw error;
      }

      return {
        tenantId: tenant.id,
        collectionPrefix: this.createCollectionPrefix(tenant.name ?? tenant.id),
        usesSharedDatabase: true,
      };
    }
  }

  private normalizeOptionalString(
    value: string | undefined,
  ): string | undefined {
    if (typeof value !== 'string') {
      return undefined;
    }

    const trimmed = value.trim();
    return trimmed.length > 0 ? trimmed : undefined;
  }

  private validateDatabaseName(databaseName: string): void {
    // MongoDB Atlas enforces a 38-byte maximum (stricter than the standard 64-byte MongoDB limit).
    if (databaseName.length > 38) {
      throw new BadRequestException(
        `Database name "${databaseName}" is too long (${databaseName.length} bytes). MongoDB Atlas limit is 38 bytes.`,
      );
    }

    if (/[\/\\\.\x00"\$\*<>:\|\?]/.test(databaseName)) {
      throw new BadRequestException(
        'Tenant name contains characters that are not allowed for MongoDB database names.',
      );
    }
  }

  private async resolveUniquePrefix(
    tenantId: string,
    tenantName: string,
  ): Promise<string> {
    const basePrefix = this.createCollectionPrefix(tenantName);

    const existing = await this.tenantsCollection().findOne(
      {
        id: { $ne: tenantId },
        collectionPrefix: basePrefix,
      },
      { projection: { id: 1 } },
    );

    if (!existing) {
      return basePrefix;
    }

    const stableSuffix = tenantId.replace(/-/g, '').slice(0, 6);
    return `${basePrefix}_${stableSuffix}`;
  }
}
