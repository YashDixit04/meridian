const { MongoClient } = require('mongodb');
const uri = "mongodb://aksyashdixit_db_user:Yash%401234@ac-jsrirxa-shard-00-00.worru9u.mongodb.net:27017,ac-jsrirxa-shard-00-01.worru9u.mongodb.net:27017,ac-jsrirxa-shard-00-02.worru9u.mongodb.net:27017/?ssl=true&replicaSet=atlas-qw44or-shard-0&authSource=admin&appName=B2B2";

async function main() {
  const client = new MongoClient(uri);
  try {
    await client.connect();
    
    console.log("Checking b2b2 database (users collection):");
    const b2b2Db = client.db('b2b2');
    const b2b2Users = await b2b2Db.collection('users').find({}).toArray();
    b2b2Users.forEach(u => console.log(`- ${u.email} (roleType: ${u.roleType})`));

    console.log("\nChecking superadmin database (superadmin_users collection):");
    const superadminDb = client.db('superadmin');
    const saUsers = await superadminDb.collection('superadmin_users').find({}).toArray();
    saUsers.forEach(u => console.log(`- ${u.email} (roleType: ${u.roleType})`));

  } finally {
    await client.close();
  }
}
main().catch(console.error);
