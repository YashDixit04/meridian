import { Body, Controller, Post } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { PublicVendorRegistrationDto } from '../dto/public-vendor-registration.dto';
import { VendorOnboardingService } from '../service/vendor-onboarding.service';

@ApiTags('Public Vendor Onboarding')
@Controller('public/vendors')
export class VendorOnboardingController {
  constructor(
    private readonly vendorOnboardingService: VendorOnboardingService,
  ) {}

  @Post('register')
  @ApiOperation({
    summary: 'Register vendor without login and submit for approval',
  })
  registerVendor(@Body() body: PublicVendorRegistrationDto) {
    return this.vendorOnboardingService.registerVendor(body);
  }
}
