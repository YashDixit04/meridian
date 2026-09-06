import { MongoClient } from 'mongodb';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../.env') });

const url = process.env.MONGODB_URI;

if (!url) {
  console.error('MONGODB_URI environment variable is not set');
  process.exit(1);
}

async function dropTenantCatalogueCollections() {
  const client = new MongoClient(url as string);

  try {
    await client.connect();
    console.log('Connected to MongoDB');

    const adminDb = client.db().admin();
    const result = await adminDb.command({ listDatabases: 1 });
    const databases = result.databases;

    for (const dbInfo of databases) {
      if (dbInfo.name.startsWith('tenant_')) {
        const db = client.db(dbInfo.name);
        const collections = await db.listCollections().toArray();

        // Looking for collections ending with 'tenant_catalogue' or 'catalogueOffereing'
        // Let's drop any collection that has `tenant_catalogue` (but NOT `tenant_catalogues`) or `catalogueOffereing` in its name.
        for (const coll of collections) {
          const isLegacyTenantCatalogue = coll.name.includes('tenant_catalogue') && !coll.name.includes('tenant_catalogues');
          const isLegacyOffering = coll.name.includes('catalogueOffereing');

          if (isLegacyTenantCatalogue || isLegacyOffering) {
            console.log(`Dropping legacy collection ${coll.name} from database ${dbInfo.name}`);
            try {
              await db.collection(coll.name).drop();
              console.log(`Successfully dropped ${coll.name} in ${dbInfo.name}`);
            } catch (dropErr: any) {
              console.error(`Failed to drop ${coll.name} in ${dbInfo.name}: ${dropErr.message}`);
            }
          }
        }
      }
    }

    console.log('Finished dropping legacy catalogueOffereing and tenant_catalogue collections.');
  } catch (error) {
    console.error('Error dropping collections:', error);
  } finally {
    await client.close();
    console.log('Disconnected from MongoDB');
  }
}

dropTenantCatalogueCollections();
