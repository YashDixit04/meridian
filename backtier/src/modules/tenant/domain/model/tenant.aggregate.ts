import { BadRequestException } from '@nestjs/common';

export interface TenantProps {
  id: string;
  name: string;
  domain?: string;
  status: string;
  tenantCode?: string;
  databaseName?: string;
  collectionPrefix?: string;
  contactEmail?: string;
  contactPhone?: string;
  address?: string;
  website?: string;
  industry?: string;
  country?: string;
  timezone?: string;
  currency?: string;
  profilePhoto?: string;

  // Subscription
  planName?: string;
  planType?: string;
  amountPaid?: string;

  // Plan features
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

  // Quotas & limits
  maxUserCreations?: number;
  maxSubUsers?: number;
  maxStorageGB?: number;
  apiRequestsTier?: string;
  userTypeSelection?: string;
  baseUsersCount?: number;
  totalVendorUsersCount?: number;
  companySpecificCatalogueCount?: number;
  productAvailability?: string;
  specificPorts?: string;
  canViewOtherTenantVendors?: boolean;

  // Admin details
  tenantAdminName?: string;
  tenantAdminEmail?: string;
}

// Fields that ONLY superadmin can modify
const SUPERADMIN_ONLY_FIELDS: Record<string, true> = {
  planName: true,
  planType: true,
  amountPaid: true,
  requisitionManagement: true,
  catalogueServices: true,
  subUsersCreation: true,
  vesselsAdditions: true,
  catalogueManagement: true,
  mealsCreation: true,
  victuallingManagementServices: true,
  activeLogsMapping: true,
  ordersManagement: true,
  invoiceManagement: true,
  maxUserCreations: true,
  maxSubUsers: true,
  maxStorageGB: true,
  apiRequestsTier: true,
  userTypeSelection: true,
  baseUsersCount: true,
  totalVendorUsersCount: true,
  companySpecificCatalogueCount: true,
  productAvailability: true,
  specificPorts: true,
  status: true,
  tenantCode: true,
  domain: true,
  canViewOtherTenantVendors: true,
  databaseName: true,
  collectionPrefix: true,
};

export class TenantAggregate {
  constructor(private readonly props: TenantProps) {}

  get id(): string {
    return this.props.id;
  }

  get name(): string {
    return this.props.name;
  }

  get propsData(): Readonly<TenantProps> {
    return Object.freeze({ ...this.props });
  }

  /**
   * Evaluates if a new user can be created within the tenant's maxUserCreations limits.
   */
  evaluateUserQuota(currentUserCount: number): {
    allowed: boolean;
    limit: number;
    current: number;
    remaining: number;
  } {
    const limit =
      this.props.maxUserCreations && this.props.maxUserCreations > 0
        ? this.props.maxUserCreations
        : this.props.baseUsersCount && this.props.baseUsersCount > 0
        ? this.props.baseUsersCount
        : 50;

    const remaining = Math.max(0, limit - currentUserCount);
    const allowed = currentUserCount < limit;

    return { allowed, limit, current: currentUserCount, remaining };
  }

  assertCanCreateUser(currentUserCount: number): void {
    const quota = this.evaluateUserQuota(currentUserCount);
    if (!quota.allowed) {
      throw new BadRequestException(
        `User creation limit reached for tenant "${this.props.name}". Maximum allowed users: ${quota.limit}, current users: ${currentUserCount}. Please upgrade your subscription plan to add more users.`,
      );
    }
  }

  /**
   * Evaluates if a new sub-user can be created within the tenant's maxSubUsers limits.
   */
  evaluateSubUserQuota(currentSubUserCount: number): {
    allowed: boolean;
    limit: number;
    current: number;
    remaining: number;
  } {
    const limit =
      this.props.maxSubUsers && this.props.maxSubUsers > 0
        ? this.props.maxSubUsers
        : this.props.maxUserCreations && this.props.maxUserCreations > 0
        ? this.props.maxUserCreations
        : 50;

    const remaining = Math.max(0, limit - currentSubUserCount);
    const allowed = currentSubUserCount < limit;

    return { allowed, limit, current: currentSubUserCount, remaining };
  }

  assertCanCreateSubUser(currentSubUserCount: number): void {
    const quota = this.evaluateSubUserQuota(currentSubUserCount);
    if (!quota.allowed) {
      throw new BadRequestException(
        `Sub-user creation limit reached for tenant "${this.props.name}". Maximum allowed sub-users: ${quota.limit}, current sub-users: ${currentSubUserCount}. Please upgrade your subscription plan to add more sub-users.`,
      );
    }
  }

  /**
   * Sanitizes payload based on caller's role.
   * If caller is NOT superadmin, silently strips any subscription, quota, or plan feature edits.
   */
  sanitizeUpdatesForRole(
    actorRoleType: string,
    payload: Record<string, unknown>,
  ): Record<string, unknown> {
    if (actorRoleType === 'superadmin') {
      return payload;
    }

    const sanitized: Record<string, unknown> = {};
    for (const [key, val] of Object.entries(payload)) {
      if (!SUPERADMIN_ONLY_FIELDS[key]) {
        sanitized[key] = val;
      }
    }

    return sanitized;
  }
}
