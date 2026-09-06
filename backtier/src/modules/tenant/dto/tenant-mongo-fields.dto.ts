import { IsObject } from 'class-validator';

export class UpdateTenantMongoFieldsDto {
  @IsObject()
  fields!: Record<string, unknown>;
}
