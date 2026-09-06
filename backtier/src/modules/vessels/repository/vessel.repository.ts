import {
  BadRequestException,
  ConflictException,
  Injectable,
} from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { Document } from 'mongodb';
import { TenantCollectionService } from '../../../core/mongodb/tenant-collection.service';
import {
  stripMongoId,
  stripMongoIds,
} from '../../../core/mongodb/mongo-document.util';

export interface VesselCoreInfoInput {
  vesselName: string;
  imoNumber: string;
  vesselType: string;
  flag: string;
  callSign?: string;
  mmsiNumber?: string;
  yearBuilt?: string;
  deadweight?: string;
  grossTonnage?: string;
  netTonnage?: string;
}

export interface VesselOwnershipInput {
  ownerCompany: string;
  operatorCompany: string;
  technicalManager?: string;
  commercialManager?: string;
}

export interface VesselOperationsInput {
  currentStatus: 'Active' | 'In Port' | 'Sailing' | 'Dry Dock';
  currentPort: string;
  nextPort?: string;
  eta?: string;
  etd?: string;
  tradingArea?: string;
}

export interface VesselProcurementInput {
  defaultCurrency: string;
  budgetLimit?: number;
  approvalRequired: boolean;
  preferredPorts?: string[];
  preferredVendors?: string[];
  contractType?: 'Spot' | 'Annual' | 'Contract';
}

export interface VesselCrewInput {
  captain?: string;
  chiefEngineer?: string;
  assignedDepartments: string[];
}

export interface VesselIntegrationInput {
  erpSystem?: string;
  externalVesselId?: string;
  syncEnabled: boolean;
}

export interface VesselSystemFlagsInput {
  isActive: boolean;
  isProcurementEnabled: boolean;
  isVendorAccessAllowed: boolean;
  isBudgetControlled: boolean;
}

export interface CreateVesselInput {
  coreInfo: VesselCoreInfoInput;
  ownership: VesselOwnershipInput;
  operations: VesselOperationsInput;
  procurement: VesselProcurementInput;
  crew: VesselCrewInput;
  integration: VesselIntegrationInput;
  systemFlags: VesselSystemFlagsInput;
}

export interface UpdateVesselInput {
  coreInfo?: Partial<VesselCoreInfoInput>;
  ownership?: Partial<VesselOwnershipInput>;
  operations?: Partial<VesselOperationsInput>;
  procurement?: Partial<VesselProcurementInput>;
  crew?: Partial<VesselCrewInput>;
  integration?: Partial<VesselIntegrationInput>;
  systemFlags?: Partial<VesselSystemFlagsInput>;
}

export interface VesselEntity extends Document, CreateVesselInput {
  id: string;
  tenantId: string;
  createdAt: Date;
  updatedAt: Date;
}

@Injectable()
export class VesselRepository {
  constructor(
    private readonly tenantCollectionService: TenantCollectionService,
  ) {}

  async findAllByTenant(tenantId: string) {
    const vesselsCollection = await this.vesselsCollection(tenantId);
    const vessels = await vesselsCollection
      .find({ tenantId })
      .sort({ createdAt: -1 })
      .toArray();

    return stripMongoIds(vessels);
  }

  async findById(tenantId: string, id: string) {
    const vesselsCollection = await this.vesselsCollection(tenantId);
    return stripMongoId(await vesselsCollection.findOne({ id, tenantId }));
  }

  async create(tenantId: string, data: CreateVesselInput) {
    const normalized = this.normalizeCreateInput(data);
    await this.ensureUniqueImoNumber(tenantId, normalized.coreInfo.imoNumber);

    const now = new Date();
    const vessel: VesselEntity = {
      id: randomUUID(),
      ...normalized,
      tenantId,
      createdAt: now,
      updatedAt: now,
    };

    const vesselsCollection = await this.vesselsCollection(tenantId);
    await vesselsCollection.insertOne(vessel);
    return stripMongoId(vessel);
  }

  async update(tenantId: string, id: string, data: UpdateVesselInput) {
    const vesselsCollection = await this.vesselsCollection(tenantId);
    const updates = this.normalizeUpdateInput(data);
    const flattenedUpdates = this.flattenForSet(
      updates as Record<string, unknown>,
    );

    if (updates.coreInfo?.imoNumber) {
      await this.ensureUniqueImoNumber(
        tenantId,
        updates.coreInfo.imoNumber,
        id,
      );
    }

    if (Object.keys(flattenedUpdates).length > 0) {
      await vesselsCollection.updateOne(
        { id, tenantId },
        {
          $set: {
            ...flattenedUpdates,
            updatedAt: new Date(),
          },
        },
      );
    }

    return stripMongoId(await vesselsCollection.findOne({ id, tenantId }));
  }

  async delete(tenantId: string, id: string) {
    const vesselsCollection = await this.vesselsCollection(tenantId);
    const vessel = await vesselsCollection.findOne({ id, tenantId });
    if (!vessel) {
      return null;
    }

    await vesselsCollection.deleteOne({ id, tenantId });
    return stripMongoId(vessel);
  }

  private async ensureUniqueImoNumber(
    tenantId: string,
    imoNumber: string,
    excludedId?: string,
  ) {
    const vesselsCollection = await this.vesselsCollection(tenantId);
    const existing = await vesselsCollection.findOne(
      excludedId
        ? { 'coreInfo.imoNumber': imoNumber, id: { $ne: excludedId } }
        : { 'coreInfo.imoNumber': imoNumber },
      { projection: { id: 1 } },
    );

    if (existing) {
      throw new ConflictException(
        'A record with this imoNumber already exists.',
      );
    }
  }

  private async vesselsCollection(tenantId: string) {
    return this.tenantCollectionService.getCollection<VesselEntity>(
      tenantId,
      'vessels',
    );
  }

  private normalizeCreateInput(input: CreateVesselInput): CreateVesselInput {
    return {
      coreInfo: {
        vesselName: this.normalizeRequiredString(
          input.coreInfo.vesselName,
          'coreInfo.vesselName',
        ),
        imoNumber: this.normalizeRequiredString(
          input.coreInfo.imoNumber,
          'coreInfo.imoNumber',
        ),
        vesselType: this.normalizeRequiredString(
          input.coreInfo.vesselType,
          'coreInfo.vesselType',
        ),
        flag: this.normalizeRequiredString(
          input.coreInfo.flag,
          'coreInfo.flag',
        ),
        callSign: this.normalizeOptionalString(input.coreInfo.callSign),
        mmsiNumber: this.normalizeOptionalString(input.coreInfo.mmsiNumber),
        yearBuilt: this.normalizeOptionalString(input.coreInfo.yearBuilt),
        deadweight: this.normalizeOptionalString(input.coreInfo.deadweight),
        grossTonnage: this.normalizeOptionalString(input.coreInfo.grossTonnage),
        netTonnage: this.normalizeOptionalString(input.coreInfo.netTonnage),
      },
      ownership: {
        ownerCompany: this.normalizeRequiredString(
          input.ownership.ownerCompany,
          'ownership.ownerCompany',
        ),
        operatorCompany: this.normalizeRequiredString(
          input.ownership.operatorCompany,
          'ownership.operatorCompany',
        ),
        technicalManager: this.normalizeOptionalString(
          input.ownership.technicalManager,
        ),
        commercialManager: this.normalizeOptionalString(
          input.ownership.commercialManager,
        ),
      },
      operations: {
        currentStatus: input.operations.currentStatus,
        currentPort: this.normalizeRequiredString(
          input.operations.currentPort,
          'operations.currentPort',
        ),
        nextPort: this.normalizeOptionalString(input.operations.nextPort),
        eta: this.normalizeOptionalString(input.operations.eta),
        etd: this.normalizeOptionalString(input.operations.etd),
        tradingArea: this.normalizeOptionalString(input.operations.tradingArea),
      },
      procurement: {
        defaultCurrency: this.normalizeRequiredString(
          input.procurement.defaultCurrency,
          'procurement.defaultCurrency',
        ),
        budgetLimit: input.procurement.budgetLimit,
        approvalRequired: input.procurement.approvalRequired,
        preferredPorts: this.normalizeStringArray(
          input.procurement.preferredPorts,
        ),
        preferredVendors: this.normalizeStringArray(
          input.procurement.preferredVendors,
        ),
        contractType: input.procurement.contractType,
      },
      crew: {
        captain: this.normalizeOptionalString(input.crew.captain),
        chiefEngineer: this.normalizeOptionalString(input.crew.chiefEngineer),
        assignedDepartments:
          this.normalizeStringArray(input.crew.assignedDepartments, true) ?? [],
      },
      integration: {
        erpSystem: this.normalizeOptionalString(input.integration.erpSystem),
        externalVesselId: this.normalizeOptionalString(
          input.integration.externalVesselId,
        ),
        syncEnabled: input.integration.syncEnabled,
      },
      systemFlags: {
        isActive: input.systemFlags.isActive,
        isProcurementEnabled: input.systemFlags.isProcurementEnabled,
        isVendorAccessAllowed: input.systemFlags.isVendorAccessAllowed,
        isBudgetControlled: input.systemFlags.isBudgetControlled,
      },
    };
  }

  private normalizeUpdateInput(input: UpdateVesselInput): UpdateVesselInput {
    return this.removeUndefined({
      coreInfo: input.coreInfo
        ? this.removeUndefined({
            vesselName: this.normalizeOptionalString(input.coreInfo.vesselName),
            imoNumber: this.normalizeOptionalString(input.coreInfo.imoNumber),
            vesselType: this.normalizeOptionalString(input.coreInfo.vesselType),
            flag: this.normalizeOptionalString(input.coreInfo.flag),
            callSign: this.normalizeOptionalString(input.coreInfo.callSign),
            mmsiNumber: this.normalizeOptionalString(input.coreInfo.mmsiNumber),
            yearBuilt: this.normalizeOptionalString(input.coreInfo.yearBuilt),
            deadweight: this.normalizeOptionalString(input.coreInfo.deadweight),
            grossTonnage: this.normalizeOptionalString(
              input.coreInfo.grossTonnage,
            ),
            netTonnage: this.normalizeOptionalString(input.coreInfo.netTonnage),
          })
        : undefined,
      ownership: input.ownership
        ? this.removeUndefined({
            ownerCompany: this.normalizeOptionalString(
              input.ownership.ownerCompany,
            ),
            operatorCompany: this.normalizeOptionalString(
              input.ownership.operatorCompany,
            ),
            technicalManager: this.normalizeOptionalString(
              input.ownership.technicalManager,
            ),
            commercialManager: this.normalizeOptionalString(
              input.ownership.commercialManager,
            ),
          })
        : undefined,
      operations: input.operations
        ? this.removeUndefined({
            currentStatus: input.operations.currentStatus,
            currentPort: this.normalizeOptionalString(
              input.operations.currentPort,
            ),
            nextPort: this.normalizeOptionalString(input.operations.nextPort),
            eta: this.normalizeOptionalString(input.operations.eta),
            etd: this.normalizeOptionalString(input.operations.etd),
            tradingArea: this.normalizeOptionalString(
              input.operations.tradingArea,
            ),
          })
        : undefined,
      procurement: input.procurement
        ? this.removeUndefined({
            defaultCurrency: this.normalizeOptionalString(
              input.procurement.defaultCurrency,
            ),
            budgetLimit: input.procurement.budgetLimit,
            approvalRequired: input.procurement.approvalRequired,
            preferredPorts: this.normalizeStringArray(
              input.procurement.preferredPorts,
              true,
            ),
            preferredVendors: this.normalizeStringArray(
              input.procurement.preferredVendors,
              true,
            ),
            contractType: input.procurement.contractType,
          })
        : undefined,
      crew: input.crew
        ? this.removeUndefined({
            captain: this.normalizeOptionalString(input.crew.captain),
            chiefEngineer: this.normalizeOptionalString(
              input.crew.chiefEngineer,
            ),
            assignedDepartments: this.normalizeStringArray(
              input.crew.assignedDepartments,
              true,
            ),
          })
        : undefined,
      integration: input.integration
        ? this.removeUndefined({
            erpSystem: this.normalizeOptionalString(
              input.integration.erpSystem,
            ),
            externalVesselId: this.normalizeOptionalString(
              input.integration.externalVesselId,
            ),
            syncEnabled: input.integration.syncEnabled,
          })
        : undefined,
      systemFlags: input.systemFlags
        ? this.removeUndefined({
            isActive: input.systemFlags.isActive,
            isProcurementEnabled: input.systemFlags.isProcurementEnabled,
            isVendorAccessAllowed: input.systemFlags.isVendorAccessAllowed,
            isBudgetControlled: input.systemFlags.isBudgetControlled,
          })
        : undefined,
    });
  }

  private normalizeRequiredString(value: string, fieldName: string): string {
    const normalized = value.trim();
    if (!normalized) {
      throw new BadRequestException(`${fieldName} is required.`);
    }

    return normalized;
  }

  private normalizeOptionalString(value: unknown): string | undefined {
    if (typeof value !== 'string') {
      return undefined;
    }

    const normalized = value.trim();
    return normalized.length > 0 ? normalized : undefined;
  }

  private normalizeStringArray(
    values?: string[],
    keepEmpty = false,
  ): string[] | undefined {
    if (!Array.isArray(values)) {
      return undefined;
    }

    const normalized = values
      .map((value) => value.trim())
      .filter((value) => value.length > 0);

    if (normalized.length === 0 && !keepEmpty) {
      return undefined;
    }

    return normalized;
  }

  private flattenForSet(
    input: Record<string, unknown>,
    parentKey?: string,
  ): Record<string, unknown> {
    const flattened: Record<string, unknown> = {};

    for (const [key, value] of Object.entries(input)) {
      if (value === undefined) {
        continue;
      }

      const nextKey = parentKey ? `${parentKey}.${key}` : key;
      const isPlainObject =
        typeof value === 'object' &&
        value !== null &&
        !Array.isArray(value) &&
        !(value instanceof Date);

      if (isPlainObject) {
        Object.assign(
          flattened,
          this.flattenForSet(value as Record<string, unknown>, nextKey),
        );
        continue;
      }

      flattened[nextKey] = value;
    }

    return flattened;
  }

  private removeUndefined<T extends object>(input: T): Partial<T> {
    const result: Record<string, unknown> = {};

    for (const [key, value] of Object.entries(
      input as Record<string, unknown>,
    )) {
      if (value !== undefined) {
        const isEmptyObject =
          typeof value === 'object' &&
          value !== null &&
          !Array.isArray(value) &&
          Object.keys(value as Record<string, unknown>).length === 0;

        if (isEmptyObject) {
          continue;
        }

        result[key] = value;
      }
    }

    return result as Partial<T>;
  }
}
