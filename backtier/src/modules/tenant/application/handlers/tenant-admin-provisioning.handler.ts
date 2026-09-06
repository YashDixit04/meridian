import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import * as bcrypt from 'bcrypt';
import { EventBus } from '../../../../core/events/event-bus.service';
import { TenantCreatedEvent } from '../../domain/events/tenant-created.event';
import { MongoDbService } from '../../../../core/mongodb/mongodb.service';
import { TenantCollectionService } from '../../../../core/mongodb/tenant-collection.service';
import { UserRole } from '../../../../core/types/user-role.enum';

@Injectable()
export class TenantAdminProvisioningHandler implements OnModuleInit {
  private readonly logger = new Logger(TenantAdminProvisioningHandler.name);

  constructor(
    private readonly eventBus: EventBus,
    private readonly mongoDbService: MongoDbService,
    private readonly tenantCollectionService: TenantCollectionService,
  ) {}

  onModuleInit() {
    this.eventBus.subscribe<TenantCreatedEvent>(
      TenantCreatedEvent.EVENT_NAME,
      (event) => this.handle(event),
    );
    this.logger.log('Subscribed to TenantCreatedEvent for admin provisioning.');
  }

  async handle(event: TenantCreatedEvent): Promise<void> {
    if (!event.adminPayload?.email) {
      this.logger.log(
        `TenantCreatedEvent [${event.tenantId}] had no admin email specified. Skipping admin user creation.`,
      );
      return;
    }

    const email = event.adminPayload.email.trim().toLowerCase();
    const username = (
      event.adminPayload.name || email.split('@')[0]
    )
      .trim()
      .toLowerCase();
    const rawPassword = event.adminPayload.password || 'tenant123';
    const passwordHash = await bcrypt.hash(rawPassword, 10);
    const userId = randomUUID();
    const now = new Date();

    // Compute accessible pages according to plan features
    const pf = event.planFeatures ?? {};
    const pages: string[] = [
      'dashboard',
      'tenantDetails',
      'tenantDocuments',
      'cart',
    ];

    if (pf.subUsersCreation !== false) pages.push('tenantSubUsers');
    if (pf.vesselsAdditions !== false) pages.push('tenantVessels');
    if (pf.requisitionManagement !== false || pf.ordersManagement !== false) {
      pages.push('tenantOrders');
    }
    if (pf.catalogueServices !== false || pf.catalogueManagement !== false) {
      pages.push('tenantCatalogue', 'addProduct');
    }
    if (pf.activeLogsMapping !== false) pages.push('tenantActivityLogs');

    const userType = (event.userTypeSelection || '').toLowerCase();
    if (userType.includes('vendor') || !userType) {
      pages.push('tenantVendors');
    }

    const permissions = {
      pages,
      fields: {
        vendorTable: [
          'companyName',
          'email',
          'companyType',
          'kycStatus',
          'serviceType',
          'approvalStatus',
        ],
        vesselTable: ['name', 'type', 'status', 'capacity'],
        orderTable: ['orderId', 'date', 'status', 'amount'],
        catalogueTable: ['productName', 'category', 'price', 'stock'],
        dashboard: ['activeUsers', 'tenants', 'revenue'],
        subUsersTable: ['name', 'email', 'role', 'department', 'status'],
      },
    };

    const userDoc = {
      id: userId,
      email,
      username,
      firstName: event.adminPayload.name || event.tenantName,
      lastName: 'Admin',
      role: UserRole.ADMIN,
      roleType: 'tenantadmin',
      passwordHash,
      tenantId: event.tenantId,
      department: 'Management',
      vesselAssigned: false,
      assignedVesselIds: [],
      permissions,
      createdAt: now,
      updatedAt: now,
    };

    // 1. Insert into the tenant's own database (scoped storage)
    try {
      const tenantUsers = await this.tenantCollectionService.getCollection(
        event.tenantId,
        'users',
      );
      await tenantUsers.updateOne(
        { email },
        { $setOnInsert: userDoc },
        { upsert: true },
      );
      this.logger.log(
        `Provisioned Tenant Admin user [${email}] in tenant storage (${event.tenantId}).`,
      );
    } catch (err) {
      this.logger.warn(
        `Could not write to tenant storage for ${event.tenantId}: ${err instanceof Error ? err.message : String(err)}`,
      );
    }

  }
}
