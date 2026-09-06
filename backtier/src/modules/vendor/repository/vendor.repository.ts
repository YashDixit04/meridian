import { Injectable } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { Document } from 'mongodb';
import { MongoDbService } from '../../../core/mongodb/mongodb.service';
import { TenantCollectionService } from '../../../core/mongodb/tenant-collection.service';
import {
  stripMongoId,
  stripMongoIds,
} from '../../../core/mongodb/mongo-document.util';

export interface VendorBasicInfo {
  companyName: string;
  legalName: string;
  registrationNumber: string;
  taxId: string;
  companyType: 'Supplier' | 'Manufacturer' | 'Trader';
  yearEstablished?: string;
  website?: string;
  email: string;
  phone: string;
}

export interface VendorKyc {
  kycStatus: 'Pending' | 'Verified' | 'Rejected';
  documents: {
    tradeLicense: string;
    taxCertificate: string;
    incorporationCertificate: string;
    bankProof: string;
    addressProof: string;
    insuranceCertificate?: string;
  };
  expiryDates?: {
    tradeLicenseExpiry?: string;
    insuranceExpiry?: string;
  };
}

export interface VendorContact {
  primaryContact: {
    name: string;
    email: string;
    phone: string;
    designation?: string;
  };
  secondaryContact?: {
    name: string;
    email: string;
    phone: string;
  };
}

export interface VendorCapability {
  productCategories: string[];
  brandsHandled?: string[];
  certifications?: string[];
  serviceType: 'Supply' | 'Service' | 'Both';
}

export interface VendorCoverage {
  countriesServed?: string[];
  portsServed: string[];
  deliveryTime?: string;
  emergencySupply: boolean;
}

export interface VendorFinancial {
  paymentTerms: string;
  currencyAccepted: string[];
  creditLimit?: number;
  bankDetails: {
    bankName: string;
    accountNumber: string;
    swiftCode?: string;
    iban?: string;
  };
}

export interface VendorPerformance {
  rating?: number;
  totalOrders?: number;
  onTimeDelivery?: string;
  rejectionRate?: string;
}

export interface VendorSystemFlags {
  isActive: boolean;
  isApproved: boolean;
  isBlacklisted: boolean;
  isPreferredVendor: boolean;
}

export interface VendorContract {
  contractType?: 'Spot' | 'Annual' | 'Long Term';
  contractStartDate?: string;
  contractEndDate?: string;
}

export interface VendorIntegration {
  externalVendorId?: string;
  erpLinked?: boolean;
  referenceSource?: string;
}

export interface CreateVendorInput {
  basicInfo: VendorBasicInfo;
  kyc: VendorKyc;
  contact: VendorContact;
  capability: VendorCapability;
  coverage: VendorCoverage;
  financial: VendorFinancial;
  performance?: VendorPerformance;
  systemFlags?: Partial<VendorSystemFlags>;
  contract?: VendorContract;
  integration?: VendorIntegration;
}

export interface UpdateVendorInput {
  basicInfo?: VendorBasicInfo;
  kyc?: VendorKyc;
  contact?: VendorContact;
  capability?: VendorCapability;
  coverage?: VendorCoverage;
  financial?: VendorFinancial;
  performance?: VendorPerformance;
  systemFlags?: Partial<VendorSystemFlags>;
  contract?: VendorContract;
  integration?: VendorIntegration;
}

export interface VendorEntity extends Document {
  id: string;
  basicInfo: VendorBasicInfo;
  kyc: VendorKyc;
  contact: VendorContact;
  capability: VendorCapability;
  coverage: VendorCoverage;
  financial: VendorFinancial;
  performance: VendorPerformance;
  systemFlags: VendorSystemFlags;
  contract?: VendorContract;
  integration?: VendorIntegration;
  // Compatibility display fields for existing consumers.
  name: string;
  contactEmail?: string;
  tenantId: string;
  createdAt: Date;
  updatedAt: Date;
}

@Injectable()
export class VendorRepository {
  constructor(
    private readonly mongoDbService: MongoDbService,
    private readonly tenantCollectionService: TenantCollectionService,
  ) {}

  async findAllByTenant(tenantId: string) {
    const vendorsCollection = await this.vendorsCollection(tenantId);
    const vendors = await vendorsCollection
      .find({ tenantId })
      .sort({ createdAt: -1 })
      .toArray();

    return stripMongoIds(vendors);
  }

  async findById(tenantId: string, id: string) {
    const vendorsCollection = await this.vendorsCollection(tenantId);
    return stripMongoId(await vendorsCollection.findOne({ id, tenantId }));
  }

  async findByRegistrationNumber(
    tenantId: string,
    registrationNumber: string,
    excludeId?: string,
  ) {
    const vendorsCollection = await this.vendorsCollection(tenantId);
    return stripMongoId(
      await vendorsCollection.findOne({
        tenantId,
        'basicInfo.registrationNumber': registrationNumber,
        ...(excludeId ? { id: { $ne: excludeId } } : {}),
      }),
    );
  }

  async findByTaxId(tenantId: string, taxId: string, excludeId?: string) {
    const vendorsCollection = await this.vendorsCollection(tenantId);
    return stripMongoId(
      await vendorsCollection.findOne({
        tenantId,
        'basicInfo.taxId': taxId,
        ...(excludeId ? { id: { $ne: excludeId } } : {}),
      }),
    );
  }

  async countByTenant(tenantId: string) {
    const vendorsCollection = await this.vendorsCollection(tenantId);
    return vendorsCollection.countDocuments({ tenantId });
  }

  async create(tenantId: string, data: CreateVendorInput) {
    const now = new Date();
    const systemFlags: VendorSystemFlags = {
      isActive: true,
      isBlacklisted: false,
      isPreferredVendor: false,
      ...data.systemFlags,
      // Approval workflow defaults to false on create.
      isApproved: false,
    };

    const vendor: VendorEntity = {
      id: randomUUID(),
      basicInfo: data.basicInfo,
      kyc: data.kyc,
      contact: data.contact,
      capability: data.capability,
      coverage: data.coverage,
      financial: data.financial,
      performance: {
        totalOrders: 0,
        ...data.performance,
      },
      systemFlags,
      contract: data.contract,
      integration: data.integration,
      name: data.basicInfo.companyName,
      contactEmail: data.basicInfo.email,
      tenantId,
      createdAt: now,
      updatedAt: now,
    };

    const vendorsCollection = await this.vendorsCollection(tenantId);
    await vendorsCollection.insertOne(vendor);
    return stripMongoId(vendor);
  }

  async update(tenantId: string, id: string, data: UpdateVendorInput) {
    const vendorsCollection = await this.vendorsCollection(tenantId);
    const updates = this.removeUndefined(data) as Record<string, unknown>;

    if (data.basicInfo) {
      updates.name = data.basicInfo.companyName;
      updates.contactEmail = data.basicInfo.email;
    }

    await vendorsCollection.updateOne(
      { id, tenantId },
      {
        $set: {
          ...updates,
          updatedAt: new Date(),
        },
      },
    );

    return stripMongoId(await vendorsCollection.findOne({ id, tenantId }));
  }

  async updateApprovalStatus(
    tenantId: string,
    id: string,
    isApproved: boolean,
  ) {
    const vendorsCollection = await this.vendorsCollection(tenantId);

    await vendorsCollection.updateOne(
      { id, tenantId },
      {
        $set: {
          'systemFlags.isApproved': isApproved,
          updatedAt: new Date(),
        },
      },
    );

    return stripMongoId(await vendorsCollection.findOne({ id, tenantId }));
  }

  async delete(tenantId: string, id: string) {
    const vendorsCollection = await this.vendorsCollection(tenantId);
    const vendor = await vendorsCollection.findOne({ id, tenantId });
    if (!vendor) {
      return null;
    }

    await vendorsCollection.deleteOne({ id, tenantId });
    return stripMongoId(vendor);
  }

  private async vendorsCollection(tenantId: string) {
    return this.tenantCollectionService.getCollection<VendorEntity>(
      tenantId,
      'vendors',
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
