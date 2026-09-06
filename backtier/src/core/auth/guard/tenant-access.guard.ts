import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import type { Request } from 'express';
import type { JwtTokenPayload } from '../types/jwt-token-payload.type';

type TenantScopedRequest = Request & {
  params: {
    tenantId?: string;
  };
  user?: JwtTokenPayload;
};

@Injectable()
export class TenantAccessGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<TenantScopedRequest>();
    const routeTenantId = request.params?.tenantId;

    if (!routeTenantId) {
      return true;
    }

    const claims = request.user;
    if (!claims) {
      throw new UnauthorizedException('Missing authentication claims');
    }

    // Platform-level admins can manage resources across tenant scopes.
    if (claims.role === 'ADMIN') {
      return true;
    }

    const tokenTenantId =
      claims.tenantId ??
      (typeof claims.tenant_id === 'string' ? claims.tenant_id : undefined);

    if (!tokenTenantId) {
      throw new ForbiddenException('Missing tenant scope in token');
    }

    if (tokenTenantId !== routeTenantId) {
      throw new ForbiddenException('Tenant scope mismatch');
    }

    return true;
  }
}
