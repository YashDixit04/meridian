import { Type } from 'class-transformer';
import { IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateDashboardStatDto {
  @IsString()
  metricName!: string;

  @Type(() => Number)
  @IsNumber()
  value!: number;
}

export class CreateActivityLogDto {
  @IsString()
  action!: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  userId?: string;
}
