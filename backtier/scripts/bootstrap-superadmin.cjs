#!/usr/bin/env node

/**
 * Idempotent bootstrap for an immutable global superadmin account,
 * plus migration of superadmin collections into a dedicated DB.
 *
 * Required env vars:
 * - MONGODB_URI
 * - MONGODB_DB_NAME
 * - SUPERADMIN_EMAIL
 * - SUPERADMIN_PASSWORD
 *
 * Optional env vars:
 * - SUPERADMIN_FIRST_NAME (default: Global)
 * - SUPERADMIN_LAST_NAME (default: Superadmin)
 * - SUPERADMIN_USERNAME (default: derived from email)
 * - SUPERADMIN_USER_ID (default: constant UUID)
 * - SUPERADMIN_TENANT_ID (default: constant UUID)
 * - SUPERADMIN_DB_NAME (default: superadmin)
 */

const { MongoClient } = require('mongodb');
const bcrypt = require('bcrypt');

const REQUIRED_ENV_VARS = [
  'MONGODB_URI',
  'MONGODB_DB_NAME',
  'SUPERADMIN_EMAIL',
  'SUPERADMIN_PASSWORD',
];

const DEFAULT_SUPERADMIN_USER_ID = '11111111-1111-1111-1111-111111111111';
const DEFAULT_SUPERADMIN_TENANT_ID = '00000000-0000-0000-0000-000000000000';
const DEFAULT_SUPERADMIN_DB_NAME = 'superadmin';

const ACCESS_PAGES = [
  'dashboard',
  'users',
  'platformUsers',
  'offers',
  'superadminCatalogue',
  'help',
  'userDetails',
  'tenantDetails',
  'tenantSubUsers',
  'tenantVendors',
  'tenantVessels',
  'tenantOrders',
  'tenantCatalogue',
  'tenantDocuments',
  'tenantActivityLogs',
  'addAccount',
  'addTenant',
  'addSubUser',
  'addVessel',
  'addVendor',
  'addProduct',
  'cart',
];

function validateEnv() {
  const missing = REQUIRED_ENV_VARS.filter((key) => !process.env[key] || !process.env[key].trim());
  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
  }
}

function getSuperadminDbName() {
  return (process.env.SUPERADMIN_DB_NAME || DEFAULT_SUPERADMIN_DB_NAME).trim();
}

async function ensureIndexes(superadminDb) {
  const superadminUsers = superadminDb.collection('superadmin_users');
  const superadminCatalogue = superadminDb.collection('superadmin_catalogue');
  const userResourcePermissions =
    superadminDb.collection('userResourcePermissions');

  await Promise.all([
    superadminUsers.createIndex({ id: 1 }, { unique: true, name: 'superadmin_users_id_unique' }),
    superadminUsers.createIndex({ email: 1 }, { unique: true, name: 'superadmin_users_email_unique' }),
    superadminUsers.createIndex({ username: 1 }, { unique: true, sparse: true, name: 'superadmin_users_username_unique' }),
    superadminUsers.createIndex({ roleType: 1 }, { name: 'superadmin_users_role_type_idx' }),
    userResourcePermissions.createIndex({ id: 1 }, { unique: true, name: 'user_resource_permissions_id_unique' }),
    userResourcePermissions.createIndex({ userId: 1, type: 1 }, { name: 'user_resource_permissions_user_type_idx' }),
    superadminCatalogue.createIndex({ id: 1 }, { unique: true, name: 'superadmin_catalogue_id_unique' }),
  ]);
}

function buildPermissionsDoc(userId) {
  const now = new Date();
  return ACCESS_PAGES.map((resource) => ({
    id: `${userId}:page:${resource}`,
    userId,
    type: 'PAGE',
    resource,
    createdAt: now,
    updatedAt: now,
  }));
}

async function upsertSuperadmin(superadminDb) {
  const email = process.env.SUPERADMIN_EMAIL.trim().toLowerCase();
  const password = process.env.SUPERADMIN_PASSWORD;
  const firstName = (process.env.SUPERADMIN_FIRST_NAME || 'Global').trim();
  const lastName = (process.env.SUPERADMIN_LAST_NAME || 'Superadmin').trim();
  const username = (process.env.SUPERADMIN_USERNAME || email.split('@')[0]).trim().toLowerCase();
  const userId = (process.env.SUPERADMIN_USER_ID || DEFAULT_SUPERADMIN_USER_ID).trim();
  const tenantId = (process.env.SUPERADMIN_TENANT_ID || DEFAULT_SUPERADMIN_TENANT_ID).trim();
  const now = new Date();
  const passwordHash = await bcrypt.hash(password, 10);

  const superadminUsers = superadminDb.collection('superadmin_users');
  const userResourcePermissions =
    superadminDb.collection('userResourcePermissions');

  await superadminUsers.updateOne(
    {
      $or: [{ id: userId }, { email }],
    },
    {
      $set: {
        email,
        username,
        firstName,
        lastName,
        role: 'ADMIN',
        roleType: 'superadmin',
        tenantId,
        passwordHash,
        permissions: {
          pages: ACCESS_PAGES,
          fields: {},
        },
        updatedAt: now,
      },
      $setOnInsert: {
        id: userId,
        createdAt: now,
      },
    },
    { upsert: true },
  );

  const persistedSuperadmin = await superadminUsers.findOne(
    { email },
    { projection: { _id: 0, id: 1 } },
  );
  const effectiveUserId = persistedSuperadmin && persistedSuperadmin.id
    ? String(persistedSuperadmin.id)
    : userId;

  await userResourcePermissions.deleteMany({ userId: effectiveUserId });
  const permissionRows = buildPermissionsDoc(effectiveUserId);
  if (permissionRows.length > 0) {
    await userResourcePermissions.insertMany(permissionRows, { ordered: true });
  }

  return { userId: effectiveUserId, email, tenantId };
}

async function collectionExists(db, collectionName) {
  return db.listCollections({ name: collectionName }, { nameOnly: true }).hasNext();
}

async function migrateCollection(sourceDb, targetDb, sourceName, targetName) {
  const exists = await collectionExists(sourceDb, sourceName);
  if (!exists) {
    return { sourceName, targetName, migrated: 0, removedFromSource: 0 };
  }

  const sourceCollection = sourceDb.collection(sourceName);
  const targetCollection = targetDb.collection(targetName);
  const sourceDocs = await sourceCollection.find({}).toArray();

  if (sourceDocs.length === 0) {
    return { sourceName, targetName, migrated: 0, removedFromSource: 0 };
  }

  const operations = sourceDocs.map((doc) => {
    const hasId = Object.prototype.hasOwnProperty.call(doc, 'id');
    const filter = hasId ? { id: doc.id } : { _id: doc._id };
    return {
      replaceOne: {
        filter,
        replacement: doc,
        upsert: true,
      },
    };
  });

  await targetCollection.bulkWrite(operations, { ordered: false });
  const removalResult = await sourceCollection.deleteMany({});

  return {
    sourceName,
    targetName,
    migrated: sourceDocs.length,
    removedFromSource: removalResult.deletedCount || 0,
  };
}

async function migrateSuperadminCollections(baseDb, superadminDb) {
  const tasks = [
    ['superadmin_users', 'superadmin_users'],
    ['superadmin_catalogue', 'superadmin_catalogue'],
    ['superadmin_catalogues', 'superadmin_catalogue'],
    ['userResourcePermissions', 'userResourcePermissions'],
  ];

  const results = [];
  for (const [sourceName, targetName] of tasks) {
    const outcome = await migrateCollection(
      baseDb,
      superadminDb,
      sourceName,
      targetName,
    );
    results.push(outcome);
  }

  return results;
}

async function main() {
  validateEnv();

  const client = new MongoClient(process.env.MONGODB_URI);
  try {
    await client.connect();
    const baseDb = client.db(process.env.MONGODB_DB_NAME);
    const superadminDbName = getSuperadminDbName();
    const superadminDb = client.db(superadminDbName);

    const migrationResults = await migrateSuperadminCollections(
      baseDb,
      superadminDb,
    );
    await ensureIndexes(superadminDb);
    const result = await upsertSuperadmin(superadminDb);

    process.stdout.write(
      `Superadmin bootstrap complete. db=${superadminDbName}, userId=${result.userId}, email=${result.email}, tenantId=${result.tenantId}\n`,
    );
    process.stdout.write(
      `Migration details: ${JSON.stringify(migrationResults)}\n`,
    );
  } finally {
    await client.close();
  }
}

main().catch((error) => {
  process.stderr.write(`Bootstrap failed: ${error.message}\n`);
  process.exit(1);
});
