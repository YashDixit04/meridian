const { MongoClient } = require('mongodb');
const bcrypt = require('bcrypt');
const uri = "mongodb://aksyashdixit_db_user:Yash%401234@ac-jsrirxa-shard-00-00.worru9u.mongodb.net:27017,ac-jsrirxa-shard-00-01.worru9u.mongodb.net:27017,ac-jsrirxa-shard-00-02.worru9u.mongodb.net:27017/?ssl=true&replicaSet=atlas-qw44or-shard-0&authSource=admin&appName=B2B2";

async function main() {
  const client = new MongoClient(uri);
  try {
    await client.connect();
    
    const superadminDb = client.db('superadmin');
    const saUser = await superadminDb.collection('superadmin_users').findOne({ email: 'superadmin@gmail.com' });
    if (!saUser) {
        console.log("Superadmin user not found");
        return;
    }
    console.log(`Found superadmin user with hash: ${saUser.passwordHash}`);
    const isValid = await bcrypt.compare('123456', saUser.passwordHash || '');
    console.log(`Is '123456' valid for superadmin@gmail.com? ${isValid}`);
    
    const adminUser = await superadminDb.collection('superadmin_users').findOne({ email: 'admin@company.com' });
    if (adminUser) {
        const isAdminValid = await bcrypt.compare('123456', adminUser.passwordHash || '');
        console.log(`Is '123456' valid for admin@company.com? ${isAdminValid}`);
    }
  } finally {
    await client.close();
  }
}
main().catch(console.error);
