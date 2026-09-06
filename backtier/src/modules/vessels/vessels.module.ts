import { Module } from '@nestjs/common';
import { VesselController } from './controller/vessel.controller';
import { VesselRepository } from './repository/vessel.repository';
import { VesselService } from './service/vessel.service';

@Module({
  controllers: [VesselController],
  providers: [VesselService, VesselRepository],
  exports: [VesselService],
})
export class VesselsModule {}
