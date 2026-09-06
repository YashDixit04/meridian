import { apiClient } from '../../../lib/apiClient';
import {
  CreateVendorPayload,
  TenantVendor,
  UpdateVendorPayload,
  ExternalVendor,
} from './types';

class VendorsService {
  async getVendors(tenantId: string): Promise<TenantVendor[]> {
    return apiClient.get<TenantVendor[]>(`/tenants/${tenantId}/vendors`);
  }

  async getCrossTenantVendors(tenantId: string): Promise<ExternalVendor[]> {
    return apiClient.get<ExternalVendor[]>(`/tenants/${tenantId}/vendors/cross-tenant`);
  }

  async getVendorById(tenantId: string, vendorId: string): Promise<TenantVendor> {
    return apiClient.get<TenantVendor>(`/tenants/${tenantId}/vendors/${vendorId}`);
  }

  async createVendor(tenantId: string, data: CreateVendorPayload): Promise<TenantVendor> {
    return apiClient.post<TenantVendor>(`/tenants/${tenantId}/vendors`, data);
  }

  async updateVendor(
    tenantId: string,
    vendorId: string,
    data: UpdateVendorPayload,
  ): Promise<TenantVendor> {
    return apiClient.patch<TenantVendor>(`/tenants/${tenantId}/vendors/${vendorId}`, data);
  }

  async updateVendorApproval(
    tenantId: string,
    vendorId: string,
    isApproved: boolean,
  ): Promise<TenantVendor> {
    return apiClient.patch<TenantVendor>(`/tenants/${tenantId}/vendors/${vendorId}/approval`, {
      isApproved,
    });
  }

  async deleteVendor(tenantId: string, vendorId: string): Promise<void> {
    return apiClient.delete<void>(`/tenants/${tenantId}/vendors/${vendorId}`);
  }
}

export const vendorsService = new VendorsService();
export default vendorsService;
