import { IsBoolean, IsOptional } from 'class-validator';

export class UpdateTenantSettingsDto {
  @IsOptional()
  @IsBoolean()
  canViewOtherTenantVendors?: boolean;
}
