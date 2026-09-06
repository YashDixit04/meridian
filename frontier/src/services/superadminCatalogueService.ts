import { apiClient } from '../lib/apiClient';

export interface SuperadminCatalogueProduct {
  id: string;
  lookupKey: string;
  productId?: string;
  productIdType?: string;
  name: string;
  price?: number;
  images?: string[];
  videos?: string[];
  variations?: string[];
  inventory?: Array<Record<string, unknown>>;
  sourceTenantId?: string;
  sourceTenantName?: string;
  sourceCatalogId?: string;
  sourceCatalogName?: string;
  createdAt: string;
  updatedAt: string;
}

export interface SuperadminCascadeDeleteResponse {
  deletedProductId: string;
  deletedOfferingsCount: number;
  deletedMappingsCount: number;
  deletedTenantCatalogueEntriesCount: number;
  affectedTenantIds: string[];
}

class SuperadminCatalogueService {
  async getProducts(): Promise<SuperadminCatalogueProduct[]> {
    return apiClient.get<SuperadminCatalogueProduct[]>('/superadmin/catalogue/products');
  }

  async deleteProduct(productId: string): Promise<SuperadminCascadeDeleteResponse> {
    return apiClient.delete<SuperadminCascadeDeleteResponse>(
      `/superadmin/catalogue/products/${productId}`,
    );
  }
}

export const superadminCatalogueService = new SuperadminCatalogueService();
export default superadminCatalogueService;
