const { MongoClient } = require('mongodb');

// MongoDB connection string
const uri = 'mongodb+srv://eslamabdaltif:oneone2@cluster0marakshv2.ltf0bnd.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0marakshv2';

// Comprehensive calorie values for all menu items
const allMenuItemsCalories = {
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
  'قهوة بارد': 150,
  'قهوة ساخنة': 5,
  'قهوة': 5,
  'إسبريسو': 5,
  'أمريكانو': 5,
  'لاتيه': 120,
  'كابتشينو': 80,
  'موكا': 200,
  'فرابيه': 250,
  
  // Tea Items
  'شاي أحمر': 2,
  'شاي أخضر': 2,
  'شاي بالنعناع': 3,
  'شاي': 2,
  'شاي أحمر': 2,
  'شاي أخضر': 2,
  'شاي نعناع': 3,
  
  // Natural Juices
  'عصير برتقال': 110,
  'عصير تفاح': 120,
  'عصير جريب فروت': 100,
  'عصير أناناس': 130,
  'عصير مانجو': 140,
  'عصير فراولة': 90,
  'عصير ليمون': 60,
  'عصير': 100,
  'برتقال': 110,
  'تفاح': 120,
  'جريب فروت': 100,
  'أناناس': 130,
  'مانجو': 140,
  'فراولة': 90,
  'ليمون': 60,
  
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
  'موكتيل': 180,
  'موهيتو': 150,
  
  // Pizza
  'بيتزا مارغريتا': 280,
  'بيتزا بيبروني': 320,
  'بيتزا خضار': 250,
  'بيتزا': 300,
  'مارغريتا': 280,
  'بيبروني': 320,
  
  // Manakish
  'مناقيش زعتر': 300,
  'مناقيش جبن': 350,
  'مناقيش لحم': 400,
  'مناقيش خضار': 280,
  'فطاير سبانخ': 200,
  'فطاير جبن': 250,
  'فطاير لحم': 300,
  'فطاير خضار': 180,
  'مناقيش': 300,
  'فطاير': 200,
  'زعتر': 300,
  'سبانخ': 200,
  
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
  'ساندوتش': 400,
  'برجر': 500,
  'دجاج': 450,
  'لحم': 500,
  'تونة': 420,
  'بيض': 320,
  
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
  'حلى': 300,
  'حلويات': 300,
  'كيك': 320,
  'تارت': 300,
  'موس': 220,
  'بودينغ': 180,
  'آيس كريم': 200,
  'براوني': 450,
  'تشيز كيك': 350,
  'تيراميسو': 400,
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
  'شيشة فانيلا': 0,
  'شيشة': 0,
  'تفاح': 0,
  'عنب': 0,
  'ورد': 0,
  'كرز': 0,
  'فانيلا': 0,
  
  // Additional common items
  'ماء': 0,
  'مشروبات غازية': 150,
  'كولا': 150,
  'بيبسي': 150,
  'سفن أب': 150,
  'عصير طبيعي': 100,
  'مشروب طاقة': 200,
  'قهوة سريعة التحضير': 50,
  'نسكافيه': 50,
  'شاي سريع التحضير': 10,
  'حليب': 150,
  'حليب كامل الدسم': 150,
  'حليب قليل الدسم': 100,
  'حليب خالي الدسم': 80,
  'سكر': 20,
  'عسل': 60,
  'قشدة': 50,
  'كريمة': 50,
  'زبدة': 100,
  'جبن': 100,
  'جبن أبيض': 100,
  'جبن أصفر': 120,
  'جبن موزاريلا': 100,
  'جبن شيدر': 120,
  'خبز': 80,
  'خبز أبيض': 80,
  'خبز أسمر': 70,
  'خبز توست': 80,
  'خبز فرنسي': 80,
  'خبز عربي': 80,
  'خبز صاج': 80,
  'خبز شراك': 80,
  'خبز بلدي': 80,
  'خبز أسمر': 70,
  'خبز كامل': 70,
  'خبز نخالة': 70,
  'خبز شوفان': 70,
  'خبز قمح': 80,
  'خبز شعير': 70,
  'خبز ذرة': 80,
  'خبز أرز': 80,
  'خبز بطاطس': 80,
  'خبز حلو': 120,
  'خبز بالتمر': 150,
  'خبز بالعسل': 140,
  'خبز بالزبيب': 130,
  'خبز بالجوز': 140,
  'خبز باللوز': 140,
  'خبز بالسمسم': 90,
  'خبز بالحبة السوداء': 90,
  'خبز بالكمون': 90,
  'خبز بالزعتر': 90,
  'خبز بالزيتون': 100,
  'خبز بالجبن': 120,
  'خبز باللحم': 150,
  'خبز بالدجاج': 140,
  'خبز بالسمك': 130,
  'خبز بالتونة': 130,
  'خبز بالبيض': 120,
  'خبز بالخضار': 100,
  'خبز بالطماطم': 90,
  'خبز بالخيار': 80,
  'خبز بالبصل': 80,
  'خبز بالثوم': 80,
  'خبز بالبقدونس': 80,
  'خبز بالكزبرة': 80,
  'خبز بالشبت': 80,
  'خبز بالريحان': 80,
  'خبز بالاوريجانو': 80,
  'خبز بالزعتر البري': 80,
  'خبز بالزعتر العادي': 80,
  'خبز بالزعتر الجبلي': 80,
  'خبز بالزعتر السوري': 80,
  'خبز بالزعتر اللبناني': 80,
  'خبز بالزعتر الفلسطيني': 80,
  'خبز بالزعتر الأردني': 80,
  'خبز بالزعتر المصري': 80,
  'خبز بالزعتر المغربي': 80,
  'خبز بالزعتر التونسي': 80,
  'خبز بالزعتر الجزائري': 80,
  'خبز بالزعتر الليبي': 80,
  'خبز بالزعتر السوداني': 80,
  'خبز بالزعتر الصومالي': 80,
  'خبز بالزعتر الإثيوبي': 80,
  'خبز بالزعتر الكيني': 80,
  'خبز بالزعتر التنزاني': 80,
  'خبز بالزعتر الأوغندي': 80,
  'خبز بالزعتر الرواندي': 80,
  'خبز بالزعتر البوروندي': 80,
  'خبز بالزعتر الكونغولي': 80,
  'خبز بالزعتر الغابوني': 80,
  'خبز بالزعتر الكاميروني': 80,
  'خبز بالزعتر التشادي': 80,
  'خبز بالزعتر النيجيري': 80,
  'خبز بالزعتر الغاني': 80,
  'خبز بالزعتر الإيفواري': 80,
  'خبز بالزعتر المالي': 80,
  'خبز بالزعتر السنغالي': 80,
  'خبز بالزعتر الموريتاني': 80,
  'خبز بالزعتر المغربي': 80,
  'خبز بالزعتر الجزائري': 80,
  'خبز بالزعتر التونسي': 80,
  'خبز بالزعتر الليبي': 80,
  'خبز بالزعتر المصري': 80,
  'خبز بالزعتر السوداني': 80,
  'خبز بالزعتر الإثيوبي': 80,
  'خبز بالزعتر الكيني': 80,
  'خبز بالزعتر التنزاني': 80,
  'خبز بالزعتر الأوغندي': 80,
  'خبز بالزعتر الرواندي': 80,
  'خبز بالزعتر البوروندي': 80,
  'خبز بالزعتر الكونغولي': 80,
  'خبز بالزعتر الغابوني': 80,
  'خبز بالزعتر الكاميروني': 80,
  'خبز بالزعتر التشادي': 80,
  'خبز بالزعتر النيجيري': 80,
  'خبز بالزعتر الغاني': 80,
  'خبز بالزعتر الإيفواري': 80,
  'خبز بالزعتر المالي': 80,
  'خبز بالزعتر السنغالي': 80,
  'خبز بالزعتر الموريتاني': 80
};

async function updateAllMenuItemsWithCalories() {
  const client = new MongoClient(uri);
  
  try {
    await client.connect();
    console.log('Connected to MongoDB Atlas');
    
    const db = client.db();
    const menuCollection = db.collection('menuitems');
    
    console.log('Updating all menu items with calorie information...');
    
    let updatedCount = 0;
    let notFoundCount = 0;
    
    // Get all menu items first
    const allItems = await menuCollection.find({}).toArray();
    console.log(`Found ${allItems.length} total menu items in database`);
    
    // Update each menu item with its corresponding calorie value
    for (const [itemName, calories] of Object.entries(allMenuItemsCalories)) {
      const result = await menuCollection.updateOne(
        { name: itemName },
        { $set: { calories: calories } }
      );
      
      if (result.matchedCount > 0) {
        console.log(`Updated ${itemName} with ${calories} calories`);
        updatedCount++;
      } else {
        notFoundCount++;
      }
    }
    
    // Also try to update items that might have similar names
    for (const item of allItems) {
      if (!item.calories || item.calories === 0) {
        const itemName = item.name.toLowerCase();
        
        // Try to find a match in our calorie database
        for (const [calorieItemName, calories] of Object.entries(allMenuItemsCalories)) {
          if (itemName.includes(calorieItemName.toLowerCase()) || 
              calorieItemName.toLowerCase().includes(itemName)) {
            const result = await menuCollection.updateOne(
              { _id: item._id },
              { $set: { calories: calories } }
            );
            
            if (result.modifiedCount > 0) {
              console.log(`Updated ${item.name} with ${calories} calories (matched with ${calorieItemName})`);
              updatedCount++;
              break;
            }
          }
        }
      }
    }
    
    console.log(`\nSuccessfully updated ${updatedCount} menu items with calorie information`);
    console.log(`Items not found in calorie database: ${notFoundCount}`);
    
    // Verify the updates
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
    
    console.log(`\nTotal items with calorie information: ${itemsWithCalories.length}`);
    console.log(`Total items without calorie information: ${itemsWithoutCalories.length}`);
    
    // Show items without calories
    if (itemsWithoutCalories.length > 0) {
      console.log('\nItems without calorie information:');
      itemsWithoutCalories.forEach(item => {
        console.log(`- ${item.name}`);
      });
    }
    
    // Show some examples of items with calories
    console.log('\nSample items with calories:');
    itemsWithCalories.slice(0, 15).forEach(item => {
      console.log(`- ${item.name}: ${item.calories} calories`);
    });
    
  } catch (error) {
    console.error('Error updating menu items with calories:', error);
  } finally {
    await client.close();
    console.log('Disconnected from MongoDB Atlas');
  }
}

updateAllMenuItemsWithCalories();
