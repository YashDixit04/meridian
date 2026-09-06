import {
  BadRequestException,
  ConflictException,
  Injectable,
} from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { Document } from 'mongodb';
import { MongoDbService } from '../../../core/mongodb/mongodb.service';
import { TenantCollectionService } from '../../../core/mongodb/tenant-collection.service';
import {
  stripMongoId,
  stripMongoIds,
} from '../../../core/mongodb/mongo-document.util';
import { OrderStatus } from '../../../core/types/order-status.enum';

export interface CreateRequisitionInput {
  orderNumber?: string;
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
  status?: OrderStatus;
  totalAmount?: number;
  userId?: string;
  vendorId?: string;
  vesselId?: string;
}

export interface UpdateRequisitionInput {
  status?: OrderStatus;
  totalAmount?: number;
  userId?: string;
  vendorId?: string;
  vesselId?: string;
}

export interface RequisitionOrderEntity extends Document {
  id: string;
  orderNumber: string;
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
  status: OrderStatus;
  totalAmount: number;
  tenantId: string;
  userId?: string;
  vendorId?: string;
  vesselId?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserEntity extends Document {
  id: string;
  tenantId: string;
  [key: string]: unknown;
}

export interface VendorEntity extends Document {
  id: string;
  tenantId: string;
  [key: string]: unknown;
}

export interface VesselEntity extends Document {
  id: string;
  tenantId: string;
  [key: string]: unknown;
}

@Injectable()
export class RequisitionRepository {
  constructor(
    private readonly mongoDbService: MongoDbService,
    private readonly tenantCollectionService: TenantCollectionService,
  ) {}

  async findAllByTenant(tenantId: string) {
    const ordersCollection = await this.ordersCollection(tenantId);
    const orders = await ordersCollection
      .find({ tenantId })
      .sort({ createdAt: -1 })
      .toArray();

    return this.attachRelations(tenantId, orders);
  }

  async findById(tenantId: string, id: string) {
    const ordersCollection = await this.ordersCollection(tenantId);
    const usersCollection = await this.usersCollection(tenantId);
    const vendorsCollection = await this.vendorsCollection(tenantId);
    const vesselsCollection = await this.vesselsCollection(tenantId);

    const order = await ordersCollection.findOne({ id, tenantId });
    if (!order) {
      return null;
    }

    const [user, vendor, vessel] = await Promise.all([
      usersCollection.findOne({ id: order.userId }),
      vendorsCollection.findOne({ id: order.vendorId }),
      vesselsCollection.findOne({ id: order.vesselId }),
    ]);

    return {
      ...stripMongoId(order),
      user: stripMongoId(user),
      vendor: stripMongoId(vendor),
      vessel: stripMongoId(vessel),
    };
  }

  async create(tenantId: string, payload: CreateRequisitionInput) {
    const ordersCollection = await this.ordersCollection(tenantId);

    // Auto-generate order number if not provided
    const orderNumber =
      payload.orderNumber || `REQ-${Math.floor(1000 + Math.random() * 9000)}`;

    const existingByOrderNumber = await ordersCollection.findOne(
      { orderNumber },
      { projection: { id: 1 } },
    );

    if (existingByOrderNumber) {
      throw new ConflictException(
        'A record with this orderNumber already exists.',
      );
    }

    if (payload.userId || payload.vendorId || payload.vesselId) {
      await this.ensureRelationOwnership(
        tenantId,
        payload.userId,
        payload.vendorId,
        payload.vesselId,
      );
    }

    const now = new Date();
    const order: RequisitionOrderEntity = {
      id: randomUUID(),
      orderNumber,
      requisitionName: payload.requisitionName,
      categoryType: payload.categoryType,
      priorityType: payload.priorityType,
      country: payload.country,
      port: payload.port,
      creatorName: payload.creatorName,
      creatorRank: payload.creatorRank,
      crewMembers: payload.crewMembers,
      freshDateRange: payload.freshDateRange,
      dryDateRange: payload.dryDateRange,
      deliveryMode: payload.deliveryMode,
      agentName: payload.agentName,
      agentEmail: payload.agentEmail,
      agentPhone: payload.agentPhone,
      status: payload.status ?? OrderStatus.DRAFT, // Default to DRAFT based on requirements
      totalAmount: payload.totalAmount ?? 0,
      tenantId,
      userId: payload.userId,
      vendorId: payload.vendorId,
      vesselId: payload.vesselId,
      createdAt: now,
      updatedAt: now,
    };

    await ordersCollection.insertOne(order);
    return stripMongoId(order);
  }

  async update(tenantId: string, id: string, payload: UpdateRequisitionInput) {
    const ordersCollection = await this.ordersCollection(tenantId);
    const existing = await ordersCollection.findOne({ id, tenantId });
    if (!existing) {
      return null;
    }

    if (payload.userId || payload.vendorId || payload.vesselId) {
      await this.ensureRelationOwnership(
        existing.tenantId,
        payload.userId ?? existing.userId,
        payload.vendorId ?? existing.vendorId,
        payload.vesselId ?? existing.vesselId,
      );
    }

    const updates = this.removeUndefined(payload);
    if (Object.keys(updates).length > 0) {
      await ordersCollection.updateOne(
        { id },
        {
          $set: {
            ...updates,
            updatedAt: new Date(),
          },
        },
      );
    }

    return stripMongoId(await ordersCollection.findOne({ id }));
  }

  async delete(tenantId: string, id: string) {
    const ordersCollection = await this.ordersCollection(tenantId);
    const order = await ordersCollection.findOne({ id });
    if (!order) {
      return null;
    }

    await ordersCollection.deleteOne({ id });
    return stripMongoId(order);
  }

  private async attachRelations(
    tenantId: string,
    orderRows: RequisitionOrderEntity[],
  ) {
    if (orderRows.length === 0) {
      return [];
    }

    const usersCollection = await this.usersCollection(tenantId);
    const vendorsCollection = await this.vendorsCollection(tenantId);
    const vesselsCollection = await this.vesselsCollection(tenantId);

    const userIds = orderRows
      .map((order) => order.userId)
      .filter(Boolean) as string[];
    const vendorIds = orderRows
      .map((order) => order.vendorId)
      .filter(Boolean) as string[];
    const vesselIds = orderRows
      .map((order) => order.vesselId)
      .filter(Boolean) as string[];

    const [users, vendors, vessels] = await Promise.all([
      usersCollection.find({ id: { $in: userIds } }).toArray(),
      vendorsCollection.find({ id: { $in: vendorIds } }).toArray(),
      vesselsCollection.find({ id: { $in: vesselIds } }).toArray(),
    ]);

    const userMap = new Map(
      stripMongoIds(users).map((user) => [user.id, user]),
    );
    const vendorMap = new Map(
      stripMongoIds(vendors).map((vendor) => [vendor.id, vendor]),
    );
    const vesselMap = new Map(
      stripMongoIds(vessels).map((vessel) => [vessel.id, vessel]),
    );

    return stripMongoIds(orderRows).map((order) => ({
      ...order,
      user: order.userId ? (userMap.get(order.userId) ?? null) : null,
      vendor: order.vendorId ? (vendorMap.get(order.vendorId) ?? null) : null,
      vessel: order.vesselId ? (vesselMap.get(order.vesselId) ?? null) : null,
    }));
  }

  private async ensureRelationOwnership(
    tenantId: string,
    userId?: string,
    vendorId?: string,
    vesselId?: string,
  ) {
    const usersCollection = await this.usersCollection(tenantId);
    const vendorsCollection = await this.vendorsCollection(tenantId);
    const vesselsCollection = await this.vesselsCollection(tenantId);

    const [user, vendor, vessel] = await Promise.all([
      userId
        ? usersCollection.findOne(
            { id: userId, tenantId },
            { projection: { id: 1 } },
          )
        : Promise.resolve(null),
      vendorId
        ? vendorsCollection.findOne(
            { id: vendorId, tenantId },
            { projection: { id: 1 } },
          )
        : Promise.resolve(null),
      vesselId
        ? vesselsCollection.findOne(
            { id: vesselId, tenantId },
            { projection: { id: 1 } },
          )
        : Promise.resolve(null),
    ]);

    if (userId && !user) {
      throw new BadRequestException('Invalid userId for this tenant.');
    }

    if (vendorId && !vendor) {
      throw new BadRequestException('Invalid vendorId for this tenant.');
    }

    if (vesselId && !vessel) {
      throw new BadRequestException('Invalid vesselId for this tenant.');
    }
  }

  private async ordersCollection(tenantId: string) {
    return this.tenantCollectionService.getCollection<RequisitionOrderEntity>(
      tenantId,
      'requisitionOrders',
    );
  }

  private async usersCollection(tenantId: string) {
    return this.tenantCollectionService.getCollection<UserEntity>(
      tenantId,
      'users',
    );
  }

  private async vendorsCollection(tenantId: string) {
    return this.tenantCollectionService.getCollection<VendorEntity>(
      tenantId,
      'vendors',
    );
  }

  private async vesselsCollection(tenantId: string) {
    return this.tenantCollectionService.getCollection<VesselEntity>(
      tenantId,
      'vessels',
    );
  }

  private removeUndefined<T extends object>(input: T): Partial<T> {
    const result: Record<string, unknown> = {};

    for (const [key, value] of Object.entries(
      input as Record<string, unknown>,
    )) {
      if (value !== undefined) {
        result[key] = value;
      }
    }

    return result as Partial<T>;
  }
}
