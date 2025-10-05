const { MongoClient } = require('mongodb');

// MongoDB connection string
const uri = 'mongodb+srv://eslamabdaltif:oneone2@cluster0marakshv2.ltf0bnd.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0marakshv2';

// Moroccan food items with their corresponding downloaded images
const moroccanFoodImageMappings = {
  'شكشوكة': '/download (1).jpeg',
  'بيض اومليت': '/download (2).jpeg', 
  'كبده': '/download (3).jpeg',
  'فول': '/download (4).jpeg',
  'صينية مشكله': '/download.jpeg',
  'حريره مفربية': '/download (1).jpeg',
  'بيصاره مغربية': '/download (2).jpeg',
  'مسمن مغربي': '/download (3).jpeg',
  'حرشه مغربية': '/download (4).jpeg',
  'طاقوس مغربي': '/download.jpeg',
  'بوكاديوس': '/download (1).jpeg',
  'بطبوط جبن': '/download (2).jpeg',
  'بطبوط لحم': '/download (3).jpeg',
  'بطبوط خضار': '/download (4).jpeg',
  'سلطة مغربية': '/download.jpeg',
  'جراتان': '/download (1).jpeg'
};

async function updateMoroccanFoodImages() {
  const client = new MongoClient(uri);
  
  try {
    await client.connect();
    console.log('Connected to MongoDB Atlas');
    
    const db = client.db();
    const menuCollection = db.collection('menuitems');
    
    // Update each Moroccan food item with its corresponding image
    for (const [itemName, imagePath] of Object.entries(moroccanFoodImageMappings)) {
      const result = await menuCollection.updateOne(
        { name: itemName },
        { $set: { image: imagePath } }
      );
      
      if (result.matchedCount > 0) {
        console.log(`Updated ${itemName} with image: ${imagePath}`);
      } else {
        console.log(`Item not found: ${itemName}`);
      }
    }
    
    // Verify the updates
    const moroccanItems = await menuCollection.find({ category: 'Moroccan Food' }).toArray();
    console.log(`\nMoroccan Food items in database: ${moroccanItems.length}`);
    
    moroccanItems.forEach(item => {
      console.log(`- ${item.name}: ${item.image}`);
    });
    
  } catch (error) {
    console.error('Error updating Moroccan food images:', error);
  } finally {
    await client.close();
    console.log('Disconnected from MongoDB Atlas');
  }
}

updateMoroccanFoodImages();
