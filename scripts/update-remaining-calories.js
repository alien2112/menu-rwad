const { MongoClient } = require('mongodb');

// MongoDB connection string
const uri = 'mongodb+srv://eslamabdaltif:oneone2@cluster0marakshv2.ltf0bnd.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0marakshv2';

// Calorie values for the remaining items
const remainingItemsCalories = {
  'اسبريسو': 5,
  'مكاتو': 80,
  'امريكانو': 5,
  'كورتادو': 100,
  'فلات وايت': 120,
  'ايس امريكانو': 5,
  'أيس كركديه': 50,
  'منجا سادة': 140,
  'ردبول': 200,
  'كودرد': 150,
  'مهيتو ردبول': 200,
  'مهيتو كودرد': 150,
  'مهيتو ريتا': 280,
  'مهيتو سفن': 150,
  'حمضيات': 100,
  'ببسي': 150,
  'في60': 200,
  'ايس دريب': 150,
  'حريره مفربية': 150
};

async function updateRemainingItemsWithCalories() {
  const client = new MongoClient(uri);
  
  try {
    await client.connect();
    console.log('Connected to MongoDB Atlas');
    
    const db = client.db();
    const menuCollection = db.collection('menuitems');
    
    console.log('Updating remaining menu items with calorie information...');
    
    let updatedCount = 0;
    
    // Update each remaining item with its corresponding calorie value
    for (const [itemName, calories] of Object.entries(remainingItemsCalories)) {
      const result = await menuCollection.updateOne(
        { name: itemName },
        { $set: { calories: calories } }
      );
      
      if (result.matchedCount > 0) {
        console.log(`Updated ${itemName} with ${calories} calories`);
        updatedCount++;
      } else {
        console.log(`Item not found: ${itemName}`);
      }
    }
    
    console.log(`\nSuccessfully updated ${updatedCount} remaining menu items with calorie information`);
    
    // Final verification
    const itemsWithCalories = await menuCollection.find({ 
      calories: { $exists: true, $ne: null, $gt: 0 } 
    }).toArray();
    
    const itemsWithoutCalories = await menuCollection.find({ 
      $or: [
        { calories: { $exists: false } },
        { calories: null },
        { calories: 0 }
      ]
    }).toArray();
    
    console.log(`\nFinal Results:`);
    console.log(`Total items with calorie information: ${itemsWithCalories.length}`);
    console.log(`Total items without calorie information: ${itemsWithoutCalories.length}`);
    
    // Show items without calories
    if (itemsWithoutCalories.length > 0) {
      console.log('\nItems without calorie information:');
      itemsWithoutCalories.forEach(item => {
        console.log(`- ${item.name}`);
      });
    }
    
    // Show all items with calories
    console.log('\nAll items with calorie information:');
    itemsWithCalories.forEach(item => {
      console.log(`- ${item.name}: ${item.calories} calories`);
    });
    
  } catch (error) {
    console.error('Error updating remaining menu items with calories:', error);
  } finally {
    await client.close();
    console.log('Disconnected from MongoDB Atlas');
  }
}

updateRemainingItemsWithCalories();
