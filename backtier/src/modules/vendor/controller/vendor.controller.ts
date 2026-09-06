import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { JwtClaimsGuard } from '../../../core/auth/guard/jwt-claims.guard';
import { TenantAccessGuard } from '../../../core/auth/guard/tenant-access.guard';
import {
  CreateVendorDto,
  UpdateVendorApprovalDto,
  UpdateVendorDto,
} from '../dto/vendor.dto';
import { VendorService } from '../service/vendor.service';
import { RolesGuard } from '../../../core/auth/guard/roles.guard';
import { Roles } from '../../../core/auth/decorators/roles.decorator';
import { UserRole } from '../../../core/types/user-role.enum';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';

@ApiTags('Vendors')
@ApiBearerAuth()
@UseGuards(JwtClaimsGuard, TenantAccessGuard, RolesGuard)
@Controller('tenants/:tenantId/vendors')
export class VendorController {
  constructor(private readonly vendorService: VendorService) {}

  @Get()
  @ApiOperation({ summary: 'Get all vendors' })
  getVendors(@Param('tenantId', new ParseUUIDPipe()) tenantId: string) {
    return this.vendorService.getVendors(tenantId);
  }

  @Get('cross-tenant')
  @ApiOperation({ summary: 'Get vendors from other tenants (Requires specific tenant setting enabled)' })
  getVendorsAcrossTenants(@Param('tenantId', new ParseUUIDPipe()) tenantId: string) {
    return this.vendorService.listVendorsAcrossTenants(tenantId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get vendor by ID' })
  getVendorById(
    @Param('tenantId', new ParseUUIDPipe()) tenantId: string,
    @Param('id', new ParseUUIDPipe()) id: string,
  ) {
    return this.vendorService.getVendorById(tenantId, id);
  }

  @Post()
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Create vendor (Admin Only)' })
  createVendor(
    @Param('tenantId', new ParseUUIDPipe()) tenantId: string,
    @Body() body: CreateVendorDto,
  ) {
    return this.vendorService.createVendor(tenantId, body);
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Update vendor (Admin Only)' })
  updateVendor(
    @Param('tenantId', new ParseUUIDPipe()) tenantId: string,
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() body: UpdateVendorDto,
  ) {
    return this.vendorService.updateVendor(tenantId, id, body);
  }

  @Patch(':id/approval')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Approve or reject vendor (Admin Only)' })
  updateVendorApproval(
    @Param('tenantId', new ParseUUIDPipe()) tenantId: string,
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() body: UpdateVendorApprovalDto,
  ) {
    return this.vendorService.updateVendorApproval(
      tenantId,
      id,
      body.isApproved,
    );
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Delete vendor (Admin Only)' })
  deleteVendor(
    @Param('tenantId', new ParseUUIDPipe()) tenantId: string,
    @Param('id', new ParseUUIDPipe()) id: string,
  ) {
    return this.vendorService.deleteVendor(tenantId, id);
  }
}
