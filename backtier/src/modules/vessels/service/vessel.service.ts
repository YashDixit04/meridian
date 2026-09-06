import { Injectable, NotFoundException } from '@nestjs/common';
import {
  CreateVesselInput,
  UpdateVesselInput,
  VesselRepository,
} from '../repository/vessel.repository';

@Injectable()
export class VesselService {
  constructor(private readonly vesselRepository: VesselRepository) {}

  getVessels(tenantId: string) {
    return this.vesselRepository.findAllByTenant(tenantId);
  }

  async getVesselById(tenantId: string, id: string) {
    const vessel = await this.vesselRepository.findById(tenantId, id);
    if (!vessel) {
      throw new NotFoundException('Vessel not found');
    }
    return vessel;
  }

  createVessel(tenantId: string, payload: CreateVesselInput) {
    return this.vesselRepository.create(tenantId, payload);
  }

  async updateVessel(tenantId: string, id: string, payload: UpdateVesselInput) {
    await this.getVesselById(tenantId, id);
    return this.vesselRepository.update(tenantId, id, payload);
  }

  async deleteVessel(tenantId: string, id: string) {
    await this.getVesselById(tenantId, id);
    return this.vesselRepository.delete(tenantId, id);
  }
}
