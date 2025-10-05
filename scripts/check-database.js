const { MongoClient } = require('mongodb');

// MongoDB connection string
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/maraksh-restaurant';

async function checkDatabase() {
  let client;
  
  try {
    console.log('Connecting to MongoDB...');
    console.log('Connection string:', MONGODB_URI);
    
    client = new MongoClient(MONGODB_URI);
    await client.connect();
    
    const db = client.db();
    console.log('Connected to database:', db.databaseName);
    
    // List all collections
    console.log('\n📋 Collections in database:');
    const collections = await db.listCollections().toArray();
    collections.forEach(col => {
      console.log(`   - ${col.name}`);
    });
    
    // Check categories collection
    console.log('\n🏷️  Categories collection:');
    const categoriesCollection = db.collection('categories');
    const categoriesCount = await categoriesCollection.countDocuments();
    console.log(`   Total categories: ${categoriesCount}`);
    
    if (categoriesCount > 0) {
      const categories = await categoriesCollection.find({}).toArray();
      console.log('   Categories:');
      categories.forEach((cat, index) => {
        console.log(`   ${index + 1}. ${cat.name} (${cat.nameEn}) - Order: ${cat.order}`);
      });
    }
    
    // Check menu items collection
    console.log('\n🍽️  Menu Items collection:');
    const menuItemsCollection = db.collection('menuitems');
    const menuItemsCount = await menuItemsCollection.countDocuments();
    console.log(`   Total menu items: ${menuItemsCount}`);
    
    if (menuItemsCount > 0) {
      const menuItems = await menuItemsCollection.find({}).limit(5).toArray();
      console.log('   Sample menu items:');
      menuItems.forEach((item, index) => {
        console.log(`   ${index + 1}. ${item.name} - ${item.price} ريال`);
      });
      if (menuItemsCount > 5) {
        console.log(`   ... and ${menuItemsCount - 5} more items`);
      }
    }
    
    // Check if collections exist but are empty
    if (categoriesCount === 0 && menuItemsCount === 0) {
      console.log('\n⚠️  Both collections are empty!');
      console.log('This might mean:');
      console.log('1. The collections were created but no data was inserted');
      console.log('2. The data was inserted but in different collection names');
      console.log('3. There was an error during insertion');
    }
    
  } catch (error) {
    console.error('❌ Error checking database:', error);
    throw error;
  } finally {
    if (client) {
      await client.close();
      console.log('\n🔌 Disconnected from MongoDB');
    }
  }
}

// Run the script
checkDatabase().catch(console.error);

