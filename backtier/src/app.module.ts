import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './core/auth/auth.module';
import { CatalogModule } from './modules/catalog/catalog.module';
import { MongoDbModule } from './core/mongodb/mongodb.module';
import { RequisitionModule } from './modules/requisition/requisition.module';
import { SmcModule } from './modules/smc/smc.module';
import { TenantModule } from './modules/tenant/tenant.module';
import { UsersModule } from './modules/users/users.module';
import { VendorModule } from './modules/vendor/vendor.module';
import { VendorOnboardingModule } from './modules/vendor-onboarding/vendor-onboarding.module';
import { VesselsModule } from './modules/vessels/vessels.module';
import { DashboardModule } from './modules/dashboard/dashboard.module';
import { TenantResolverMiddleware } from './core/middleware/tenant-resolver.middleware';
import { EventBusModule } from './core/events/event-bus.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    EventBusModule,
    AuthModule,
    MongoDbModule,
    TenantModule,
    UsersModule,
    VendorModule,
    VendorOnboardingModule,
    VesselsModule,
    CatalogModule,
    RequisitionModule,
    SmcModule,
    DashboardModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    // Attach tenant context to every incoming request.
    consumer.apply(TenantResolverMiddleware).forRoutes('*');
  }
}
