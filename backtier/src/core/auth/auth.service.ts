import {
  Injectable,
  UnauthorizedException,
  NotFoundException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { Document } from 'mongodb';
import { MongoDbService } from '../mongodb/mongodb.service';
import { TenantCollectionService } from '../mongodb/tenant-collection.service';
import { stripMongoId } from '../mongodb/mongo-document.util';

export interface TokenPayload {
  sub: string;
  email: string;
  role: string;
  roleType?: string;
  tenantId: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

interface UserEntity extends Document {
  id: string;
  email: string;
  username?: string;
  role: string;
  tenantId: string;
  passwordHash?: string;
  permissions?: Record<string, unknown>;
  [key: string]: unknown;
}

interface UserResourcePermissionEntity extends Document {
  userId: string;
  type: string;
  resource: string;
  field?: string;
}

@Injectable()
export class AuthService {
  private readonly accessTokenTtl: number;
  private readonly refreshTokenTtl: number;
  private readonly superadminDatabaseName: string;

  constructor(
    private readonly jwtService: JwtService,
    private readonly mongoDbService: MongoDbService,
    private readonly tenantCollectionService: TenantCollectionService,
    private readonly configService: ConfigService,
  ) {
    // Access token: 15 minutes; Refresh token: 7 days
    this.accessTokenTtl =
      this.configService.get<number>('JWT_ACCESS_TTL') ?? 900;
    this.refreshTokenTtl =
      this.configService.get<number>('JWT_REFRESH_TTL') ?? 604800;
    this.superadminDatabaseName =
      this.configService.get<string>('SUPERADMIN_DB_NAME')?.trim() ||
      'superadmin';
  }

  async getMe(userId: string, tenantIdHint?: string) {
    const scopedUser = await this.tenantCollectionService.findUserById(
      userId,
      tenantIdHint,
    );
    const resolvedTenantId = scopedUser?.tenantId;
    const user = scopedUser?.user ?? (await this.findLegacyUserById(userId));

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const resourcePermissions = resolvedTenantId
      ? await (
          await this.tenantUserResourcePermissionsCollection(resolvedTenantId)
        )
          .find({ userId })
          .toArray()
      : await this.legacyUserResourcePermissionsCollection()
          .find({ userId })
          .toArray();

    const profile = stripMongoId(user) as Record<string, unknown>;
    delete profile.passwordHash;

    if (resourcePermissions.length > 0) {
      const pages = resourcePermissions
        .filter((permission) => permission.type === 'PAGE')
        .map((permission) => permission.resource);

      const fields: Record<string, string[]> = {};
      resourcePermissions
        .filter((permission) => permission.type === 'FIELD')
        .forEach((permission) => {
          if (!fields[permission.resource]) {
            fields[permission.resource] = [];
          }

          if (permission.field) {
            fields[permission.resource].push(permission.field);
          }
        });

      profile.permissions = { pages, fields };
    }

    return profile;
  }

  /**
   * Login with email + password.
   * Looks up user from the DB, validates password, issues access + refresh tokens.
   */
  async login(email: string, password: string): Promise<AuthTokens> {
    const normalizedLogin = email.trim().toLowerCase();

    const scopedUser =
      await this.tenantCollectionService.findUserByLogin(normalizedLogin);
    const user =
      scopedUser?.user ?? (await this.findLegacyUserByLogin(normalizedLogin));

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isValid = await bcrypt.compare(password, user.passwordHash ?? '');
    if (!isValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    if (!user.email) {
      throw new UnauthorizedException('User account is missing an email.');
    }

    return this.issueTokens({
      sub: user.id,
      email: user.email,
      role: user.role,
      roleType: typeof user.roleType === 'string' ? user.roleType : undefined,
      tenantId: user.tenantId,
    });
  }

  /**
   * Refresh access token using a valid refresh token.
   * Validates the refresh token, verifies it belongs to the user, issues new pair.
   */
  async refresh(refreshToken: string): Promise<AuthTokens> {
    let payload: Partial<TokenPayload> & { sub: string };
    try {
      payload = await this.jwtService.verifyAsync<
        Partial<TokenPayload> & { sub: string }
      >(refreshToken, {
        secret:
          this.configService.get<string>('JWT_REFRESH_SECRET') ??
          this.configService.get<string>('JWT_SECRET') ??
          'change-me-in-production',
      });
    } catch {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }

    const scopedUser = await this.tenantCollectionService.findUserById(
      payload.sub,
      payload.tenantId,
    );
    const user =
      scopedUser?.user ?? (await this.findLegacyUserById(payload.sub));

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (!user.email) {
      throw new NotFoundException('User email is missing');
    }

    return this.issueTokens({
      sub: user.id,
      email: user.email,
      role: user.role,
      roleType: typeof user.roleType === 'string' ? user.roleType : undefined,
      tenantId: user.tenantId,
    });
  }

  /**
   * Internal: Build and sign access + refresh token pair.
   */
  private async issueTokens(payload: TokenPayload): Promise<AuthTokens> {
    const accessSecret =
      this.configService.get<string>('JWT_SECRET') ?? 'change-me-in-production';
    const refreshSecret =
      this.configService.get<string>('JWT_REFRESH_SECRET') ?? accessSecret;

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload, {
        secret: accessSecret,
        expiresIn: this.accessTokenTtl,
      }),
      this.jwtService.signAsync(
        { sub: payload.sub, tenantId: payload.tenantId },
        { secret: refreshSecret, expiresIn: this.refreshTokenTtl },
      ),
    ]);

    return { accessToken, refreshToken, expiresIn: this.accessTokenTtl };
  }

  private async findLegacyUserById(id: string) {
    const platformUser = await this.platformUsersCollection().findOne({ id });
    if (platformUser) {
      return platformUser;
    }

    return this.fallbackUsersCollection().findOne({ id });
  }

  private async findLegacyUserByLogin(login: string) {
    const query = {
      $or: [{ email: login }, { username: login }],
    };

    const platformUser = await this.platformUsersCollection().findOne(query);
    if (platformUser) {
      return platformUser;
    }

    return this.fallbackUsersCollection().findOne(query);
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

  private async tenantUserResourcePermissionsCollection(tenantId: string) {
    return this.tenantCollectionService.getCollection<UserResourcePermissionEntity>(
      tenantId,
      'userResourcePermissions',
    );
  }
}
