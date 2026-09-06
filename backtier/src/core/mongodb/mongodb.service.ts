import {
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  ClientSession,
  Collection,
  Db,
  DeleteResult,
  Document,
  Filter,
  MongoClient,
  MongoServerError,
  UpdateResult,
} from 'mongodb';

@Injectable()
export class MongoDbService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(MongoDbService.name);
  private client: MongoClient | null = null;
  private db: Db | null = null;
  private hasLoggedDisabledState = false;

  private readonly defaultMaxPoolSize = 100;
  private readonly defaultMinPoolSize = 20;
  private readonly defaultMaxConnecting = 20;
  private readonly defaultMaxIdleTimeMs = 30_000;
  private readonly defaultWaitQueueTimeoutMs = 5_000;

  constructor(private readonly configService: ConfigService) {}

  async onModuleInit() {
    const uri = this.configService.get<string>('MONGODB_URI');
    const dbName = this.configService.get<string>('MONGODB_DB_NAME');

    if (!uri || !dbName) {
      this.logger.warn(
        'MONGODB_URI or MONGODB_DB_NAME is missing. MongoDB Atlas sync is disabled.',
      );
      return;
    }

    const maxPoolSize = this.resolveNumericConfig(
      'MONGODB_MAX_POOL_SIZE',
      this.defaultMaxPoolSize,
      1,
    );
    const minPoolSize = this.resolveNumericConfig(
      'MONGODB_MIN_POOL_SIZE',
      this.defaultMinPoolSize,
      0,
    );
    const maxConnecting = this.resolveNumericConfig(
      'MONGODB_MAX_CONNECTING',
      this.defaultMaxConnecting,
      1,
    );
    const maxIdleTimeMS = this.resolveNumericConfig(
      'MONGODB_MAX_IDLE_TIME_MS',
      this.defaultMaxIdleTimeMs,
      1_000,
    );
    const waitQueueTimeoutMS = this.resolveNumericConfig(
      'MONGODB_WAIT_QUEUE_TIMEOUT_MS',
      this.defaultWaitQueueTimeoutMs,
      1_000,
    );

    this.client = new MongoClient(uri, {
      maxPoolSize,
      minPoolSize: Math.min(minPoolSize, maxPoolSize),
      maxConnecting,
      maxIdleTimeMS,
      waitQueueTimeoutMS,
    });
    await this.client.connect();
    this.db = this.client.db(dbName);

    this.logger.log(
      `Connected to MongoDB Atlas (${dbName}) with pool config max=${maxPoolSize}, min=${Math.min(
        minPoolSize,
        maxPoolSize,
      )}, maxConnecting=${maxConnecting}, maxIdleTimeMS=${maxIdleTimeMS}, waitQueueTimeoutMS=${waitQueueTimeoutMS}.`,
    );
  }

  async onModuleDestroy() {
    if (!this.client) {
      return;
    }

    await this.client.close();
    this.client = null;
    this.db = null;
  }

  isConnected(): boolean {
    return !!this.db;
  }

  collection<TSchema extends Document = Document>(
    name: string,
    databaseName?: string,
  ): Collection<TSchema> {
    const db = this.requireDb(databaseName);
    return db.collection<TSchema>(name);
  }

  async ensureCollection(name: string, databaseName?: string): Promise<void> {
    const db = this.requireDb(databaseName);

    const existing = await db
      .listCollections({ name }, { nameOnly: true })
      .hasNext();

    if (!existing) {
      await db.createCollection(name);
    }
  }

  async dropCollectionIfExists(
    name: string,
    databaseName?: string,
  ): Promise<void> {
    if (!this.client) {
      return;
    }

    const db = databaseName ? this.client.db(databaseName) : this.db;
    if (!db) {
      return;
    }

    try {
      await db.dropCollection(name);
    } catch (error) {
      // Namespace not found means collection does not exist, which is acceptable.
      if (
        error instanceof MongoServerError &&
        (error.codeName === 'NamespaceNotFound' || error.code === 26)
      ) {
        return;
      }

      throw error;
    }
  }

  async renameCollectionIfExists(
    oldName: string,
    newName: string,
    databaseName?: string,
  ): Promise<void> {
    if (oldName === newName) {
      return;
    }

    const db = this.requireDb(databaseName);

    const [oldExists, newExists] = await Promise.all([
      db.listCollections({ name: oldName }, { nameOnly: true }).hasNext(),
      db.listCollections({ name: newName }, { nameOnly: true }).hasNext(),
    ]);

    if (!oldExists || newExists) {
      return;
    }

    await db.collection(oldName).rename(newName);
  }

  async runInTransaction<T>(
    operation: (session: ClientSession) => Promise<T>,
  ): Promise<T> {
    if (!this.client || !this.db) {
      throw new Error(
        'MongoDB Atlas is not connected. Set MONGODB_URI and MONGODB_DB_NAME.',
      );
    }

    const session = this.client.startSession();

    try {
      let result!: T;

      await session.withTransaction(async () => {
        result = await operation(session);
      });

      return result;
    } finally {
      await session.endSession();
    }
  }

  async upsertOne(
    collectionName: string,
    filter: Filter<Document>,
    payload: Record<string, unknown>,
  ): Promise<UpdateResult<Document> | null> {
    const document = this.sanitizeDocument(payload);
    if (Object.keys(document).length === 0 || this.shouldSkipOperations()) {
      return null;
    }

    const { createdAt, ...documentWithoutCreatedAt } = document;
    const now = new Date();
    let createdAtOnInsert = now;

    if (createdAt instanceof Date && !Number.isNaN(createdAt.getTime())) {
      createdAtOnInsert = createdAt;
    } else if (typeof createdAt === 'string') {
      const parsed = new Date(createdAt);
      if (!Number.isNaN(parsed.getTime())) {
        createdAtOnInsert = parsed;
      }
    }

    return this.collection(collectionName).updateOne(
      filter,
      {
        $set: {
          ...documentWithoutCreatedAt,
          updatedAt: now,
        },
        $setOnInsert: {
          createdAt: createdAtOnInsert,
        },
      },
      { upsert: true },
    );
  }

  async updateFields(
    collectionName: string,
    filter: Filter<Document>,
    fields: Record<string, unknown>,
  ): Promise<UpdateResult<Document> | null> {
    const updates = this.sanitizeDocument(fields);
    if (Object.keys(updates).length === 0 || this.shouldSkipOperations()) {
      return null;
    }

    return this.collection(collectionName).updateOne(
      filter,
      {
        $set: {
          ...updates,
          updatedAt: new Date(),
        },
      },
      { upsert: true },
    );
  }

  async deleteOne(
    collectionName: string,
    filter: Filter<Document>,
  ): Promise<DeleteResult | null> {
    if (this.shouldSkipOperations()) {
      return null;
    }

    return this.collection(collectionName).deleteOne(filter);
  }

  private shouldSkipOperations(): boolean {
    if (this.db) {
      return false;
    }

    if (!this.hasLoggedDisabledState) {
      this.logger.warn(
        'MongoDB Atlas operation skipped because the connection is not initialized.',
      );
      this.hasLoggedDisabledState = true;
    }

    return true;
  }

  private resolveNumericConfig(
    key: string,
    fallback: number,
    minimum: number,
  ): number {
    const rawValue = this.configService.get<string>(key);
    if (!rawValue) {
      return fallback;
    }

    const parsed = Number.parseInt(rawValue, 10);
    if (Number.isNaN(parsed) || parsed < minimum) {
      this.logger.warn(
        `${key}="${rawValue}" is invalid. Falling back to ${fallback}.`,
      );
      return fallback;
    }

    return parsed;
  }

  private requireDb(databaseName?: string): Db {
    if (!this.client || !this.db) {
      throw new Error(
        'MongoDB Atlas is not connected. Set MONGODB_URI and MONGODB_DB_NAME.',
      );
    }

    if (!databaseName) {
      return this.db;
    }

    return this.client.db(databaseName);
  }

  // Removes unsupported keys so arbitrary payloads can still be safely upserted.
  private sanitizeDocument(
    input: Record<string, unknown>,
  ): Record<string, unknown> {
    const output: Record<string, unknown> = {};

    for (const [rawKey, rawValue] of Object.entries(input)) {
      if (
        rawValue === undefined ||
        rawKey.startsWith('$') ||
        rawKey.includes('\0')
      ) {
        continue;
      }

      if (Array.isArray(rawValue)) {
        output[rawKey] = rawValue.map((item) => {
          if (item && typeof item === 'object' && !(item instanceof Date)) {
            return this.sanitizeDocument(item as Record<string, unknown>);
          }
          return item;
        });
        continue;
      }

      if (
        rawValue &&
        typeof rawValue === 'object' &&
        !(rawValue instanceof Date)
      ) {
        output[rawKey] = this.sanitizeDocument(
          rawValue as Record<string, unknown>,
        );
        continue;
      }

      output[rawKey] = rawValue;
    }

    return output;
  }
}
