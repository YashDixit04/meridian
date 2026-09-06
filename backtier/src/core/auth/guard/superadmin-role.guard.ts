import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import type { Request } from 'express';
import type { JwtTokenPayload } from '../types/jwt-token-payload.type';

type SuperadminScopedRequest = Request & {
  user?: JwtTokenPayload;
};

@Injectable()
export class SuperadminRoleGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context
      .switchToHttp()
      .getRequest<SuperadminScopedRequest>();
    const roleType = String(
      request.user?.roleType ?? request.user?.role_type ?? '',
    ).toLowerCase();

    if (roleType !== 'superadmin') {
      throw new ForbiddenException(
        'Superadmin access is required for this operation.',
      );
    }

    return true;
  }
}
