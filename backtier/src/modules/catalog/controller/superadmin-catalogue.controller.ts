import {
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtClaimsGuard } from '../../../core/auth/guard/jwt-claims.guard';
import { RolesGuard } from '../../../core/auth/guard/roles.guard';
import { SuperadminRoleGuard } from '../../../core/auth/guard/superadmin-role.guard';
import { CatalogService } from '../service/catalog.service';

@ApiTags('Superadmin Catalogue')
@ApiBearerAuth()
@UseGuards(JwtClaimsGuard, RolesGuard, SuperadminRoleGuard)
@Controller('superadmin/catalogue/products')
export class SuperadminCatalogueController {
  constructor(private readonly catalogService: CatalogService) {}

  @Get()
  @ApiOperation({ summary: 'List products from superadmin_catalogue' })
  getProducts() {
    return this.catalogService.getSuperadminCatalogueProducts();
  }

  @Delete(':id')
  @ApiOperation({
    summary:
      'Delete a superadmin catalogue product and cascade to tenant mappings and offerings',
  })
  deleteProduct(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.catalogService.deleteSuperadminCatalogueProduct(id);
  }
}
