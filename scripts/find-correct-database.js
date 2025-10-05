const { MongoClient } = require('mongodb');
require('dotenv').config();

async function findCorrectDatabase() {
  const client = new MongoClient(process.env.MONGODB_URI);
  try {
    await client.connect();
    
    console.log('🔍 Searching for databases with menu items...\n');
    
    // List all databases
    const adminDb = client.db().admin();
    const databases = await adminDb.listDatabases();
    
    console.log('📁 Available databases:');
    databases.databases.forEach(db => {
      console.log(`   - ${db.name} (${(db.sizeOnDisk / 1024 / 1024).toFixed(2)} MB)`);
    });
    
    console.log('\n🔍 Checking each database for menu items...\n');
    
    for (const dbInfo of databases.databases) {
      try {
        const db = client.db(dbInfo.name);
        const collections = await db.listCollections().toArray();
        
        console.log(`Database: ${dbInfo.name}`);
        console.log(`   Collections: ${collections.map(c => c.name).join(', ')}`);
        
        // Check for menu items
        if (collections.some(c => c.name === 'menuitems' || c.name === 'items')) {
          const menuCollection = collections.find(c => c.name === 'menuitems' || c.name === 'items');
          const count = await db.collection(menuCollection.name).countDocuments();
          console.log(`   📋 Menu items: ${count}`);
          
          if (count > 0) {
            const sample = await db.collection(menuCollection.name).findOne({});
            console.log(`   📸 Sample item: ${sample?.name || 'No name'} - Image: ${sample?.image || 'No image'}`);
          }
        }
        
        console.log('');
      } catch (error) {
        console.log(`   Error accessing ${dbInfo.name}: ${error.message}`);
      }
    }
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await client.close();
  }
}

findCorrectDatabase();



