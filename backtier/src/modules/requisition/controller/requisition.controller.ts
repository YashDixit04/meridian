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
  CreateRequisitionDto,
  UpdateRequisitionDto,
} from '../dto/requisition.dto';
import { RequisitionService } from '../service/requisition.service';
import { RolesGuard } from '../../../core/auth/guard/roles.guard';
import { Roles } from '../../../core/auth/decorators/roles.decorator';
import { UserRole } from '../../../core/types/user-role.enum';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';

@ApiTags('Requisition Orders')
@ApiBearerAuth()
@UseGuards(JwtClaimsGuard, TenantAccessGuard, RolesGuard)
@Controller('tenants/:tenantId/requisitions')
export class RequisitionController {
  constructor(private readonly requisitionService: RequisitionService) {}

  @Get()
  @ApiOperation({ summary: 'Get all requisition orders' })
  getOrders(@Param('tenantId', new ParseUUIDPipe()) tenantId: string) {
    return this.requisitionService.getOrders(tenantId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get requisition order by ID' })
  getOrderById(
    @Param('tenantId', new ParseUUIDPipe()) tenantId: string,
    @Param('id', new ParseUUIDPipe()) id: string,
  ) {
    return this.requisitionService.getOrderById(tenantId, id);
  }

  @Post()
  @Roles(UserRole.ADMIN, UserRole.USER)
  @ApiOperation({ summary: 'Create requisition order' })
  createOrder(
    @Param('tenantId', new ParseUUIDPipe()) tenantId: string,
    @Body() body: CreateRequisitionDto,
  ) {
    return this.requisitionService.createOrder(tenantId, body);
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN, UserRole.USER)
  @ApiOperation({ summary: 'Update requisition order' })
  updateOrder(
    @Param('tenantId', new ParseUUIDPipe()) tenantId: string,
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() body: UpdateRequisitionDto,
  ) {
    return this.requisitionService.updateOrder(tenantId, id, body);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN, UserRole.USER)
  @ApiOperation({ summary: 'Delete requisition order' })
  deleteOrder(
    @Param('tenantId', new ParseUUIDPipe()) tenantId: string,
    @Param('id', new ParseUUIDPipe()) id: string,
  ) {
    return this.requisitionService.deleteOrder(tenantId, id);
  }
}
