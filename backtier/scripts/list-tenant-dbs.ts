/**
 * list-tenant-dbs.ts — Debug helper to list all MongoDB databases and their collections.
 */
import { MongoClient } from 'mongodb';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../.env') });

const url = process.env.MONGODB_URI;
if (!url) { console.error('MONGODB_URI not set'); process.exit(1); }

async function run() {
  const client = new MongoClient(url as string);
  try {
    await client.connect();
    const { databases } = await client.db().admin().command({ listDatabases: 1 });
    console.log('\nAll databases:');
    for (const dbInfo of databases) {
      const colls = await client.db(dbInfo.name).listCollections().toArray();
      const names = colls.map((c: any) => c.name).join(', ');
      console.log(`  ${dbInfo.name}: [${names}]`);
    }
  } finally {
    await client.close();
  }
}
run();
