import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import {
  CreateTenantInput,
  TenantRepository,
  UpdateTenantInput,
} from '../repository/tenant.repository';
import { PaginationQueryDto } from '../../../core/dto/pagination-query.dto';
import { TenantCollectionService } from '../../../core/mongodb/tenant-collection.service';
import { TenantCacheService } from '../../../core/mongodb/tenant-cache.service';
import { MongoDbService } from '../../../core/mongodb/mongodb.service';
import { UpdateTenantSettingsDto } from '../dto/tenant-settings.dto';
import { TenantTransformer } from '../tenant.transformer';
import { EventBus } from '../../../core/events/event-bus.service';
import { TenantCreatedEvent } from '../domain/events/tenant-created.event';
import { TenantAggregate, TenantProps } from '../domain/model/tenant.aggregate';

@Injectable()
export class TenantService {
  constructor(
    private readonly tenantRepository: TenantRepository,
    private readonly tenantCollectionService: TenantCollectionService,
    private readonly tenantCacheService: TenantCacheService,
    private readonly eventBus: EventBus,
    private readonly mongoDbService: MongoDbService,
  ) {}
  private normalizeOptionalString(
    value: string | undefined,
  ): string | undefined {
    if (typeof value !== 'string') {
      return undefined;
    }

    const trimmed = value.trim();
    return trimmed.length > 0 ? trimmed : undefined;
  }

  private sanitizeTenantPayload<
    T extends CreateTenantInput | UpdateTenantInput,
  >(payload: T): T {
    const sanitized: T = { ...payload };

    if ('domain' in sanitized) {
      sanitized.domain = this.normalizeOptionalString(sanitized.domain);
    }

    if ('profilePhoto' in sanitized) {
      const photo = this.normalizeOptionalString(sanitized.profilePhoto);
      sanitized.profilePhoto =
        photo && !photo.startsWith('blob:') ? photo : undefined;
    }

    if ('contactEmail' in sanitized) {
      const contactEmail = this.normalizeOptionalString(sanitized.contactEmail);
      sanitized.contactEmail = contactEmail
        ? contactEmail.toLowerCase()
        : undefined;
    }

    return sanitized;
  }

  private shouldProvisionVendorCollection(userTypeSelection?: string): boolean {
    if (typeof userTypeSelection !== 'string') {
      return true;
    }

    return userTypeSelection.toLowerCase().includes('vendor');
  }

  private shouldProvisionVesselCollection(userTypeSelection?: string): boolean {
    if (typeof userTypeSelection !== 'string') {
      return true;
    }

    const normalized = userTypeSelection.toLowerCase();
    return normalized.includes('smc');
  }

  getTenants(query: PaginationQueryDto) {
    return this.tenantRepository.findAll(query);
  }

  async findTenantByContactEmail(contactEmail: string) {
    const normalizedEmail =
      this.normalizeOptionalString(contactEmail)?.toLowerCase();
    if (!normalizedEmail) {
      return null;
    }

    return this.tenantRepository.findByContactEmail(normalizedEmail);
  }

  async getTenantById(id: string) {
    const tenant = await this.tenantRepository.findById(id);
    if (!tenant) {
      throw new NotFoundException('Tenant not found');
    }
    return tenant;
  }

  async getTenantDetails(id: string) {
    const tenant = await this.tenantRepository.findById(id);
    if (!tenant) {
      throw new NotFoundException('Tenant not found');
    }

    // We fetch aggregate counts to mimic the comprehensive mocked data structure
    const users = await this.tenantRepository.getTenantUsers(id);
    const vesselsCount = await this.tenantRepository.countVessels(id);
    const vendorsCount = await this.tenantRepository.countVendors(id);
    const catalogsCount = await this.tenantRepository.countCatalogs(id);
    const ordersCount = await this.tenantRepository.countOrders(id);

    return {
      tenantInformation: {
        tenantName: tenant.name,
        tenantCode:
          tenant.tenantCode || tenant.id.substring(0, 8).toUpperCase(),
        domain: tenant.domain,
        createdAt: tenant.createdAt,
        status: tenant.status,
        contactEmail: tenant.contactEmail,
        contactPhone: tenant.contactPhone,
        website: tenant.website,
        industry: tenant.industry,
        country: tenant.country,
        timezone: tenant.timezone,
        address: tenant.address,
        currency: tenant.currency,
        profilePhoto: tenant.profilePhoto,
      },
      subscription: {
        planName: tenant.planName,
        planType: tenant.planType,
        amountPaid: tenant.amountPaid,
      },
      planFeatures: {
        requisitionManagement: tenant.requisitionManagement,
        catalogueServices: tenant.catalogueServices,
        subUsersCreation: tenant.subUsersCreation,
        vesselsAdditions: tenant.vesselsAdditions,
        catalogueManagement: tenant.catalogueManagement,
        mealsCreation: tenant.mealsCreation,
        victuallingManagementServices: tenant.victuallingManagementServices,
        activeLogsMapping: tenant.activeLogsMapping,
        ordersManagement: tenant.ordersManagement,
        invoiceManagement: tenant.invoiceManagement,
        maxUserCreations: tenant.maxUserCreations,
        maxSubUsers: tenant.maxSubUsers,
        maxStorageGB: tenant.maxStorageGB,
        apiRequestsTier: tenant.apiRequestsTier,
      },
      userConfigurations: {
        tenantAdminName: tenant.tenantAdminName || 'Admin',
        tenantAdminEmail: tenant.tenantAdminEmail || tenant.contactEmail || '',
        tenantAdminRole: 'Admin',
        userTypeSelection: tenant.userTypeSelection,
        baseUsersCount: tenant.baseUsersCount ?? 4,
        totalVendorUsersCount: tenant.totalVendorUsersCount ?? 4,
      },
      catalogueSettings: {
        companySpecificCatalogueCount: tenant.companySpecificCatalogueCount,
        productAvailability: tenant.productAvailability,
        specificPorts: tenant.specificPorts,
      },
      usersList: users,
      usersCount: users.length,
      vesselsCount,
      vendorsCount,
      catalogsCount,
      ordersCount,
      canViewOtherTenantVendors: tenant.canViewOtherTenantVendors,
    };
  }

  async createTenant(payload: CreateTenantInput) {
    const sanitizedPayload = this.sanitizeTenantPayload(payload);
    delete sanitizedPayload.collectionPrefix;
    delete sanitizedPayload.databaseName;

    const normalizedName = this.normalizeOptionalString(sanitizedPayload.name);

    if (!normalizedName) {
      throw new BadRequestException('Tenant name is required.');
    }

    sanitizedPayload.name = normalizedName;

    if (!sanitizedPayload.tenantCode) {
      const count = await this.tenantRepository.countTenants();
      const codeNumber = (count + 1).toString().padStart(4, '0');
      sanitizedPayload.tenantCode = `SKSTEN${codeNumber}`;
    }

    const adminPassword = sanitizedPayload.tenantAdminPassword;
    delete sanitizedPayload.tenantAdminPassword;

    if (!sanitizedPayload.tenantAdminEmail && sanitizedPayload.contactEmail) {
      sanitizedPayload.tenantAdminEmail = sanitizedPayload.contactEmail;
    }

    if (!sanitizedPayload.tenantAdminName) {
      sanitizedPayload.tenantAdminName = `${sanitizedPayload.name} Admin`;
    }

    // Create the tenant record first to obtain its UUID.
    const createdTenant = await this.tenantRepository.create(sanitizedPayload);
    if (!createdTenant) {
      throw new BadRequestException('Failed to create tenant.');
    }

    const compactId = createdTenant.id.replace(/-/g, '').slice(0, 31);
    const specDbName = `tenant_${compactId}`;
    await this.tenantRepository.setDatabaseName(createdTenant.id, specDbName);

    const tenantWithDb = { ...createdTenant, databaseName: specDbName };

    // Invalidate cached metadata
    await this.tenantCacheService.invalidate(tenantWithDb.id);

    // Publish Domain Event: TenantCreatedEvent (triggers DB provisioning and Admin user creation)
    await this.eventBus.publish(
      new TenantCreatedEvent(
        tenantWithDb.id,
        tenantWithDb.name,
        specDbName,
        sanitizedPayload.tenantAdminEmail
          ? {
              name: sanitizedPayload.tenantAdminName || `${tenantWithDb.name} Admin`,
              email: sanitizedPayload.tenantAdminEmail,
              password: adminPassword,
            }
          : undefined,
        {
          requisitionManagement: tenantWithDb.requisitionManagement,
          catalogueServices: tenantWithDb.catalogueServices,
          subUsersCreation: tenantWithDb.subUsersCreation,
          vesselsAdditions: tenantWithDb.vesselsAdditions,
          catalogueManagement: tenantWithDb.catalogueManagement,
          mealsCreation: tenantWithDb.mealsCreation,
          victuallingManagementServices: tenantWithDb.victuallingManagementServices,
          activeLogsMapping: tenantWithDb.activeLogsMapping,
          ordersManagement: tenantWithDb.ordersManagement,
          invoiceManagement: tenantWithDb.invoiceManagement,
        },
        {
          baseUsersCount: tenantWithDb.baseUsersCount,
          totalVendorUsersCount: tenantWithDb.totalVendorUsersCount,
          maxUserCreations: tenantWithDb.maxUserCreations,
          maxSubUsers: tenantWithDb.maxSubUsers,
        },
        tenantWithDb.userTypeSelection,
      ),
    );

    return tenantWithDb;
  }

  async updateTenant(
    id: string,
    payload: UpdateTenantInput,
    actorRoleType?: string,
  ) {
    const currentTenant = await this.getTenantById(id);
    let sanitizedPayload = this.sanitizeTenantPayload(payload);
    delete sanitizedPayload.collectionPrefix;
    delete sanitizedPayload.databaseName;

    // Enforce role-based field restrictions via Domain Aggregate Root
    if (actorRoleType && actorRoleType !== 'superadmin') {
      const aggregate = new TenantAggregate(currentTenant as unknown as TenantProps);
      sanitizedPayload = aggregate.sanitizeUpdatesForRole(
        actorRoleType,
        sanitizedPayload as Record<string, unknown>,
      ) as UpdateTenantInput;
    }

    // Handle tenant admin password change if requested
    if (payload.tenantAdminPassword && payload.tenantAdminPassword.length >= 6) {
      const newPasswordHash = await bcrypt.hash(payload.tenantAdminPassword, 10);
      const now = new Date();

      // Update password in tenant storage
      try {
        const tenantUsers = await this.tenantCollectionService.getCollection(id, 'users');
        await tenantUsers.updateMany(
          { roleType: 'tenantadmin' },
          { $set: { passwordHash: newPasswordHash, updatedAt: now } },
        );
      } catch (err) {
        // Continue if collection not created yet
      }


      delete sanitizedPayload.tenantAdminPassword;
    }

    if ('name' in sanitizedPayload) {
      sanitizedPayload.name = this.normalizeOptionalString(
        sanitizedPayload.name,
      );
    }

    const updatedTenant = await this.tenantRepository.update(
      id,
      sanitizedPayload,
    );

    if (!updatedTenant) {
      return updatedTenant;
    }

    if (
      Object.prototype.hasOwnProperty.call(
        sanitizedPayload,
        'userTypeSelection',
      )
    ) {
      await this.tenantCollectionService.ensureTenantCollections(
        {
          id: updatedTenant.id,
          name: updatedTenant.name ?? currentTenant.name,
          collectionPrefix:
            updatedTenant.collectionPrefix ?? currentTenant.collectionPrefix,
          databaseName:
            updatedTenant.databaseName ?? currentTenant.databaseName,
        },
        {
          includeSubUsers: false,
          includeVendors: this.shouldProvisionVendorCollection(
            updatedTenant.userTypeSelection,
          ),
          includeVessels: this.shouldProvisionVesselCollection(
            updatedTenant.userTypeSelection,
          ),
        },
      );
    }

    return updatedTenant;
  }


  async updateTenantMongoFields(id: string, fields: Record<string, unknown>) {
    await this.getTenantById(id);
    const result = await this.tenantRepository.syncMongoFields(id, fields);

    return {
      tenantId: id,
      matchedCount: result?.matchedCount ?? 0,
      modifiedCount: result?.modifiedCount ?? 0,
      upsertedId: result?.upsertedId ?? null,
    };
  }

  async deleteTenant(id: string) {
    await this.getTenantById(id);
    const result = await this.tenantRepository.delete(id);
    // Remove from cache on delete.
    await this.tenantCacheService.invalidate(id);
    return result;
  }

  async getTenantSettings(id: string) {
    const tenant = await this.getTenantById(id);
    return TenantTransformer.toSettingsDTO(tenant);
  }

  async updateTenantSettings(id: string, settings: UpdateTenantSettingsDto) {
    const tenant = await this.getTenantById(id);

    if (settings.canViewOtherTenantVendors === true) {
      const userTypeSelection = (tenant.userTypeSelection || '').toLowerCase();
      if (!userTypeSelection.includes('smc') || !userTypeSelection.includes('vendor')) {
        throw new BadRequestException(
          'Cross-tenant vendor visibility can only be enabled for multi-tenant (smc+vendor) accounts.',
        );
      }
    }

    await this.tenantRepository.update(id, {
      canViewOtherTenantVendors: settings.canViewOtherTenantVendors,
    });

    const updatedTenant = await this.getTenantById(id);
    return TenantTransformer.toSettingsDTO(updatedTenant);
  }
}
