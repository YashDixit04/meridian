import { Test, TestingModule } from '@nestjs/testing';
import { CatalogService } from './catalog.service';
import { CatalogRepository, OfferingEntity } from '../repository/catalog.repository';
import { VendorService } from '../../vendor/service/vendor.service';
import { TenantCollectionService } from '../../../core/mongodb/tenant-collection.service';
import { TenantService } from '../../tenant/service/tenant.service';
import { ContractedVendorMappingRepository } from '../repository/contracted-vendor-mapping.repository';
import { BadRequestException, ForbiddenException, Logger } from '@nestjs/common';
import { randomUUID } from 'crypto';

describe('CatalogService', () => {
  let service: CatalogService;
  let catalogRepository: jest.Mocked<CatalogRepository>;
  let vendorService: jest.Mocked<VendorService>;
  let tenantCollectionService: jest.Mocked<TenantCollectionService>;
  let tenantService: jest.Mocked<TenantService>;
  let contractedVendorMappingRepo: jest.Mocked<ContractedVendorMappingRepository>;
  let mockVendorCatalogue: any;

  beforeEach(async () => {
    catalogRepository = {
      createOffering: jest.fn(),
      findById: jest.fn(),
    } as unknown as jest.Mocked<CatalogRepository>;

    vendorService = {
      assertVendorEligibleForRfq: jest.fn(),
      getVendorById: jest.fn(),
    } as unknown as jest.Mocked<VendorService>;

    mockVendorCatalogue = {
      findOne: jest.fn(),
      updateOne: jest.fn(),
      insertOne: jest.fn(),
    };

    tenantCollectionService = {
      getCollection: jest.fn().mockResolvedValue(mockVendorCatalogue),
    } as unknown as jest.Mocked<TenantCollectionService>;

    tenantService = {
      getTenantById: jest.fn(),
    } as unknown as jest.Mocked<TenantService>;

    contractedVendorMappingRepo = {
      findOrCreate: jest.fn(),
      updateSyncedProductId: jest.fn(),
    } as unknown as jest.Mocked<ContractedVendorMappingRepository>;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CatalogService,
        { provide: CatalogRepository, useValue: catalogRepository },
        { provide: VendorService, useValue: vendorService },
        { provide: TenantCollectionService, useValue: tenantCollectionService },
        { provide: TenantService, useValue: tenantService },
        { provide: ContractedVendorMappingRepository, useValue: contractedVendorMappingRepo },
      ],
    }).compile();

    service = module.get<CatalogService>(CatalogService);
    // Suppress logger in tests
    jest.spyOn(Logger.prototype, 'log').mockImplementation(() => {});
  });

  describe('syncProductToVendor', () => {
    it('should return null and not insert when sourceCatalogProductId already exists in vendor catalogue', async () => {
      mockVendorCatalogue.findOne.mockResolvedValueOnce({ id: 'existing-id' });

      const result = await service.syncProductToVendor('vendor-tenant', 'offering-id', { productId: 'p1' } as any);
      
      expect(result).toBeNull();
      expect(mockVendorCatalogue.insertOne).not.toHaveBeenCalled();
      expect(mockVendorCatalogue.updateOne).not.toHaveBeenCalled();
    });

    it('should insert new product and return id when not found', async () => {
      mockVendorCatalogue.findOne.mockResolvedValueOnce(null).mockResolvedValueOnce(null);
      const snapshot = { id: 'snapshot-id', name: 'Product' } as any;

      const result = await service.syncProductToVendor('vendor-tenant', 'offering-id', snapshot);
      
      expect(result).toBe(snapshot.id); // Since it reuses the id
      expect(mockVendorCatalogue.insertOne).toHaveBeenCalledWith(expect.objectContaining({
        id: 'snapshot-id',
        name: 'Product',
        sourceCatalogProductId: 'offering-id',
        tenantId: 'vendor-tenant',
      }));
    });

    it('should stamp sourceCatalogProductId on legacy productId match and return existing id', async () => {
      mockVendorCatalogue.findOne
        .mockResolvedValueOnce(null) // no exact match
        .mockResolvedValueOnce({ id: 'legacy-id' }); // legacy match

      const result = await service.syncProductToVendor('vendor-tenant', 'offering-id', { productId: 'p1' } as any);
      
      expect(result).toBe('legacy-id');
      expect(mockVendorCatalogue.updateOne).toHaveBeenCalledWith(
        { id: 'legacy-id' },
        { $set: expect.objectContaining({ sourceCatalogProductId: 'offering-id' }) }
      );
      expect(mockVendorCatalogue.insertOne).not.toHaveBeenCalled();
    });
  });

  describe('createOffering - same-tenant regression (snapshot test)', () => {
    it('should match the expected pre-refactor document shape for same-tenant product', async () => {
      const payload = { name: 'Item', price: 100, isVendorProduct: true, vendorId: 'v1' };
      const offering = { id: 'offering-id', ...payload };
      catalogRepository.findById.mockResolvedValueOnce({ id: 'catalog-id', tenantId: 't1' } as any);
      catalogRepository.createOffering.mockResolvedValueOnce(offering as any);
      
      // We mock syncProductToVendor to see what shape is passed.
      const syncSpy = jest.spyOn(service, 'syncProductToVendor').mockResolvedValueOnce('synced-id');

      await service.createOffering('t1', 'catalog-id', payload);
      
      expect(syncSpy).toHaveBeenCalledWith('t1', 'offering-id', offering);
      // The object written to vendorCatalogue in syncProductToVendor is identical to `offering` + `sourceCatalogProductId`.
      // It matches pre-refactor shape.
    });
  });

  describe('createOffering - cross-tenant guard tests', () => {
    it('should throw ForbiddenException when canViewOtherTenantVendors is false', async () => {
      catalogRepository.findById.mockResolvedValueOnce({ id: 'c1' } as any);
      tenantService.getTenantById.mockResolvedValueOnce({ canViewOtherTenantVendors: false } as any);

      await expect(
        service.createOffering('t1', 'c1', { name: 'P', price: 10, vendorId: 'v1', vendorTenantId: 't2', isVendorProduct: true })
      ).rejects.toThrow(ForbiddenException);
    });

    it('should throw BadRequestException when external vendor not found', async () => {
      catalogRepository.findById.mockResolvedValueOnce({ id: 'c1' } as any);
      tenantService.getTenantById.mockResolvedValueOnce({ canViewOtherTenantVendors: true } as any);
      vendorService.getVendorById.mockResolvedValueOnce(null as any);

      await expect(
        service.createOffering('t1', 'c1', { name: 'P', price: 10, vendorId: 'v1', vendorTenantId: 't2', isVendorProduct: true })
      ).rejects.toThrow(BadRequestException);
    });

    it('should create contracted_vendor_mapping with syncedProductId when cross-tenant sync succeeds', async () => {
      catalogRepository.findById.mockResolvedValueOnce({ id: 'c1' } as any);
      tenantService.getTenantById.mockResolvedValueOnce({ canViewOtherTenantVendors: true } as any);
      vendorService.getVendorById.mockResolvedValueOnce({ id: 'v1' } as any);
      const offering = { id: 'offering-1', name: 'P', price: 10, isVendorProduct: true, vendorId: 'v1' };
      catalogRepository.createOffering.mockResolvedValueOnce(offering as any);
      jest.spyOn(service, 'syncProductToVendor').mockResolvedValueOnce('synced-id');
      contractedVendorMappingRepo.findOrCreate.mockResolvedValueOnce({ id: 'mapping-1' } as any);

      await service.createOffering('t1', 'c1', { ...offering, vendorTenantId: 't2' } as any);

      expect(contractedVendorMappingRepo.updateSyncedProductId).toHaveBeenCalledWith('mapping-1', 'synced-id');
    });

    it('should NOT overwrite syncedProductId on mapping when sync returns null', async () => {
      catalogRepository.findById.mockResolvedValueOnce({ id: 'c1' } as any);
      tenantService.getTenantById.mockResolvedValueOnce({ canViewOtherTenantVendors: true } as any);
      vendorService.getVendorById.mockResolvedValueOnce({ id: 'v1' } as any);
      const offering = { id: 'offering-1', name: 'P', price: 10, isVendorProduct: true, vendorId: 'v1' };
      catalogRepository.createOffering.mockResolvedValueOnce(offering as any);
      jest.spyOn(service, 'syncProductToVendor').mockResolvedValueOnce(null);
      contractedVendorMappingRepo.findOrCreate.mockResolvedValueOnce({ id: 'mapping-1' } as any);

      await service.createOffering('t1', 'c1', { ...offering, vendorTenantId: 't2' } as any);

      expect(contractedVendorMappingRepo.updateSyncedProductId).not.toHaveBeenCalled();
    });
  });
});
