import { apiClient } from '../../../lib/apiClient';
import { VendorKycDocument } from './types';

class DocumentsService {
  async getVendorKycDocuments(tenantId: string): Promise<VendorKycDocument[]> {
    return apiClient.get<VendorKycDocument[]>(
      `/tenants/${tenantId}/activity-logs/vendor-kyc-documents`,
    );
  }
}

export const documentsService = new DocumentsService();
export default documentsService;
