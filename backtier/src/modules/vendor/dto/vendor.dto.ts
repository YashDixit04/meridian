import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsBoolean,
  IsDateString,
  IsEmail,
  IsEnum,
  IsIn,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  Min,
  ValidateNested,
} from 'class-validator';

export enum VendorCompanyType {
  SUPPLIER = 'Supplier',
  MANUFACTURER = 'Manufacturer',
  TRADER = 'Trader',
}

export enum VendorKycStatus {
  PENDING = 'Pending',
  VERIFIED = 'Verified',
  REJECTED = 'Rejected',
}

export enum VendorServiceType {
  SUPPLY = 'Supply',
  SERVICE = 'Service',
  BOTH = 'Both',
}

export enum VendorContractType {
  SPOT = 'Spot',
  ANNUAL = 'Annual',
  LONG_TERM = 'Long Term',
}

class VendorBasicInfoDto {
  @IsString()
  @IsNotEmpty()
  companyName!: string;

  @IsString()
  @IsNotEmpty()
  legalName!: string;

  @IsString()
  @IsNotEmpty()
  registrationNumber!: string;

  @IsString()
  @IsNotEmpty()
  taxId!: string;

  @IsEnum(VendorCompanyType)
  companyType!: VendorCompanyType;

  @IsOptional()
  @IsString()
  yearEstablished?: string;

  @IsOptional()
  @IsString()
  website?: string;

  @IsEmail()
  email!: string;

  @IsString()
  @IsNotEmpty()
  phone!: string;
}

class VendorKycDocumentsDto {
  @IsString()
  @IsNotEmpty()
  tradeLicense!: string;

  @IsString()
  @IsNotEmpty()
  taxCertificate!: string;

  @IsString()
  @IsNotEmpty()
  incorporationCertificate!: string;

  @IsString()
  @IsNotEmpty()
  bankProof!: string;

  @IsString()
  @IsNotEmpty()
  addressProof!: string;

  @IsOptional()
  @IsString()
  insuranceCertificate?: string;
}

class VendorKycExpiryDatesDto {
  @IsOptional()
  @IsDateString()
  tradeLicenseExpiry?: string;

  @IsOptional()
  @IsDateString()
  insuranceExpiry?: string;
}

class VendorKycDto {
  @IsEnum(VendorKycStatus)
  kycStatus!: VendorKycStatus;

  @ValidateNested()
  @Type(() => VendorKycDocumentsDto)
  documents!: VendorKycDocumentsDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => VendorKycExpiryDatesDto)
  expiryDates?: VendorKycExpiryDatesDto;
}

class VendorContactPersonDto {
  @IsString()
  @IsNotEmpty()
  name!: string;

  @IsEmail()
  email!: string;

  @IsString()
  @IsNotEmpty()
  phone!: string;

  @IsOptional()
  @IsString()
  designation?: string;
}

class VendorContactDto {
  @ValidateNested()
  @Type(() => VendorContactPersonDto)
  primaryContact!: VendorContactPersonDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => VendorContactPersonDto)
  secondaryContact?: VendorContactPersonDto;
}

class VendorCapabilityDto {
  @IsArray()
  @ArrayMinSize(1)
  @IsString({ each: true })
  productCategories!: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  brandsHandled?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  certifications?: string[];

  @IsEnum(VendorServiceType)
  serviceType!: VendorServiceType;
}

class VendorCoverageDto {
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  countriesServed?: string[];

  @IsArray()
  @ArrayMinSize(1)
  @IsString({ each: true })
  portsServed!: string[];

  @IsOptional()
  @IsString()
  deliveryTime?: string;

  @IsBoolean()
  emergencySupply!: boolean;
}

class VendorBankDetailsDto {
  @IsString()
  @IsNotEmpty()
  bankName!: string;

  @IsString()
  @IsNotEmpty()
  accountNumber!: string;

  @IsOptional()
  @IsString()
  swiftCode?: string;

  @IsOptional()
  @IsString()
  iban?: string;
}

class VendorFinancialDto {
  @IsString()
  @IsNotEmpty()
  paymentTerms!: string;

  @IsArray()
  @ArrayMinSize(1)
  @IsString({ each: true })
  currencyAccepted!: string[];

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  creditLimit?: number;

  @ValidateNested()
  @Type(() => VendorBankDetailsDto)
  bankDetails!: VendorBankDetailsDto;
}

class VendorPerformanceDto {
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  @Max(5)
  rating?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  totalOrders?: number;

  @IsOptional()
  @IsString()
  onTimeDelivery?: string;

  @IsOptional()
  @IsString()
  rejectionRate?: string;
}

class VendorSystemFlagsDto {
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  @IsBoolean()
  isApproved?: boolean;

  @IsOptional()
  @IsBoolean()
  isBlacklisted?: boolean;

  @IsOptional()
  @IsBoolean()
  isPreferredVendor?: boolean;
}

class VendorContractDto {
  @IsOptional()
  @IsEnum(VendorContractType)
  contractType?: VendorContractType;

  @IsOptional()
  @IsDateString()
  contractStartDate?: string;

  @IsOptional()
  @IsDateString()
  contractEndDate?: string;
}

class VendorIntegrationDto {
  @IsOptional()
  @IsString()
  externalVendorId?: string;

  @IsOptional()
  @IsBoolean()
  erpLinked?: boolean;

  @IsOptional()
  @IsString()
  @IsIn([
    'Self Registered',
    'SMC Referral',
    'Partner Referral',
    'Web Discovery',
    'Existing Contract Renewal',
    'Other',
  ])
  referenceSource?: string;
}

export class CreateVendorDto {
  @ValidateNested()
  @Type(() => VendorBasicInfoDto)
  basicInfo!: VendorBasicInfoDto;

  @ValidateNested()
  @Type(() => VendorKycDto)
  kyc!: VendorKycDto;

  @ValidateNested()
  @Type(() => VendorContactDto)
  contact!: VendorContactDto;

  @ValidateNested()
  @Type(() => VendorCapabilityDto)
  capability!: VendorCapabilityDto;

  @ValidateNested()
  @Type(() => VendorCoverageDto)
  coverage!: VendorCoverageDto;

  @ValidateNested()
  @Type(() => VendorFinancialDto)
  financial!: VendorFinancialDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => VendorPerformanceDto)
  performance?: VendorPerformanceDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => VendorSystemFlagsDto)
  systemFlags?: VendorSystemFlagsDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => VendorContractDto)
  contract?: VendorContractDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => VendorIntegrationDto)
  integration?: VendorIntegrationDto;
}

export class UpdateVendorDto {
  @IsOptional()
  @ValidateNested()
  @Type(() => VendorBasicInfoDto)
  basicInfo?: VendorBasicInfoDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => VendorKycDto)
  kyc?: VendorKycDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => VendorContactDto)
  contact?: VendorContactDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => VendorCapabilityDto)
  capability?: VendorCapabilityDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => VendorCoverageDto)
  coverage?: VendorCoverageDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => VendorFinancialDto)
  financial?: VendorFinancialDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => VendorPerformanceDto)
  performance?: VendorPerformanceDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => VendorSystemFlagsDto)
  systemFlags?: VendorSystemFlagsDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => VendorContractDto)
  contract?: VendorContractDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => VendorIntegrationDto)
  integration?: VendorIntegrationDto;
}

export class UpdateVendorApprovalDto {
  @IsBoolean()
  isApproved!: boolean;
}
