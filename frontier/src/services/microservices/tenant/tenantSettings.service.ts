import { apiClient as api } from '../../../lib/apiClient';
import { TenantSettings } from './types';

class TenantSettingsService {
  private readonly baseUrl = '/api/tenants';

  async getTenantSettings(tenantId: string): Promise<TenantSettings> {
    const response = await api.get<TenantSettings>(
      `${this.baseUrl}/${tenantId}/settings`,
    );
    return response;
  }

  async updateTenantSettings(
    tenantId: string,
    settings: Partial<TenantSettings>,
  ): Promise<TenantSettings> {
    const response = await api.patch<TenantSettings>(
      `${this.baseUrl}/${tenantId}/settings`,
      settings,
    );
    return response;
  }
}

export const tenantSettingsService = new TenantSettingsService();
