import { Module } from '@nestjs/common';
import { TenantModule } from '../tenant/tenant.module';
import { CatalogController } from './controller/catalog.controller';
import { SuperadminCatalogueController } from './controller/superadmin-catalogue.controller';
import { CatalogRepository } from './repository/catalog.repository';
import { ContractedVendorMappingRepository } from './repository/contracted-vendor-mapping.repository';
import { CatalogService } from './service/catalog.service';
import { CatalogBulkUploadQueueService } from './service/catalog-bulk-upload-queue.service';
import { VendorModule } from '../vendor/vendor.module';
import { SuperadminRoleGuard } from '../../core/auth/guard/superadmin-role.guard';

@Module({
  imports: [VendorModule, TenantModule],
  controllers: [CatalogController, SuperadminCatalogueController],
  providers: [
    CatalogService,
    CatalogRepository,
    ContractedVendorMappingRepository,
    SuperadminRoleGuard,
    CatalogBulkUploadQueueService,
  ],
  exports: [CatalogService, ContractedVendorMappingRepository],
})
export class CatalogModule {}
