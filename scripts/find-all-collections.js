const { MongoClient } = require('mongodb');
require('dotenv').config();

async function findAllBuckets() {
  const client = new MongoClient(process.env.MONGODB_URI);
  try {
    await client.connect();
    const db = client.db(process.env.DB_NAME || 'maraksh');
    
    console.log('🔍 Searching ALL collections for images...\n');
    
    // List ALL collections
    const collections = await db.listCollections().toArray();
    console.log('📁 All collections in database:');
    collections.forEach(col => {
      console.log(`   - ${col.name}`);
    });
    
    console.log('\n🔍 Checking each collection for image data...\n');
    
    for (const col of collections) {
      try {
        const collection = db.collection(col.name);
        const count = await collection.countDocuments();
        console.log(`${col.name}: ${count} documents`);
        
        // Check if collection has image-related fields
        if (count > 0) {
          const sample = await collection.findOne({});
          const fields = Object.keys(sample || {});
          const imageFields = fields.filter(field => 
            field.toLowerCase().includes('image') || 
            field.toLowerCase().includes('photo') ||
            field.toLowerCase().includes('picture') ||
            field.toLowerCase().includes('url')
          );
          
          if (imageFields.length > 0) {
            console.log(`   📸 Image fields: ${imageFields.join(', ')}`);
          }
        }
      } catch (error) {
        console.log(`   Error reading ${col.name}`);
      }
    }
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await client.close();
  }
}

findAllBuckets();
