import { Module } from '@nestjs/common';
import { VendorController } from './controller/vendor.controller';
import { VendorRepository } from './repository/vendor.repository';
import { VendorService } from './service/vendor.service';
import { TenantModule } from '../tenant/tenant.module';

@Module({
  imports: [TenantModule],
  controllers: [VendorController],
  providers: [VendorService, VendorRepository],
  exports: [VendorService],
})
export class VendorModule {}
