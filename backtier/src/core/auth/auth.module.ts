import { Global, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { JwtClaimsGuard } from './guard/jwt-claims.guard';
import { TenantAccessGuard } from './guard/tenant-access.guard';
import { RolesGuard } from './guard/roles.guard';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';

@Global()
@Module({
  imports: [
    ConfigModule,
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret:
          configService.get<string>('JWT_SECRET') ?? 'change-me-in-production',
      }),
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtClaimsGuard, TenantAccessGuard, RolesGuard],
  exports: [
    AuthService,
    JwtModule,
    JwtClaimsGuard,
    TenantAccessGuard,
    RolesGuard,
  ],
})
export class AuthModule {}
