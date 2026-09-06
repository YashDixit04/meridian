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
import { CreateVesselDto, UpdateVesselDto } from '../dto/vessel.dto';
import { VesselService } from '../service/vessel.service';
import { RolesGuard } from '../../../core/auth/guard/roles.guard';
import { Roles } from '../../../core/auth/decorators/roles.decorator';
import { UserRole } from '../../../core/types/user-role.enum';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';

@ApiTags('Vessels')
@ApiBearerAuth()
@UseGuards(JwtClaimsGuard, TenantAccessGuard, RolesGuard)
@Controller('tenants/:tenantId/vessels')
export class VesselController {
  constructor(private readonly vesselService: VesselService) {}

  @Get()
  @ApiOperation({ summary: 'Get all vessels' })
  getVessels(@Param('tenantId', new ParseUUIDPipe()) tenantId: string) {
    return this.vesselService.getVessels(tenantId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get vessel by ID' })
  getVesselById(
    @Param('tenantId', new ParseUUIDPipe()) tenantId: string,
    @Param('id', new ParseUUIDPipe()) id: string,
  ) {
    return this.vesselService.getVesselById(tenantId, id);
  }

  @Post()
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Create vessel (Admin Only)' })
  createVessel(
    @Param('tenantId', new ParseUUIDPipe()) tenantId: string,
    @Body() body: CreateVesselDto,
  ) {
    return this.vesselService.createVessel(tenantId, body);
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Update vessel (Admin Only)' })
  updateVessel(
    @Param('tenantId', new ParseUUIDPipe()) tenantId: string,
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() body: UpdateVesselDto,
  ) {
    return this.vesselService.updateVessel(tenantId, id, body);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Delete vessel (Admin Only)' })
  deleteVessel(
    @Param('tenantId', new ParseUUIDPipe()) tenantId: string,
    @Param('id', new ParseUUIDPipe()) id: string,
  ) {
    return this.vesselService.deleteVessel(tenantId, id);
  }
}
