import { Injectable, Logger, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import IORedis from 'ioredis';

export interface TenantCacheEntry {
  tenantId: string;
  dbName: string;
  name: string;
  status: string;
}

/**
 * Redis-backed tenant metadata cache.
 *
 * Replaces the per-process in-memory Map used in TenantCollectionService, so
 * that all horizontally-scaled NestJS instances share the same warm cache.
 *
 * Falls back to a local Map when Redis is unavailable so the system never
 * hard-fails on a missing cache layer.
 */
@Injectable()
export class TenantCacheService implements OnModuleDestroy {
  private readonly logger = new Logger(TenantCacheService.name);
  private readonly keyPrefix = 'tenant_meta:';
  private readonly ttlSeconds: number;

  private redis: IORedis | null = null;
  /** Local fallback used when Redis is not configured / unreachable. */
  private readonly localCache = new Map<string, TenantCacheEntry>();

  constructor(private readonly configService: ConfigService) {
    this.ttlSeconds = this.readNumericConfig(
      'TENANT_CACHE_TTL_SECONDS',
      300,
      10,
    );
    this.redis = this.createRedisClient();
  }

  async onModuleDestroy(): Promise<void> {
    if (this.redis) {
      try {
        await this.redis.quit();
      } catch {
        // Ignore errors on shutdown.
      }
      this.redis = null;
    }
  }

  async get(tenantId: string): Promise<TenantCacheEntry | null> {
    const key = this.buildKey(tenantId);

    if (this.redis) {
      try {
        const raw = await this.redis.get(key);
        if (raw) {
          return JSON.parse(raw) as TenantCacheEntry;
        }
        return null;
      } catch (err) {
        this.logger.warn(
          `Redis GET failed for tenant ${tenantId}, falling back to local cache: ${String(err)}`,
        );
      }
    }

    return this.localCache.get(tenantId) ?? null;
  }

  async set(entry: TenantCacheEntry): Promise<void> {
    const key = this.buildKey(entry.tenantId);
    const serialized = JSON.stringify(entry);

    if (this.redis) {
      try {
        await this.redis.set(key, serialized, 'EX', this.ttlSeconds);
        return;
      } catch (err) {
        this.logger.warn(
          `Redis SET failed for tenant ${entry.tenantId}, writing to local cache: ${String(err)}`,
        );
      }
    }

    this.localCache.set(entry.tenantId, entry);
  }

  async invalidate(tenantId: string): Promise<void> {
    const key = this.buildKey(tenantId);
    this.localCache.delete(tenantId);

    if (this.redis) {
      try {
        await this.redis.del(key);
      } catch (err) {
        this.logger.warn(
          `Redis DEL failed for tenant ${tenantId}: ${String(err)}`,
        );
      }
    }
  }

  private buildKey(tenantId: string): string {
    return `${this.keyPrefix}${tenantId}`;
  }

  private createRedisClient(): IORedis | null {
    const redisUrl = this.configService.get<string>('REDIS_URL')?.trim();

    if (redisUrl) {
      const client = new IORedis(redisUrl, {
        maxRetriesPerRequest: 3,
        lazyConnect: true,
      });
      this.attachErrorHandler(client);
      return client;
    }

    const host = this.configService.get<string>('REDIS_HOST')?.trim();
    if (!host) {
      this.logger.warn(
        'Neither REDIS_URL nor REDIS_HOST is set. TenantCacheService will use per-process local cache only.',
      );
      return null;
    }

    const port = this.readNumericConfig('REDIS_PORT', 6379, 1);
    const db = this.readNumericConfig('REDIS_DB', 0, 0);
    const password = this.configService.get<string>('REDIS_PASSWORD');

    const client = new IORedis({
      host,
      port,
      db,
      password: password && password.length > 0 ? password : undefined,
      maxRetriesPerRequest: 3,
      lazyConnect: true,
    });

    this.attachErrorHandler(client);
    return client;
  }

  private attachErrorHandler(client: IORedis): void {
    client.on('error', (err: Error) => {
      this.logger.warn(`TenantCacheService Redis error: ${err.message}`);
    });
  }

  private readNumericConfig(
    key: string,
    fallback: number,
    minimum: number,
  ): number {
    const raw = this.configService.get<string>(key);
    if (!raw) return fallback;
    const parsed = Number.parseInt(raw, 10);
    if (Number.isNaN(parsed) || parsed < minimum) return fallback;
    return parsed;
  }
}
