/**
 * Backward-compatible tenant service entrypoint.
 *
 * The implementation has been split into frontend microservice-style modules under:
 * services/microservices/tenant/*
 */

export * from './microservices/tenant';
export { tenantService } from './microservices/tenant';
export { default } from './microservices/tenant';
