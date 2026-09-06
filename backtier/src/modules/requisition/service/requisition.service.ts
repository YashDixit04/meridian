import { Injectable, NotFoundException } from '@nestjs/common';
import {
  CreateRequisitionInput,
  RequisitionRepository,
  UpdateRequisitionInput,
} from '../repository/requisition.repository';
import { VendorService } from '../../vendor/service/vendor.service';

@Injectable()
export class RequisitionService {
  constructor(
    private readonly requisitionRepository: RequisitionRepository,
    private readonly vendorService: VendorService,
  ) {}

  getOrders(tenantId: string) {
    return this.requisitionRepository.findAllByTenant(tenantId);
  }

  async getOrderById(tenantId: string, id: string) {
    const order = await this.requisitionRepository.findById(tenantId, id);
    if (!order) {
      throw new NotFoundException('Order not found');
    }
    return order;
  }

  async createOrder(tenantId: string, payload: CreateRequisitionInput) {
    if (payload.vendorId) {
      await this.vendorService.assertVendorEligibleForRfq(
        tenantId,
        payload.vendorId,
      );
    }
    return this.requisitionRepository.create(tenantId, payload);
  }

  async updateOrder(
    tenantId: string,
    id: string,
    payload: UpdateRequisitionInput,
  ) {
    await this.getOrderById(tenantId, id);
    if (payload.vendorId) {
      await this.vendorService.assertVendorEligibleForRfq(
        tenantId,
        payload.vendorId,
      );
    }
    return this.requisitionRepository.update(tenantId, id, payload);
  }

  async deleteOrder(tenantId: string, id: string) {
    await this.getOrderById(tenantId, id);
    return this.requisitionRepository.delete(tenantId, id);
  }
}
