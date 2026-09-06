import { Injectable, Logger, NestMiddleware } from '@nestjs/common';
import type { NextFunction, Request, Response } from 'express';
import {
  TenantCacheService,
  TenantCacheEntry,
} from '../mongodb/tenant-cache.service';
import { MongoDbService } from '../mongodb/mongodb.service';
import { Document } from 'mongodb';

interface TenantDocument extends Document {
  id: string;
  name: string;
  dbName?: string;
  databaseName?: string;
  status: string;
}

/** The resolved tenant context attached to every request. */
export interface TenantContext {
  tenantId: string;
  dbName: string;
  name: string;
  status: string;
}

/** Extend Express Request to carry tenantContext. */
declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      tenantContext?: TenantContext;
    }
  }
}

/**
 * TenantResolverMiddleware
 *
 * Runs on every request before guards/controllers.
 * Resolution priority:
 *   1. `x-tenant-id` request header
 *   2. JWT payload `tenantId` (already decoded by JwtAuthGuard upstream)
 *
 * On resolution:
 *   - Looks up tenant metadata from Redis cache (TenantCacheService).
 *   - Falls back to core_db.tenants if not cached.
 *   - Attaches `req.tenantContext` for downstream use.
 *
 * Non-blocking: if no tenantId can be resolved, the request continues
 * without a tenantContext (public/superadmin routes need no tenant).
 */
@Injectable()
export class TenantResolverMiddleware implements NestMiddleware {
  private readonly logger = new Logger(TenantResolverMiddleware.name);

  constructor(
    private readonly tenantCacheService: TenantCacheService,
    private readonly mongoDbService: MongoDbService,
  ) {}

  async use(req: Request, _res: Response, next: NextFunction): Promise<void> {
    try {
      const tenantId = this.resolveTenantId(req);

      if (tenantId) {
        const context = await this.fetchTenantContext(tenantId);
        if (context) {
          req.tenantContext = context;
        }
      }
    } catch (err) {
      // Non-fatal — log and continue.  Guards/controllers will reject if needed.
      this.logger.warn(
        `TenantResolverMiddleware: error resolving tenant — ${String(err)}`,
      );
    }

    next();
  }

  // ─── Private helpers ────────────────────────────────────────────────────────

  private resolveTenantId(req: Request): string | undefined {
    // 1. Explicit header takes precedence (API clients, service-to-service).
    const headerValue = req.headers['x-tenant-id'];
    if (typeof headerValue === 'string' && headerValue.trim().length > 0) {
      return headerValue.trim();
    }

    // 2. JWT payload (set by JwtAuthGuard on authenticated requests).
    const user = (req as any).user as
      | { tenantId?: string; tenant_id?: string }
      | undefined;
    if (user?.tenantId) return user.tenantId;
    if (user?.tenant_id) return user.tenant_id;

    return undefined;
  }

  private async fetchTenantContext(
    tenantId: string,
  ): Promise<TenantContext | null> {
    // Try Redis / local cache first.
    const cached = await this.tenantCacheService.get(tenantId);
    if (cached) {
      return {
        tenantId: cached.tenantId,
        dbName: cached.dbName,
        name: cached.name,
        status: cached.status,
      };
    }

    // Cache miss — query core_db.tenants.
    if (!this.mongoDbService.isConnected()) {
      return null;
    }

    const tenant = await this.mongoDbService
      .collection<TenantDocument>('tenants')
      .findOne(
        { id: tenantId },
        { projection: { id: 1, name: 1, databaseName: 1, status: 1 } },
      );

    if (!tenant) {
      this.logger.warn(
        `TenantResolverMiddleware: tenant ${tenantId} not found in core_db.`,
      );
      return null;
    }

    const dbName = tenant.databaseName ?? tenant.dbName ?? `tenant_${tenantId}`;

    const entry: TenantCacheEntry = {
      tenantId: tenant.id,
      dbName,
      name: tenant.name,
      status: tenant.status,
    };

    // Warm the cache for subsequent requests.
    await this.tenantCacheService.set(entry);

    return {
      tenantId: tenant.id,
      dbName,
      name: tenant.name,
      status: tenant.status,
    };
  }
}
