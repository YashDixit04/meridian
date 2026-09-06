import { apiClient } from '../../../lib/apiClient';
import {
  CreateVesselPayload,
  TenantVessel,
  UpdateVesselPayload,
} from './types';

class VesselsService {
  async getVessels(tenantId: string): Promise<TenantVessel[]> {
    return apiClient.get<TenantVessel[]>(`/tenants/${tenantId}/vessels`);
  }

  async getVesselById(tenantId: string, vesselId: string): Promise<TenantVessel> {
    return apiClient.get<TenantVessel>(`/tenants/${tenantId}/vessels/${vesselId}`);
  }

  async createVessel(tenantId: string, data: CreateVesselPayload): Promise<TenantVessel> {
    return apiClient.post<TenantVessel>(`/tenants/${tenantId}/vessels`, data);
  }

  async updateVessel(
    tenantId: string,
    vesselId: string,
    data: UpdateVesselPayload,
  ): Promise<TenantVessel> {
    return apiClient.patch<TenantVessel>(`/tenants/${tenantId}/vessels/${vesselId}`, data);
  }

  async deleteVessel(tenantId: string, vesselId: string): Promise<void> {
    return apiClient.delete<void>(`/tenants/${tenantId}/vessels/${vesselId}`);
  }
}

export const vesselsService = new VesselsService();
export default vesselsService;
