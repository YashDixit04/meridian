import { MongoClient } from 'mongodb';
import * as dotenv from 'dotenv';
import * as path from 'path';
dotenv.config({ path: path.resolve(__dirname, '../.env') });
const url = process.env.MONGODB_URI!;
(async () => {
  const c = new MongoClient(url);
  await c.connect();
  
  for (const dbName of ['MultiUser', 'SMCTenant', 'vendortenant']) {
    const db = c.db(dbName);
    const total = await db.collection('tenant_catalogues').countDocuments({});
    const catalogs = await db.collection('tenant_catalogues').countDocuments({ type: 'catalog' });
    const products = await db.collection('tenant_catalogues').countDocuments({ type: 'product' });
    const noType  = await db.collection('tenant_catalogues').countDocuments({ type: { $exists: false } });
    console.log(`\n── ${dbName}/tenant_catalogues ──`);
    console.log(`  total=${total}  type=catalog:${catalogs}  type=product:${products}  no-type:${noType}`);
    
    // Sample a product doc with all fields
    const sampleProduct = await db.collection('tenant_catalogues').findOne({ type: 'product' });
    if (sampleProduct) {
      const { _id, ...rest } = sampleProduct as any;
      console.log('  Sample product:', JSON.stringify(rest, null, 4));
    }
    
    // Sample a catalog doc
    const sampleCatalog = await db.collection('tenant_catalogues').findOne({ type: 'catalog' });
    if (sampleCatalog) {
      const { _id, ...rest } = sampleCatalog as any;
      console.log('  Sample catalog:', JSON.stringify(rest, null, 4));
    }
  }
  
  await c.close();
})();
