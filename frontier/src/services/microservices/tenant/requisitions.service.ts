import { apiClient } from '../../../lib/apiClient';

export interface CreateRequisitionPayload {
  requisitionName: string;
  categoryType?: string;
  priorityType: string;
  country: string;
  port: string;
  creatorName: string;
  creatorRank: string;
  crewMembers: string;
  freshDateRange?: string;
  dryDateRange?: string;
  deliveryMode: string;
  agentName: string;
  agentEmail: string;
  agentPhone: string;
  status?: string;
}

class RequisitionsService {
  async getRequisitions(tenantId: string): Promise<any[]> {
    return apiClient.get<any[]>(`/tenants/${tenantId}/requisitions`);
  }

  async getRequisitionById(tenantId: string, requisitionId: string): Promise<any> {
    return apiClient.get<any>(`/tenants/${tenantId}/requisitions/${requisitionId}`);
  }

  async createRequisition(tenantId: string, data: CreateRequisitionPayload): Promise<any> {
    return apiClient.post<any>(`/tenants/${tenantId}/requisitions`, data);
  }

  async updateRequisition(tenantId: string, requisitionId: string, data: Partial<CreateRequisitionPayload>): Promise<any> {
    return apiClient.patch<any>(`/tenants/${tenantId}/requisitions/${requisitionId}`, data);
  }

  async deleteRequisition(tenantId: string, requisitionId: string): Promise<void> {
    return apiClient.delete<void>(`/tenants/${tenantId}/requisitions/${requisitionId}`);
  }
}

export const requisitionsService = new RequisitionsService();
export default requisitionsService;
