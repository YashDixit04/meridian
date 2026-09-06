import { Module } from '@nestjs/common';
import { TenantModule } from '../tenant/tenant.module';
import { VendorModule } from '../vendor/vendor.module';
import { VendorOnboardingController } from './controller/vendor-onboarding.controller';
import { VendorOnboardingNotificationService } from './service/vendor-onboarding-notification.service';
import { VendorOnboardingNotificationQueueService } from './service/vendor-onboarding-notification-queue.service';
import { VendorOnboardingService } from './service/vendor-onboarding.service';

@Module({
  imports: [TenantModule, VendorModule],
  controllers: [VendorOnboardingController],
  providers: [
    VendorOnboardingService,
    VendorOnboardingNotificationService,
    VendorOnboardingNotificationQueueService,
  ],
})
export class VendorOnboardingModule {}
