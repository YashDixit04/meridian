import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { TenantService } from '../../tenant/service/tenant.service';
import {
  CreateVendorInput,
  VendorEntity,
  UpdateVendorInput,
  VendorRepository,
} from '../repository/vendor.repository';
import { TenantCollectionService } from '../../../core/mongodb/tenant-collection.service';
import { VendorTransformer } from '../vendor.transformer';

@Injectable()
export class VendorService {
  constructor(
    private readonly vendorRepository: VendorRepository,
    private readonly tenantService: TenantService,
    private readonly tenantCollectionService: TenantCollectionService,
  ) {}

  private isVendorOnlyTenant(userTypeSelection: string | undefined): boolean {
    if (typeof userTypeSelection !== 'string') {
      return false;
    }

    const normalized = userTypeSelection.trim().toLowerCase();
    if (!normalized.includes('vendor')) {
      return false;
    }

    return !normalized.includes('both') && !normalized.includes('smc');
  }

  private async assertVendorOnlyTenantLimit(tenantId: string) {
    const tenant = await this.tenantService.getTenantById(tenantId);
    if (!this.isVendorOnlyTenant(tenant.userTypeSelection)) {
      return;
    }

    const existingVendors = await this.vendorRepository.countByTenant(tenantId);
    if (existingVendors > 0) {
      throw new ConflictException(
        'Vendor-only tenants can have only one Vendor KYC profile.',
      );
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

  private normalizeStringArray(
    value: string[] | undefined,
  ): string[] | undefined {
    if (!Array.isArray(value)) {
      return undefined;
    }

    return value
      .map((item) => this.normalizeOptionalString(item))
      .filter((item): item is string => Boolean(item));
  }

  private ensureRequiredKycDocuments(payload: {
    kyc: {
      documents: {
        tradeLicense?: string;
        taxCertificate?: string;
        incorporationCertificate?: string;
        bankProof?: string;
        addressProof?: string;
      };
    };
  }) {
    const docs = payload.kyc.documents;
    const requiredDocs: Array<keyof typeof docs> = [
      'tradeLicense',
      'taxCertificate',
      'incorporationCertificate',
      'bankProof',
      'addressProof',
    ];

    for (const key of requiredDocs) {
      const value = this.normalizeOptionalString(docs[key]);
      if (!value) {
        throw new BadRequestException(`KYC document "${key}" is required.`);
      }
    }
  }

  private ensureCoreBusinessRules(payload: {
    capability: { productCategories: string[] };
    coverage: { portsServed: string[] };
  }) {
    if (
      !Array.isArray(payload.capability.productCategories) ||
      payload.capability.productCategories.length === 0
    ) {
      throw new BadRequestException(
        'Vendor must include at least 1 product category.',
      );
    }

    if (
      !Array.isArray(payload.coverage.portsServed) ||
      payload.coverage.portsServed.length === 0
    ) {
      throw new BadRequestException(
        'Vendor must include at least 1 port served.',
      );
    }
  }

  private attachComputedFields(vendor: Record<string, any>) {
    const expiryDates = vendor.kyc?.expiryDates;
    const alerts: string[] = [];
    const now = new Date();

    if (expiryDates?.tradeLicenseExpiry) {
      const tradeExpiry = new Date(expiryDates.tradeLicenseExpiry);
      if (
        !Number.isNaN(tradeExpiry.getTime()) &&
        tradeExpiry.getTime() < now.getTime()
      ) {
        alerts.push('Trade license has expired.');
      }
    }

    if (expiryDates?.insuranceExpiry) {
      const insuranceExpiry = new Date(expiryDates.insuranceExpiry);
      if (
        !Number.isNaN(insuranceExpiry.getTime()) &&
        insuranceExpiry.getTime() < now.getTime()
      ) {
        alerts.push('Insurance certificate has expired.');
      }
    }

    return {
      ...vendor,
      alerts,
    };
  }

  private normalizeCreatePayload(
    payload: CreateVendorInput,
  ): CreateVendorInput {
    return {
      ...payload,
      basicInfo: {
        ...payload.basicInfo,
        companyName: payload.basicInfo.companyName.trim(),
        legalName: payload.basicInfo.legalName.trim(),
        registrationNumber: payload.basicInfo.registrationNumber.trim(),
        taxId: payload.basicInfo.taxId.trim(),
        yearEstablished: this.normalizeOptionalString(
          payload.basicInfo.yearEstablished,
        ),
        website: this.normalizeOptionalString(payload.basicInfo.website),
        email: payload.basicInfo.email.trim().toLowerCase(),
        phone: payload.basicInfo.phone.trim(),
      },
      capability: {
        ...payload.capability,
        productCategories:
          this.normalizeStringArray(payload.capability.productCategories) ?? [],
        brandsHandled: this.normalizeStringArray(
          payload.capability.brandsHandled,
        ),
        certifications: this.normalizeStringArray(
          payload.capability.certifications,
        ),
      },
      coverage: {
        ...payload.coverage,
        countriesServed: this.normalizeStringArray(
          payload.coverage.countriesServed,
        ),
        portsServed:
          this.normalizeStringArray(payload.coverage.portsServed) ?? [],
        deliveryTime: this.normalizeOptionalString(
          payload.coverage.deliveryTime,
        ),
      },
      financial: {
        ...payload.financial,
        paymentTerms: payload.financial.paymentTerms.trim(),
        currencyAccepted:
          this.normalizeStringArray(payload.financial.currencyAccepted) ?? [],
        bankDetails: {
          ...payload.financial.bankDetails,
          bankName: payload.financial.bankDetails.bankName.trim(),
          accountNumber: payload.financial.bankDetails.accountNumber.trim(),
          swiftCode: this.normalizeOptionalString(
            payload.financial.bankDetails.swiftCode,
          ),
          iban: this.normalizeOptionalString(
            payload.financial.bankDetails.iban,
          ),
        },
      },
      contract: payload.contract
        ? {
            ...payload.contract,
            contractStartDate: this.normalizeOptionalString(
              payload.contract.contractStartDate,
            ),
            contractEndDate: this.normalizeOptionalString(
              payload.contract.contractEndDate,
            ),
          }
        : undefined,
      integration: payload.integration
        ? {
            ...payload.integration,
            externalVendorId: this.normalizeOptionalString(
              payload.integration.externalVendorId,
            ),
            referenceSource: this.normalizeOptionalString(
              payload.integration.referenceSource,
            ),
          }
        : undefined,
    };
  }

  private normalizeUpdatePayload(
    payload: UpdateVendorInput,
  ): UpdateVendorInput {
    const normalized: UpdateVendorInput = { ...payload };

    if (payload.basicInfo) {
      normalized.basicInfo = {
        ...payload.basicInfo,
        companyName: payload.basicInfo.companyName.trim(),
        legalName: payload.basicInfo.legalName.trim(),
        registrationNumber: payload.basicInfo.registrationNumber.trim(),
        taxId: payload.basicInfo.taxId.trim(),
        yearEstablished: this.normalizeOptionalString(
          payload.basicInfo.yearEstablished,
        ),
        website: this.normalizeOptionalString(payload.basicInfo.website),
        email: payload.basicInfo.email.trim().toLowerCase(),
        phone: payload.basicInfo.phone.trim(),
      };
    }

    if (payload.capability) {
      normalized.capability = {
        ...payload.capability,
        productCategories:
          this.normalizeStringArray(payload.capability.productCategories) ?? [],
        brandsHandled: this.normalizeStringArray(
          payload.capability.brandsHandled,
        ),
        certifications: this.normalizeStringArray(
          payload.capability.certifications,
        ),
      };
    }

    if (payload.coverage) {
      normalized.coverage = {
        ...payload.coverage,
        countriesServed: this.normalizeStringArray(
          payload.coverage.countriesServed,
        ),
        portsServed:
          this.normalizeStringArray(payload.coverage.portsServed) ?? [],
        deliveryTime: this.normalizeOptionalString(
          payload.coverage.deliveryTime,
        ),
      };
    }

    if (payload.financial) {
      normalized.financial = {
        ...payload.financial,
        paymentTerms: payload.financial.paymentTerms.trim(),
        currencyAccepted:
          this.normalizeStringArray(payload.financial.currencyAccepted) ?? [],
        bankDetails: {
          ...payload.financial.bankDetails,
          bankName: payload.financial.bankDetails.bankName.trim(),
          accountNumber: payload.financial.bankDetails.accountNumber.trim(),
          swiftCode: this.normalizeOptionalString(
            payload.financial.bankDetails.swiftCode,
          ),
          iban: this.normalizeOptionalString(
            payload.financial.bankDetails.iban,
          ),
        },
      };
    }

    if (payload.contract) {
      normalized.contract = {
        ...payload.contract,
        contractStartDate: this.normalizeOptionalString(
          payload.contract.contractStartDate,
        ),
        contractEndDate: this.normalizeOptionalString(
          payload.contract.contractEndDate,
        ),
      };
    }

    if (payload.integration) {
      normalized.integration = {
        ...payload.integration,
        externalVendorId: this.normalizeOptionalString(
          payload.integration.externalVendorId,
        ),
        referenceSource: this.normalizeOptionalString(
          payload.integration.referenceSource,
        ),
      };
    }

    return normalized;
  }

  private async ensureUniqueCompanyIds(
    tenantId: string,
    basicInfo: { registrationNumber: string; taxId: string },
    excludeId?: string,
  ) {
    const [existingByReg, existingByTax] = await Promise.all([
      this.vendorRepository.findByRegistrationNumber(
        tenantId,
        basicInfo.registrationNumber,
        excludeId,
      ),
      this.vendorRepository.findByTaxId(tenantId, basicInfo.taxId, excludeId),
    ]);

    if (existingByReg) {
      throw new ConflictException(
        'A vendor with this registration number already exists.',
      );
    }

    if (existingByTax) {
      throw new ConflictException('A vendor with this tax ID already exists.');
    }
  }

  async getVendors(tenantId: string) {
    const vendors = await this.vendorRepository.findAllByTenant(tenantId);
    return vendors.map((vendor) =>
      this.attachComputedFields(vendor as Record<string, any>),
    );
  }

  async getVendorById(tenantId: string, id: string) {
    const vendor = await this.vendorRepository.findById(tenantId, id);
    if (!vendor) {
      throw new NotFoundException('Vendor not found');
    }
    return this.attachComputedFields(vendor as Record<string, any>);
  }

  async createVendor(tenantId: string, payload: CreateVendorInput) {
    const normalizedPayload = this.normalizeCreatePayload(payload);
    await this.assertVendorOnlyTenantLimit(tenantId);
    this.ensureRequiredKycDocuments(normalizedPayload);
    this.ensureCoreBusinessRules(normalizedPayload);
    await this.ensureUniqueCompanyIds(tenantId, normalizedPayload.basicInfo);

    const created = await this.vendorRepository.create(
      tenantId,
      normalizedPayload,
    );
    if (!created) {
      throw new BadRequestException('Failed to create vendor.');
    }
    return this.attachComputedFields(created as Record<string, any>);
  }

  async updateVendor(tenantId: string, id: string, payload: UpdateVendorInput) {
    const existing = await this.vendorRepository.findById(tenantId, id);
    if (!existing) {
      throw new NotFoundException('Vendor not found');
    }

    const normalizedPayload = this.normalizeUpdatePayload(payload);

    const effectiveVendor = {
      ...existing,
      ...normalizedPayload,
      basicInfo: normalizedPayload.basicInfo ?? existing.basicInfo,
      kyc: normalizedPayload.kyc ?? existing.kyc,
      capability: normalizedPayload.capability ?? existing.capability,
      coverage: normalizedPayload.coverage ?? existing.coverage,
    };

    this.ensureRequiredKycDocuments(effectiveVendor);
    this.ensureCoreBusinessRules(effectiveVendor);

    if (normalizedPayload.basicInfo) {
      await this.ensureUniqueCompanyIds(
        tenantId,
        normalizedPayload.basicInfo,
        id,
      );
    }

    const updated = await this.vendorRepository.update(
      tenantId,
      id,
      normalizedPayload,
    );
    if (!updated) {
      throw new NotFoundException('Vendor not found');
    }

    return this.attachComputedFields(updated as Record<string, any>);
  }

  async updateVendorApproval(
    tenantId: string,
    id: string,
    isApproved: boolean,
  ) {
    const existing = await this.vendorRepository.findById(tenantId, id);
    if (!existing) {
      throw new NotFoundException('Vendor not found');
    }

    const updated = await this.vendorRepository.updateApprovalStatus(
      tenantId,
      id,
      isApproved,
    );
    if (!updated) {
      throw new NotFoundException('Vendor not found');
    }

    return this.attachComputedFields(updated as Record<string, any>);
  }

  async assertVendorEligibleForRfq(tenantId: string, id: string) {
    const vendor = await this.vendorRepository.findById(tenantId, id);
    if (!vendor) {
      throw new NotFoundException('Vendor not found');
    }

    if (vendor.systemFlags?.isBlacklisted) {
      throw new BadRequestException('Blacklisted vendors cannot receive RFQs.');
    }

    return this.attachComputedFields(vendor as Record<string, any>);
  }

  async deleteVendor(tenantId: string, id: string) {
    await this.getVendorById(tenantId, id);
    return this.vendorRepository.delete(tenantId, id);
  }

  async listVendorsAcrossTenants(requestingTenantId: string) {
    const tenant = await this.tenantService.getTenantById(requestingTenantId);
    
    if (tenant.canViewOtherTenantVendors !== true) {
      throw new ForbiddenException('Cross-tenant vendor access is not enabled for this tenant.');
    }

    const query = { skip: 0, take: 1000, orderBy: {} } as any;
    const allTenantsResult = await this.tenantService.getTenants(query);
    
    const otherTenants = allTenantsResult.data.filter(
      (t) => t.id !== requestingTenantId && t.domain !== 'global.platform'
    );

    const vendorPromises = otherTenants.map(async (otherTenant) => {
      const vendorCollection = await this.tenantCollectionService.getCollection(otherTenant.id, 'vendors');
      const vendors = await vendorCollection.find({}).toArray();
      
      return vendors.map(v => 
        VendorTransformer.toExternalVendorDTO(v as any, otherTenant.id, otherTenant.name)
      );
    });

    const vendorArrays = await Promise.all(vendorPromises);
    return vendorArrays.flat();
  }
}
