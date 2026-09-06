import { Module } from '@nestjs/common';
import { RequisitionController } from './controller/requisition.controller';
import { RequisitionRepository } from './repository/requisition.repository';
import { RequisitionService } from './service/requisition.service';
import { VendorModule } from '../vendor/vendor.module';

@Module({
  imports: [VendorModule],
  controllers: [RequisitionController],
  providers: [RequisitionService, RequisitionRepository],
  exports: [RequisitionService],
})
export class RequisitionModule {}
