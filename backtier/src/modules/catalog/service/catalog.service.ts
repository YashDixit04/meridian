import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import {
  CatalogRepository,
  CreateCatalogInput,
  CreateOfferingInput,
  SuperadminCatalogueCascadeDeleteResult,
  UpdateCatalogInput,
  UpdateOfferingInput,
  OfferingEntity,
} from '../repository/catalog.repository';
import { VendorService } from '../../vendor/service/vendor.service';
import { TenantCollectionService } from '../../../core/mongodb/tenant-collection.service';
import { TenantService } from '../../tenant/service/tenant.service';
import { ContractedVendorMappingRepository } from '../repository/contracted-vendor-mapping.repository';

export interface BulkCreateOfferingsFailure {
  index: number;
  productId?: string;
  reason: string;
}

export interface BulkCreateOfferingsProgress {
  total: number;
  processed: number;
  createdCount: number;
  failedCount: number;
  lastIndex: number;
  lastProductId?: string;
}

export interface BulkCreateOfferingsOptions {
  onProgress?: (progress: BulkCreateOfferingsProgress) => void | Promise<void>;
}

export interface BulkCreateOfferingsResult {
  createdCount: number;
  failedCount: number;
  created: Array<Awaited<ReturnType<CatalogRepository['createOffering']>>>;
  failed: BulkCreateOfferingsFailure[];
}

export type SuperadminCatalogueProduct = Awaited<
  ReturnType<CatalogRepository['getSuperadminCatalogueProducts']>
>[number];

@Injectable()
export class CatalogService {
  private readonly logger = new Logger(CatalogService.name);

  constructor(
    private readonly catalogRepository: CatalogRepository,
    private readonly vendorService: VendorService,
    private readonly tenantCollectionService: TenantCollectionService,
    private readonly tenantService: TenantService,
    private readonly contractedVendorMappingRepo: ContractedVendorMappingRepository,
  ) {}

  getCatalogs(tenantId: string) {
    return this.catalogRepository.findAllByTenant(tenantId);
  }

  async getCatalogById(tenantId: string, id: string) {
    const catalog = await this.catalogRepository.findById(tenantId, id);
    if (!catalog) {
      throw new NotFoundException('Catalog not found');
    }
    return catalog;
  }

  createCatalog(tenantId: string, payload: CreateCatalogInput) {
    return this.catalogRepository.createCatalog(tenantId, payload);
  }

  async updateCatalog(
    tenantId: string,
    id: string,
    payload: UpdateCatalogInput,
  ) {
    await this.getCatalogById(tenantId, id);
    return this.catalogRepository.updateCatalog(tenantId, id, payload);
  }

  async deleteCatalog(tenantId: string, id: string) {
    await this.getCatalogById(tenantId, id);
    return this.catalogRepository.deleteCatalog(tenantId, id);
  }

  getOfferings(tenantId: string, catalogId: string) {
    return this.catalogRepository.getOfferings(tenantId, catalogId);
  }

  async getOfferingById(tenantId: string, catalogId: string, id: string) {
    const offering = await this.catalogRepository.getOfferingById(
      tenantId,
      catalogId,
      id,
    );
    if (!offering) {
      throw new NotFoundException('Offering not found');
    }
    return offering;
  }

  async createOffering(
    tenantId: string,
    catalogId: string,
    payload: CreateOfferingInput,
    requestingUserId?: string,
  ) {
    await this.getCatalogById(tenantId, catalogId);

    if (payload.isVendorProduct && !payload.vendorId) {
      throw new BadRequestException('vendorId is required for vendor products.');
    }

    const isCrossTenant = payload.vendorTenantId && payload.vendorTenantId !== tenantId;

    if (isCrossTenant) {
      // FIX 1: Re-check toggle on write path
      const requestingTenant = await this.tenantService.getTenantById(tenantId);
      if (requestingTenant.canViewOtherTenantVendors !== true) {
        throw new ForbiddenException('Cross-tenant vendor selection is not enabled.');
      }

      // FIX 1: Server-side vendor existence verification
      const externalVendor = await this.vendorService.getVendorById(payload.vendorTenantId!, payload.vendorId!);
      if (!externalVendor) {
        throw new BadRequestException('Vendor not found in the specified tenant.');
      }
      if ((externalVendor as any).systemFlags?.isBlacklisted) {
        throw new BadRequestException('Blacklisted vendors cannot receive RFQs.');
      }
    } else if (payload.vendorId) {
      await this.vendorService.assertVendorEligibleForRfq(
        tenantId,
        payload.vendorId,
      );
    }

    const offering = await this.catalogRepository.createOffering(tenantId, catalogId, payload);
    if (!offering) {
      throw new BadRequestException('Failed to create offering.');
    }

    if (payload.isVendorProduct && payload.vendorId) {
      const targetTenantId = isCrossTenant ? payload.vendorTenantId! : tenantId;
      const syncedId = await this.syncProductToVendor(targetTenantId, offering.id, offering as unknown as OfferingEntity);

      if (isCrossTenant) {
        const mapping = await this.contractedVendorMappingRepo.findOrCreate({
          catalogProductId: offering.id,
          smcTenantId: tenantId,
          vendorTenantId: payload.vendorTenantId!,
          vendorId: payload.vendorId,
          createdBy: requestingUserId || 'system',
        });

        // FIX 3: Only update syncedProductId when sync returned a new id
        if (syncedId !== null) {
          await this.contractedVendorMappingRepo.updateSyncedProductId(mapping.id, syncedId);
        }
      }
    }

    return offering;
  }

  async createOfferingsBulk(
    tenantId: string,
    catalogId: string,
    payloads: CreateOfferingInput[],
    options: BulkCreateOfferingsOptions = {},
  ): Promise<BulkCreateOfferingsResult> {
    await this.getCatalogById(tenantId, catalogId);

    if (!Array.isArray(payloads) || payloads.length === 0) {
      throw new BadRequestException(
        'At least one offering payload is required.',
      );
    }

    const created: Array<
      Awaited<ReturnType<CatalogRepository['createOffering']>>
    > = [];
    const failed: BulkCreateOfferingsFailure[] = [];
    const validatedVendorIds = new Set<string>();

    for (const [index, payload] of payloads.entries()) {
      try {
        if (payload.isVendorProduct && !payload.vendorId) {
          throw new BadRequestException(
            'vendorId is required for vendor products.',
          );
        }

        if (payload.vendorId && !validatedVendorIds.has(payload.vendorId)) {
          await this.vendorService.assertVendorEligibleForRfq(
            tenantId,
            payload.vendorId,
          );
          validatedVendorIds.add(payload.vendorId);
        }

        const createdOffering = await this.catalogRepository.createOffering(
          tenantId,
          catalogId,
          payload,
        );
        created.push(createdOffering);
      } catch (error) {
        failed.push({
          index,
          productId: payload.productId,
          reason: this.resolveBulkCreateErrorReason(error),
        });
      }

      await options.onProgress?.({
        total: payloads.length,
        processed: index + 1,
        createdCount: created.length,
        failedCount: failed.length,
        lastIndex: index,
        lastProductId: payload.productId,
      });
    }

    return {
      createdCount: created.length,
      failedCount: failed.length,
      created,
      failed,
    };
  }

  async updateOffering(
    tenantId: string,
    catalogId: string,
    id: string,
    payload: UpdateOfferingInput,
  ) {
    const existingOffering = await this.getOfferingById(
      tenantId,
      catalogId,
      id,
    );
    const nextVendorId = payload.vendorId ?? existingOffering.vendorId;
    const nextIsVendorProduct =
      payload.isVendorProduct ??
      existingOffering.isVendorProduct ??
      Boolean(nextVendorId);

    if (nextIsVendorProduct && !nextVendorId) {
      throw new BadRequestException(
        'vendorId is required when isVendorProduct is true.',
      );
    }

    if (nextVendorId) {
      await this.vendorService.assertVendorEligibleForRfq(
        tenantId,
        nextVendorId,
      );
    }

    return this.catalogRepository.updateOffering(tenantId, id, payload);
  }

  async deleteOffering(tenantId: string, catalogId: string, id: string) {
    await this.getOfferingById(tenantId, catalogId, id);
    return this.catalogRepository.deleteOffering(tenantId, id);
  }

  getSuperadminCatalogueProducts(): Promise<SuperadminCatalogueProduct[]> {
    return this.catalogRepository.getSuperadminCatalogueProducts();
  }

  async deleteSuperadminCatalogueProduct(
    superadminProductId: string,
  ): Promise<SuperadminCatalogueCascadeDeleteResult> {
    const deleted =
      await this.catalogRepository.deleteSuperadminCatalogueProduct(
        superadminProductId,
      );

    if (!deleted) {
      throw new NotFoundException('Superadmin catalogue product not found');
    }

    return deleted;
  }

  private resolveBulkCreateErrorReason(error: unknown): string {
    if (error instanceof BadRequestException) {
      const response = error.getResponse();

      if (typeof response === 'string') {
        return response;
      }

      if (response && typeof response === 'object') {
        const message = (response as { message?: string | string[] }).message;
        if (Array.isArray(message) && message.length > 0) {
          return message.join(', ');
        }

        if (typeof message === 'string' && message.trim().length > 0) {
          return message;
        }
      }

      return error.message || 'Failed to create offering.';
    }

    if (error instanceof Error && error.message.trim().length > 0) {
      return error.message;
    }

    return 'Failed to create offering.';
  }

  async syncProductToVendor(
    vendorTenantId: string,
    offeringId: string,
    productSnapshot: OfferingEntity,
  ): Promise<string | null> {
    const vendorCatalogue = await this.tenantCollectionService.getCollection(
      vendorTenantId,
      'tenantCatalogues',
    );

    // Step 1: Primary dedupe — check if already synced by this exact offering
    const existing = await vendorCatalogue.findOne({ sourceCatalogProductId: offeringId });
    if (existing) {
      return null; // already linked; do NOT re-notify
    }

    const now = new Date();

    // Step 2: Legacy fallback — check if vendor already has this product by productId
    if (productSnapshot.productId) {
      const legacyMatch = await vendorCatalogue.findOne({
        type: 'product',
        productId: productSnapshot.productId,
        sourceCatalogProductId: { $exists: false }, // only pre-existing, un-linked products
      });

      if (legacyMatch) {
        // stamp the link without re-inserting
        await vendorCatalogue.updateOne(
          { id: legacyMatch.id as unknown as string },
          { $set: { sourceCatalogProductId: offeringId, updatedAt: now } },
        );
        this.logger.log(`Linked legacy vendor product ${legacyMatch.id} to offering ${offeringId}`);
        return legacyMatch.id as unknown as string; // non-null → update mapping.syncedProductId
      }
    }

    // Step 3: Insert new product entry in vendor's catalogue
    const newProduct = {
      ...productSnapshot,
      type: 'product',
      sourceCatalogProductId: offeringId,
      tenantId: vendorTenantId,
      updatedAt: now,
    };
    
    // Using `any` to insert because mongo handles _id if not given, 
    // but we already have id on productSnapshot, we can reuse or regenerate if needed.
    await vendorCatalogue.insertOne(newProduct as any);
    this.logger.log(`Synced product ${offeringId} → vendor ${vendorTenantId} as ${newProduct.id}`);
    
    // Notification stub:
    // this.notificationService?.notify(vendorTenantId, 'PRODUCT_SYNCED', { offeringId })
    
    return newProduct.id as string;
  }
}
