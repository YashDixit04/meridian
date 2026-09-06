import { apiClient } from '@/lib/apiClient';
import { CreateVendorPayload } from '@/services/tenantService';

export interface PublicVendorRegistrationRequest {
  vendor: CreateVendorPayload;
  tenantContactEmail?: string;
  applicantEmail?: string;
  sendForApproval?: boolean;
  tenantUserTypeSelection?: 'SMC Users only' | 'Vendor Users only' | 'Both SMC and Vendor Users';
}

export interface PublicVendorRegistrationResponse {
  message: string;
  vendorId: string;
  tenantId: string;
  tenantLinkedByEmail: boolean;
  tenantCreated: boolean;
  tenantContactEmail?: string;
  approvalStatus: 'Pending' | 'Approved';
  approvalRecipientEmail?: string;
  approvalNotificationSent: boolean;
}

class PublicVendorRegistrationService {
  async registerVendor(
    payload: PublicVendorRegistrationRequest,
  ): Promise<PublicVendorRegistrationResponse> {
    return apiClient.post<PublicVendorRegistrationResponse>('/public/vendors/register', payload);
  }
}

export const publicVendorRegistrationService = new PublicVendorRegistrationService();
export default publicVendorRegistrationService;
