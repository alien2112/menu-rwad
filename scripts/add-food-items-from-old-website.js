const { MongoClient } = require('mongodb');

// Your MongoDB Atlas connection string
const MONGODB_URI = 'mongodb+srv://eslamabdaltif:oneone2@cluster0marakshv2.ltf0bnd.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0marakshv2';

async function addFoodItemsFromOldWebsite() {
  let client;
  
  try {
    console.log('🌐 Connecting to MongoDB Atlas...');
    console.log('Connection string:', MONGODB_URI.replace(/\/\/.*@/, '//***:***@')); // Hide credentials
    
    client = new MongoClient(MONGODB_URI);
    await client.connect();
    
    const db = client.db();
    console.log('✅ Connected to Atlas database:', db.databaseName);
    
    const categoriesCollection = db.collection('categories');
    const menuItemsCollection = db.collection('menuitems');
    
    // Get existing categories
    const categories = await categoriesCollection.find({}).toArray();
    const categoryMap = {};
    categories.forEach(cat => {
      categoryMap[cat.name] = cat._id;
    });
    
    console.log('\n📋 Available categories:');
    categories.forEach(cat => {
      console.log(`   - ${cat.name} (${cat.nameEn})`);
    });
    
    // Food items from the old website
    const foodItems = [
      // Moroccan Food (مأكولات مغربية)
      { name: 'شكشوكة', description: 'شكشوكه', categoryId: categoryMap['المأكولات المغربية'], price: 14, calories: 149, order: 1, status: 'active', createdAt: new Date(), updatedAt: new Date() },
      { name: 'بيض اومليت', description: 'بيض اومليت', categoryId: categoryMap['المأكولات المغربية'], price: 10, calories: 120, order: 2, status: 'active', createdAt: new Date(), updatedAt: new Date() },
      { name: 'كبده', description: 'كبده بالطريقه المغربية', categoryId: categoryMap['المأكولات المغربية'], price: 14, calories: 107, order: 3, status: 'active', createdAt: new Date(), updatedAt: new Date() },
      { name: 'فول', description: 'فول مدمس', categoryId: categoryMap['المأكولات المغربية'], price: 10, calories: 180, order: 4, status: 'active', createdAt: new Date(), updatedAt: new Date() },
      { name: 'صينية مشكله', description: 'صينية مشكله من الاكلات المغربية', categoryId: categoryMap['المأكولات المغربية'], price: 25, calories: 300, order: 5, status: 'active', featured: true, createdAt: new Date(), updatedAt: new Date() },
      { name: 'حريره مفربية', description: 'شوربة حريره مغربيه', categoryId: categoryMap['المأكولات المغربية'], price: 5, order: 6, status: 'active', createdAt: new Date(), updatedAt: new Date() },
      { name: 'بيصاره مغربية', description: 'بيصاره مغربية', categoryId: categoryMap['المأكولات المغربية'], price: 5, calories: 75, order: 7, status: 'active', createdAt: new Date(), updatedAt: new Date() },
      { name: 'مسمن مغربي', description: 'مسمن مغربي بالحبة', categoryId: categoryMap['المأكولات المغربية'], price: 4, calories: 95, order: 8, status: 'active', createdAt: new Date(), updatedAt: new Date() },
      { name: 'حرشه مغربية', description: 'حرشه مغربية', categoryId: categoryMap['المأكولات المغربية'], price: 4, calories: 115, order: 9, status: 'active', createdAt: new Date(), updatedAt: new Date() },
      { name: 'طاقوس مغربي', description: 'طاقوس مغربي باوصال الدجاج - لحم', categoryId: categoryMap['المأكولات المغربية'], price: 20, calories: 230, order: 10, status: 'active', createdAt: new Date(), updatedAt: new Date() },
      { name: 'بوكاديوس', description: 'بوكاديوس ( تونه - سلطه - خبز - زيتون )', categoryId: categoryMap['المأكولات المغربية'], price: 15, calories: 70, order: 11, status: 'active', createdAt: new Date(), updatedAt: new Date() },
      { name: 'بطبوط جبن', description: 'حبة فطير مغربي بالجبن المودزريلا', categoryId: categoryMap['المأكولات المغربية'], price: 15, calories: 70, order: 12, status: 'active', createdAt: new Date(), updatedAt: new Date() },
      { name: 'بطبوط لحم', description: 'حبة فطير مغربي باللحم ( بطبوبط )', categoryId: categoryMap['المأكولات المغربية'], price: 15, calories: 130, order: 13, status: 'active', createdAt: new Date(), updatedAt: new Date() },
      { name: 'بطبوط خضار', description: 'فطير مغربي بالخضار', categoryId: categoryMap['المأكولات المغربية'], price: 15, calories: 90, order: 14, status: 'active', createdAt: new Date(), updatedAt: new Date() },
      { name: 'سلطة مغربية', description: 'سلطة خضار مغربية', categoryId: categoryMap['المأكولات المغربية'], price: 10, calories: 25, order: 15, status: 'active', createdAt: new Date(), updatedAt: new Date() },
      { name: 'جراتان', description: 'بشاميل - لحم - بطاطس - معكرونه', categoryId: categoryMap['المأكولات المغربية'], price: 25, calories: 290, order: 16, status: 'active', createdAt: new Date(), updatedAt: new Date() },

      // Pizza (البيتزا)
      { name: 'بيتزا خضار', description: 'بيتزا بالخضار الطازجة والجبن', categoryId: categoryMap['البيتزا'], price: 12, calories: 250, order: 1, status: 'active', createdAt: new Date(), updatedAt: new Date() },
      { name: 'بيتزا دجاج', description: 'بيتزا بقطع الدجاج المشوي والخضار', categoryId: categoryMap['البيتزا'], price: 14, calories: 320, order: 2, status: 'active', featured: true, createdAt: new Date(), updatedAt: new Date() },
      { name: 'بيتزا مشكل', description: 'بيتزا بخليط من اللحوم والخضار', categoryId: categoryMap['البيتزا'], price: 15, calories: 350, order: 3, status: 'active', createdAt: new Date(), updatedAt: new Date() },

      // Desserts (الحلا)
      { name: 'تشيز كيك توت ازرق', description: 'تشيز كيك توت ازرق', categoryId: categoryMap['الحلا'], price: 22, calories: 19, order: 1, status: 'active', createdAt: new Date(), updatedAt: new Date() },
      { name: 'تشيز كيك فراوله', description: 'تشيز كيك فراوله', categoryId: categoryMap['الحلا'], price: 22, calories: 80, order: 2, status: 'active', createdAt: new Date(), updatedAt: new Date() },
      { name: 'كيك سنيكرس', description: 'كيك سنيكرس', categoryId: categoryMap['الحلا'], price: 22, calories: 120, order: 3, status: 'active', createdAt: new Date(), updatedAt: new Date() },
      { name: 'كيك ترامسيو', description: 'كيك ترامسيو', categoryId: categoryMap['الحلا'], price: 22, calories: 86, order: 4, status: 'active', createdAt: new Date(), updatedAt: new Date() },
      { name: 'تشيز كيك لوتس', description: 'شيس كيك لوتس', categoryId: categoryMap['الحلا'], price: 22, calories: 110, order: 5, status: 'active', createdAt: new Date(), updatedAt: new Date() },
      { name: 'بودينج', description: 'بودينج متنوع', categoryId: categoryMap['الحلا'], price: 15, calories: 75, order: 6, status: 'active', createdAt: new Date(), updatedAt: new Date() },
      { name: 'كوكيز', description: 'كوكيز محضر طازج بالشوكولاتة', categoryId: categoryMap['الحلا'], price: 12, calories: 150, order: 7, status: 'active', createdAt: new Date(), updatedAt: new Date() },
      { name: 'كيك عسل', description: 'كيك العسل الطبيعي الشهي', categoryId: categoryMap['الحلا'], price: 22, calories: 320, order: 8, status: 'active', createdAt: new Date(), updatedAt: new Date() },
      { name: 'سان سبيستيان', description: 'كيك سان سبيستيان الإسباني', categoryId: categoryMap['الحلا'], price: 22, calories: 380, order: 9, status: 'active', createdAt: new Date(), updatedAt: new Date() },
      { name: 'كيك نوتيلا', description: 'كيك النوتيلا الكريمي الشهير', categoryId: categoryMap['الحلا'], price: 22, calories: 420, order: 10, status: 'active', featured: true, createdAt: new Date(), updatedAt: new Date() },
      { name: 'كرانشي كيك', description: 'كيك مقرمش بطبقات الشوكولاتة', categoryId: categoryMap['الحلا'], price: 22, calories: 450, order: 11, status: 'active', createdAt: new Date(), updatedAt: new Date() }
    ];
    
    // Filter out items for categories that don't exist
    const validItems = foodItems.filter(item => item.categoryId);
    const invalidItems = foodItems.filter(item => !item.categoryId);
    
    if (invalidItems.length > 0) {
      console.log('\n⚠️  Some items could not be added (category not found):');
      invalidItems.forEach(item => {
        console.log(`   - ${item.name} (category not found)`);
      });
    }
    
    console.log(`\n🍽️  Adding ${validItems.length} food items...`);
    
    // Insert food items
    const result = await menuItemsCollection.insertMany(validItems);
    console.log(`   Created ${result.insertedCount} food items`);
    
    // Verify the data
    console.log('\n✅ Verification:');
    const totalCategories = await categoriesCollection.countDocuments();
    const totalMenuItems = await menuItemsCollection.countDocuments();
    console.log(`   Total Categories: ${totalCategories}`);
    console.log(`   Total Menu Items: ${totalMenuItems}`);
    
    // Show items by category
    console.log('\n📊 Items by Category:');
    for (const category of categories) {
      const itemCount = await menuItemsCollection.countDocuments({ categoryId: category._id });
      console.log(`   ${category.name}: ${itemCount} items`);
    }
    
    console.log('\n🎉 Food items from old website added successfully!');
    
  } catch (error) {
    console.error('❌ Error adding food items:', error);
    throw error;
  } finally {
    if (client) {
      await client.close();
      console.log('\n🔌 Disconnected from MongoDB Atlas');
    }
  }
}

// Run the script
addFoodItemsFromOldWebsite().catch(console.error);

