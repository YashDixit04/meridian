import { VendorEntity } from './repository/vendor.repository';

export interface VendorDTO extends Omit<VendorEntity, '_id' | 'tenantId'> {}

export interface ExternalVendorDTO extends VendorDTO {
  isExternal: true;
  vendorTenantId: string;
  vendorTenantName: string;
}

export class VendorTransformer {
  static toVendorDTO(vendor: VendorEntity): VendorDTO {
    const { _id, tenantId, ...rest } = vendor as any;
    return rest as VendorDTO;
  }

  static toExternalVendorDTO(
    vendor: VendorEntity,
    vendorTenantId: string,
    vendorTenantName: string,
  ): ExternalVendorDTO {
    const baseDTO = this.toVendorDTO(vendor);
    return {
      ...baseDTO,
      isExternal: true,
      vendorTenantId,
      vendorTenantName,
    };
  }
}
