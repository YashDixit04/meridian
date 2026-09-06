import { Module } from '@nestjs/common';
import { SmcController } from './controller/smc.controller';
import { SmcRepository } from './repository/smc.repository';
import { SmcService } from './service/smc.service';

@Module({
  controllers: [SmcController],
  providers: [SmcService, SmcRepository],
  exports: [SmcService],
})
export class SmcModule {}
