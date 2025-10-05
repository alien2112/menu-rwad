const { MongoClient } = require('mongodb');

// MongoDB connection string
const uri = 'mongodb+srv://eslamabdaltif:oneone2@cluster0marakshv2.ltf0bnd.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0marakshv2';

// Moroccan food items with their corresponding migrated images from old website
const moroccanFoodImageMappings = {
  'شكشوكة': '/migrated-images/download (1).jpeg',
  'بيض اومليت': '/migrated-images/download (2).jpeg', 
  'كبده': '/migrated-images/download (3).jpeg',
  'فول': '/migrated-images/download (4).jpeg',
  'صينية مشكله': '/migrated-images/download.jpeg',
  'حريره مفربية': '/migrated-images/download (1).jpeg',
  'بيصاره مغربية': '/migrated-images/download (2).jpeg',
  'مسمن مغربي': '/migrated-images/download (3).jpeg',
  'حرشه مغربية': '/migrated-images/download (4).jpeg',
  'طاقوس مغربي': '/migrated-images/download.jpeg',
  'بوكاديوس': '/migrated-images/download (1).jpeg',
  'بطبوط جبن': '/migrated-images/download (2).jpeg',
  'بطبوط لحم': '/migrated-images/download (3).jpeg',
  'بطبوط خضار': '/migrated-images/download (4).jpeg',
  'سلطة مغربية': '/migrated-images/download.jpeg',
  'جراتان': '/migrated-images/download (1).jpeg'
};

async function updateMoroccanFoodImagesWithNewPaths() {
  const client = new MongoClient(uri);
  
  try {
    await client.connect();
    console.log('Connected to MongoDB Atlas');
    
    const db = client.db();
    const menuCollection = db.collection('menuitems');
    
    // Update each Moroccan food item with its corresponding migrated image path
    for (const [itemName, imagePath] of Object.entries(moroccanFoodImageMappings)) {
      const result = await menuCollection.updateOne(
        { name: itemName },
        { $set: { image: imagePath } }
      );
      
      if (result.matchedCount > 0) {
        console.log(`Updated ${itemName} with migrated image: ${imagePath}`);
      } else {
        console.log(`Item not found: ${itemName}`);
      }
    }
    
    // Verify the updates
    const moroccanItems = await menuCollection.find({ 
      name: { 
        $in: ['شكشوكة', 'بيض اومليت', 'كبده', 'فول', 'صينية مشكله', 'حريره مفربية', 'بيصاره مغربية', 'مسمن مغربي', 'حرشه مغربية', 'طاقوس مغربي', 'بوكاديوس', 'بطبوط جبن', 'بطبوط لحم', 'بطبوط خضار', 'سلطة مغربية', 'جراتان'] 
      } 
    }).toArray();
    
    console.log(`\nFound ${moroccanItems.length} Moroccan food items:`);
    console.log('\nMoroccan Food Items with Migrated Images:');
    
    moroccanItems.forEach(item => {
      console.log(`- ${item.name}: ${item.image || 'No image'}`);
    });
    
  } catch (error) {
    console.error('Error updating Moroccan food images:', error);
  } finally {
    await client.close();
    console.log('Disconnected from MongoDB Atlas');
  }
}

updateMoroccanFoodImagesWithNewPaths();

