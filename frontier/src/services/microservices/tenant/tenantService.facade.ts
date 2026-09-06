import activityLogsService from './activityLogs.service';
import catalogService from './catalog.service';
import documentsService from './documents.service';
import tenantCrudService, { TenantQuery } from './tenantCrud.service';
import usersService from './users.service';
import vendorsService from './vendors.service';
import vesselsService from './vessels.service';
import requisitionsService from './requisitions.service';
import { tenantSettingsService } from './tenantSettings.service';
import {
  ActivityLog,
  BulkCreateOfferingsPayload,
  BulkCreateOfferingsResult,
  CreateOfferingPayload,
  CreateSubUserPayload,
  CreateTenantPayload,
  CreateTenantUserPayload,
  CreateVendorPayload,
  CreateVesselPayload,
  PaginatedResponse,
  SubUser,
  Tenant,
  TenantCatalog,
  TenantOffering,
  TenantUser,
  TenantVendor,
  TenantVessel,
  UpdateOfferingPayload,
  UpdateSubUserPayload,
  UpdateTenantPayload,
  UpdateTenantUserPayload,
  UpdateVendorPayload,
  UpdateVesselPayload,
  VendorKycDocument,
  ExternalVendor,
  TenantSettings,
} from './types';

class TenantServiceFacade {
  readonly tenant = tenantCrudService;
  readonly users = usersService;
  readonly vessels = vesselsService;
  readonly vendors = vendorsService;
  readonly catalogs = catalogService;
  readonly activityLogs = activityLogsService;
  readonly documents = documentsService;
  readonly requisitions = requisitionsService;
  readonly settings = tenantSettingsService;

  async getTenants(query?: TenantQuery): Promise<PaginatedResponse<Tenant>> {
    return this.tenant.getTenants(query);
  }

  async getTenantById(id: string): Promise<Tenant> {
    return this.tenant.getTenantById(id);
  }

  async getTenantDetails(id: string): Promise<any> {
    return this.tenant.getTenantDetails(id);
  }

  async createTenant(data: CreateTenantPayload): Promise<Tenant> {
    return this.tenant.createTenant(data);
  }

  async updateTenant(id: string, data: UpdateTenantPayload): Promise<Tenant> {
    return this.tenant.updateTenant(id, data);
  }

  async deleteTenant(id: string): Promise<void> {
    return this.tenant.deleteTenant(id);
  }

  async getTenantSettings(tenantId: string): Promise<TenantSettings> {
    return this.settings.getTenantSettings(tenantId);
  }

  async updateTenantSettings(tenantId: string, data: Partial<TenantSettings>): Promise<TenantSettings> {
    return this.settings.updateTenantSettings(tenantId, data);
  }

  async getTenantUsers(tenantId: string): Promise<TenantUser[]> {
    return this.users.getTenantUsers(tenantId);
  }

  async getPlatformUsers(tenantId: string): Promise<TenantUser[]> {
    return this.users.getPlatformUsers(tenantId);
  }

  async getTenantScopedUsers(tenantId: string): Promise<TenantUser[]> {
    return this.users.getTenantScopedUsers(tenantId);
  }

  async getTenantUserById(tenantId: string, userId: string): Promise<TenantUser> {
    return this.users.getTenantUserById(tenantId, userId);
  }

  async createTenantUser(tenantId: string, data: CreateTenantUserPayload): Promise<TenantUser> {
    return this.users.createTenantUser(tenantId, data);
  }

  async updateTenantUser(
    tenantId: string,
    userId: string,
    data: UpdateTenantUserPayload,
  ): Promise<TenantUser> {
    return this.users.updateTenantUser(tenantId, userId, data);
  }

  async deleteTenantUser(tenantId: string, userId: string): Promise<void> {
    return this.users.deleteTenantUser(tenantId, userId);
  }

  async getSubUsers(tenantId: string, userId: string): Promise<SubUser[]> {
    return this.users.getSubUsers(tenantId, userId);
  }

  async createSubUser(
    tenantId: string,
    userId: string,
    data: CreateSubUserPayload,
  ): Promise<SubUser> {
    return this.users.createSubUser(tenantId, userId, data);
  }

  async updateSubUser(
    tenantId: string,
    userId: string,
    subUserId: string,
    data: UpdateSubUserPayload,
  ): Promise<SubUser> {
    return this.users.updateSubUser(tenantId, userId, subUserId, data);
  }

  async getVessels(tenantId: string): Promise<TenantVessel[]> {
    return this.vessels.getVessels(tenantId);
  }

  async getVesselById(tenantId: string, vesselId: string): Promise<TenantVessel> {
    return this.vessels.getVesselById(tenantId, vesselId);
  }

  async createVessel(tenantId: string, data: CreateVesselPayload): Promise<TenantVessel> {
    return this.vessels.createVessel(tenantId, data);
  }

  async updateVessel(
    tenantId: string,
    vesselId: string,
    data: UpdateVesselPayload,
  ): Promise<TenantVessel> {
    return this.vessels.updateVessel(tenantId, vesselId, data);
  }

  async deleteVessel(tenantId: string, vesselId: string): Promise<void> {
    return this.vessels.deleteVessel(tenantId, vesselId);
  }

  async getVendors(tenantId: string): Promise<TenantVendor[]> {
    return this.vendors.getVendors(tenantId);
  }

  async getCrossTenantVendors(tenantId: string): Promise<ExternalVendor[]> {
    return this.vendors.getCrossTenantVendors(tenantId);
  }

  async getVendorById(tenantId: string, vendorId: string): Promise<TenantVendor> {
    return this.vendors.getVendorById(tenantId, vendorId);
  }

  async createVendor(tenantId: string, data: CreateVendorPayload): Promise<TenantVendor> {
    return this.vendors.createVendor(tenantId, data);
  }

  async updateVendor(
    tenantId: string,
    vendorId: string,
    data: UpdateVendorPayload,
  ): Promise<TenantVendor> {
    return this.vendors.updateVendor(tenantId, vendorId, data);
  }

  async updateVendorApproval(
    tenantId: string,
    vendorId: string,
    isApproved: boolean,
  ): Promise<TenantVendor> {
    return this.vendors.updateVendorApproval(tenantId, vendorId, isApproved);
  }

  async deleteVendor(tenantId: string, vendorId: string): Promise<void> {
    return this.vendors.deleteVendor(tenantId, vendorId);
  }

  async getCatalogs(tenantId: string): Promise<TenantCatalog[]> {
    return this.catalogs.getCatalogs(tenantId);
  }

  async getCatalogById(tenantId: string, catalogId: string): Promise<TenantCatalog> {
    return this.catalogs.getCatalogById(tenantId, catalogId);
  }

  async createCatalog(
    tenantId: string,
    data: { name: string; description?: string },
  ): Promise<TenantCatalog> {
    return this.catalogs.createCatalog(tenantId, data);
  }

  async updateCatalog(
    tenantId: string,
    catalogId: string,
    data: Partial<{ name: string; description: string }>,
  ): Promise<TenantCatalog> {
    return this.catalogs.updateCatalog(tenantId, catalogId, data);
  }

  async getOfferings(tenantId: string, catalogId: string): Promise<TenantOffering[]> {
    return this.catalogs.getOfferings(tenantId, catalogId);
  }

  async getOfferingById(
    tenantId: string,
    catalogId: string,
    offeringId: string,
  ): Promise<TenantOffering> {
    return this.catalogs.getOfferingById(tenantId, catalogId, offeringId);
  }

  async createOffering(
    tenantId: string,
    catalogId: string,
    data: CreateOfferingPayload,
  ): Promise<TenantOffering> {
    return this.catalogs.createOffering(tenantId, catalogId, data);
  }

  async createOfferingsBulk(
    tenantId: string,
    catalogId: string,
    data: BulkCreateOfferingsPayload,
  ): Promise<BulkCreateOfferingsResult> {
    return this.catalogs.createOfferingsBulk(tenantId, catalogId, data);
  }

  async updateOffering(
    tenantId: string,
    catalogId: string,
    offeringId: string,
    data: UpdateOfferingPayload,
  ): Promise<TenantOffering> {
    return this.catalogs.updateOffering(tenantId, catalogId, offeringId, data);
  }

  async deleteOffering(tenantId: string, catalogId: string, offeringId: string): Promise<void> {
    return this.catalogs.deleteOffering(tenantId, catalogId, offeringId);
  }

  async getActivityLogs(tenantId: string): Promise<ActivityLog[]> {
    return this.activityLogs.getActivityLogs(tenantId);
  }

  async getVendorKycDocuments(tenantId: string): Promise<VendorKycDocument[]> {
    return this.documents.getVendorKycDocuments(tenantId);
  }

  // Requisitions
  async getRequisitions(tenantId: string): Promise<any[]> {
    return this.requisitions.getRequisitions(tenantId);
  }

  async getRequisitionById(tenantId: string, requisitionId: string): Promise<any> {
    return this.requisitions.getRequisitionById(tenantId, requisitionId);
  }

  async createRequisition(tenantId: string, data: any): Promise<any> {
    return this.requisitions.createRequisition(tenantId, data);
  }

  async updateRequisition(tenantId: string, requisitionId: string, data: any): Promise<any> {
    return this.requisitions.updateRequisition(tenantId, requisitionId, data);
  }

  async deleteRequisition(tenantId: string, requisitionId: string): Promise<void> {
    return this.requisitions.deleteRequisition(tenantId, requisitionId);
  }
}

export const tenantService = new TenantServiceFacade();
export default tenantService;
