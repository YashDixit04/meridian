/**
 * inspect-catalogue-docs.ts — Show doc counts per catalogue collection in each tenant DB
 */
import { MongoClient } from 'mongodb';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../.env') });
const url = process.env.MONGODB_URI;
if (!url) { process.exit(1); }

const SKIP = new Set(['admin', 'local', 'config', 'core_db', 'superadmin']);
const CATALOGUE_COLS = [
  'tenant_catalogues', 'catalogue_mappings', 'tenant_catalogue', 'catalogue_offereing',
];

async function run() {
  const client = new MongoClient(url as string);
  try {
    await client.connect();
    const { databases } = await client.db().admin().command({ listDatabases: 1 });
    for (const dbInfo of databases) {
      if (SKIP.has(dbInfo.name)) continue;
      const db = client.db(dbInfo.name);
      const colls = (await db.listCollections().toArray()).map((c: any) => c.name);
      console.log(`\n── ${dbInfo.name} ──`);
      for (const name of CATALOGUE_COLS) {
        // also check prefixed variants
        const matches = colls.filter(
          (c: string) => c === name || c.endsWith('_' + name),
        );
        for (const match of matches) {
          const count = await db.collection(match).countDocuments({});
          const sample = count > 0
            ? await db.collection(match).findOne({})
            : null;
          const typeField = sample ? `type=${JSON.stringify((sample as any).type ?? 'MISSING')}` : '';
          console.log(`  ${match}: ${count} docs  ${typeField}`);
          if (count > 0 && count <= 5) {
            const docs = await db.collection(match).find({}, { projection: { id: 1, type: 1, name: 1, catalogId: 1 } }).toArray();
            docs.forEach((d: any) => console.log(`    ↳`, JSON.stringify(d)));
          }
        }
      }
    }
  } finally {
    await client.close();
  }
}
run();
