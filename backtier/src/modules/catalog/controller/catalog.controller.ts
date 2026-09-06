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
  UseGuards,
} from '@nestjs/common';
import { JwtClaimsGuard } from '../../../core/auth/guard/jwt-claims.guard';
import { TenantAccessGuard } from '../../../core/auth/guard/tenant-access.guard';
import {
  BulkCreateOfferingsDto,
  CreateCatalogDto,
  CreateOfferingDto,
  UpdateCatalogDto,
  UpdateOfferingDto,
} from '../dto/catalog.dto';
import { CatalogService } from '../service/catalog.service';
import { RolesGuard } from '../../../core/auth/guard/roles.guard';
import { Roles } from '../../../core/auth/decorators/roles.decorator';
import { UserRole } from '../../../core/types/user-role.enum';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CatalogBulkUploadQueueService } from '../service/catalog-bulk-upload-queue.service';

@ApiTags('Catalogs')
@ApiBearerAuth()
@UseGuards(JwtClaimsGuard, TenantAccessGuard, RolesGuard)
@Controller('tenants/:tenantId/catalogs')
export class CatalogController {
  constructor(
    private readonly catalogService: CatalogService,
    private readonly catalogBulkUploadQueueService: CatalogBulkUploadQueueService,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Get all catalogs' })
  getCatalogs(@Param('tenantId', new ParseUUIDPipe()) tenantId: string) {
    return this.catalogService.getCatalogs(tenantId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get catalog by ID' })
  getCatalogById(
    @Param('tenantId', new ParseUUIDPipe()) tenantId: string,
    @Param('id') id: string,
  ) {
    return this.catalogService.getCatalogById(tenantId, id);
  }

  @Post()
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Create catalog (Admin Only)' })
  createCatalog(
    @Param('tenantId', new ParseUUIDPipe()) tenantId: string,
    @Body() body: CreateCatalogDto,
  ) {
    return this.catalogService.createCatalog(tenantId, body);
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Update catalog (Admin Only)' })
  updateCatalog(
    @Param('tenantId', new ParseUUIDPipe()) tenantId: string,
    @Param('id') id: string,
    @Body() body: UpdateCatalogDto,
  ) {
    return this.catalogService.updateCatalog(tenantId, id, body);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Delete catalog (Admin Only)' })
  deleteCatalog(
    @Param('tenantId', new ParseUUIDPipe()) tenantId: string,
    @Param('id') id: string,
  ) {
    return this.catalogService.deleteCatalog(tenantId, id);
  }

  @Get(':catalogId/offerings')
  @ApiOperation({ summary: 'Get offerings' })
  getOfferings(
    @Param('tenantId', new ParseUUIDPipe()) tenantId: string,
    @Param('catalogId') catalogId: string,
  ) {
    return this.catalogService.getOfferings(tenantId, catalogId);
  }

  @Get(':catalogId/offerings/:id')
  @ApiOperation({ summary: 'Get offering by ID' })
  getOfferingById(
    @Param('tenantId', new ParseUUIDPipe()) tenantId: string,
    @Param('catalogId') catalogId: string,
    @Param('id') id: string,
  ) {
    return this.catalogService.getOfferingById(tenantId, catalogId, id);
  }

  @Post(':catalogId/offerings')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Create offering (Admin Only)' })
  createOffering(
    @Param('tenantId', new ParseUUIDPipe()) tenantId: string,
    @Param('catalogId') catalogId: string,
    @Body() body: CreateOfferingDto,
  ) {
    return this.catalogService.createOffering(tenantId, catalogId, body);
  }

  @Post(':catalogId/offerings/bulk')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Bulk create offerings (Admin Only)' })
  createOfferingsBulk(
    @Param('tenantId', new ParseUUIDPipe()) tenantId: string,
    @Param('catalogId') catalogId: string,
    @Body() body: BulkCreateOfferingsDto,
  ) {
    return this.catalogService.createOfferingsBulk(
      tenantId,
      catalogId,
      body.offerings,
    );
  }

  @Post(':catalogId/offerings/bulk/async')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Queue bulk create offerings (Admin Only)' })
  queueOfferingsBulk(
    @Param('tenantId', new ParseUUIDPipe()) tenantId: string,
    @Param('catalogId') catalogId: string,
    @Body() body: BulkCreateOfferingsDto,
  ) {
    return this.catalogBulkUploadQueueService.enqueueBulkCreateOfferings(
      tenantId,
      catalogId,
      body.offerings,
    );
  }

  @Get(':catalogId/offerings/bulk/jobs')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'List bulk upload jobs (Admin Only)' })
  listOfferingsBulkJobs(
    @Param('tenantId', new ParseUUIDPipe()) tenantId: string,
    @Param('catalogId') catalogId: string,
    @Query('state') state?: string,
    @Query('limit') limit?: string,
  ) {
    return this.catalogBulkUploadQueueService.listBulkCreateOfferingsJobs(
      tenantId,
      catalogId,
      state ?? 'waiting',
      limit ? Number.parseInt(limit, 10) : 20,
    );
  }

  @Get(':catalogId/offerings/bulk/jobs/:jobId')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Get bulk upload job status (Admin Only)' })
  getOfferingsBulkJobStatus(
    @Param('tenantId', new ParseUUIDPipe()) tenantId: string,
    @Param('catalogId') catalogId: string,
    @Param('jobId') jobId: string,
    @Query('includeResult') includeResult?: string,
  ) {
    return this.catalogBulkUploadQueueService
      .getBulkCreateOfferingsJobStatus(tenantId, catalogId, jobId)
      .then((status) => {
        if (includeResult === 'true') {
          return status;
        }

        const { result, ...statusWithoutResult } = status;
        return {
          ...statusWithoutResult,
          result: null,
        };
      });
  }

  @Patch(':catalogId/offerings/:id')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Update offering (Admin Only)' })
  updateOffering(
    @Param('tenantId', new ParseUUIDPipe()) tenantId: string,
    @Param('catalogId') catalogId: string,
    @Param('id') id: string,
    @Body() body: UpdateOfferingDto,
  ) {
    return this.catalogService.updateOffering(tenantId, catalogId, id, body);
  }

  @Delete(':catalogId/offerings/:id')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Delete offering (Admin Only)' })
  deleteOffering(
    @Param('tenantId', new ParseUUIDPipe()) tenantId: string,
    @Param('catalogId') catalogId: string,
    @Param('id') id: string,
  ) {
    return this.catalogService.deleteOffering(tenantId, catalogId, id);
  }
}
