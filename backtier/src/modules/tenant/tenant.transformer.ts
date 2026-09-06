import { TenantEntity } from './repository/tenant.repository';

export interface TenantSettingsDTO {
  canViewOtherTenantVendors: boolean;
}

export class TenantTransformer {
  static toSettingsDTO(rawTenant: TenantEntity): TenantSettingsDTO {
    return {
      canViewOtherTenantVendors: rawTenant.canViewOtherTenantVendors === true,
    };
  }
}
