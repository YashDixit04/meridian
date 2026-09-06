/**
 * migrate-tenant-catalogues-unified.ts
 *
 * One-time migration to unify the tenant_catalogues collection.
 *
 * What this does per tenant database (any DB containing tenant_catalogues or catalogue_mappings):
 *
 *  1. STAMP CATALOG-METADATA DOCUMENTS
 *     Existing docs in tenant_catalogues that do NOT have a `type` field (legacy
 *     catalog container rows) get stamped with `type: 'catalog'`.
 *
 *  2. MIGRATE PRODUCT DOCUMENTS FROM catalogue_mappings
 *     Docs in catalogue_mappings are copied into tenant_catalogues with
 *     `type: 'product'` (skipping any whose `id` already exists in
 *     tenant_catalogues to prevent duplicates).
 *
 * Run once after deploying the unified schema change.
 *   npx ts-node -r tsconfig-paths/register scripts/migrate-tenant-catalogues-unified.ts
 */

import { MongoClient } from 'mongodb';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../.env') });

const url = process.env.MONGODB_URI;

if (!url) {
  console.error('MONGODB_URI environment variable is not set');
  process.exit(1);
}

// System databases to always skip
const SYSTEM_DBS = new Set(['admin', 'local', 'config', 'core_db', 'superadmin']);

async function migrate() {
  const client = new MongoClient(url as string);

  try {
    await client.connect();
    console.log('[migration] Connected to MongoDB');

    const adminDb = client.db().admin();
    const { databases } = await adminDb.command({ listDatabases: 1 });

    let totalCatalogStamped = 0;
    let totalProductsMigrated = 0;
    let totalProductsSkipped = 0;
    let tenantsProcessed = 0;

    for (const dbInfo of databases) {
      if (SYSTEM_DBS.has(dbInfo.name)) {
        continue;
      }

      const db = client.db(dbInfo.name);
      const collectionNames = (await db.listCollections().toArray()).map((c) => c.name);

      // Find any variant of tenant_catalogues (bare name or prefixed like msc_tenant_catalogues)
      const tenantCataloguesName = collectionNames.find(
        (name) => name === 'tenant_catalogues' || name.endsWith('_tenant_catalogues'),
      );

      // Find any variant of catalogue_mappings
      const catalogueMappingsName = collectionNames.find(
        (name) => name === 'catalogue_mappings' || name.endsWith('_catalogue_mappings'),
      );

      // Only process DBs that have at least one of these collections
      if (!tenantCataloguesName && !catalogueMappingsName) {
        console.log(`[migration] ${dbInfo.name}: no catalogue collections found, skipping.`);
        continue;
      }

      tenantsProcessed++;
      console.log(`\n[migration] Processing database: ${dbInfo.name}`);

      if (tenantCataloguesName) {
        const tenantCatalogues = db.collection(tenantCataloguesName);

        // ── Step 1: Stamp existing catalog-metadata docs (no type field) ──
        const stampResult = await tenantCatalogues.updateMany(
          { type: { $exists: false } },
          { $set: { type: 'catalog' } },
        );
        totalCatalogStamped += stampResult.modifiedCount;
        console.log(
          `  ✔ Stamped ${stampResult.modifiedCount} catalog-metadata docs with type='catalog' in ${tenantCataloguesName}`,
        );

        // ── Step 2: Migrate catalogue_mappings → tenant_catalogues with type='product' ──
        if (catalogueMappingsName) {
          const catalogueMappings = db.collection(catalogueMappingsName);
          const mappingDocs = await catalogueMappings.find({}).toArray();

          if (mappingDocs.length === 0) {
            console.log(`  ℹ ${catalogueMappingsName} is empty, nothing to migrate.`);
          } else {
            // Collect existing product IDs in tenant_catalogues to avoid duplicates
            const existingProductIds = new Set<string>(
              (
                await tenantCatalogues
                  .find({ type: 'product' }, { projection: { id: 1 } })
                  .toArray()
              ).map((doc) => doc.id as string),
            );

            let migratedCount = 0;
            let skippedCount = 0;

            for (const doc of mappingDocs) {
              const docId = doc.id as string | undefined;

              if (docId && existingProductIds.has(docId)) {
                skippedCount++;
                continue;
              }

              // Remove MongoDB _id so insertOne generates a new ObjectId
              const { _id, ...rest } = doc;
              await tenantCatalogues.insertOne({ ...rest, type: 'product' });
              migratedCount++;
            }

            totalProductsMigrated += migratedCount;
            totalProductsSkipped += skippedCount;
            console.log(
              `  ✔ Migrated ${migratedCount} products from ${catalogueMappingsName} (skipped ${skippedCount} duplicates)`,
            );
          }
        } else {
          console.log(`  ℹ No catalogue_mappings collection found in ${dbInfo.name}.`);
        }
      } else if (catalogueMappingsName) {
        // tenant_catalogues doesn't exist yet but catalogue_mappings does — create and populate
        console.log(
          `  ℹ ${dbInfo.name}: tenant_catalogues not found but catalogue_mappings exists. Creating tenant_catalogues and migrating.`,
        );
        const tenantCatalogues = db.collection('tenant_catalogues');
        const catalogueMappings = db.collection(catalogueMappingsName);
        const mappingDocs = await catalogueMappings.find({}).toArray();
        let migratedCount = 0;

        for (const doc of mappingDocs) {
          const { _id, ...rest } = doc;
          await tenantCatalogues.insertOne({ ...rest, type: 'product' });
          migratedCount++;
        }

        totalProductsMigrated += migratedCount;
        console.log(`  ✔ Created tenant_catalogues and migrated ${migratedCount} products.`);
      }
    }

    console.log('\n[migration] ─── Summary ───────────────────────────────');
    console.log(`  Tenant databases processed : ${tenantsProcessed}`);
    console.log(`  Catalog docs stamped       : ${totalCatalogStamped} (type='catalog')`);
    console.log(`  Product docs migrated      : ${totalProductsMigrated} (type='product')`);
    console.log(`  Product docs skipped       : ${totalProductsSkipped} (already existed)`);
    console.log('[migration] ────────────────────────────────────────────\n');
    console.log('[migration] Done. tenant_catalogues is now the unified collection.');
  } catch (error) {
    console.error('[migration] Error:', error);
    process.exit(1);
  } finally {
    await client.close();
    console.log('[migration] Disconnected from MongoDB');
  }
}

migrate();
