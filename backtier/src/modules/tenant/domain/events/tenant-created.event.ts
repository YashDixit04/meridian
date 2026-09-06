import { randomUUID } from 'node:crypto';
import { DomainEvent } from '../../../../core/events/domain-event.interface';

export interface TenantAdminCredentials {
  readonly name: string;
  readonly email: string;
  readonly password?: string;
}

export interface TenantQuotas {
  readonly baseUsersCount?: number;
  readonly totalVendorUsersCount?: number;
  readonly maxUserCreations?: number;
  readonly maxSubUsers?: number;
}

export class TenantCreatedEvent implements DomainEvent {
  public static readonly EVENT_NAME = 'tenant.created';
  public readonly eventName = TenantCreatedEvent.EVENT_NAME;
  public readonly occurredOn: Date;
  public readonly eventId: string;

  constructor(
    public readonly tenantId: string,
    public readonly tenantName: string,
    public readonly databaseName: string,
    public readonly adminPayload?: TenantAdminCredentials,
    public readonly planFeatures?: Record<string, boolean | undefined>,
    public readonly quotas?: TenantQuotas,
    public readonly userTypeSelection?: string,
  ) {
    this.occurredOn = new Date();
    this.eventId = randomUUID();
  }
}
