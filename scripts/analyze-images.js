const { MongoClient, GridFSBucket } = require('mongodb');
require('dotenv').config();

async function analyzeImages() {
  const client = new MongoClient(process.env.MONGODB_URI);
  try {
    await client.connect();
    const db = client.db(process.env.DB_NAME || 'maraksh');
    const bucket = new GridFSBucket(db, { bucketName: 'images' });
    
    console.log('🔍 Analyzing all 81 images...\n');
    
    const files = await bucket.find({}).toArray();
    console.log(`Total files found: ${files.length}`);
    
    // Categorize files
    const categories = {
      original: 0,
      webp: 0,
      regular: 0,
      other: 0
    };
    
    const sampleFiles = {
      original: [],
      webp: [],
      regular: [],
      other: []
    };
    
    files.forEach(file => {
      const filename = file.filename;
      if (filename.startsWith('original_')) {
        categories.original++;
        if (sampleFiles.original.length < 3) {
          sampleFiles.original.push(filename);
        }
      } else if (filename.includes('_webp.webp')) {
        categories.webp++;
        if (sampleFiles.webp.length < 3) {
          sampleFiles.webp.push(filename);
        }
      } else if (filename.match(/\.(jpg|jpeg|png)$/i)) {
        categories.regular++;
        if (sampleFiles.regular.length < 5) {
          sampleFiles.regular.push(filename);
        }
      } else {
        categories.other++;
        if (sampleFiles.other.length < 3) {
          sampleFiles.other.push(filename);
        }
      }
    });
    
    console.log('📊 File categories:');
    console.log(`   Regular images: ${categories.regular}`);
    console.log(`   Original backups: ${categories.original}`);
    console.log(`   WebP versions: ${categories.webp}`);
    console.log(`   Other files: ${categories.other}`);
    
    console.log('\n📁 Sample regular images (not converted yet):');
    sampleFiles.regular.forEach(filename => {
      console.log(`   - ${filename}`);
    });
    
    console.log('\n📁 Sample original backups:');
    sampleFiles.original.forEach(filename => {
      console.log(`   - ${filename}`);
    });
    
    console.log('\n📁 Sample WebP versions:');
    sampleFiles.webp.forEach(filename => {
      console.log(`   - ${filename}`);
    });
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await client.close();
  }
}

analyzeImages();
