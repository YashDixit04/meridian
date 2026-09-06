require('dotenv').config();
const { MongoClient } = require('mongodb');

const tenantId = process.argv[2];

if (!tenantId) {
  console.error('Usage: node scripts/verify-tenant-collections.cjs <tenantId>');
  process.exit(1);
}

const mongoUri = process.env.MONGODB_URI;
const dbName = process.env.MONGODB_DB_NAME;

if (!mongoUri || !dbName) {
  console.error('MONGODB_URI or MONGODB_DB_NAME is missing in environment.');
  process.exit(1);
}

const escapeForRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

(async () => {
  const client = new MongoClient(mongoUri);

  try {
    await client.connect();
    const db = client.db(dbName);

    const tenant = await db.collection('tenants').findOne({ id: tenantId });
    if (!tenant) {
      throw new Error(`Tenant ${tenantId} not found in collection tenants.`);
    }

    const collectionPrefix = tenant.collectionPrefix;
    if (!collectionPrefix) {
      throw new Error(`Tenant ${tenantId} does not have collectionPrefix.`);
    }

    const escapedPrefix = escapeForRegex(collectionPrefix);
    const collections = await db
      .listCollections({ name: new RegExp(`^${escapedPrefix}_`) }, { nameOnly: true })
      .toArray();

    console.log(JSON.stringify({
      tenantId,
      collectionPrefix,
      collectionCount: collections.length,
      collections: collections.map((entry) => entry.name).sort(),
    }, null, 2));
  } finally {
    await client.close();
  }
})().catch((error) => {
  console.error(error.message || error);
  process.exit(1);
});
