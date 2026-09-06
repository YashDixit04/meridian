import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsBoolean,
  IsDateString,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  IsUUID,
  Min,
  ValidateNested,
} from 'class-validator';

export class CreateCatalogDto {
  @IsString()
  name!: string;

  @IsOptional()
  @IsString()
  description?: string;
}

export class UpdateCatalogDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  description?: string;
}

export class CreateOfferingDto {
  @IsString()
  name!: string;

  @Type(() => Number)
  @IsNumber()
  @Min(0)
  price!: number;

  @IsOptional()
  @IsUUID()
  vendorId?: string;

  @IsOptional()
  @IsString()
  vendorTenantId?: string;

  @IsOptional()
  @IsBoolean()
  isVendorProduct?: boolean;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  ports?: string[];

  @IsOptional()
  @IsString()
  productId?: string;

  @IsOptional()
  @IsString()
  productIdType?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  images?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  videos?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  variations?: string[];

  @IsOptional()
  @IsArray()
  inventory?: Array<Record<string, unknown>>;

  @IsOptional()
  @IsString()
  subcategory?: string;

  @IsOptional()
  @IsString()
  impaCode?: string;

  @IsOptional()
  @IsString()
  mfrPartNumber?: string;

  @IsOptional()
  @IsString()
  hsCode?: string;

  @IsOptional()
  @IsString()
  storageType?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @IsPositive()
  shelfLifeDays?: number;

  @IsOptional()
  @IsDateString()
  expiryDate?: string;

  @IsOptional()
  @IsBoolean()
  isHazmat?: boolean;

  @IsOptional()
  @IsString()
  unNumber?: string;

  @IsOptional()
  @IsString()
  imdgClass?: string;

  @IsOptional()
  @IsString()
  packingGroup?: string;

  @IsOptional()
  @IsString()
  customsRef?: string;

  @IsOptional()
  @IsBoolean()
  dutyFreeFlag?: boolean;

  @IsOptional()
  @IsString()
  category?: string;

  @IsOptional()
  @IsString()
  brand?: string;

  @IsOptional()
  @IsString()
  barcode?: string;

  @IsOptional()
  certification?: Record<string, unknown>;

  @IsOptional()
  serialTracking?: Record<string, unknown>;

  @IsOptional()
  weight?: Record<string, unknown>;

  @IsOptional()
  volume?: Record<string, unknown>;

  @IsOptional()
  dimensions?: Record<string, unknown>;
}

export class UpdateOfferingDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  price?: number;

  @IsOptional()
  @IsUUID()
  vendorId?: string;

  @IsOptional()
  @IsBoolean()
  isVendorProduct?: boolean;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  ports?: string[];

  @IsOptional()
  @IsString()
  productId?: string;

  @IsOptional()
  @IsString()
  productIdType?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  images?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  videos?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  variations?: string[];

  @IsOptional()
  @IsArray()
  inventory?: Array<Record<string, unknown>>;

  @IsOptional()
  @IsString()
  subcategory?: string;

  @IsOptional()
  @IsString()
  impaCode?: string;

  @IsOptional()
  @IsString()
  mfrPartNumber?: string;

  @IsOptional()
  @IsString()
  hsCode?: string;

  @IsOptional()
  @IsString()
  storageType?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @IsPositive()
  shelfLifeDays?: number;

  @IsOptional()
  @IsDateString()
  expiryDate?: string;

  @IsOptional()
  @IsBoolean()
  isHazmat?: boolean;

  @IsOptional()
  @IsString()
  unNumber?: string;

  @IsOptional()
  @IsString()
  imdgClass?: string;

  @IsOptional()
  @IsString()
  packingGroup?: string;

  @IsOptional()
  @IsString()
  customsRef?: string;

  @IsOptional()
  @IsBoolean()
  dutyFreeFlag?: boolean;

  @IsOptional()
  @IsString()
  category?: string;

  @IsOptional()
  @IsString()
  brand?: string;

  @IsOptional()
  @IsString()
  barcode?: string;

  @IsOptional()
  certification?: Record<string, unknown>;

  @IsOptional()
  serialTracking?: Record<string, unknown>;

  @IsOptional()
  weight?: Record<string, unknown>;

  @IsOptional()
  volume?: Record<string, unknown>;

  @IsOptional()
  dimensions?: Record<string, unknown>;
}

export class BulkCreateOfferingsDto {
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => CreateOfferingDto)
  offerings!: CreateOfferingDto[];
}
