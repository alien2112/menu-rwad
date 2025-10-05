const { MongoClient } = require('mongodb');

// Your MongoDB Atlas connection string
const MONGODB_URI = 'mongodb+srv://eslamabdaltif:oneone2@cluster0marakshv2.ltf0bnd.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0marakshv2';

// Updated categories without icons
const updatedCategories = [
  {
    name: 'القهوة الساخنة',
    nameEn: 'Hot Coffee',
    description: 'مشروبات القهوة الساخنة الطازجة',
    color: '#8B4513',
    order: 1,
    featured: true,
    featuredOrder: 1,
    status: 'active',
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    name: 'المشروبات الباردة',
    nameEn: 'Cold Beverages',
    description: 'مشروبات القهوة الباردة المنعشة',
    color: '#4169E1',
    order: 2,
    featured: true,
    featuredOrder: 2,
    status: 'active',
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    name: 'عصائر طازجة',
    nameEn: 'Fresh Juices',
    description: 'عصائر الفواكه الطازجة الطبيعية',
    color: '#FF6347',
    order: 3,
    featured: true,
    featuredOrder: 3,
    status: 'active',
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    name: 'مشروبات الطاقة',
    nameEn: 'Energy Drinks',
    description: 'مشروبات الطاقة المنعشة',
    color: '#FFD700',
    order: 4,
    featured: false,
    status: 'active',
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    name: 'مشروبات المهيتو',
    nameEn: 'Mojito Drinks',
    description: 'مشروبات المهيتو المنعشة بالنعناع',
    color: '#32CD32',
    order: 5,
    featured: false,
    status: 'active',
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    name: 'المشروبات الغازية',
    nameEn: 'Soft Drinks',
    description: 'المشروبات الغازية والموسي',
    color: '#FF69B4',
    order: 6,
    featured: false,
    status: 'active',
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    name: 'القهوة المقطرة',
    nameEn: 'Drip Coffee',
    description: 'قهوة مقطرة طازجة',
    color: '#654321',
    order: 7,
    featured: false,
    status: 'active',
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    name: 'الشاي',
    nameEn: 'Tea',
    description: 'شاي أثاي وطائفي وأحمر',
    color: '#8B0000',
    order: 8,
    featured: false,
    status: 'active',
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    name: 'قهوة اليوم',
    nameEn: 'Coffee of the Day',
    description: 'قهوة اليوم المميزة',
    color: '#D2691E',
    order: 9,
    featured: true,
    featuredOrder: 4,
    status: 'active',
    createdAt: new Date(),
    updatedAt: new Date()
  },
  // New food categories
  {
    name: 'الحلا',
    nameEn: 'Desserts',
    description: 'الحلويات والمأكولات الحلوة',
    color: '#F1C40F',
    order: 10,
    featured: true,
    featuredOrder: 5,
    status: 'active',
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    name: 'المأكولات المغربية',
    nameEn: 'Moroccan Food',
    description: 'الأطباق والمأكولات المغربية التقليدية',
    color: '#E67E22',
    order: 11,
    featured: true,
    featuredOrder: 6,
    status: 'active',
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    name: 'الساندويتش والبرجر',
    nameEn: 'Sandwiches & Burgers',
    description: 'الساندويتش والبرجر الطازج',
    color: '#8E44AD',
    order: 12,
    featured: false,
    status: 'active',
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    name: 'المناقيش والفطائر',
    nameEn: 'Manakish & Pastries',
    description: 'المناقيش والفطائر الطازجة',
    color: '#E67E22',
    order: 13,
    featured: false,
    status: 'active',
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    name: 'البيتزا',
    nameEn: 'Pizza',
    description: 'البيتزا الطازجة بأنواع مختلفة',
    color: '#E74C3C',
    order: 14,
    featured: false,
    status: 'active',
    createdAt: new Date(),
    updatedAt: new Date()
  }
];

async function updateCategoriesWithFood() {
  let client;
  
  try {
    console.log('🌐 Connecting to MongoDB Atlas...');
    console.log('Connection string:', MONGODB_URI.replace(/\/\/.*@/, '//***:***@')); // Hide credentials
    
    client = new MongoClient(MONGODB_URI);
    await client.connect();
    
    const db = client.db();
    console.log('✅ Connected to Atlas database:', db.databaseName);
    
    // Clear existing categories and menu items
    console.log('\n🗑️  Clearing existing categories and menu items...');
    
    const categoriesCollection = db.collection('categories');
    const menuItemsCollection = db.collection('menuitems');
    
    // Delete all menu items first
    const deletedItems = await menuItemsCollection.deleteMany({});
    console.log(`   Deleted ${deletedItems.deletedCount} menu items`);
    
    // Delete all categories
    const deletedCategories = await categoriesCollection.deleteMany({});
    console.log(`   Deleted ${deletedCategories.deletedCount} categories`);
    
    // Insert new categories (without icons)
    console.log('\n📝 Creating new categories (without icons)...');
    const categoryResult = await categoriesCollection.insertMany(updatedCategories);
    console.log(`   Created ${categoryResult.insertedCount} categories`);
    
    // Get category IDs for menu items
    const categories = await categoriesCollection.find({}).toArray();
    const categoryMap = {};
    categories.forEach(cat => {
      categoryMap[cat.name] = cat._id;
    });
    
    // Menu items data (keeping the beverage items)
    const menuItems = [
      // Hot Coffee
      { name: 'اسبريسو', categoryId: categoryMap['القهوة الساخنة'], price: 12, order: 1, status: 'active', createdAt: new Date(), updatedAt: new Date() },
      { name: 'مكاتو', categoryId: categoryMap['القهوة الساخنة'], price: 14, order: 2, status: 'active', createdAt: new Date(), updatedAt: new Date() },
      { name: 'امريكانو', categoryId: categoryMap['القهوة الساخنة'], price: 14, order: 3, status: 'active', createdAt: new Date(), updatedAt: new Date() },
      { name: 'كورتادو', categoryId: categoryMap['القهوة الساخنة'], price: 15, order: 4, status: 'active', createdAt: new Date(), updatedAt: new Date() },
      { name: 'فلات وايت', categoryId: categoryMap['القهوة الساخنة'], price: 16, order: 5, status: 'active', createdAt: new Date(), updatedAt: new Date() },
      { name: 'لاتيه', categoryId: categoryMap['القهوة الساخنة'], price: 17, order: 6, status: 'active', createdAt: new Date(), updatedAt: new Date() },
      { name: 'كابتشينو', categoryId: categoryMap['القهوة الساخنة'], price: 17, order: 7, status: 'active', createdAt: new Date(), updatedAt: new Date() },
      { name: 'سبنش لاتيه', categoryId: categoryMap['القهوة الساخنة'], price: 19, order: 8, status: 'active', createdAt: new Date(), updatedAt: new Date() },
      { name: 'وايت موكا حار', categoryId: categoryMap['القهوة الساخنة'], price: 19, order: 9, status: 'active', createdAt: new Date(), updatedAt: new Date() },
      { name: 'موكا حار', categoryId: categoryMap['القهوة الساخنة'], price: 19, order: 10, status: 'active', createdAt: new Date(), updatedAt: new Date() },

      // Cold Beverages
      { name: 'ايس امريكانو', categoryId: categoryMap['المشروبات الباردة'], price: 18, order: 1, status: 'active', createdAt: new Date(), updatedAt: new Date() },
      { name: 'ايس لاتيه', categoryId: categoryMap['المشروبات الباردة'], price: 18, order: 2, status: 'active', createdAt: new Date(), updatedAt: new Date() },
      { name: 'ايس سبنش لاتيه', categoryId: categoryMap['المشروبات الباردة'], price: 20, order: 3, status: 'active', createdAt: new Date(), updatedAt: new Date() },
      { name: 'أيس وايت موكا', categoryId: categoryMap['المشروبات الباردة'], price: 20, order: 4, status: 'active', createdAt: new Date(), updatedAt: new Date() },
      { name: 'أيس موكا', categoryId: categoryMap['المشروبات الباردة'], price: 20, order: 5, status: 'active', createdAt: new Date(), updatedAt: new Date() },
      { name: 'أيس كركديه', categoryId: categoryMap['المشروبات الباردة'], price: 19, order: 6, status: 'active', createdAt: new Date(), updatedAt: new Date() },

      // Fresh Juices
      { name: 'برتقال', categoryId: categoryMap['عصائر طازجة'], price: 19, order: 1, status: 'active', createdAt: new Date(), updatedAt: new Date() },
      { name: 'منجا سادة', categoryId: categoryMap['عصائر طازجة'], price: 19, order: 2, status: 'active', createdAt: new Date(), updatedAt: new Date() },
      { name: 'منجا حليب', categoryId: categoryMap['عصائر طازجة'], price: 19, order: 3, status: 'active', createdAt: new Date(), updatedAt: new Date() },
      { name: 'ليمون سادة', categoryId: categoryMap['عصائر طازجة'], price: 16, order: 4, status: 'active', createdAt: new Date(), updatedAt: new Date() },
      { name: 'ليمون نعناع', categoryId: categoryMap['عصائر طازجة'], price: 19, order: 5, status: 'active', createdAt: new Date(), updatedAt: new Date() },
      { name: 'افكادو حليب', categoryId: categoryMap['عصائر طازجة'], price: 19, order: 6, status: 'active', createdAt: new Date(), updatedAt: new Date() },

      // Energy Drinks
      { name: 'ردبول', categoryId: categoryMap['مشروبات الطاقة'], price: 20, order: 1, status: 'active', createdAt: new Date(), updatedAt: new Date() },
      { name: 'كودرد', categoryId: categoryMap['مشروبات الطاقة'], price: 18, order: 2, status: 'active', createdAt: new Date(), updatedAt: new Date() },
      { name: 'ريتا', categoryId: categoryMap['مشروبات الطاقة'], price: 15, order: 3, status: 'active', createdAt: new Date(), updatedAt: new Date() },

      // Mojito Drinks
      { name: 'مهيتو ردبول', categoryId: categoryMap['مشروبات المهيتو'], price: 25, order: 1, status: 'active', createdAt: new Date(), updatedAt: new Date() },
      { name: 'مهيتو كودرد', categoryId: categoryMap['مشروبات المهيتو'], price: 22, order: 2, status: 'active', createdAt: new Date(), updatedAt: new Date() },
      { name: 'مهيتو ريتا', categoryId: categoryMap['مشروبات المهيتو'], price: 20, order: 3, status: 'active', createdAt: new Date(), updatedAt: new Date() },
      { name: 'مهيتو سفن', categoryId: categoryMap['مشروبات المهيتو'], price: 18, order: 4, status: 'active', createdAt: new Date(), updatedAt: new Date() },

      // Soft Drinks
      { name: 'سفن', categoryId: categoryMap['المشروبات الغازية'], price: 7, order: 1, status: 'active', createdAt: new Date(), updatedAt: new Date() },
      { name: 'حمضيات', categoryId: categoryMap['المشروبات الغازية'], price: 7, order: 2, status: 'active', createdAt: new Date(), updatedAt: new Date() },
      { name: 'ببسي', categoryId: categoryMap['المشروبات الغازية'], price: 7, order: 3, status: 'active', createdAt: new Date(), updatedAt: new Date() },
      { name: 'موسي فرولة', categoryId: categoryMap['المشروبات الغازية'], price: 19, order: 4, status: 'active', createdAt: new Date(), updatedAt: new Date() },
      { name: 'موسي شعير', categoryId: categoryMap['المشروبات الغازية'], price: 19, order: 5, status: 'active', createdAt: new Date(), updatedAt: new Date() },
      { name: 'موسي رمان', categoryId: categoryMap['المشروبات الغازية'], price: 19, order: 6, status: 'active', createdAt: new Date(), updatedAt: new Date() },

      // Drip Coffee
      { name: 'في60', categoryId: categoryMap['القهوة المقطرة'], price: 18, order: 1, status: 'active', createdAt: new Date(), updatedAt: new Date() },
      { name: 'ايس دريب', categoryId: categoryMap['القهوة المقطرة'], price: 18, order: 2, status: 'active', createdAt: new Date(), updatedAt: new Date() },

      // Tea
      { name: 'شاي أثاي براد كبير', categoryId: categoryMap['الشاي'], price: 25, order: 1, status: 'active', createdAt: new Date(), updatedAt: new Date() },
      { name: 'شاي أثاي براد وسط', categoryId: categoryMap['الشاي'], price: 18, order: 2, status: 'active', createdAt: new Date(), updatedAt: new Date() },
      { name: 'شاي أثاي براد صغير', categoryId: categoryMap['الشاي'], price: 14, order: 3, status: 'active', createdAt: new Date(), updatedAt: new Date() },
      { name: 'شاي طائفي براد كبير', categoryId: categoryMap['الشاي'], price: 25, order: 4, status: 'active', createdAt: new Date(), updatedAt: new Date() },
      { name: 'شاي طائفي براد وسط', categoryId: categoryMap['الشاي'], price: 18, order: 5, status: 'active', createdAt: new Date(), updatedAt: new Date() },
      { name: 'شاي طائفي براد صغير', categoryId: categoryMap['الشاي'], price: 14, order: 6, status: 'active', createdAt: new Date(), updatedAt: new Date() },
      { name: 'شاي أحمر براد كبير', categoryId: categoryMap['الشاي'], price: 25, order: 7, status: 'active', createdAt: new Date(), updatedAt: new Date() },
      { name: 'شاي أحمر براد وسط', categoryId: categoryMap['الشاي'], price: 18, order: 8, status: 'active', createdAt: new Date(), updatedAt: new Date() },
      { name: 'شاي أحمر براد صغير', categoryId: categoryMap['الشاي'], price: 14, order: 9, status: 'active', createdAt: new Date(), updatedAt: new Date() },

      // Coffee of the Day
      { name: 'قهوة اليوم حار', categoryId: categoryMap['قهوة اليوم'], price: 12, order: 1, status: 'active', createdAt: new Date(), updatedAt: new Date() },
      { name: 'قهوة اليوم بارد', categoryId: categoryMap['قهوة اليوم'], price: 12, order: 2, status: 'active', createdAt: new Date(), updatedAt: new Date() }
    ];
    
    // Insert menu items
    console.log('\n🍽️  Creating menu items...');
    const menuItemsResult = await menuItemsCollection.insertMany(menuItems);
    console.log(`   Created ${menuItemsResult.insertedCount} menu items`);
    
    // Verify the data
    console.log('\n✅ Verification:');
    const finalCategories = await categoriesCollection.countDocuments();
    const finalMenuItems = await menuItemsCollection.countDocuments();
    console.log(`   Categories in Atlas: ${finalCategories}`);
    console.log(`   Menu items in Atlas: ${finalMenuItems}`);
    
    console.log('\n📋 New Categories Created:');
    const allCategories = await categoriesCollection.find({}).sort({ order: 1 }).toArray();
    allCategories.forEach((cat, index) => {
      console.log(`   ${index + 1}. ${cat.name} (${cat.nameEn}) - Featured: ${cat.featured ? 'Yes' : 'No'}`);
    });
    
    console.log('\n🎉 Menu update completed successfully!');
    console.log('📊 Summary:');
    console.log(`   - Categories: ${categoryResult.insertedCount} (including new food categories)`);
    console.log(`   - Menu Items: ${menuItemsResult.insertedCount}`);
    console.log('   - Icons: Removed from all categories');
    
  } catch (error) {
    console.error('❌ Error updating Atlas database:', error);
    throw error;
  } finally {
    if (client) {
      await client.close();
      console.log('\n🔌 Disconnected from MongoDB Atlas');
    }
  }
}

// Run the script
updateCategoriesWithFood().catch(console.error);

