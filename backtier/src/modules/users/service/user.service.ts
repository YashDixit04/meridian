import { Injectable, NotFoundException } from '@nestjs/common';
import {
  CreateSubUserInput,
  CreateUserInput,
  UpdateSubUserInput,
  UpdateUserInput,
  UserRepository,
} from '../repository/user.repository';

@Injectable()
export class UserService {
  constructor(private readonly userRepository: UserRepository) {}

  getUsers(tenantId: string) {
    return this.userRepository.findAllByTenant(tenantId);
  }

  /**
   * Returns platform users (admin, adminusers, tenantadmin, tenantadmin_subusers).
   * Used by the SuperAdmin's Users / Platform Users listing page.
   */
  getPlatformUsers(tenantId: string) {
    return this.userRepository.findPlatformUsers(tenantId);
  }

  /**
   * Returns only tenantadmin and tenantadmin_subusers for Tenant Sub Users page.
   */
  getTenantScopedUsers(tenantId: string) {
    return this.userRepository.findTenantScopedUsers(tenantId);
  }

  async getUserById(tenantId: string, id: string) {
    const user = await this.userRepository.findById(tenantId, id);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }

  createUser(tenantId: string, payload: CreateUserInput) {
    return this.userRepository.create(tenantId, payload);
  }

  async updateUser(tenantId: string, id: string, payload: UpdateUserInput) {
    await this.getUserById(tenantId, id);
    return this.userRepository.update(tenantId, id, payload);
  }

  async deleteUser(tenantId: string, id: string) {
    await this.getUserById(tenantId, id);
    return this.userRepository.delete(tenantId, id);
  }

  async getSubUsers(tenantId: string, userId: string) {
    await this.getUserById(tenantId, userId);
    return this.userRepository.findSubUsers(tenantId, userId);
  }

  async getSubUserById(tenantId: string, userId: string, id: string) {
    await this.getUserById(tenantId, userId);
    const subUser = await this.userRepository.findSubUserById(
      tenantId,
      userId,
      id,
    );
    if (!subUser) {
      throw new NotFoundException('Sub user not found');
    }
    return subUser;
  }

  async createSubUser(
    tenantId: string,
    userId: string,
    payload: CreateSubUserInput,
  ) {
    await this.getUserById(tenantId, userId);
    return this.userRepository.createSubUser(tenantId, userId, payload);
  }

  async updateSubUser(
    tenantId: string,
    userId: string,
    id: string,
    payload: UpdateSubUserInput,
  ) {
    await this.getSubUserById(tenantId, userId, id);
    return this.userRepository.updateSubUser(tenantId, id, payload);
  }

  async deleteSubUser(tenantId: string, userId: string, id: string) {
    await this.getSubUserById(tenantId, userId, id);
    return this.userRepository.deleteSubUser(tenantId, id);
  }
}
