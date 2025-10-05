const { MongoClient } = require('mongodb');

// MongoDB connection string
const uri = 'mongodb+srv://eslamabdaltif:oneone2@cluster0marakshv2.ltf0bnd.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0marakshv2';

// Standard calorie values for Moroccan food items (based on typical nutritional data)
const moroccanFoodCalories = {
  // Moroccan Breakfast Items
  'شكشوكة': 320,
  'بيض اومليت': 280,
  'كبده': 180,
  'فول': 250,
  'صينية مشكله': 400,
  
  // Moroccan Soups
  'حريره مفربية': 150,
  'بيصاره مغربية': 200,
  
  // Moroccan Breads
  'مسمن مغربي': 350,
  'حرشه مغربية': 300,
  
  // Moroccan Main Dishes
  'طاقوس مغربي': 450,
  'بوكاديوس': 380,
  
  // Moroccan Sandwiches
  'بطبوط جبن': 420,
  'بطبوط لحم': 480,
  'بطبوط خضار': 350,
  
  // Moroccan Salads
  'سلطة مغربية': 120,
  
  // Moroccan Desserts
  'جراتان': 320,
  
  // Coffee Items
  'قهوة عربية': 5,
  'قهوة تركية': 5,
  'قهوة إسبريسو': 5,
  'قهوة أمريكانو': 5,
  'قهوة لاتيه': 120,
  'قهوة كابتشينو': 80,
  'قهوة موكا': 200,
  'قهوة فرابيه': 250,
  'قهوة آيس كريم': 300,
  'قهوة باردة': 150,
  'قهوة مثلجة': 180,
  'قهوة فانيلا': 180,
  'قهوة كراميل': 200,
  'قهوة شوكولاتة': 220,
  'قهوة نوتيلا': 250,
  'قهوة أوريو': 280,
  
  // Tea Items
  'شاي أحمر': 2,
  'شاي أخضر': 2,
  'شاي بالنعناع': 3,
  
  // Natural Juices
  'عصير برتقال': 110,
  'عصير تفاح': 120,
  'عصير جريب فروت': 100,
  'عصير أناناس': 130,
  'عصير مانجو': 140,
  'عصير فراولة': 90,
  'عصير ليمون': 60,
  
  // Cocktails
  'موهيتو': 150,
  'كوكتيل فراولة': 180,
  'كوكتيل مانجو': 200,
  'كوكتيل أناناس': 190,
  'كوكتيل برتقال': 170,
  'كوكتيل ليمون': 160,
  'كوكتيل تفاح': 175,
  'كوكتيل جريب فروت': 165,
  'كوكتيل خوخ': 185,
  
  // Pizza
  'بيتزا مارغريتا': 280,
  'بيتزا بيبروني': 320,
  'بيتزا خضار': 250,
  
  // Manakish
  'مناقيش زعتر': 300,
  'مناقيش جبن': 350,
  'مناقيش لحم': 400,
  'مناقيش خضار': 280,
  'فطاير سبانخ': 200,
  'فطاير جبن': 250,
  'فطاير لحم': 300,
  'فطاير خضار': 180,
  
  // Sandwiches
  'ساندوتش دجاج': 450,
  'ساندوتش لحم': 500,
  'ساندوتش خضار': 350,
  'برجر دجاج': 480,
  'برجر لحم': 520,
  'برجر نباتي': 400,
  'ساندوتش تونة': 420,
  'ساندوتش جبن': 380,
  'ساندوتش بيض': 320,
  
  // Desserts
  'تشيز كيك': 350,
  'تيراميسو': 400,
  'براوني': 450,
  'آيس كريم': 200,
  'بودينغ': 180,
  'موس': 220,
  'تارت': 300,
  'كيك': 320,
  'دونات': 250,
  'وافل': 280,
  'بان كيك': 200,
  
  // Shisha
  'شيشة تفاح': 0,
  'شيشة عنب': 0,
  'شيشة فراولة': 0,
  'شيشة نعناع': 0,
  'شيشة ورد': 0,
  'شيشة ليمون': 0,
  'شيشة خوخ': 0,
  'شيشة مانجو': 0,
  'شيشة أناناس': 0,
  'شيشة كرز': 0,
  'شيشة فانيلا': 0
};

async function updateMenuItemsWithCalories() {
  const client = new MongoClient(uri);
  
  try {
    await client.connect();
    console.log('Connected to MongoDB Atlas');
    
    const db = client.db();
    const menuCollection = db.collection('menuitems');
    
    console.log('Updating menu items with calorie information...');
    
    let updatedCount = 0;
    
    // Update each menu item with its corresponding calorie value
    for (const [itemName, calories] of Object.entries(moroccanFoodCalories)) {
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
    
    console.log(`\nSuccessfully updated ${updatedCount} menu items with calorie information`);
    
    // Verify the updates
    const itemsWithCalories = await menuCollection.find({ 
      calories: { $exists: true, $ne: null } 
    }).toArray();
    
    console.log(`\nTotal items with calorie information: ${itemsWithCalories.length}`);
    
    // Show some examples
    console.log('\nSample items with calories:');
    itemsWithCalories.slice(0, 10).forEach(item => {
      console.log(`- ${item.name}: ${item.calories} calories`);
    });
    
  } catch (error) {
    console.error('Error updating menu items with calories:', error);
  } finally {
    await client.close();
    console.log('Disconnected from MongoDB Atlas');
  }
}

updateMenuItemsWithCalories();
