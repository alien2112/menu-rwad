const { MongoClient } = require('mongodb');

// Try different connection strings
const connectionStrings = [
  'mongodb://localhost:27017/maraksh-restaurant',
  'mongodb://localhost:27017/marakshv2',
  'mongodb://localhost:27017/maraksh',
  'mongodb://localhost:27017/test'
];

async function findDatabase() {
  for (const uri of connectionStrings) {
    let client;
    try {
      console.log(`\n🔍 Trying connection: ${uri}`);
      client = new MongoClient(uri);
      await client.connect();
      
      const db = client.db();
      console.log(`✅ Connected to database: ${db.databaseName}`);
      
      // List all collections
      const collections = await db.listCollections().toArray();
      console.log(`📋 Collections: ${collections.map(c => c.name).join(', ')}`);
      
      // Check each collection for data
      for (const collection of collections) {
        const count = await db.collection(collection.name).countDocuments();
        console.log(`   ${collection.name}: ${count} documents`);
        
        if (count > 0 && (collection.name === 'categories' || collection.name === 'menuitems')) {
          const sample = await db.collection(collection.name).findOne({});
          console.log(`   Sample: ${JSON.stringify(sample, null, 2)}`);
        }
      }
      
      await client.close();
      
    } catch (error) {
      console.log(`❌ Failed: ${error.message}`);
      if (client) await client.close();
    }
  }
}

// Also check what databases exist
async function listAllDatabases() {
  let client;
  try {
    console.log('\n🗄️  Listing all databases on localhost:27017...');
    client = new MongoClient('mongodb://localhost:27017');
    await client.connect();
    
    const admin = client.db().admin();
    const databases = await admin.listDatabases();
    
    console.log('Available databases:');
    databases.databases.forEach(db => {
      console.log(`   - ${db.name} (${(db.sizeOnDisk / 1024 / 1024).toFixed(2)} MB)`);
    });
    
  } catch (error) {
    console.error('❌ Error listing databases:', error);
  } finally {
    if (client) await client.close();
  }
}

async function main() {
  await listAllDatabases();
  await findDatabase();
}

main().catch(console.error);

