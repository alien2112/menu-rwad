const { MongoClient } = require('mongodb');

// MongoDB connection string
const uri = 'mongodb+srv://eslamabdaltif:oneone2@cluster0marakshv2.ltf0bnd.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0marakshv2';

async function checkMoroccanFoodItems() {
  const client = new MongoClient(uri);
  
  try {
    await client.connect();
    console.log('Connected to MongoDB Atlas');
    
    const db = client.db();
    const menuCollection = db.collection('menuitems');
    
    // Get all Moroccan food items
    const moroccanItems = await menuCollection.find({ 
      name: { 
        $in: ['شكشوكة', 'بيض اومليت', 'كبده', 'فول', 'صينية مشكله', 'حريره مفربية', 'بيصاره مغربية', 'مسمن مغربي', 'حرشه مغربية', 'طاقوس مغربي', 'بوكاديوس', 'بطبوط جبن', 'بطبوط لحم', 'بطبوط خضار', 'سلطة مغربية', 'جراتان'] 
      } 
    }).toArray();
    
    console.log(`Found ${moroccanItems.length} Moroccan food items:`);
    console.log('\nMoroccan Food Items with Images:');
    
    moroccanItems.forEach(item => {
      console.log(`- ${item.name}: ${item.image || 'No image'}`);
    });
    
  } catch (error) {
    console.error('Error checking Moroccan food items:', error);
  } finally {
    await client.close();
    console.log('Disconnected from MongoDB Atlas');
  }
}

checkMoroccanFoodItems();

