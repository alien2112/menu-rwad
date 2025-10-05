const { MongoClient } = require('mongodb');

async function copyDataToMaraksh() {
  let sourceClient, targetClient;
  
  try {
    console.log('🔄 Copying data from maraksh-restaurant to maraksh database...');
    
    // Connect to source database
    sourceClient = new MongoClient('mongodb://localhost:27017/maraksh-restaurant');
    await sourceClient.connect();
    const sourceDb = sourceClient.db();
    
    // Connect to target database
    targetClient = new MongoClient('mongodb://localhost:27017/maraksh');
    await targetClient.connect();
    const targetDb = targetClient.db();
    
    console.log('✅ Connected to both databases');
    
    // Clear target collections first
    console.log('🗑️  Clearing target collections...');
    await targetDb.collection('categories').deleteMany({});
    await targetDb.collection('menuitems').deleteMany({});
    
    // Copy categories
    console.log('📝 Copying categories...');
    const categories = await sourceDb.collection('categories').find({}).toArray();
    if (categories.length > 0) {
      const categoryResult = await targetDb.collection('categories').insertMany(categories);
      console.log(`   Copied ${categoryResult.insertedCount} categories`);
    }
    
    // Copy menu items
    console.log('🍽️  Copying menu items...');
    const menuItems = await sourceDb.collection('menuitems').find({}).toArray();
    if (menuItems.length > 0) {
      const menuItemsResult = await targetDb.collection('menuitems').insertMany(menuItems);
      console.log(`   Copied ${menuItemsResult.insertedCount} menu items`);
    }
    
    // Verify the copy
    console.log('\n✅ Verification:');
    const finalCategories = await targetDb.collection('categories').countDocuments();
    const finalMenuItems = await targetDb.collection('menuitems').countDocuments();
    console.log(`   Categories in maraksh: ${finalCategories}`);
    console.log(`   Menu items in maraksh: ${finalMenuItems}`);
    
    console.log('\n🎉 Data copied successfully!');
    
  } catch (error) {
    console.error('❌ Error copying data:', error);
  } finally {
    if (sourceClient) await sourceClient.close();
    if (targetClient) await targetClient.close();
    console.log('🔌 Disconnected from databases');
  }
}

copyDataToMaraksh().catch(console.error);

