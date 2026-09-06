import {
  BadRequestException,
  ConflictException,
  Injectable,
} from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import * as bcrypt from 'bcrypt';
import { Collection, Document } from 'mongodb';
import { MongoDbService } from '../../../core/mongodb/mongodb.service';
import { TenantCollectionService } from '../../../core/mongodb/tenant-collection.service';
import {
  stripMongoId,
  stripMongoIds,
} from '../../../core/mongodb/mongo-document.util';
import { UserRole } from '../../../core/types/user-role.enum';
import { TenantAggregate, TenantProps } from '../../tenant/domain/model/tenant.aggregate';

const PLATFORM_USER_ROLE_TYPES = new Set([
  'superadmin',
  'admin',
  'adminusers',
]);

export interface CreateUserInput {
  email: string;
  firstName: string;
  lastName: string;
  username?: string;
  password?: string;
  roleType?: string;
  role?: UserRole;
  permissions?: object;
  department?: string;
  vesselAssigned?: boolean;
  assignedVesselIds?: string[];
}

export interface UpdateUserInput {
  email?: string;
  firstName?: string;
  lastName?: string;
  username?: string;
  password?: string;
  roleType?: string;
  role?: UserRole;
  permissions?: object;
  department?: string;
  vesselAssigned?: boolean;
  assignedVesselIds?: string[];
}

export interface CreateSubUserInput {
  name: string;
  email: string;
}

export interface UpdateSubUserInput {
  name?: string;
  email?: string;
}

export interface UserEntity extends Document {
  id: string;
  email: string;
  username: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  passwordHash: string;
  roleType: string;
  permissions: Record<string, unknown>;
  department?: string;
  vesselAssigned?: boolean;
  assignedVesselIds?: string[];
  tenantId: string;
  createdAt: Date;
  updatedAt: Date;
  [key: string]: unknown;
}

interface VesselEntity extends Document {
  id: string;
  tenantId: string;
}

export interface SubUserEntity extends Document {
  id: string;
  name: string;
  email: string;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
  [key: string]: unknown;
}

export interface UserResourcePermissionEntity extends Document {
  id: string;
  userId: string;
  type: string;
  resource: string;
  field?: string;
  createdAt: Date;
  updatedAt: Date;
}

@Injectable()
export class UserRepository {
  private readonly superadminDatabaseName =
    process.env.SUPERADMIN_DB_NAME?.trim() || 'superadmin';

  constructor(
    private readonly mongoDbService: MongoDbService,
    private readonly tenantCollectionService: TenantCollectionService,
  ) {}

  /**
   * Returns all non-superadmin users for a given tenant.
   * SuperAdmin is a platform-level account; it never appears in user listings.
   */
  async findAllByTenant(tenantId: string) {
    const usersCollection = await this.usersCollection(tenantId);
    const users = await usersCollection
      .find({
        tenantId,
        roleType: { $ne: 'superadmin' },
      })
      .sort({ createdAt: -1 })
      .toArray();

    return this.attachSubUsers(tenantId, users);
  }

  /**
   * Returns platform users for the SuperAdmin's "Users / Platform Users" page.
   * Reads from the shared superadmin_users collection and excludes superadmin.
   * Excludes only superadmin.
   */
  async findPlatformUsers(_tenantId: string) {
    const users = await this.platformUsersCollection()
      .find({
        roleType: { $in: ['admin', 'adminusers'] },
      })
      .sort({ createdAt: -1 })
      .toArray();

    return stripMongoIds(users).map((user) => ({
      ...user,
      subUsers: [],
    }));
  }

  /**
   * Returns only tenant-scoped user roles used by the Tenant Sub Users page.
   */
  async findTenantScopedUsers(tenantId: string) {
    const usersCollection = await this.usersCollection(tenantId);
    const users = await usersCollection
      .find({
        tenantId,
        roleType: { $in: ['tenantadmin', 'tenantadmin_subusers'] },
      })
      .sort({ createdAt: -1 })
      .toArray();

    return this.attachSubUsers(tenantId, users);
  }

  async findById(tenantId: string, id: string) {
    const usersCollection = await this.usersCollection(tenantId);
    const user = await usersCollection.findOne({ id, tenantId });

    if (user) {
      const subUsersCollection = await this.subUsersCollection(tenantId);
      const subUsers = await subUsersCollection
        .find({ userId: id })
        .sort({ createdAt: -1 })
        .toArray();

      return {
        ...stripMongoId(user),
        subUsers: stripMongoIds(subUsers),
      };
    }

    const platformUser = await this.platformUsersCollection().findOne({ id });
    if (platformUser) {
      return {
        ...stripMongoId(platformUser),
        subUsers: [],
      };
    }

    const fallbackUser = await this.fallbackUsersCollection().findOne({ id });
    if (!fallbackUser) {
      return null;
    }

    return {
      ...stripMongoId(fallbackUser),
      subUsers: [],
    };
  }

  async create(tenantId: string, data: CreateUserInput) {
    const normalizedEmail = data.email.trim().toLowerCase();
    const username = (
      data.username?.trim() || normalizedEmail.split('@')[0]
    ).toLowerCase();
    const roleType = data.roleType ?? 'admin';
    const isPlatformRole = PLATFORM_USER_ROLE_TYPES.has(roleType);
    if (tenantId && tenantId !== '00000000-0000-0000-0000-000000000000') {
      const tenantDoc = await this.mongoDbService
        .collection('tenants', 'core_db')
        .findOne({ id: tenantId });
      if (tenantDoc) {
        const aggregate = new TenantAggregate(tenantDoc as unknown as TenantProps);
        const existingUsersCount = await (
          await this.usersCollection(tenantId)
        ).countDocuments({ tenantId });
        aggregate.assertCanCreateUser(existingUsersCount);
      }
    }

    await this.ensureUniqueEmail(normalizedEmail);
    await this.ensureUniqueUsername(username);

    const passwordHash = data.password
      ? await bcrypt.hash(data.password, 10)
      : '';
    const now = new Date();
    const assignedVesselIds = this.normalizeVesselIds(data.assignedVesselIds);

    if (assignedVesselIds.length > 0) {
      await this.ensureTenantVesselsExist(tenantId, assignedVesselIds);
    }

    if (data.vesselAssigned && assignedVesselIds.length === 0) {
      throw new BadRequestException(
        'assignedVesselIds is required when vesselAssigned is true.',
      );
    }

    const user: UserEntity = {
      id: randomUUID(),
      email: normalizedEmail,
      username,
      firstName: data.firstName,
      lastName: data.lastName,
      role: data.role ?? UserRole.USER,
      passwordHash,
      roleType,
      permissions: (data.permissions ?? {}) as Record<string, unknown>,
      department: data.department,
      vesselAssigned: data.vesselAssigned ?? assignedVesselIds.length > 0,
      assignedVesselIds,
      tenantId,
      createdAt: now,
      updatedAt: now,
    };

    const usersCollection = isPlatformRole
      ? this.platformUsersCollection()
      : await this.usersCollection(tenantId);

    await usersCollection.insertOne(user);

    if (isPlatformRole) {
      await this.replaceLegacyUserResourcePermissions(
        user.id,
        user.permissions,
        now,
      );
    } else {
      await this.replaceUserResourcePermissions(
        tenantId,
        user.id,
        user.permissions,
        now,
      );
    }

    return stripMongoId(user);
  }

  async update(tenantId: string, id: string, data: UpdateUserInput) {
    const updates: Record<string, unknown> = {};
    let normalizedAssignedVesselIds: string[] | undefined;

    if (data.email !== undefined) {
      const email = data.email.trim().toLowerCase();
      await this.ensureUniqueEmail(email, id);
      updates.email = email;
    }

    if (data.username !== undefined) {
      const username = data.username.trim().toLowerCase();
      await this.ensureUniqueUsername(username, id);
      updates.username = username;
    }

    if (data.firstName !== undefined) {
      updates.firstName = data.firstName;
    }

    if (data.lastName !== undefined) {
      updates.lastName = data.lastName;
    }

    if (data.roleType !== undefined) {
      updates.roleType = data.roleType;
    }

    if (data.role !== undefined) {
      updates.role = data.role;
    }

    if (data.permissions !== undefined) {
      updates.permissions = data.permissions as Record<string, unknown>;
    }

    if (data.department !== undefined) {
      updates.department = data.department;
    }

    if (data.vesselAssigned !== undefined) {
      updates.vesselAssigned = data.vesselAssigned;
    }

    if (data.assignedVesselIds !== undefined) {
      normalizedAssignedVesselIds = this.normalizeVesselIds(
        data.assignedVesselIds,
      );
      await this.ensureTenantVesselsExist(
        tenantId,
        normalizedAssignedVesselIds,
      );
      updates.assignedVesselIds = normalizedAssignedVesselIds;

      if (data.vesselAssigned === undefined) {
        updates.vesselAssigned = normalizedAssignedVesselIds.length > 0;
      }
    }

    if (
      data.vesselAssigned &&
      data.assignedVesselIds !== undefined &&
      normalizedAssignedVesselIds?.length === 0
    ) {
      throw new BadRequestException(
        'assignedVesselIds is required when vesselAssigned is true.',
      );
    }

    if (data.password) {
      updates.passwordHash = await bcrypt.hash(data.password, 10);
    }

    const usersCollection = await this.usersCollection(tenantId);
    const isTenantScopedUser =
      (await usersCollection.countDocuments({ id, tenantId }, { limit: 1 })) >
      0;

    const platformUsersCollection = this.platformUsersCollection();
    const platformUser = isTenantScopedUser
      ? null
      : await platformUsersCollection.findOne({ id });

    const fallbackUser =
      isTenantScopedUser || platformUser
        ? null
        : await this.fallbackUsersCollection().findOne({ id });

    if (Object.keys(updates).length > 0) {
      const targetCollection = isTenantScopedUser
        ? usersCollection
        : platformUser
          ? platformUsersCollection
          : fallbackUser
            ? this.fallbackUsersCollection()
            : null;

      if (targetCollection) {
        await targetCollection.updateOne(
          isTenantScopedUser ? { id, tenantId } : { id },
          {
            $set: {
              ...updates,
              updatedAt: new Date(),
            },
          },
        );
      }
    }

    if (data.permissions !== undefined) {
      if (isTenantScopedUser) {
        await this.replaceUserResourcePermissions(
          tenantId,
          id,
          data.permissions as Record<string, unknown>,
        );
      } else {
        await this.replaceLegacyUserResourcePermissions(
          id,
          data.permissions as Record<string, unknown>,
        );
      }
    }

    return this.findById(tenantId, id);
  }

  async delete(tenantId: string, id: string) {
    const usersCollection = await this.usersCollection(tenantId);
    const tenantScopedUser = await usersCollection.findOne({ id, tenantId });

    if (tenantScopedUser) {
      if (tenantScopedUser.roleType === 'superadmin') {
        throw new BadRequestException(
          'The global superadmin account cannot be deleted.',
        );
      }

      const subUsersCollection = await this.subUsersCollection(tenantId);
      const permissionsCollection =
        await this.userResourcePermissionsCollection(tenantId);
      const activityLogsCollection =
        await this.activityLogsCollection(tenantId);

      await Promise.all([
        usersCollection.deleteOne({ id, tenantId }),
        subUsersCollection.deleteMany({ userId: id }),
        permissionsCollection.deleteMany({ userId: id }),
        activityLogsCollection.deleteMany({ userId: id }),
      ]);

      return {
        ...stripMongoId(tenantScopedUser),
        subUsers: [],
      };
    }

    const platformUsersCollection = this.platformUsersCollection();
    const platformUser = await platformUsersCollection.findOne({ id });

    if (platformUser) {
      if (platformUser.roleType === 'superadmin') {
        throw new BadRequestException(
          'The global superadmin account cannot be deleted.',
        );
      }

      await Promise.all([
        platformUsersCollection.deleteOne({ id }),
        this.legacyUserResourcePermissionsCollection().deleteMany({
          userId: id,
        }),
      ]);

      return {
        ...stripMongoId(platformUser),
        subUsers: [],
      };
    }

    const fallbackUsersCollection = this.fallbackUsersCollection();
    const fallbackUser = await fallbackUsersCollection.findOne({ id });

    if (!fallbackUser) {
      return null;
    }

    if (fallbackUser.roleType === 'superadmin') {
      throw new BadRequestException(
        'The global superadmin account cannot be deleted.',
      );
    }

    await Promise.all([
      fallbackUsersCollection.deleteOne({ id }),
      this.legacyUserResourcePermissionsCollection().deleteMany({ userId: id }),
    ]);

    return {
      ...stripMongoId(fallbackUser),
      subUsers: [],
    };
  }

  async findSubUsers(tenantId: string, userId: string) {
    const usersCollection = await this.usersCollection(tenantId);
    const userExists = await usersCollection.countDocuments(
      { id: userId, tenantId },
      { limit: 1 },
    );
    if (!userExists) {
      return [];
    }

    const subUsersCollection = await this.subUsersCollection(tenantId);
    const subUsers = await subUsersCollection
      .find({ userId })
      .sort({ createdAt: -1 })
      .toArray();

    return stripMongoIds(subUsers);
  }

  async findSubUserById(tenantId: string, userId: string, id: string) {
    const usersCollection = await this.usersCollection(tenantId);
    const userExists = await usersCollection.countDocuments(
      { id: userId, tenantId },
      { limit: 1 },
    );
    if (!userExists) {
      return null;
    }

    const subUsersCollection = await this.subUsersCollection(tenantId);
    return stripMongoId(await subUsersCollection.findOne({ id, userId }));
  }

  async createSubUser(
    tenantId: string,
    userId: string,
    data: CreateSubUserInput,
  ) {
    if (tenantId && tenantId !== '00000000-0000-0000-0000-000000000000') {
      const tenantDoc = await this.mongoDbService
        .collection('tenants', 'core_db')
        .findOne({ id: tenantId });
      if (tenantDoc) {
        const aggregate = new TenantAggregate(tenantDoc as unknown as TenantProps);
        const existingSubUsers = await (
          await this.subUsersCollection(tenantId)
        ).countDocuments({});
        aggregate.assertCanCreateSubUser(existingSubUsers);
      }
    }
    const now = new Date();
    const subUser: SubUserEntity = {
      id: randomUUID(),
      name: data.name,
      email: data.email.trim().toLowerCase(),
      userId,
      createdAt: now,
      updatedAt: now,
    };

    const subUsersCollection = await this.subUsersCollection(tenantId);
    await subUsersCollection.insertOne(subUser);
    return stripMongoId(subUser);
  }

  async updateSubUser(tenantId: string, id: string, data: UpdateSubUserInput) {
    const updates: Record<string, unknown> = {};

    if (data.name !== undefined) {
      updates.name = data.name;
    }

    if (data.email !== undefined) {
      updates.email = data.email.trim().toLowerCase();
    }

    if (Object.keys(updates).length > 0) {
      const subUsersCollection = await this.subUsersCollection(tenantId);
      await subUsersCollection.updateOne(
        { id },
        {
          $set: {
            ...updates,
            updatedAt: new Date(),
          },
        },
      );
    }

    const subUsersCollection = await this.subUsersCollection(tenantId);
    return stripMongoId(await subUsersCollection.findOne({ id }));
  }

  async deleteSubUser(tenantId: string, id: string) {
    const subUsersCollection = await this.subUsersCollection(tenantId);
    const subUser = await subUsersCollection.findOne({ id });
    if (!subUser) {
      return null;
    }

    await subUsersCollection.deleteOne({ id });
    return stripMongoId(subUser);
  }

  private async ensureUniqueEmail(email: string, excludedUserId?: string) {
    const targets =
      await this.tenantCollectionService.listTenantCollectionTargets('users');

    for (const target of targets) {
      const existing = await this.tenantCollectionService
        .getCollectionForTarget<UserEntity>(target)
        .findOne(
          excludedUserId ? { email, id: { $ne: excludedUserId } } : { email },
          { projection: { id: 1 } },
        );

      if (existing) {
        throw new ConflictException('A record with this email already exists.');
      }
    }

    const platformExisting = await this.platformUsersCollection().findOne(
      excludedUserId ? { email, id: { $ne: excludedUserId } } : { email },
      { projection: { id: 1 } },
    );

    if (platformExisting) {
      throw new ConflictException('A record with this email already exists.');
    }

    const fallbackExisting = await this.fallbackUsersCollection().findOne(
      excludedUserId ? { email, id: { $ne: excludedUserId } } : { email },
      { projection: { id: 1 } },
    );

    if (fallbackExisting) {
      throw new ConflictException('A record with this email already exists.');
    }
  }

  private async ensureUniqueUsername(
    username: string,
    excludedUserId?: string,
  ) {
    if (!username) {
      return;
    }

    const targets =
      await this.tenantCollectionService.listTenantCollectionTargets('users');

    for (const target of targets) {
      const existing = await this.tenantCollectionService
        .getCollectionForTarget<UserEntity>(target)
        .findOne(
          excludedUserId
            ? { username, id: { $ne: excludedUserId } }
            : { username },
          { projection: { id: 1 } },
        );

      if (existing) {
        throw new ConflictException(
          'A record with this username already exists.',
        );
      }
    }

    const platformExisting = await this.platformUsersCollection().findOne(
      excludedUserId ? { username, id: { $ne: excludedUserId } } : { username },
      { projection: { id: 1 } },
    );

    if (platformExisting) {
      throw new ConflictException(
        'A record with this username already exists.',
      );
    }

    const fallbackExisting = await this.fallbackUsersCollection().findOne(
      excludedUserId ? { username, id: { $ne: excludedUserId } } : { username },
      { projection: { id: 1 } },
    );

    if (fallbackExisting) {
      throw new ConflictException(
        'A record with this username already exists.',
      );
    }
  }

  private async attachSubUsers(tenantId: string, users: UserEntity[]) {
    if (users.length === 0) {
      return [];
    }

    const userIds = users.map((user) => user.id);
    const subUsersCollection = await this.subUsersCollection(tenantId);
    const subUsers = await subUsersCollection
      .find({ userId: { $in: userIds } })
      .sort({ createdAt: -1 })
      .toArray();

    const groupedSubUsers = new Map<string, SubUserEntity[]>();
    for (const subUser of subUsers) {
      const bucket = groupedSubUsers.get(subUser.userId) ?? [];
      bucket.push(subUser);
      groupedSubUsers.set(subUser.userId, bucket);
    }

    return stripMongoIds(users).map((user) => ({
      ...user,
      subUsers: stripMongoIds(groupedSubUsers.get(user.id) ?? []),
    }));
  }

  private async replaceUserResourcePermissions(
    tenantId: string,
    userId: string,
    permissions: Record<string, unknown>,
    now: Date = new Date(),
  ) {
    const permissionsCollection =
      await this.userResourcePermissionsCollection(tenantId);
    await this.replaceUserResourcePermissionsInCollection(
      permissionsCollection,
      userId,
      permissions,
      now,
    );
  }

  private async replaceLegacyUserResourcePermissions(
    userId: string,
    permissions: Record<string, unknown>,
    now: Date = new Date(),
  ) {
    const permissionsCollection =
      this.legacyUserResourcePermissionsCollection();
    await this.replaceUserResourcePermissionsInCollection(
      permissionsCollection,
      userId,
      permissions,
      now,
    );
  }

  private async replaceUserResourcePermissionsInCollection(
    permissionsCollection: Collection<UserResourcePermissionEntity>,
    userId: string,
    permissions: Record<string, unknown>,
    now: Date = new Date(),
  ) {
    await permissionsCollection.deleteMany({ userId });

    const records: UserResourcePermissionEntity[] = [];
    const typed = permissions as {
      pages?: string[];
      fields?: Record<string, string[]>;
    };

    if (Array.isArray(typed.pages)) {
      for (const page of typed.pages) {
        records.push({
          id: randomUUID(),
          userId,
          type: 'PAGE',
          resource: page,
          createdAt: now,
          updatedAt: now,
        });
      }
    }

    if (typed.fields && typeof typed.fields === 'object') {
      for (const [resource, fields] of Object.entries(typed.fields)) {
        if (!Array.isArray(fields)) {
          continue;
        }

        for (const field of fields) {
          records.push({
            id: randomUUID(),
            userId,
            type: 'FIELD',
            resource,
            field,
            createdAt: now,
            updatedAt: now,
          });
        }
      }
    }

    if (records.length > 0) {
      await permissionsCollection.insertMany(records);
    }
  }

  private async usersCollection(tenantId: string) {
    return this.tenantCollectionService.getCollection<UserEntity>(
      tenantId,
      'users',
    );
  }

  private async subUsersCollection(tenantId: string) {
    return this.tenantCollectionService.getCollection<SubUserEntity>(
      tenantId,
      'subUsers',
    );
  }

  private async userResourcePermissionsCollection(tenantId: string) {
    return this.tenantCollectionService.getCollection<UserResourcePermissionEntity>(
      tenantId,
      'userResourcePermissions',
    );
  }

  private async activityLogsCollection(tenantId: string) {
    return this.tenantCollectionService.getCollection(tenantId, 'activityLogs');
  }

  private async vesselsCollection(tenantId: string) {
    return this.tenantCollectionService.getCollection<VesselEntity>(
      tenantId,
      'vessels',
    );
  }

  private normalizeVesselIds(vesselIds?: string[]): string[] {
    if (!Array.isArray(vesselIds)) {
      return [];
    }

    return Array.from(
      new Set(vesselIds.map((id) => id.trim()).filter((id) => id.length > 0)),
    );
  }

  private async ensureTenantVesselsExist(
    tenantId: string,
    vesselIds: string[],
  ) {
    if (vesselIds.length === 0) {
      return;
    }

    const vesselsCollection = await this.vesselsCollection(tenantId);
    const matchedVessels = await vesselsCollection
      .find(
        {
          tenantId,
          id: { $in: vesselIds },
        },
        { projection: { id: 1 } },
      )
      .toArray();

    const matchedIds = new Set(matchedVessels.map((vessel) => vessel.id));
    const invalidIds = vesselIds.filter(
      (vesselId) => !matchedIds.has(vesselId),
    );

    if (invalidIds.length > 0) {
      throw new BadRequestException(
        'One or more assignedVesselIds are invalid for this tenant.',
      );
    }
  }

  private platformUsersCollection() {
    return this.mongoDbService.collection<UserEntity>(
      'superadmin_users',
      this.superadminDatabaseName,
    );
  }

  private fallbackUsersCollection() {
    return this.mongoDbService.collection<UserEntity>('users');
  }

  private legacyUserResourcePermissionsCollection() {
    return this.mongoDbService.collection<UserResourcePermissionEntity>(
      'userResourcePermissions',
      this.superadminDatabaseName,
    );
  }
}
