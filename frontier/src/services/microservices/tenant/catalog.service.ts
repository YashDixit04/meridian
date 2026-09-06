import { apiClient } from '../../../lib/apiClient';
import {
  BulkCreateOfferingsPayload,
  BulkCreateOfferingsResult,
  CreateOfferingPayload,
  TenantCatalog,
  TenantOffering,
  UpdateOfferingPayload,
} from './types';

class CatalogService {
  async getCatalogs(tenantId: string): Promise<TenantCatalog[]> {
    return apiClient.get<TenantCatalog[]>(`/tenants/${tenantId}/catalogs`);
  }

  async getCatalogById(tenantId: string, catalogId: string): Promise<TenantCatalog> {
    return apiClient.get<TenantCatalog>(`/tenants/${tenantId}/catalogs/${catalogId}`);
  }

  async createCatalog(
    tenantId: string,
    data: { name: string; description?: string },
  ): Promise<TenantCatalog> {
    return apiClient.post<TenantCatalog>(`/tenants/${tenantId}/catalogs`, data);
  }

  async updateCatalog(
    tenantId: string,
    catalogId: string,
    data: Partial<{ name: string; description: string }>,
  ): Promise<TenantCatalog> {
    return apiClient.patch<TenantCatalog>(`/tenants/${tenantId}/catalogs/${catalogId}`, data);
  }

  async getOfferings(tenantId: string, catalogId: string): Promise<TenantOffering[]> {
    return apiClient.get<TenantOffering[]>(`/tenants/${tenantId}/catalogs/${catalogId}/offerings`);
  }

  async getOfferingById(
    tenantId: string,
    catalogId: string,
    offeringId: string,
  ): Promise<TenantOffering> {
    return apiClient.get<TenantOffering>(
      `/tenants/${tenantId}/catalogs/${catalogId}/offerings/${offeringId}`,
    );
  }

  async createOffering(
    tenantId: string,
    catalogId: string,
    data: CreateOfferingPayload,
  ): Promise<TenantOffering> {
    return apiClient.post<TenantOffering>(`/tenants/${tenantId}/catalogs/${catalogId}/offerings`, data);
  }

  async createOfferingsBulk(
    tenantId: string,
    catalogId: string,
    data: BulkCreateOfferingsPayload,
  ): Promise<BulkCreateOfferingsResult> {
    return apiClient.post<BulkCreateOfferingsResult>(
      `/tenants/${tenantId}/catalogs/${catalogId}/offerings/bulk`,
      data,
    );
  }

  async updateOffering(
    tenantId: string,
    catalogId: string,
    offeringId: string,
    data: UpdateOfferingPayload,
  ): Promise<TenantOffering> {
    return apiClient.patch<TenantOffering>(
      `/tenants/${tenantId}/catalogs/${catalogId}/offerings/${offeringId}`,
      data,
    );
  }

  async deleteOffering(tenantId: string, catalogId: string, offeringId: string): Promise<void> {
    return apiClient.delete<void>(`/tenants/${tenantId}/catalogs/${catalogId}/offerings/${offeringId}`);
  }
}

export const catalogService = new CatalogService();
export default catalogService;
