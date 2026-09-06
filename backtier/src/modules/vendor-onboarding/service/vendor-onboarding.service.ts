import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateTenantInput } from '../../tenant/repository/tenant.repository';
import { TenantService } from '../../tenant/service/tenant.service';
import { VendorService } from '../../vendor/service/vendor.service';
import {
  PUBLIC_TENANT_USER_TYPE_SELECTIONS,
  PublicVendorRegistrationDto,
} from '../dto/public-vendor-registration.dto';
import { VendorApprovalNotificationPayload } from './vendor-onboarding-notification.service';
import {
  VendorApprovalNotificationDispatchResult,
  VendorOnboardingNotificationQueueService,
} from './vendor-onboarding-notification-queue.service';

interface ResolvedTenantContext {
  tenantId: string;
  tenantLinkedByEmail: boolean;
  tenantCreated: boolean;
  tenantContactEmail?: string;
}

@Injectable()
export class VendorOnboardingService {
  private readonly approvalRecipientEmail = 'aksyashdixit@gmail.com';

  constructor(
    private readonly tenantService: TenantService,
    private readonly vendorService: VendorService,
    private readonly notificationQueueService: VendorOnboardingNotificationQueueService,
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

  private createTenantDomainSeed(name: string): string {
    const slug = name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 30);

    const suffix = Date.now().toString().slice(-6);
    return `vendor-${slug || 'workspace'}-${suffix}.local`;
  }

  private resolveTenantUserTypeSelection(
    selection: string | undefined,
  ): string {
    if (
      typeof selection === 'string' &&
      PUBLIC_TENANT_USER_TYPE_SELECTIONS.includes(
        selection as (typeof PUBLIC_TENANT_USER_TYPE_SELECTIONS)[number],
      )
    ) {
      return selection;
    }

    return 'Vendor Users only';
  }

  private buildAutoProvisionTenantPayload(
    dto: PublicVendorRegistrationDto,
  ): CreateTenantInput {
    const companyName = this.normalizeOptionalString(
      dto.vendor.basicInfo.companyName,
    );
    const legalName = this.normalizeOptionalString(
      dto.vendor.basicInfo.legalName,
    );
    const tenantName = companyName || legalName || 'Vendor Workspace';

    return {
      name: `${tenantName} Workspace`,
      contactEmail: dto.vendor.basicInfo.email,
      contactPhone: this.normalizeOptionalString(dto.vendor.basicInfo.phone),
      domain: this.createTenantDomainSeed(tenantName),
      status: 'Active',
      userTypeSelection: this.resolveTenantUserTypeSelection(
        dto.tenantUserTypeSelection,
      ),
      planName: 'Vendor Onboarding',
      planType: 'Custom',
      amountPaid: '$0.00',
    };
  }

  private async resolveTenantContext(
    dto: PublicVendorRegistrationDto,
  ): Promise<ResolvedTenantContext> {
    const tenantContactEmail = this.normalizeOptionalString(
      dto.tenantContactEmail,
    )?.toLowerCase();

    if (tenantContactEmail) {
      const linkedTenant =
        await this.tenantService.findTenantByContactEmail(tenantContactEmail);
      if (!linkedTenant) {
        throw new BadRequestException(
          'No tenant was found for the provided tenant contact email.',
        );
      }

      return {
        tenantId: linkedTenant.id,
        tenantLinkedByEmail: true,
        tenantCreated: false,
        tenantContactEmail,
      };
    }

    const createdTenant = await this.tenantService.createTenant(
      this.buildAutoProvisionTenantPayload(dto),
    );

    return {
      tenantId: createdTenant.id,
      tenantLinkedByEmail: false,
      tenantCreated: true,
      tenantContactEmail: createdTenant.contactEmail,
    };
  }

  private buildNotificationPayload(
    dto: PublicVendorRegistrationDto,
    tenantContext: ResolvedTenantContext,
  ): VendorApprovalNotificationPayload {
    return {
      approvalRecipientEmail: this.approvalRecipientEmail,
      vendorName: dto.vendor.basicInfo.companyName,
      vendorEmail: dto.vendor.basicInfo.email,
      tenantId: tenantContext.tenantId,
      tenantLinkedByEmail: tenantContext.tenantLinkedByEmail,
      tenantCreated: tenantContext.tenantCreated,
    };
  }

  async registerVendor(dto: PublicVendorRegistrationDto) {
    const tenantContext = await this.resolveTenantContext(dto);

    const createdVendor = (await this.vendorService.createVendor(
      tenantContext.tenantId,
      dto.vendor,
    )) as unknown as {
      id: string;
      systemFlags?: {
        isApproved?: boolean;
      };
    };

    const shouldSendForApproval = dto.sendForApproval !== false;
    let approvalNotificationResult: VendorApprovalNotificationDispatchResult = {
      queued: false,
      sent: false,
    };

    if (shouldSendForApproval) {
      approvalNotificationResult =
        await this.notificationQueueService.dispatchApprovalNotification(
          this.buildNotificationPayload(dto, tenantContext),
        );
    }

    return {
      message: 'Vendor registration submitted for approval.',
      vendorId: createdVendor.id,
      tenantId: tenantContext.tenantId,
      tenantLinkedByEmail: tenantContext.tenantLinkedByEmail,
      tenantCreated: tenantContext.tenantCreated,
      tenantContactEmail: tenantContext.tenantContactEmail,
      approvalStatus: createdVendor.systemFlags?.isApproved
        ? 'Approved'
        : 'Pending',
      approvalRecipientEmail: shouldSendForApproval
        ? this.approvalRecipientEmail
        : undefined,
      approvalNotificationQueued: approvalNotificationResult.queued,
      approvalNotificationSent:
        approvalNotificationResult.sent || approvalNotificationResult.queued,
      approvalNotificationJobId: approvalNotificationResult.jobId,
    };
  }
}
