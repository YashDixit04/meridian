import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { JwtClaimsGuard } from '../../../core/auth/guard/jwt-claims.guard';
import { CreateTenantDto, UpdateTenantDto } from '../dto/tenant.dto';
import { UpdateTenantMongoFieldsDto } from '../dto/tenant-mongo-fields.dto';
import { UpdateTenantSettingsDto } from '../dto/tenant-settings.dto';
import { TenantService } from '../service/tenant.service';
import { SuperadminRoleGuard } from '../../../core/auth/guard/superadmin-role.guard';
import { RolesGuard } from '../../../core/auth/guard/roles.guard';
import { Roles } from '../../../core/auth/decorators/roles.decorator';
import { UserRole } from '../../../core/types/user-role.enum';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { PaginationQueryDto } from '../../../core/dto/pagination-query.dto';

@ApiTags('Tenants')
@ApiBearerAuth()
@UseGuards(JwtClaimsGuard, RolesGuard)
@Controller('tenants')
export class TenantController {
  constructor(private readonly tenantService: TenantService) {}

  @Get()
  @ApiOperation({ summary: 'Get all tenants (paginated, filterable)' })
  getTenants(@Query() query: PaginationQueryDto) {
    return this.tenantService.getTenants(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get tenant by ID' })
  getTenantById(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.tenantService.getTenantById(id);
  }

  @Get(':id/details')
  @ApiOperation({
    summary: 'Get aggregated tenant details including users and counts',
  })
  getTenantDetails(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.tenantService.getTenantDetails(id);
  }

  @Post()
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Create a tenant (Admin Only)' })
  createTenant(@Body() body: CreateTenantDto) {
    return this.tenantService.createTenant(body);
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Update a tenant (Admin Only)' })
  updateTenant(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() body: UpdateTenantDto,
    @Req() req: { user?: { roleType?: string } },
  ) {
    return this.tenantService.updateTenant(id, body, req.user?.roleType);
  }

  @Patch(':id/mongo-fields')
  @Roles(UserRole.ADMIN)
  @ApiOperation({
    summary: 'Sync arbitrary tenant fields to MongoDB Atlas (Admin Only)',
  })
  updateTenantMongoFields(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() body: UpdateTenantMongoFieldsDto,
  ) {
    return this.tenantService.updateTenantMongoFields(id, body.fields);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Delete a tenant (Admin Only)' })
  deleteTenant(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.tenantService.deleteTenant(id);
  }

  @Get(':id/settings')
  @UseGuards(SuperadminRoleGuard)
  @ApiOperation({ summary: 'Get tenant settings (Superadmin Only)' })
  getTenantSettings(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.tenantService.getTenantSettings(id);
  }

  @Patch(':id/settings')
  @UseGuards(SuperadminRoleGuard)
  @ApiOperation({ summary: 'Update tenant settings (Superadmin Only)' })
  updateTenantSettings(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() body: UpdateTenantSettingsDto,
  ) {
    return this.tenantService.updateTenantSettings(id, body);
  }
}
