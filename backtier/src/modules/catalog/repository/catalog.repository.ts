import { BadRequestException, Injectable } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { ClientSession, Document, MongoServerError } from 'mongodb';
import { MongoDbService } from '../../../core/mongodb/mongodb.service';
import { TenantCollectionService } from '../../../core/mongodb/tenant-collection.service';
import {
  stripMongoId,
  stripMongoIds,
} from '../../../core/mongodb/mongo-document.util';

export interface CreateCatalogInput {
  name: string;
  description?: string;
}

export interface UpdateCatalogInput {
  name?: string;
  description?: string;
}

export interface CreateOfferingInput {
  name: string;
  price: number;
  vendorId?: string;
  vendorTenantId?: string;
  isVendorProduct?: boolean;
  ports?: string[];
  productId?: string;
  productIdType?: string;
  category?: string;
  country?: string;
  region?: string;
  images?: string[];
  videos?: string[];
  variations?: string[];
  inventory?: Array<Record<string, unknown>>;
}

export interface UpdateOfferingInput {
  name?: string;
  price?: number;
  vendorId?: string;
  isVendorProduct?: boolean;
  ports?: string[];
  productId?: string;
  productIdType?: string;
  category?: string;
  country?: string;
  region?: string;
  images?: string[];
  videos?: string[];
  variations?: string[];
  inventory?: Array<Record<string, unknown>>;
}

export interface CatalogEntity extends Document {
  id: string;
  type: 'catalog';
  name: string;
  description?: string;
  tenantId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface OfferingEntity extends Document {
  id: string;
  type: 'product';
  tenantId: string;
  catalogId: string;
  superadminProductId: string;
  name: string;
  price: number;
  vendorId?: string;
  isVendorProduct: boolean;
  ports: string[];
  productId?: string;
  productIdType?: string;
  category?: string;
  country?: string;
  region?: string;
  images: string[];
  videos: string[];
  variations: string[];
  inventory: Array<Record<string, unknown>>;
  createdAt: Date;
  updatedAt: Date;
}

export interface SuperadminCatalogueEntity extends Document {
  id: string;
  lookupKey: string;
  productId?: string;
  normalizedProductId?: string;
  productIdType?: string;
  name: string;
  price?: number;
  images: string[];
  videos: string[];
  variations: string[];
  inventory: Array<Record<string, unknown>>;
  sourceTenantId: string;
  sourceCatalogId: string;
  sourceTenantName?: string;
  sourceCatalogName?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CatalogueMappingEntity extends OfferingEntity {}

/** Union type for documents in the shared tenant_catalogues collection */
export type TenantCatalogueDocument = CatalogEntity | OfferingEntity;

export interface SuperadminCatalogueCascadeDeleteResult {
  deletedProductId: string;
  deletedOfferingsCount: number;
  deletedMappingsCount: number;
  deletedTenantCatalogueEntriesCount: number;
  affectedTenantIds: string[];
}

export interface VendorEntity extends Document {
  id: string;
  tenantId: string;
  name: string;
  contactEmail?: string;
  createdAt: Date;
  updatedAt: Date;
}

interface TenantMetadataEntity extends Document {
  id: string;
  name?: string;
  collectionPrefix?: string;
}

interface TenantCatalogueLookupEntity extends Document {
  id: string;
  name?: string;
}

@Injectable()
export class CatalogRepository {
  private superadminCatalogueReadyPromise?: Promise<void>;
  private readonly superadminDatabaseName =
    process.env.SUPERADMIN_DB_NAME?.trim() || 'superadmin';
  private readonly defaultDatabaseName = process.env.MONGODB_DB_NAME?.trim();

  constructor(
    private readonly mongoDbService: MongoDbService,
    private readonly tenantCollectionService: TenantCollectionService,
  ) {}

  async findAllByTenant(tenantId: string) {
    // tenant_catalogues holds both type='catalog' and type='product' documents.
    const sharedCollection = await this.tenantCataloguesCollection(tenantId);

    const [catalogRows, offeringRows] = await Promise.all([
      sharedCollection
        .find({ type: 'catalog' })
        .sort({ createdAt: -1 })
        .toArray(),
      sharedCollection
        .find({ type: 'product' })
        .sort({ createdAt: -1 })
        .toArray(),
    ]);

    const catalogs = stripMongoIds(catalogRows as any[]) as CatalogEntity[];
    const typedOfferingRows = offeringRows as unknown as OfferingEntity[];

    if (catalogs.length === 0 && typedOfferingRows.length === 0) {
      return [];
    }

    const catalogMap = new Map(
      catalogs.map((catalog) => [catalog.id, catalog]),
    );
    for (const offering of typedOfferingRows) {
      if (!catalogMap.has(offering.catalogId)) {
        catalogMap.set(
          offering.catalogId,
          this.buildVirtualCatalog(tenantId, offering.catalogId, offering),
        );
      }
    }

    const mergedCatalogs = Array.from(catalogMap.values()).sort(
      (left, right) => right.createdAt.getTime() - left.createdAt.getTime(),
    );

    return this.attachOfferings(tenantId, mergedCatalogs, typedOfferingRows);
  }

  async findById(tenantId: string, id: string) {
    const sharedCollection = await this.tenantCataloguesCollection(tenantId);
    const vendorsCollection = await this.vendorsCollection(tenantId);

    const catalog = (await sharedCollection.findOne({
      id,
      type: 'catalog',
    })) as unknown as CatalogEntity | null;

    const offeringRows = (await sharedCollection
      .find({ catalogId: id, type: 'product' })
      .sort({ createdAt: -1 })
      .toArray()) as unknown as OfferingEntity[];

    if (!catalog && offeringRows.length === 0) {
      return null;
    }

    const vendors = await vendorsCollection.find({}).toArray();

    const vendorMap = new Map(
      stripMongoIds(vendors).map((vendor) => [vendor.id, vendor]),
    );
    const offerings = stripMongoIds(offeringRows).map((offering) => ({
      ...offering,
      vendor: offering.vendorId
        ? (vendorMap.get(offering.vendorId) ?? null)
        : null,
    }));

    const catalogEntity =
      catalog ?? this.buildVirtualCatalog(tenantId, id, offeringRows[0]);

    return {
      ...stripMongoId(catalogEntity),
      offerings,
    };
  }

  async createCatalog(tenantId: string, payload: CreateCatalogInput) {
    const now = new Date();
    const catalog: CatalogEntity = {
      id: randomUUID(),
      type: 'catalog',
      name: payload.name,
      description: payload.description,
      tenantId,
      createdAt: now,
      updatedAt: now,
    };

    const catalogsCollection = await this.catalogsCollection(tenantId);
    await catalogsCollection.insertOne(catalog as any);
    return stripMongoId(catalog);
  }

  async updateCatalog(
    tenantId: string,
    id: string,
    payload: UpdateCatalogInput,
  ) {
    const catalogsCollection = await this.catalogsCollection(tenantId);
    const updates = this.removeUndefined(payload);
    if (Object.keys(updates).length > 0) {
      await catalogsCollection.updateOne(
        { id, type: 'catalog' },
        {
          $set: {
            ...updates,
            updatedAt: new Date(),
          },
        },
      );
    }

    return stripMongoId(
      await catalogsCollection.findOne({ id, type: 'catalog' }),
    );
  }

  async deleteCatalog(tenantId: string, id: string) {
    const catalogsCollection = await this.catalogsCollection(tenantId);
    const offeringsCollection = await this.offeringsCollection(tenantId);

    const catalog = await catalogsCollection.findOne({ id, type: 'catalog' });
    if (!catalog) {
      return null;
    }

    await this.executeWithOptionalTransaction(async (session) => {
      await Promise.all([
        offeringsCollection.deleteMany(
          { catalogId: id, type: 'product' },
          this.sessionOptions(session),
        ),
        catalogsCollection.deleteOne(
          { id, type: 'catalog' },
          this.sessionOptions(session),
        ),
      ]);
    });

    return stripMongoId(catalog);
  }

  async getOfferings(tenantId: string, catalogId: string) {
    const catalogsCollection = await this.catalogsCollection(tenantId);
    const offeringsCollection = await this.offeringsCollection(tenantId);
    const vendorsCollection = await this.vendorsCollection(tenantId);

    const catalog = await catalogsCollection.findOne({
      id: catalogId,
      type: 'catalog',
    });

    const offerings = await offeringsCollection
      .find({ catalogId, type: 'product' })
      .sort({ createdAt: -1 })
      .toArray();

    if (offerings.length === 0) {
      return [];
    }

    const vendorIds = offerings
      .map((offering) => offering.vendorId)
      .filter(
        (vendorId): vendorId is string =>
          typeof vendorId === 'string' && vendorId.length > 0,
      );
    const vendors =
      vendorIds.length > 0
        ? await vendorsCollection.find({ id: { $in: vendorIds } }).toArray()
        : [];

    const catalogPlain = stripMongoId(
      catalog ?? this.buildVirtualCatalog(tenantId, catalogId, offerings[0]),
    );
    const vendorMap = new Map(
      stripMongoIds(vendors).map((vendor) => [vendor.id, vendor]),
    );

    return stripMongoIds(offerings).map((offering) => ({
      ...offering,
      vendor: offering.vendorId
        ? (vendorMap.get(offering.vendorId) ?? null)
        : null,
      catalog: catalogPlain,
    }));
  }

  async getOfferingById(tenantId: string, catalogId: string, id: string) {
    const catalogsCollection = await this.catalogsCollection(tenantId);
    const offeringsCollection = await this.offeringsCollection(tenantId);
    const vendorsCollection = await this.vendorsCollection(tenantId);

    const catalog = await catalogsCollection.findOne({
      id: catalogId,
      type: 'catalog',
      tenantId,
    });
    if (!catalog) {
      return null;
    }

    const offering = await offeringsCollection.findOne({
      id,
      catalogId,
      type: 'product',
    });
    if (!offering) {
      return null;
    }

    const vendor = offering.vendorId
      ? await vendorsCollection.findOne({ id: offering.vendorId })
      : null;

    return {
      ...stripMongoId(offering),
      vendor: stripMongoId(vendor),
      catalog: stripMongoId(catalog),
    };
  }

  async createOffering(
    tenantId: string,
    catalogId: string,
    payload: CreateOfferingInput,
  ) {
    const catalogsCollection = await this.catalogsCollection(tenantId);
    const offeringsCollection = await this.offeringsCollection(tenantId);
    const vendorsCollection = await this.vendorsCollection(tenantId);

    return this.executeWithOptionalTransaction(async (session) => {
      const catalog = await catalogsCollection.findOne(
        { id: catalogId, type: 'catalog' },
        this.sessionOptions(session),
      );

      if (!catalog) {
        throw new BadRequestException(
          'Catalog not found for offering creation.',
        );
      }

      if (payload.isVendorProduct && !payload.vendorId) {
        throw new BadRequestException(
          'vendorId is required for vendor products.',
        );
      }

      if (payload.vendorId && !payload.vendorTenantId) {
        const vendor = await vendorsCollection.findOne(
          {
            id: payload.vendorId,
            tenantId: catalog.tenantId,
          },
          this.sessionOptions(session),
        );

        if (!vendor) {
          throw new BadRequestException('Vendor not found for this tenant.');
        }
      }

      const normalizedProductId = this.normalizeOptionalString(
        payload.productId,
      );
      if (normalizedProductId) {
        const duplicateOffering = await offeringsCollection.findOne(
          {
            type: 'product',
            productId: normalizedProductId,
          },
          this.sessionOptions(session),
        );

        if (duplicateOffering) {
          throw new BadRequestException(
            'productId must be unique within this tenant catalogue.',
          );
        }
      }

      const now = new Date();
      const superadminProduct = await this.ensureSuperadminCatalogueProduct(
        tenantId,
        catalogId,
        payload,
        normalizedProductId,
        now,
        session,
      );

      const resolvedCategory =
        this.normalizeOptionalString(payload.category) ||
        catalogId
          .split('-')
          .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
          .join(' ') ||
        'Uncategorized';

      const offering: OfferingEntity = {
        id: randomUUID(),
        type: 'product',
        tenantId,
        catalogId,
        superadminProductId: superadminProduct.id,
        name: payload.name,
        price: payload.price,
        vendorId: payload.vendorId,
        isVendorProduct: payload.isVendorProduct ?? Boolean(payload.vendorId),
        ports: this.normalizeStringArray(payload.ports),
        productId: normalizedProductId,
        productIdType: this.normalizeOptionalString(payload.productIdType),
        category: resolvedCategory,
        country: this.normalizeOptionalString(payload.country),
        region: this.normalizeOptionalString(payload.region),
        images: this.normalizeStringArray(payload.images),
        videos: this.normalizeStringArray(payload.videos),
        variations: this.normalizeStringArray(payload.variations),
        inventory: this.normalizeInventory(payload.inventory),
        createdAt: now,
        updatedAt: now,
      };

      await offeringsCollection.insertOne(
        offering,
        this.sessionOptions(session),
      );

      return stripMongoId(offering);
    });
  }

  async updateOffering(
    tenantId: string,
    id: string,
    payload: UpdateOfferingInput,
  ) {
    const catalogsCollection = await this.catalogsCollection(tenantId);
    const offeringsCollection = await this.offeringsCollection(tenantId);
    const vendorsCollection = await this.vendorsCollection(tenantId);

    return this.executeWithOptionalTransaction(async (session) => {
      const existing = await offeringsCollection.findOne(
        { id, type: 'product' },
        this.sessionOptions(session),
      );
      if (!existing) {
        return null;
      }

      const nextVendorId = payload.vendorId ?? existing.vendorId;
      const nextIsVendorProduct =
        payload.isVendorProduct ??
        existing.isVendorProduct ??
        Boolean(nextVendorId);

      if (nextIsVendorProduct && !nextVendorId) {
        throw new BadRequestException(
          'vendorId is required when isVendorProduct is true.',
        );
      }

      let targetVendorTenantId: string | undefined;
      if (nextVendorId) {
        const catalog = await catalogsCollection.findOne(
          { id: existing.catalogId },
          this.sessionOptions(session),
        );
        if (!catalog) {
          throw new BadRequestException('Catalog not found for this offering.');
        }

        const vendor = await vendorsCollection.findOne(
          {
            id: nextVendorId,
            tenantId: catalog.tenantId,
          },
          this.sessionOptions(session),
        );

        if (!vendor) {
          throw new BadRequestException('Vendor not found for this tenant.');
        }
        targetVendorTenantId = vendor.tenantId;
      }

      let normalizedProductIdForNext = existing.productId;
      if (payload.productId !== undefined) {
        const normalizedProductId = this.normalizeOptionalString(
          payload.productId,
        );

        if (normalizedProductId && normalizedProductId !== existing.productId) {
          const duplicateOffering = await offeringsCollection.findOne(
            {
              type: 'product',
              productId: normalizedProductId,
              id: { $ne: id },
            },
            this.sessionOptions(session),
          );

          if (duplicateOffering) {
            throw new BadRequestException(
              'productId must be unique within this tenant catalogue.',
            );
          }
        }

        normalizedProductIdForNext = normalizedProductId;
      }

      const updates = this.removeUndefined(
        payload,
      ) as Partial<UpdateOfferingInput> & {
        superadminProductId?: string;
        category?: string;
      };
      if (updates.productId !== undefined) {
        updates.productId = this.normalizeOptionalString(updates.productId);
      }

      if (updates.productIdType !== undefined) {
        updates.productIdType = this.normalizeOptionalString(
          updates.productIdType,
        );
      }

      if (updates.category !== undefined) {
        updates.category =
          this.normalizeOptionalString(updates.category) ||
          existing.catalogId
            .split('-')
            .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
            .join(' ') ||
          'Uncategorized';
      }

      if (updates.country !== undefined) {
        updates.country = this.normalizeOptionalString(updates.country);
      }

      if (updates.region !== undefined) {
        updates.region = this.normalizeOptionalString(updates.region);
      }

      if (updates.ports !== undefined) {
        updates.ports = this.normalizeStringArray(updates.ports);
      }

      if (updates.images !== undefined) {
        updates.images = this.normalizeStringArray(updates.images);
      }

      if (updates.videos !== undefined) {
        updates.videos = this.normalizeStringArray(updates.videos);
      }

      if (updates.variations !== undefined) {
        updates.variations = this.normalizeStringArray(updates.variations);
      }

      if (updates.inventory !== undefined) {
        updates.inventory = this.normalizeInventory(updates.inventory);
      }

      const needsSuperadminSync =
        [
          'name',
          'price',
          'productId',
          'productIdType',
          'images',
          'videos',
          'variations',
          'inventory',
        ].some((key) => Object.prototype.hasOwnProperty.call(updates, key)) ||
        !this.normalizeOptionalString(existing.superadminProductId);

      if (needsSuperadminSync) {
        const refreshedSuperadminProduct =
          await this.ensureSuperadminCatalogueProduct(
            tenantId,
            existing.catalogId,
            {
              name:
                this.normalizeOptionalString(updates.name ?? existing.name) ||
                existing.name,
              price:
                typeof updates.price === 'number'
                  ? updates.price
                  : existing.price,
              productId: normalizedProductIdForNext,
              productIdType: this.normalizeOptionalString(
                updates.productIdType ?? existing.productIdType,
              ),
              vendorId: nextVendorId,
              isVendorProduct: nextIsVendorProduct,
              ports: Array.isArray(updates.ports)
                ? updates.ports
                : existing.ports,
              images: Array.isArray(updates.images)
                ? updates.images
                : existing.images,
              videos: Array.isArray(updates.videos)
                ? updates.videos
                : existing.videos,
              variations: Array.isArray(updates.variations)
                ? updates.variations
                : existing.variations,
              inventory: Array.isArray(updates.inventory)
                ? updates.inventory
                : existing.inventory,
            },
            normalizedProductIdForNext,
            new Date(),
            session,
          );

        updates.superadminProductId = refreshedSuperadminProduct.id;
      }

      if (Object.keys(updates).length > 0) {
        await offeringsCollection.updateOne(
          { id },
          {
            $set: {
              ...updates,
              updatedAt: new Date(),
            },
          },
          this.sessionOptions(session),
        );
      }

      const updatedOffering = await offeringsCollection.findOne(
        { id, type: 'product' },
        this.sessionOptions(session),
      );
      if (!updatedOffering) {
        return null;
      }

      if (targetVendorTenantId && targetVendorTenantId !== tenantId) {
        const vendorOfferingsCollection =
          await this.offeringsCollection(targetVendorTenantId);
        await vendorOfferingsCollection.updateOne(
          { id: updatedOffering.id },
          { $set: { ...updatedOffering, tenantId: targetVendorTenantId } },
          { ...this.sessionOptions(session), upsert: true },
        );
      }

      return stripMongoId(updatedOffering);
    });
  }

  async deleteOffering(tenantId: string, id: string) {
    const offeringsCollection = await this.offeringsCollection(tenantId);

    return this.executeWithOptionalTransaction(async (session) => {
      const offering = await offeringsCollection.findOne(
        { id, type: 'product' },
        this.sessionOptions(session),
      );
      if (!offering) {
        return null;
      }

      let targetVendorTenantId: string | undefined;
      if (offering.vendorId) {
        const vendorsCollection = await this.vendorsCollection(tenantId);
        const vendor = await vendorsCollection.findOne(
          { id: offering.vendorId },
          this.sessionOptions(session),
        );
        if (vendor) {
          targetVendorTenantId = vendor.tenantId;
        }
      }

      await offeringsCollection.deleteOne(
        { id, type: 'product' },
        this.sessionOptions(session),
      );

      if (targetVendorTenantId && targetVendorTenantId !== tenantId) {
        const vendorOfferingsCollection =
          await this.offeringsCollection(targetVendorTenantId);
        await vendorOfferingsCollection.deleteOne(
          { id, type: 'product' },
          this.sessionOptions(session),
        );
      }

      return stripMongoId(offering);
    });
  }

  async getSuperadminCatalogueProducts() {
    // Scan all tenant_catalogues collections for type='product' documents
    const tenantTargets =
      await this.tenantCollectionService.listTenantCollectionTargets(
        'tenantCatalogues',
      );

    const offeringBackedProducts: SuperadminCatalogueEntity[] = [];
    for (const target of tenantTargets) {
      const offeringRows = await this.mongoDbService
        .collection<OfferingEntity>(target.collectionName)
        .find({ type: 'product' })
        .sort({ updatedAt: -1, createdAt: -1 })
        .toArray();

      for (const offering of offeringRows) {
        const normalizedProductId = this.normalizeOptionalString(
          offering.productId,
        );
        offeringBackedProducts.push({
          id: offering.id,
          lookupKey: `${target.tenantId}:${offering.id}`,
          productId: normalizedProductId,
          normalizedProductId: normalizedProductId?.toLowerCase(),
          productIdType: this.normalizeOptionalString(offering.productIdType),
          name: offering.name,
          price: offering.price,
          images: this.normalizeStringArray(offering.images),
          videos: this.normalizeStringArray(offering.videos),
          variations: this.normalizeStringArray(offering.variations),
          inventory: this.normalizeInventory(offering.inventory),
          sourceTenantId: target.tenantId,
          sourceCatalogId: offering.catalogId,
          createdAt: offering.createdAt,
          updatedAt: offering.updatedAt,
        });
      }
    }

    const superadminCollection = await this.superadminCatalogueCollection();
    const superadminRows = stripMongoIds(
      await superadminCollection
        .find({})
        .sort({ updatedAt: -1, createdAt: -1 })
        .toArray(),
    ) as SuperadminCatalogueEntity[];

    let products = offeringBackedProducts.sort(
      (left, right) => right.updatedAt.getTime() - left.updatedAt.getTime(),
    );

    if (products.length === 0 || superadminRows.length > products.length) {
      products = superadminRows;
    }

    if (products.length === 0) {
      return [];
    }

    const sourceTenantIds = Array.from(
      new Set(
        products
          .map((product) =>
            this.normalizeOptionalString(product.sourceTenantId),
          )
          .filter((tenantId): tenantId is string => Boolean(tenantId)),
      ),
    );

    const tenantRows =
      sourceTenantIds.length > 0
        ? await this.tenantsCollection()
            .find(
              { id: { $in: sourceTenantIds } },
              { projection: { id: 1, name: 1, collectionPrefix: 1 } },
            )
            .toArray()
        : [];

    const tenantMetaById = new Map(
      tenantRows.map((tenant) => [tenant.id, tenant]),
    );

    const sourceCatalogNames = await this.resolveSourceCatalogNames(
      products,
      tenantMetaById,
    );

    return products.map((product) => {
      const sourceTenantId = this.normalizeOptionalString(
        product.sourceTenantId,
      );
      const sourceCatalogId = this.normalizeOptionalString(
        product.sourceCatalogId,
      );
      const sourceTenantMeta = sourceTenantId
        ? tenantMetaById.get(sourceTenantId)
        : undefined;
      const sourceTenantName = this.normalizeOptionalString(
        sourceTenantMeta?.name,
      );
      const sourceCatalogName =
        sourceTenantId && sourceCatalogId
          ? sourceCatalogNames.get(`${sourceTenantId}:${sourceCatalogId}`)
          : undefined;

      return {
        ...product,
        sourceTenantName,
        sourceCatalogName:
          sourceCatalogName ?? this.deriveCatalogName(sourceCatalogId),
      };
    });
  }

  async deleteSuperadminCatalogueProduct(
    superadminProductId: string,
  ): Promise<SuperadminCatalogueCascadeDeleteResult | null> {
    const superadminCollection = await this.superadminCatalogueCollection();

    const existingProduct = await superadminCollection.findOne({
      id: superadminProductId,
    });
    if (!existingProduct) {
      // Fallback: scan tenant_catalogues for orphaned product
      const tenantTargets =
        await this.tenantCollectionService.listTenantCollectionTargets(
          'tenantCatalogues',
        );
      let resolvedTenantId: string | undefined;

      for (const target of tenantTargets) {
        const offering = await this.mongoDbService
          .collection<OfferingEntity>(target.collectionName)
          .findOne({ id: superadminProductId, type: 'product' });

        if (offering) {
          resolvedTenantId = target.tenantId;
          break;
        }
      }

      if (!resolvedTenantId) {
        return null;
      }

      return this.executeWithOptionalTransaction(async (session) => {
        const offeringsCollection =
          await this.offeringsCollection(resolvedTenantId);

        const offeringDeleteResult = await offeringsCollection.deleteOne(
          { id: superadminProductId, type: 'product' },
          this.sessionOptions(session),
        );
        const deletedOfferingsCount = offeringDeleteResult.deletedCount ?? 0;

        return {
          deletedProductId: superadminProductId,
          deletedOfferingsCount,
          deletedMappingsCount: deletedOfferingsCount,
          deletedTenantCatalogueEntriesCount: 0,
          affectedTenantIds:
            deletedOfferingsCount > 0 ? [resolvedTenantId] : [],
        };
      });
    }

    return this.executeWithOptionalTransaction(async (session) => {
      const normalizedProductId = this.normalizeOptionalString(
        existingProduct.productId,
      );

      const offeringFilter = normalizedProductId
        ? {
            $or: [{ superadminProductId }, { productId: normalizedProductId }],
          }
        : { superadminProductId };

      // Cascade-delete product entries across all tenant_catalogues
      const tenantTargets =
        await this.tenantCollectionService.listTenantCollectionTargets(
          'tenantCatalogues',
        );

      const affectedTenantIds = new Set<string>();
      let deletedMappingsCount = 0;

      for (const target of tenantTargets) {
        const deleteResult = await this.mongoDbService
          .collection<CatalogueMappingEntity>(target.collectionName)
          .deleteMany(
            { ...offeringFilter, type: 'product' },
            this.sessionOptions(session),
          );

        const deletedCount = deleteResult.deletedCount ?? 0;
        deletedMappingsCount += deletedCount;

        if (deletedCount > 0) {
          affectedTenantIds.add(target.tenantId);
        }
      }

      await superadminCollection.deleteOne(
        { id: superadminProductId },
        this.sessionOptions(session),
      );

      return {
        deletedProductId: superadminProductId,
        deletedMappingsCount,
        deletedOfferingsCount: deletedMappingsCount,
        deletedTenantCatalogueEntriesCount: 0,
        affectedTenantIds: Array.from(affectedTenantIds),
      };
    });
  }

  private async attachOfferings(
    tenantId: string,
    catalogRows: CatalogEntity[],
    offeringRowsInput?: OfferingEntity[],
  ) {
    if (catalogRows.length === 0) {
      return [];
    }

    const offeringsCollection = await this.offeringsCollection(tenantId);
    const vendorsCollection = await this.vendorsCollection(tenantId);

    const catalogIds = catalogRows.map((catalog) => catalog.id);
    const offerings: OfferingEntity[] = offeringRowsInput
      ? offeringRowsInput.filter((offering) =>
          catalogIds.includes(offering.catalogId),
        )
      : ((await offeringsCollection
          .find({ catalogId: { $in: catalogIds }, type: 'product' })
          .sort({ createdAt: -1 })
          .toArray()) as unknown as OfferingEntity[]);

    const vendorIds = offerings
      .map((offering) => offering.vendorId)
      .filter(
        (vendorId): vendorId is string =>
          typeof vendorId === 'string' && vendorId.length > 0,
      );
    const vendors =
      vendorIds.length > 0
        ? await vendorsCollection.find({ id: { $in: vendorIds } }).toArray()
        : [];

    const vendorMap = new Map(
      stripMongoIds(vendors).map((vendor) => [vendor.id, vendor]),
    );
    const groupedOfferings = new Map<string, Array<Record<string, unknown>>>();

    for (const offering of stripMongoIds(offerings)) {
      const bucket = groupedOfferings.get(offering.catalogId) ?? [];
      bucket.push({
        ...offering,
        vendor: offering.vendorId
          ? (vendorMap.get(offering.vendorId) ?? null)
          : null,
      });
      groupedOfferings.set(offering.catalogId, bucket);
    }

    return stripMongoIds(catalogRows).map((catalog) => ({
      ...catalog,
      offerings: groupedOfferings.get(catalog.id) ?? [],
    }));
  }

  private async catalogsCollection(tenantId: string) {
    // Both catalog metadata and product offerings live in tenant_catalogues,
    // differentiated by the `type` field ('catalog' | 'product').
    return this.tenantCollectionService.getCollection<CatalogEntity>(
      tenantId,
      'tenantCatalogues',
    );
  }

  private async offeringsCollection(tenantId: string) {
    // Products/offerings are stored in the same tenant_catalogues collection
    // with type='product' to allow a single unified collection per tenant.
    return this.tenantCollectionService.getCollection<OfferingEntity>(
      tenantId,
      'tenantCatalogues',
    );
  }

  private async catalogueMappingsCollection(tenantId: string) {
    return this.offeringsCollection(tenantId);
  }

  /** Returns a loosely-typed handle to the shared tenant_catalogues collection for cross-type queries. */
  private async tenantCataloguesCollection(tenantId: string) {
    return this.tenantCollectionService.getCollection<TenantCatalogueDocument>(
      tenantId,
      'tenantCatalogues',
    );
  }

  private async superadminCatalogueCollection() {
    await this.ensureSuperadminCatalogueCollectionReady();
    return this.mongoDbService.collection<SuperadminCatalogueEntity>(
      'superadmin_catalogue',
      this.superadminDatabaseName,
    );
  }

  private async vendorsCollection(tenantId: string) {
    return this.tenantCollectionService.getCollection<VendorEntity>(
      tenantId,
      'vendors',
    );
  }

  private tenantsCollection() {
    return this.mongoDbService.collection<TenantMetadataEntity>('tenants');
  }

  private async resolveSourceCatalogNames(
    products: SuperadminCatalogueEntity[],
    tenantMetaById: Map<string, TenantMetadataEntity>,
  ): Promise<Map<string, string>> {
    const catalogIdsByTenant = new Map<string, Set<string>>();

    for (const product of products) {
      const sourceTenantId = this.normalizeOptionalString(
        product.sourceTenantId,
      );
      const sourceCatalogId = this.normalizeOptionalString(
        product.sourceCatalogId,
      );

      if (!sourceTenantId || !sourceCatalogId) {
        continue;
      }

      const bucket =
        catalogIdsByTenant.get(sourceTenantId) ?? new Set<string>();
      bucket.add(sourceCatalogId);
      catalogIdsByTenant.set(sourceTenantId, bucket);
    }

    const catalogNameByTenantCatalogKey = new Map<string, string>();

    for (const [tenantId, catalogIds] of catalogIdsByTenant.entries()) {
      const tenantMeta = tenantMetaById.get(tenantId);
      const tenantPrefix = tenantMeta
        ? this.resolveTenantCollectionPrefix(tenantMeta)
        : undefined;

      if (!tenantPrefix) {
        continue;
      }

      const tenantCatalogCollectionName =
        this.tenantCollectionService.buildCollectionName(
          tenantPrefix,
          'tenantCatalogues',
        );

      const catalogRows = await this.mongoDbService
        .collection<TenantCatalogueLookupEntity>(tenantCatalogCollectionName)
        .find(
          { id: { $in: Array.from(catalogIds) } },
          { projection: { id: 1, name: 1 } },
        )
        .toArray();

      for (const row of catalogRows) {
        const catalogId = this.normalizeOptionalString(row.id);
        const catalogName = this.normalizeOptionalString(row.name);

        if (!catalogId || !catalogName) {
          continue;
        }

        catalogNameByTenantCatalogKey.set(
          `${tenantId}:${catalogId}`,
          catalogName,
        );
      }
    }

    return catalogNameByTenantCatalogKey;
  }

  private resolveTenantCollectionPrefix(
    tenantMeta: TenantMetadataEntity,
  ): string | undefined {
    const existingPrefix = this.normalizeOptionalString(
      tenantMeta.collectionPrefix,
    );
    if (existingPrefix) {
      return existingPrefix;
    }

    const tenantName = this.normalizeOptionalString(tenantMeta.name);
    if (!tenantName) {
      return undefined;
    }

    return this.tenantCollectionService.createCollectionPrefix(tenantName);
  }

  private async ensureSuperadminCatalogueCollectionReady() {
    if (!this.superadminCatalogueReadyPromise) {
      this.superadminCatalogueReadyPromise = (async () => {
        await this.mongoDbService.renameCollectionIfExists(
          'catalogs',
          'superadmin_catalogue',
          this.superadminDatabaseName,
        );
        await this.mongoDbService.ensureCollection(
          'superadmin_catalogue',
          this.superadminDatabaseName,
        );

        if (
          this.defaultDatabaseName &&
          this.defaultDatabaseName !== this.superadminDatabaseName
        ) {
          await this.mongoDbService.dropCollectionIfExists(
            'superadmin_catalogue',
            this.defaultDatabaseName,
          );
        }

        const collection =
          this.mongoDbService.collection<SuperadminCatalogueEntity>(
            'superadmin_catalogue',
            this.superadminDatabaseName,
          );
        await collection.createIndex(
          { id: 1 },
          { unique: true, name: 'superadmin_catalogue_id_unique' },
        );
        await collection.createIndex(
          { lookupKey: 1 },
          { name: 'superadmin_catalogue_lookup_key_idx' },
        );
        await collection.createIndex(
          { normalizedProductId: 1 },
          { sparse: true, name: 'superadmin_catalogue_product_id_idx' },
        );
        await collection.createIndex(
          { updatedAt: -1 },
          { name: 'superadmin_catalogue_updated_at_idx' },
        );
      })();
    }

    await this.superadminCatalogueReadyPromise;
  }

  private buildSuperadminLookupKey(
    normalizedProductId: string | undefined,
    productName: string,
    productIdType: string | undefined,
  ): string {
    if (normalizedProductId) {
      return `product:${normalizedProductId.toLowerCase()}`;
    }

    const normalizedName = productName.trim().toLowerCase();
    const normalizedType = (productIdType ?? '').trim().toLowerCase();
    return `name:${normalizedName}|type:${normalizedType}`;
  }

  private async ensureSuperadminCatalogueProduct(
    tenantId: string,
    catalogId: string,
    payload: CreateOfferingInput,
    normalizedProductId: string | undefined,
    now: Date,
    session?: ClientSession,
  ): Promise<SuperadminCatalogueEntity> {
    const superadminCollection = await this.superadminCatalogueCollection();
    const normalizedName =
      this.normalizeOptionalString(payload.name) || payload.name;
    const normalizedProductIdType = this.normalizeOptionalString(
      payload.productIdType,
    );
    const lookupKey = this.buildSuperadminLookupKey(
      normalizedProductId,
      normalizedName,
      normalizedProductIdType,
    );

    const existing = await superadminCollection.findOne(
      { lookupKey },
      this.sessionOptions(session),
    );

    const normalizedImages = this.normalizeStringArray(payload.images);
    const normalizedVideos = this.normalizeStringArray(payload.videos);
    const normalizedVariations = this.normalizeStringArray(payload.variations);
    const normalizedInventory = this.normalizeInventory(payload.inventory);

    if (existing) {
      const updates = this.removeUndefined({
        name: normalizedName,
        price: payload.price,
        productId: normalizedProductId,
        normalizedProductId,
        productIdType: normalizedProductIdType,
        images: normalizedImages,
        videos: normalizedVideos,
        variations: normalizedVariations,
        inventory: normalizedInventory,
        sourceTenantId: tenantId,
        sourceCatalogId: catalogId,
        updatedAt: now,
      }) as Partial<SuperadminCatalogueEntity>;

      await superadminCollection.updateOne(
        { id: existing.id },
        { $set: updates },
        this.sessionOptions(session),
      );

      return {
        ...existing,
        ...updates,
      };
    }

    const superadminProduct = this.removeUndefined({
      id: randomUUID(),
      lookupKey,
      productId: normalizedProductId,
      normalizedProductId,
      productIdType: normalizedProductIdType,
      name: normalizedName,
      price: payload.price,
      images: normalizedImages,
      videos: normalizedVideos,
      variations: normalizedVariations,
      inventory: normalizedInventory,
      sourceTenantId: tenantId,
      sourceCatalogId: catalogId,
      createdAt: now,
      updatedAt: now,
    }) as SuperadminCatalogueEntity;

    await superadminCollection.insertOne(
      superadminProduct,
      this.sessionOptions(session),
    );
    return superadminProduct;
  }

  private deriveCatalogName(catalogId: string | undefined): string | undefined {
    if (!catalogId) {
      return undefined;
    }

    const normalized = catalogId.trim();
    if (!normalized) {
      return undefined;
    }

    const words = normalized
      .split(/[-_\s]+/)
      .map((word) => word.trim())
      .filter((word) => word.length > 0)
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1));

    return words.length > 0 ? words.join(' ') : normalized;
  }

  private buildVirtualCatalog(
    tenantId: string,
    catalogId: string,
    offering?: OfferingEntity,
  ): CatalogEntity {
    const createdAt = offering?.createdAt ?? new Date();
    const updatedAt = offering?.updatedAt ?? createdAt;

    return {
      id: catalogId,
      type: 'catalog' as const,
      name: this.deriveCatalogName(catalogId) ?? 'Uncategorized',
      description: undefined,
      tenantId,
      createdAt,
      updatedAt,
    };
  }

  private async executeWithOptionalTransaction<T>(
    operation: (session?: ClientSession) => Promise<T>,
  ): Promise<T> {
    try {
      return await this.mongoDbService.runInTransaction(async (session) =>
        operation(session),
      );
    } catch (error) {
      if (this.isTransactionUnsupported(error)) {
        return operation(undefined);
      }

      throw error;
    }
  }

  private isTransactionUnsupported(error: unknown): boolean {
    if (error instanceof MongoServerError) {
      const codeName = (error.codeName || '').toLowerCase();
      if (
        codeName.includes('nosuchtransaction') ||
        codeName.includes('illegaloperation')
      ) {
        return true;
      }
    }

    if (error instanceof Error) {
      const message = error.message.toLowerCase();
      return (
        message.includes('transaction numbers are only allowed') ||
        message.includes('transactions are not supported') ||
        message.includes('replica set')
      );
    }

    return false;
  }

  private sessionOptions(
    session?: ClientSession,
  ): { session: ClientSession } | undefined {
    return session ? { session } : undefined;
  }

  private removeUndefined<T extends object>(input: T): Partial<T> {
    const result: Record<string, unknown> = {};

    for (const [key, value] of Object.entries(
      input as Record<string, unknown>,
    )) {
      if (value !== undefined) {
        result[key] = value;
      }
    }

    return result as Partial<T>;
  }

  private normalizeOptionalString(
    value: string | undefined,
  ): string | undefined {
    if (typeof value !== 'string') {
      return undefined;
    }

    const normalized = value.trim();
    return normalized.length > 0 ? normalized : undefined;
  }

  private normalizeStringArray(input: string[] | undefined): string[] {
    if (!Array.isArray(input)) {
      return [];
    }

    return Array.from(
      new Set(
        input
          .filter((value): value is string => typeof value === 'string')
          .map((value) => value.trim())
          .filter((value) => value.length > 0),
      ),
    );
  }

  private normalizeInventory(
    input: Array<Record<string, unknown>> | undefined,
  ): Array<Record<string, unknown>> {
    if (!Array.isArray(input)) {
      return [];
    }

    return input
      .filter(
        (item): item is Record<string, unknown> =>
          !!item && typeof item === 'object' && !Array.isArray(item),
      )
      .map((item) => this.removeUndefined(item));
  }
}
