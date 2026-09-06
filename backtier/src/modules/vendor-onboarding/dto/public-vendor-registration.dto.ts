import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsEmail,
  IsIn,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { CreateVendorDto } from '../../vendor/dto/vendor.dto';

export const PUBLIC_TENANT_USER_TYPE_SELECTIONS = [
  'SMC Users only',
  'Vendor Users only',
  'Both SMC and Vendor Users',
] as const;

export class PublicVendorRegistrationDto {
  @ValidateNested()
  @Type(() => CreateVendorDto)
  vendor!: CreateVendorDto;

  @IsOptional()
  @IsEmail()
  tenantContactEmail?: string;

  @IsOptional()
  @IsEmail()
  applicantEmail?: string;

  @IsOptional()
  @IsBoolean()
  sendForApproval?: boolean;

  @IsOptional()
  @IsString()
  @IsIn(PUBLIC_TENANT_USER_TYPE_SELECTIONS)
  tenantUserTypeSelection?: string;
}
