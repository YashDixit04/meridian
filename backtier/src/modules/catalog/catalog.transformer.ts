import { ContractedVendorMappingEntity } from './repository/contracted-vendor-mapping.repository';
import { OfferingEntity } from './repository/catalog.repository';

export interface ContractedVendorMappingDTO {
  catalogProductId: string;
  smcTenantId: string;
  vendorTenantId: string;
  vendorId: string;
  relationshipType: 'ContractedVendor';
  syncedProductId: string | null;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface OfferingDTO extends Omit<OfferingEntity, '_id' | 'tenantId'> {
  vendorTenantId?: string;
}

export class CatalogTransformer {
  static toContractedVendorMappingDTO(mapping: Omit<ContractedVendorMappingEntity, '_id'>): ContractedVendorMappingDTO {
    return {
      catalogProductId: mapping.catalogProductId,
      smcTenantId: mapping.smcTenantId,
      vendorTenantId: mapping.vendorTenantId,
      vendorId: mapping.vendorId,
      relationshipType: mapping.relationshipType,
      syncedProductId: mapping.syncedProductId,
      createdBy: mapping.createdBy,
      createdAt: mapping.createdAt,
      updatedAt: mapping.updatedAt,
    };
  }

  static toOfferingDTO(offering: OfferingEntity, vendorTenantId?: string): OfferingDTO {
    const { _id, tenantId, ...rest } = offering as any;
    return {
      ...rest,
      vendorTenantId,
    };
  }
}
