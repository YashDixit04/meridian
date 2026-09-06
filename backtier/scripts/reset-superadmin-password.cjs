const { MongoClient } = require('mongodb');
const bcrypt = require('bcrypt');
const uri = "mongodb://aksyashdixit_db_user:Yash%401234@ac-jsrirxa-shard-00-00.worru9u.mongodb.net:27017,ac-jsrirxa-shard-00-01.worru9u.mongodb.net:27017,ac-jsrirxa-shard-00-02.worru9u.mongodb.net:27017/?ssl=true&replicaSet=atlas-qw44or-shard-0&authSource=admin&appName=B2B2";

async function main() {
  const client = new MongoClient(uri);
  try {
    await client.connect();
    const superadminDb = client.db('superadmin');
    
    const newHash = await bcrypt.hash('123456', 10);
    
    const result = await superadminDb.collection('superadmin_users').updateOne(
        { email: 'superadmin@gmail.com' },
        { $set: { passwordHash: newHash } }
    );
    console.log(`Updated password for superadmin@gmail.com. Modified count: ${result.modifiedCount}`);

    const resultAdmin = await superadminDb.collection('superadmin_users').updateOne(
        { email: 'admin@company.com' },
        { $set: { passwordHash: newHash } }
    );
    console.log(`Updated password for admin@company.com. Modified count: ${resultAdmin.modifiedCount}`);
  } finally {
    await client.close();
  }
}
main().catch(console.error);
