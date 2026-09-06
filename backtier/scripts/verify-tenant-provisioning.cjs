const { MongoClient } = require('mongodb');
require('dotenv').config();

const baseUrl = process.env.TEST_BASE_URL || 'http://localhost:3001';

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

async function request(method, path, body, token) {
  const response = await fetch(`${baseUrl}${path}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  let payload;
  try {
    payload = await response.json();
  } catch {
    payload = null;
  }

  if (!response.ok) {
    const message = payload?.error || payload?.message || `${response.status} ${response.statusText}`;
    throw new Error(`${method} ${path} failed: ${message}`);
  }

  return payload?.data ?? payload;
}

async function listCollectionNames(db, prefix) {
  const collections = await db.listCollections({ name: { $regex: `^${prefix}_` } }).toArray();
  return collections.map((item) => item.name);
}

async function createTenantAndVerify({ token, db, rand, mode }) {
  const isSmcOnly = mode === 'smc-only';
  const name = `${isSmcOnly ? 'SMCOnly' : 'VendorEnabled'} QA ${rand}`;
  const domain = `${isSmcOnly ? 'smc' : 'vendor'}-${rand}.example.com`;
  const userTypeSelection = isSmcOnly ? 'SMC Users only' : 'Both SMC and Vendor Users';

  const payload = {
    name,
    domain,
    status: 'Active',
    userTypeSelection,
    totalVendorUsersCount: isSmcOnly ? 0 : 4,
    requisitionManagement: true,
    catalogueServices: true,
    subUsersCreation: true,
    vesselsAdditions: true,
    catalogueManagement: false,
    mealsCreation: false,
    victuallingManagementServices: true,
    activeLogsMapping: true,
    ordersManagement: true,
    invoiceManagement: false,
    maxUserCreations: 123,
    maxSubUsers: 77,
    maxStorageGB: 256,
    apiRequestsTier: 'Standard',
  };

  const created = await request('POST', '/tenants', payload, token);
  assert(created?.id, 'Tenant creation did not return id.');
  assert(created?.collectionPrefix, 'Tenant creation did not return collectionPrefix.');

  const details = await request('GET', `/tenants/${created.id}/details`, undefined, token);
  const features = details?.planFeatures || {};

  assert(features.requisitionManagement === true, 'requisitionManagement was not persisted.');
  assert(features.catalogueServices === true, 'catalogueServices was not persisted.');
  assert(features.subUsersCreation === true, 'subUsersCreation was not persisted.');
  assert(features.vesselsAdditions === true, 'vesselsAdditions was not persisted.');
  assert(features.catalogueManagement === false, 'catalogueManagement was not persisted.');
  assert(features.mealsCreation === false, 'mealsCreation was not persisted.');
  assert(features.victuallingManagementServices === true, 'victuallingManagementServices was not persisted.');
  assert(features.activeLogsMapping === true, 'activeLogsMapping was not persisted.');
  assert(features.ordersManagement === true, 'ordersManagement was not persisted.');
  assert(features.invoiceManagement === false, 'invoiceManagement was not persisted.');

  const collectionNames = await listCollectionNames(db, created.collectionPrefix);
  const hasSubUsersCollection = collectionNames.includes(`${created.collectionPrefix}_sub_users`);
  const hasVendorsCollection = collectionNames.includes(`${created.collectionPrefix}_vendors`);

  assert(hasSubUsersCollection === false, `Unexpected sub_users collection created for tenant ${created.id}.`);

  if (isSmcOnly) {
    assert(hasVendorsCollection === false, `Unexpected vendors collection created for SMC-only tenant ${created.id}.`);
  } else {
    assert(hasVendorsCollection === true, `Expected vendors collection was not created for vendor-enabled tenant ${created.id}.`);
  }

  return {
    tenantId: created.id,
    collectionPrefix: created.collectionPrefix,
    hasSubUsersCollection,
    hasVendorsCollection,
    userTypeSelection,
  };
}

async function main() {
  const mongoUri = process.env.MONGODB_URI;
  const mongoDbName = process.env.MONGODB_DB_NAME || 'b2b2';

  assert(mongoUri, 'MONGODB_URI is missing.');

  const login = await request('POST', '/auth/login', {
    email: 'superadmin@gmail.com',
    password: '123456',
  });

  const token = login?.accessToken;
  assert(token, 'Login succeeded but accessToken is missing.');

  const mongoClient = new MongoClient(mongoUri);
  const createdTenantIds = [];

  try {
    await mongoClient.connect();
    const db = mongoClient.db(mongoDbName);

    const randA = `${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    const randB = `${Date.now()}-${Math.floor(Math.random() * 1000)}`;

    const smcResult = await createTenantAndVerify({ token, db, rand: randA, mode: 'smc-only' });
    createdTenantIds.push(smcResult.tenantId);

    const vendorResult = await createTenantAndVerify({ token, db, rand: randB, mode: 'vendor-enabled' });
    createdTenantIds.push(vendorResult.tenantId);

    console.log(JSON.stringify({
      status: 'PASS',
      smcOnlyTenant: smcResult,
      vendorEnabledTenant: vendorResult,
    }, null, 2));
  } finally {
    for (const tenantId of createdTenantIds) {
      try {
        await request('DELETE', `/tenants/${tenantId}`, undefined, token);
      } catch (error) {
        console.error(`Cleanup failed for tenant ${tenantId}:`, error.message || error);
      }
    }

    await mongoClient.close();
  }
}

main().catch((error) => {
  console.error('Tenant provisioning verification failed.');
  console.error(error.message || error);
  process.exit(1);
});
