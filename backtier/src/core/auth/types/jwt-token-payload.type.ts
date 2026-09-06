export interface JwtTokenPayload {
  sub: string;
  email?: string;
  role?: string;
  roleType?: string;
  role_type?: string;
  tenantId?: string;
  tenant_id?: string;
  [key: string]: unknown;
}
