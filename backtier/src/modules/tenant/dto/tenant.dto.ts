import { IsOptional, IsString, IsNumber, IsBoolean } from 'class-validator';

export class CreateTenantDto {
  @IsString()
  name!: string;

  @IsOptional()
  @IsString()
  domain?: string;

  @IsOptional() @IsString() status?: string;
  @IsOptional() @IsString() tenantCode?: string;
  @IsOptional() @IsString() contactEmail?: string;
  @IsOptional() @IsString() contactPhone?: string;
  @IsOptional() @IsString() website?: string;
  @IsOptional() @IsString() industry?: string;
  @IsOptional() @IsString() country?: string;
  @IsOptional() @IsString() timezone?: string;
  @IsOptional() @IsString() planName?: string;
  @IsOptional() @IsString() planType?: string;
  @IsOptional() @IsString() amountPaid?: string;

  @IsOptional() @IsBoolean() requisitionManagement?: boolean;
  @IsOptional() @IsBoolean() catalogueServices?: boolean;
  @IsOptional() @IsBoolean() subUsersCreation?: boolean;
  @IsOptional() @IsBoolean() vesselsAdditions?: boolean;
  @IsOptional() @IsBoolean() catalogueManagement?: boolean;
  @IsOptional() @IsBoolean() mealsCreation?: boolean;
  @IsOptional() @IsBoolean() victuallingManagementServices?: boolean;
  @IsOptional() @IsBoolean() activeLogsMapping?: boolean;
  @IsOptional() @IsBoolean() ordersManagement?: boolean;
  @IsOptional() @IsBoolean() invoiceManagement?: boolean;

  @IsOptional() @IsString() address?: string;
  @IsOptional() @IsString() currency?: string;
  @IsOptional() @IsNumber() maxUserCreations?: number;
  @IsOptional() @IsNumber() maxSubUsers?: number;
  @IsOptional() @IsNumber() maxStorageGB?: number;
  @IsOptional() @IsString() apiRequestsTier?: string;
  @IsOptional() @IsString() userTypeSelection?: string;
  @IsOptional() @IsBoolean() canViewOtherTenantVendors?: boolean;
  @IsOptional() @IsNumber() baseUsersCount?: number;
  @IsOptional() @IsNumber() totalVendorUsersCount?: number;
  @IsOptional() @IsNumber() companySpecificCatalogueCount?: number;
  @IsOptional() @IsString() productAvailability?: string;
  @IsOptional() @IsString() specificPorts?: string;
  @IsOptional() @IsString() profilePhoto?: string;
  @IsOptional() @IsString() tenantAdminName?: string;
  @IsOptional() @IsString() tenantAdminEmail?: string;
  @IsOptional() @IsString() tenantAdminPassword?: string;
}

export class UpdateTenantDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  domain?: string;

  @IsOptional() @IsString() status?: string;
  @IsOptional() @IsString() tenantCode?: string;
  @IsOptional() @IsString() contactEmail?: string;
  @IsOptional() @IsString() contactPhone?: string;
  @IsOptional() @IsString() website?: string;
  @IsOptional() @IsString() industry?: string;
  @IsOptional() @IsString() country?: string;
  @IsOptional() @IsString() timezone?: string;
  @IsOptional() @IsString() planName?: string;
  @IsOptional() @IsString() planType?: string;
  @IsOptional() @IsString() amountPaid?: string;

  @IsOptional() @IsBoolean() requisitionManagement?: boolean;
  @IsOptional() @IsBoolean() catalogueServices?: boolean;
  @IsOptional() @IsBoolean() subUsersCreation?: boolean;
  @IsOptional() @IsBoolean() vesselsAdditions?: boolean;
  @IsOptional() @IsBoolean() catalogueManagement?: boolean;
  @IsOptional() @IsBoolean() mealsCreation?: boolean;
  @IsOptional() @IsBoolean() victuallingManagementServices?: boolean;
  @IsOptional() @IsBoolean() activeLogsMapping?: boolean;
  @IsOptional() @IsBoolean() ordersManagement?: boolean;
  @IsOptional() @IsBoolean() invoiceManagement?: boolean;

  @IsOptional() @IsString() address?: string;
  @IsOptional() @IsString() currency?: string;
  @IsOptional() @IsNumber() maxUserCreations?: number;
  @IsOptional() @IsNumber() maxSubUsers?: number;
  @IsOptional() @IsNumber() maxStorageGB?: number;
  @IsOptional() @IsString() apiRequestsTier?: string;
  @IsOptional() @IsString() userTypeSelection?: string;
  @IsOptional() @IsBoolean() canViewOtherTenantVendors?: boolean;
  @IsOptional() @IsNumber() baseUsersCount?: number;
  @IsOptional() @IsNumber() totalVendorUsersCount?: number;
  @IsOptional() @IsNumber() companySpecificCatalogueCount?: number;
  @IsOptional() @IsString() productAvailability?: string;
  @IsOptional() @IsString() specificPorts?: string;
  @IsOptional() @IsString() profilePhoto?: string;
  @IsOptional() @IsString() tenantAdminName?: string;
  @IsOptional() @IsString() tenantAdminEmail?: string;
  @IsOptional() @IsString() tenantAdminPassword?: string;
}
