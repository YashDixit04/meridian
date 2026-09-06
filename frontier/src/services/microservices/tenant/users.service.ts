import { apiClient } from '../../../lib/apiClient';
import {
  CreateSubUserPayload,
  CreateTenantUserPayload,
  SubUser,
  TenantUser,
  UpdateSubUserPayload,
  UpdateTenantUserPayload,
} from './types';

class UsersService {
  async getTenantUsers(tenantId: string): Promise<TenantUser[]> {
    return apiClient.get<TenantUser[]>(`/tenants/${tenantId}/users`);
  }

  async getPlatformUsers(tenantId: string): Promise<TenantUser[]> {
    return apiClient.get<TenantUser[]>(`/tenants/${tenantId}/users/platform-users`);
  }

  async getTenantScopedUsers(tenantId: string): Promise<TenantUser[]> {
    return apiClient.get<TenantUser[]>(`/tenants/${tenantId}/users/tenant-users`);
  }

  async getTenantUserById(tenantId: string, userId: string): Promise<TenantUser> {
    return apiClient.get<TenantUser>(`/tenants/${tenantId}/users/${userId}`);
  }

  async createTenantUser(tenantId: string, data: CreateTenantUserPayload): Promise<TenantUser> {
    return apiClient.post<TenantUser>(`/tenants/${tenantId}/users`, data);
  }

  async updateTenantUser(
    tenantId: string,
    userId: string,
    data: UpdateTenantUserPayload,
  ): Promise<TenantUser> {
    return apiClient.patch<TenantUser>(`/tenants/${tenantId}/users/${userId}`, data);
  }

  async deleteTenantUser(tenantId: string, userId: string): Promise<void> {
    return apiClient.delete<void>(`/tenants/${tenantId}/users/${userId}`);
  }

  async getSubUsers(tenantId: string, userId: string): Promise<SubUser[]> {
    return apiClient.get<SubUser[]>(`/tenants/${tenantId}/users/${userId}/sub-users`);
  }

  async createSubUser(
    tenantId: string,
    userId: string,
    data: CreateSubUserPayload,
  ): Promise<SubUser> {
    return apiClient.post<SubUser>(`/tenants/${tenantId}/users/${userId}/sub-users`, data);
  }

  async updateSubUser(
    tenantId: string,
    userId: string,
    subUserId: string,
    data: UpdateSubUserPayload,
  ): Promise<SubUser> {
    return apiClient.patch<SubUser>(
      `/tenants/${tenantId}/users/${userId}/sub-users/${subUserId}`,
      data,
    );
  }
}

export const usersService = new UsersService();
export default usersService;
