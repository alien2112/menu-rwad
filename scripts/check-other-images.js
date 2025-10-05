const { MongoClient } = require('mongodb');
require('dotenv').config();

async function findMoreImages() {
  const client = new MongoClient(process.env.MONGODB_URI);
  try {
    await client.connect();
    const db = client.db(process.env.DB_NAME || 'maraksh');
    
    console.log('🔍 Checking for images in other collections...\n');
    
    // Check MenuItem collection for image references
    const menuItems = await db.collection('menuitems').find({}).toArray();
    console.log(`MenuItems with images: ${menuItems.filter(item => item.imageId || item.imageUrl).length}`);
    
    // Check HomepageImage collection
    const homepageImages = await db.collection('homepageimages').find({}).toArray();
    console.log(`HomepageImages: ${homepageImages.length}`);
    
    // Check Category collection
    const categories = await db.collection('categories').find({}).toArray();
    console.log(`Categories with images: ${categories.filter(cat => cat.imageId || cat.imageUrl).length}`);
    
    // Show sample image references
    console.log('\n📁 Sample MenuItem image references:');
    menuItems.filter(item => item.imageId || item.imageUrl).slice(0, 5).forEach(item => {
      console.log(`   - ${item.name}: imageId=${item.imageId}, imageUrl=${item.imageUrl}`);
    });
    
    console.log('\n📁 Sample HomepageImage references:');
    homepageImages.slice(0, 5).forEach(img => {
      console.log(`   - ${img.title}: imageId=${img.imageId}, imageUrl=${img.imageUrl}`);
    });
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await client.close();
  }
}

findMoreImages();
