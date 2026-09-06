/**
 * inspect-tenants-in-coredb.ts — Show all tenant records in core_db
 */
import { MongoClient } from 'mongodb';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../.env') });
const url = process.env.MONGODB_URI;
if (!url) { process.exit(1); }

async function run() {
  const client = new MongoClient(url as string);
  try {
    await client.connect();
    const tenants = await client.db('core_db').collection('tenants').find(
      {},
      { projection: { id: 1, name: 1, collectionPrefix: 1, databaseName: 1 } }
    ).toArray();

    console.log('\nTenants in core_db:');
    for (const t of tenants) {
      console.log(JSON.stringify(t, null, 2));
    }
  } finally {
    await client.close();
  }
}
run();
