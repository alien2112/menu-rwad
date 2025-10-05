const { MongoClient } = require('mongodb');

// MongoDB connection string
const uri = 'mongodb+srv://eslamabdaltif:oneone2@cluster0marakshv2.ltf0bnd.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0marakshv2';

async function checkDatabase() {
  const client = new MongoClient(uri);
  
  try {
    await client.connect();
    console.log('Connected to MongoDB Atlas');
    
    const db = client.db();
    const menuCollection = db.collection('menuitems');
    
    // Check all items in the database
    const allItems = await menuCollection.find({}).toArray();
    console.log(`Total items in database: ${allItems.length}`);
    
    // Group by category
    const categories = {};
    allItems.forEach(item => {
      if (!categories[item.category]) {
        categories[item.category] = [];
      }
      categories[item.category].push(item.name);
    });
    
    console.log('\nCategories and items:');
    Object.keys(categories).forEach(category => {
      console.log(`\n${category}:`);
      categories[category].forEach(itemName => {
        console.log(`  - ${itemName}`);
      });
    });
    
  } catch (error) {
    console.error('Error checking database:', error);
  } finally {
    await client.close();
    console.log('Disconnected from MongoDB Atlas');
  }
}

checkDatabase();
