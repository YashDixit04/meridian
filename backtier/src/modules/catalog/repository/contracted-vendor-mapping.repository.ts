import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { MongoDbService } from '../../../core/mongodb/mongodb.service';
import { Document, Collection } from 'mongodb';
import { stripMongoId, stripMongoIds } from '../../../core/mongodb/mongo-document.util';

export interface CreateContractedVendorMappingDto {
  catalogProductId: string;
  smcTenantId: string;
  vendorTenantId: string;
  vendorId: string;
  createdBy: string;
}

export interface ContractedVendorMappingEntity extends Document {
  id: string;
  catalogProductId: string;
  smcTenantId: string;
  vendorTenantId: string;
  vendorId: string;
  relationshipType: 'ContractedVendor';
  syncedProductId: string | null;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

@Injectable()
export class ContractedVendorMappingRepository implements OnModuleInit {
  private readonly logger = new Logger(ContractedVendorMappingRepository.name);
  private readonly collectionName = 'contracted_vendor_mappings';

  constructor(private readonly mongoDbService: MongoDbService) {}

  private get collection(): Collection<ContractedVendorMappingEntity> {
    return this.mongoDbService.collection<ContractedVendorMappingEntity>(this.collectionName);
  }

  async onModuleInit() {
    await this.ensureIndexes();
  }

  private async ensureIndexes() {
    try {
      await this.collection.createIndex(
        { catalogProductId: 1, vendorTenantId: 1, vendorId: 1 },
        { unique: true, name: 'contracted_vendor_mappings_unique' }
      );
      await this.collection.createIndex({ smcTenantId: 1 }, { name: 'cvm_smc_tenant_idx' });
      await this.collection.createIndex({ vendorTenantId: 1 }, { name: 'cvm_vendor_tenant_idx' });
      await this.collection.createIndex({ createdAt: -1 }, { name: 'cvm_created_at_idx' });
      this.logger.log(`Indexes ensured for ${this.collectionName}`);
    } catch (error) {
      this.logger.error(`Failed to ensure indexes for ${this.collectionName}`, error);
    }
  }

  async findOrCreate(dto: CreateContractedVendorMappingDto): Promise<Omit<ContractedVendorMappingEntity, '_id'>> {
    const now = new Date();
    
    const filter = {
      catalogProductId: dto.catalogProductId,
      vendorTenantId: dto.vendorTenantId,
      vendorId: dto.vendorId,
    };

    const update = {
      $setOnInsert: {
        id: randomUUID(),
        catalogProductId: dto.catalogProductId,
        smcTenantId: dto.smcTenantId,
        vendorTenantId: dto.vendorTenantId,
        vendorId: dto.vendorId,
        relationshipType: 'ContractedVendor' as const,
        syncedProductId: null,
        createdBy: dto.createdBy,
        createdAt: now,
      },
      $set: {
        updatedAt: now,
      },
    };

    const result = await this.collection.findOneAndUpdate(filter, update, {
      upsert: true,
      returnDocument: 'after',
    });

    if (!result) {
      throw new Error('Failed to find or create contracted vendor mapping');
    }

    return stripMongoId(result) as unknown as Omit<ContractedVendorMappingEntity, '_id'>;
  }

  async updateSyncedProductId(id: string, syncedProductId: string): Promise<void> {
    await this.collection.updateOne(
      { id },
      { 
        $set: { 
          syncedProductId,
          updatedAt: new Date()
        } 
      }
    );
  }

  async findByOfferingId(catalogProductId: string): Promise<Omit<ContractedVendorMappingEntity, '_id'>[]> {
    const results = await this.collection.find({ catalogProductId }).sort({ createdAt: -1 }).toArray();
    return stripMongoIds(results as any[]) as unknown as Omit<ContractedVendorMappingEntity, '_id'>[];
  }
}
