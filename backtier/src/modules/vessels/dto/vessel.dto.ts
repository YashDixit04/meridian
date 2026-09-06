import { Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';

export enum VesselCurrentStatus {
  ACTIVE = 'Active',
  IN_PORT = 'In Port',
  SAILING = 'Sailing',
  DRY_DOCK = 'Dry Dock',
}

export enum VesselContractType {
  SPOT = 'Spot',
  ANNUAL = 'Annual',
  CONTRACT = 'Contract',
}

class CreateCoreInfoDto {
  @IsString()
  @IsNotEmpty()
  vesselName!: string;

  @IsString()
  @IsNotEmpty()
  imoNumber!: string;

  @IsString()
  @IsNotEmpty()
  vesselType!: string;

  @IsString()
  @IsNotEmpty()
  flag!: string;

  @IsOptional()
  @IsString()
  callSign?: string;

  @IsOptional()
  @IsString()
  mmsiNumber?: string;

  @IsOptional()
  @IsString()
  yearBuilt?: string;

  @IsOptional()
  @IsString()
  deadweight?: string;

  @IsOptional()
  @IsString()
  grossTonnage?: string;

  @IsOptional()
  @IsString()
  netTonnage?: string;
}

class UpdateCoreInfoDto {
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  vesselName?: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  imoNumber?: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  vesselType?: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  flag?: string;

  @IsOptional()
  @IsString()
  callSign?: string;

  @IsOptional()
  @IsString()
  mmsiNumber?: string;

  @IsOptional()
  @IsString()
  yearBuilt?: string;

  @IsOptional()
  @IsString()
  deadweight?: string;

  @IsOptional()
  @IsString()
  grossTonnage?: string;

  @IsOptional()
  @IsString()
  netTonnage?: string;
}

class CreateOwnershipDto {
  @IsString()
  @IsNotEmpty()
  ownerCompany!: string;

  @IsString()
  @IsNotEmpty()
  operatorCompany!: string;

  @IsOptional()
  @IsString()
  technicalManager?: string;

  @IsOptional()
  @IsString()
  commercialManager?: string;
}

class UpdateOwnershipDto {
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  ownerCompany?: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  operatorCompany?: string;

  @IsOptional()
  @IsString()
  technicalManager?: string;

  @IsOptional()
  @IsString()
  commercialManager?: string;
}

class CreateOperationsDto {
  @IsEnum(VesselCurrentStatus)
  currentStatus!: VesselCurrentStatus;

  @IsString()
  @IsNotEmpty()
  currentPort!: string;

  @IsOptional()
  @IsString()
  nextPort?: string;

  @IsOptional()
  @IsString()
  eta?: string;

  @IsOptional()
  @IsString()
  etd?: string;

  @IsOptional()
  @IsString()
  tradingArea?: string;
}

class UpdateOperationsDto {
  @IsOptional()
  @IsEnum(VesselCurrentStatus)
  currentStatus?: VesselCurrentStatus;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  currentPort?: string;

  @IsOptional()
  @IsString()
  nextPort?: string;

  @IsOptional()
  @IsString()
  eta?: string;

  @IsOptional()
  @IsString()
  etd?: string;

  @IsOptional()
  @IsString()
  tradingArea?: string;
}

class CreateProcurementDto {
  @IsString()
  @IsNotEmpty()
  defaultCurrency!: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  budgetLimit?: number;

  @IsBoolean()
  approvalRequired!: boolean;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  preferredPorts?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  preferredVendors?: string[];

  @IsOptional()
  @IsEnum(VesselContractType)
  contractType?: VesselContractType;
}

class UpdateProcurementDto {
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  defaultCurrency?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  budgetLimit?: number;

  @IsOptional()
  @IsBoolean()
  approvalRequired?: boolean;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  preferredPorts?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  preferredVendors?: string[];

  @IsOptional()
  @IsEnum(VesselContractType)
  contractType?: VesselContractType;
}

class CreateCrewDto {
  @IsOptional()
  @IsString()
  captain?: string;

  @IsOptional()
  @IsString()
  chiefEngineer?: string;

  @IsArray()
  @IsString({ each: true })
  assignedDepartments!: string[];
}

class UpdateCrewDto {
  @IsOptional()
  @IsString()
  captain?: string;

  @IsOptional()
  @IsString()
  chiefEngineer?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  assignedDepartments?: string[];
}

class CreateIntegrationDto {
  @IsOptional()
  @IsString()
  erpSystem?: string;

  @IsOptional()
  @IsString()
  externalVesselId?: string;

  @IsBoolean()
  syncEnabled!: boolean;
}

class UpdateIntegrationDto {
  @IsOptional()
  @IsString()
  erpSystem?: string;

  @IsOptional()
  @IsString()
  externalVesselId?: string;

  @IsOptional()
  @IsBoolean()
  syncEnabled?: boolean;
}

class CreateSystemFlagsDto {
  @IsBoolean()
  isActive!: boolean;

  @IsBoolean()
  isProcurementEnabled!: boolean;

  @IsBoolean()
  isVendorAccessAllowed!: boolean;

  @IsBoolean()
  isBudgetControlled!: boolean;
}

class UpdateSystemFlagsDto {
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  @IsBoolean()
  isProcurementEnabled?: boolean;

  @IsOptional()
  @IsBoolean()
  isVendorAccessAllowed?: boolean;

  @IsOptional()
  @IsBoolean()
  isBudgetControlled?: boolean;
}

export class CreateVesselDto {
  @ValidateNested()
  @Type(() => CreateCoreInfoDto)
  coreInfo!: CreateCoreInfoDto;

  @ValidateNested()
  @Type(() => CreateOwnershipDto)
  ownership!: CreateOwnershipDto;

  @ValidateNested()
  @Type(() => CreateOperationsDto)
  operations!: CreateOperationsDto;

  @ValidateNested()
  @Type(() => CreateProcurementDto)
  procurement!: CreateProcurementDto;

  @ValidateNested()
  @Type(() => CreateCrewDto)
  crew!: CreateCrewDto;

  @ValidateNested()
  @Type(() => CreateIntegrationDto)
  integration!: CreateIntegrationDto;

  @ValidateNested()
  @Type(() => CreateSystemFlagsDto)
  systemFlags!: CreateSystemFlagsDto;
}

export class UpdateVesselDto {
  @IsOptional()
  @ValidateNested()
  @Type(() => UpdateCoreInfoDto)
  coreInfo?: UpdateCoreInfoDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => UpdateOwnershipDto)
  ownership?: UpdateOwnershipDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => UpdateOperationsDto)
  operations?: UpdateOperationsDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => UpdateProcurementDto)
  procurement?: UpdateProcurementDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => UpdateCrewDto)
  crew?: UpdateCrewDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => UpdateIntegrationDto)
  integration?: UpdateIntegrationDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => UpdateSystemFlagsDto)
  systemFlags?: UpdateSystemFlagsDto;
}
