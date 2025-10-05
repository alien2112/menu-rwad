const { MongoClient } = require('mongodb');
require('dotenv').config();

async function findAllImages() {
  const client = new MongoClient(process.env.MONGODB_URI);
  try {
    await client.connect();
    const db = client.db(process.env.DB_NAME || 'maraksh');
    
    console.log('🔍 Searching for all GridFS buckets...\n');
    
    // List all collections to find GridFS buckets
    const collections = await db.listCollections().toArray();
    const gridfsBuckets = collections.filter(col => 
      col.name.includes('.files') || col.name.includes('.chunks')
    );
    
    console.log('📁 Found GridFS buckets:');
    const bucketNames = new Set();
    gridfsBuckets.forEach(col => {
      const bucketName = col.name.replace(/\.(files|chunks)$/, '');
      bucketNames.add(bucketName);
    });
    
    bucketNames.forEach(bucketName => {
      console.log(`   - ${bucketName}`);
    });
    
    console.log('\n📊 Image counts per bucket:');
    
    for (const bucketName of bucketNames) {
      try {
        const filesCollection = db.collection(`${bucketName}.files`);
        const count = await filesCollection.countDocuments();
        console.log(`   ${bucketName}: ${count} files`);
        
        if (count > 0) {
          // Show sample files
          const sampleFiles = await filesCollection.find({}).limit(3).toArray();
          console.log(`     Sample files:`);
          sampleFiles.forEach(file => {
            console.log(`       - ${file.filename} (${file.contentType})`);
          });
        }
      } catch (error) {
        console.log(`   ${bucketName}: Error reading bucket`);
      }
    }
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await client.close();
  }
}

findAllImages();
