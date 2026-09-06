import { Type } from 'class-transformer';
import { IsEnum, IsNumber, IsOptional, IsString, Min } from 'class-validator';
import { OrderStatus } from '../../../core/types/order-status.enum';

export class CreateRequisitionDto {
  @IsOptional()
  @IsString()
  orderNumber?: string;

  @IsString()
  requisitionName!: string;

  @IsOptional()
  @IsString()
  categoryType?: string;

  @IsString()
  priorityType!: string;

  @IsString()
  country!: string;

  @IsString()
  port!: string;

  @IsString()
  creatorName!: string;

  @IsString()
  creatorRank!: string;

  @IsString()
  crewMembers!: string;

  @IsOptional()
  @IsString()
  freshDateRange?: string;

  @IsOptional()
  @IsString()
  dryDateRange?: string;

  @IsString()
  deliveryMode!: string;

  @IsString()
  agentName!: string;

  @IsString()
  agentEmail!: string;

  @IsString()
  agentPhone!: string;

  @IsOptional()
  @IsEnum(OrderStatus)
  status?: OrderStatus;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  totalAmount?: number;

  @IsOptional()
  @IsString()
  userId?: string;

  @IsOptional()
  @IsString()
  vendorId?: string;

  @IsOptional()
  @IsString()
  vesselId?: string;
}

export class UpdateRequisitionDto {
  @IsOptional()
  @IsEnum(OrderStatus)
  status?: OrderStatus;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  totalAmount?: number;

  @IsOptional()
  @IsString()
  userId?: string;

  @IsOptional()
  @IsString()
  vendorId?: string;

  @IsOptional()
  @IsString()
  vesselId?: string;
}
