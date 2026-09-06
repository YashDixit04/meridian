import { apiClient } from '../../../lib/apiClient';
import {
  CreateTenantPayload,
  PaginatedResponse,
  Tenant,
  UpdateTenantPayload,
} from './types';

export interface TenantQuery {
  page?: number;
  limit?: number;
  search?: string;
}

class TenantCrudService {
  async getTenants(query?: TenantQuery): Promise<PaginatedResponse<Tenant>> {
    const params = new URLSearchParams();
    if (query?.page) params.set('page', String(query.page));
    if (query?.limit) params.set('limit', String(query.limit));
    if (query?.search) params.set('search', query.search);

    const qs = params.toString() ? `?${params.toString()}` : '';
    return apiClient.get<PaginatedResponse<Tenant>>(`/tenants${qs}`);
  }

  async getTenantById(id: string): Promise<Tenant> {
    return apiClient.get<Tenant>(`/tenants/${id}`);
  }

  async getTenantDetails(id: string): Promise<any> {
    return apiClient.get<any>(`/tenants/${id}/details`);
  }

  async createTenant(data: CreateTenantPayload): Promise<Tenant> {
    return apiClient.post<Tenant>('/tenants', data);
  }

  async updateTenant(id: string, data: UpdateTenantPayload): Promise<Tenant> {
    return apiClient.patch<Tenant>(`/tenants/${id}`, data);
  }

  async deleteTenant(id: string): Promise<void> {
    return apiClient.delete<void>(`/tenants/${id}`);
  }
}

export const tenantCrudService = new TenantCrudService();
export default tenantCrudService;
