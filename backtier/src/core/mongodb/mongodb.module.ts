import { Global, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongoDbService } from './mongodb.service';
import { TenantCollectionService } from './tenant-collection.service';
import { TenantCacheService } from './tenant-cache.service';

@Global()
@Module({
  imports: [ConfigModule],
  providers: [MongoDbService, TenantCollectionService, TenantCacheService],
  exports: [MongoDbService, TenantCollectionService, TenantCacheService],
})
export class MongoDbModule {}
