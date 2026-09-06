require('dotenv').config();
const { MongoClient } = require('mongodb');

const mongoUri = process.env.MONGODB_URI;
const dbName = process.env.MONGODB_DB_NAME;
const isApplyMode = process.argv.includes('--apply');

if (!mongoUri || !dbName) {
  console.error('MONGODB_URI or MONGODB_DB_NAME is missing in environment.');
  process.exit(1);
}

const hasCollection = async (db, collectionName) => {
  const hits = await db.listCollections({ name: collectionName }, { nameOnly: true }).toArray();
  return hits.length > 0;
};

(async () => {
  const client = new MongoClient(mongoUri);
  await client.connect();

  try {
    const db = client.db(dbName);
    const tenants = await db
      .collection('tenants')
      .find({}, { projection: { id: 1, name: 1, collectionPrefix: 1 } })
      .toArray();

    const operations = [];

    for (const tenant of tenants) {
      if (!tenant.collectionPrefix || typeof tenant.collectionPrefix !== 'string') {
        operations.push({
          tenantId: tenant.id,
          tenantName: tenant.name || '',
          action: 'skip_missing_prefix',
        });
        continue;
      }

      const prefix = tenant.collectionPrefix;
      const renamePairs = [
        {
          from: `${prefix}_catalogs`,
          to: `${prefix}_tenant_catalogues`,
        },
        {
          from: `${prefix}_offerings`,
          to: `${prefix}_catalogue_offereing`,
        },
      ];

      for (const pair of renamePairs) {
        const [oldExists, newExists] = await Promise.all([
          hasCollection(db, pair.from),
          hasCollection(db, pair.to),
        ]);

        if (!oldExists && !newExists) {
          operations.push({
            tenantId: tenant.id,
            tenantName: tenant.name || '',
            from: pair.from,
            to: pair.to,
            action: 'skip_missing_both',
          });
          continue;
        }

        if (!oldExists && newExists) {
          operations.push({
            tenantId: tenant.id,
            tenantName: tenant.name || '',
            from: pair.from,
            to: pair.to,
            action: 'already_renamed',
          });
          continue;
        }

        if (oldExists && newExists) {
          operations.push({
            tenantId: tenant.id,
            tenantName: tenant.name || '',
            from: pair.from,
            to: pair.to,
            action: 'skip_target_exists',
          });
          continue;
        }

        if (isApplyMode) {
          await db.collection(pair.from).rename(pair.to, { dropTarget: false });
          operations.push({
            tenantId: tenant.id,
            tenantName: tenant.name || '',
            from: pair.from,
            to: pair.to,
            action: 'renamed',
          });
        } else {
          operations.push({
            tenantId: tenant.id,
            tenantName: tenant.name || '',
            from: pair.from,
            to: pair.to,
            action: 'planned_rename',
          });
        }
      }
    }

    const summary = {
      mode: isApplyMode ? 'apply' : 'dry-run',
      totals: {
        renamed: operations.filter((item) => item.action === 'renamed').length,
        planned: operations.filter((item) => item.action === 'planned_rename').length,
        alreadyRenamed: operations.filter((item) => item.action === 'already_renamed').length,
        skipTargetExists: operations.filter((item) => item.action === 'skip_target_exists').length,
        skipMissingBoth: operations.filter((item) => item.action === 'skip_missing_both').length,
        skipMissingPrefix: operations.filter((item) => item.action === 'skip_missing_prefix').length,
      },
      operations,
    };

    console.log(JSON.stringify(summary, null, 2));
  } finally {
    await client.close();
  }
})().catch((error) => {
  console.error(error.message || error);
  process.exit(1);
});
