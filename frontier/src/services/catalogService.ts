/**
 * Catalog Service — v2 (Backend-connected)
 * Calls the real NestJS backend for catalog and offering data.
 */

import { apiClient } from '../lib/apiClient';
import { catalogColumns, catalogTableData, catalogVendors } from '../data/catalogData';
import reqConfig from '../data/requisitionModalConfig.json';

export interface CatalogProduct {
  id: string;
  name: string;
  description?: string;
  tenantId: string;
  createdAt: string;
  updatedAt: string;
}

export interface Offering {
  id: string;
  name: string;
  price: number;
  catalogId: string;
  vendorId?: string;
  isVendorProduct?: boolean;
  ports?: string[];
  productId?: string;
  productIdType?: string;
  images?: string[];
  videos?: string[];
  variations?: string[];
  inventory?: Array<Record<string, unknown>>;
  createdAt: string;
  updatedAt: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}

export interface CatalogQuery {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

class CatalogService {
  /**
   * Fetch paginated catalogs for a given tenant.
   */
  async getCatalogs(tenantId: string, query?: CatalogQuery): Promise<PaginatedResponse<CatalogProduct>> {
    const params = new URLSearchParams();
    if (query?.page) params.set('page', String(query.page));
    if (query?.limit) params.set('limit', String(query.limit));
    if (query?.search) params.set('search', query.search);
    if (query?.sortBy) params.set('sortBy', query.sortBy);
    if (query?.sortOrder) params.set('sortOrder', query.sortOrder);

    const qs = params.toString() ? `?${params.toString()}` : '';
    return apiClient.get<PaginatedResponse<CatalogProduct>>(
      `/tenants/${tenantId}/catalogs${qs}`,
    );
  }

  /**
   * Fetch offerings under a specific catalog.
   */
  async getOfferings(tenantId: string, catalogId: string): Promise<Offering[]> {
    return apiClient.get<Offering[]>(
      `/tenants/${tenantId}/catalogs/${catalogId}/offerings`,
    );
  }

  /**
   * Create a new catalog (admin only).
   */
  async createCatalog(
    tenantId: string,
    data: { name: string; description?: string },
  ): Promise<CatalogProduct> {
    return apiClient.post<CatalogProduct>(`/tenants/${tenantId}/catalogs`, data);
  }

  /**
   * Update an existing catalog (admin only).
   */
  async updateCatalog(
    tenantId: string,
    catalogId: string,
    data: Partial<{ name: string; description: string }>,
  ): Promise<CatalogProduct> {
    return apiClient.patch<CatalogProduct>(
      `/tenants/${tenantId}/catalogs/${catalogId}`,
      data,
    );
  }

  /**
   * Delete a catalog (admin only).
   */
  async deleteCatalog(tenantId: string, catalogId: string): Promise<void> {
    return apiClient.delete<void>(`/tenants/${tenantId}/catalogs/${catalogId}`);
  }

  // ─── Legacy UI Compatibility Methods (Mocks) ────────────────────────────────

  getColumnsConfig(): any[] {
    return catalogColumns;
  }

  async getProducts(): Promise<any[]> {
    return catalogTableData;
  }

  async getVendors(): Promise<string[]> {
    return catalogVendors;
  }

  async getRequisitionModalConfig(): Promise<any> {
    return reqConfig;
  }
}

export const catalogService = new CatalogService();
export default catalogService;
