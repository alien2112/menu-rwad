const { MongoClient, GridFSBucket } = require('mongodb');
require('dotenv').config();

async function checkImageUsage() {
  const client = new MongoClient(process.env.MONGODB_URI);
  try {
    await client.connect();
    const db = client.db(process.env.DB_NAME || 'maraksh');
    const bucket = new GridFSBucket(db, { bucketName: 'images' });
    
    console.log('🔍 Checking what these 27 images are...\n');
    
    const files = await bucket.find({}).toArray();
    const regularImages = files.filter(file => 
      !file.filename.startsWith('original_') && 
      !file.filename.includes('_webp.webp') &&
      file.filename.match(/\.(jpg|jpeg|png)$/i)
    );
    
    console.log(`Found ${regularImages.length} regular images:`);
    regularImages.forEach((file, index) => {
      console.log(`${index + 1}. ${file.filename}`);
      console.log(`   - Content Type: ${file.contentType}`);
      console.log(`   - Upload Date: ${file.uploadDate}`);
      console.log(`   - Size: ${Math.round(file.length / 1024)} KB`);
      console.log('');
    });
    
    // Check if these images are referenced anywhere
    console.log('🔍 Checking if these images are referenced in the app...\n');
    
    // Look for image references in the codebase
    const imageIds = regularImages.map(file => file._id.toString());
    console.log('Image IDs that should be referenced:');
    imageIds.slice(0, 5).forEach(id => {
      console.log(`   - ${id}`);
    });
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await client.close();
  }
}

checkImageUsage();
