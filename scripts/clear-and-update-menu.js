const { MongoClient } = require('mongodb');

// MongoDB connection string - you'll need to replace this with your actual connection string
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/maraksh-restaurant';

// New beverage categories
const beverageCategories = [
  {
    name: 'القهوة الساخنة',
    nameEn: 'Hot Coffee',
    description: 'مشروبات القهوة الساخنة الطازجة',
    color: '#8B4513',
    icon: '☕',
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
    icon: '🧊',
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
    icon: '🍹',
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
    icon: '⚡',
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
    icon: '🌿',
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
    icon: '🥤',
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
    icon: '☕',
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
    icon: '🍵',
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
    icon: '⭐',
    order: 9,
    featured: true,
    featuredOrder: 4,
    status: 'active',
    createdAt: new Date(),
    updatedAt: new Date()
  }
];

async function updateMenuDirectly() {
  let client;
  
  try {
    console.log('Connecting to MongoDB...');
    console.log('Connection string:', MONGODB_URI);
    
    client = new MongoClient(MONGODB_URI);
    await client.connect();
    
    const db = client.db();
    console.log('Connected to database:', db.databaseName);
    
    // Clear existing data
    console.log('\n🗑️  Clearing existing categories and menu items...');
    
    const categoriesCollection = db.collection('categories');
    const menuItemsCollection = db.collection('menuitems');
    
    // Delete all menu items first
    const deletedItems = await menuItemsCollection.deleteMany({});
    console.log(`   Deleted ${deletedItems.deletedCount} menu items`);
    
    // Delete all categories
    const deletedCategories = await categoriesCollection.deleteMany({});
    console.log(`   Deleted ${deletedCategories.deletedCount} categories`);
    
    // Insert new categories
    console.log('\n📝 Creating new categories...');
    const categoryResult = await categoriesCollection.insertMany(beverageCategories);
    console.log(`   Created ${categoryResult.insertedCount} categories`);
    
    // Get category IDs for menu items
    const categories = await categoriesCollection.find({}).toArray();
    const categoryMap = {};
    categories.forEach(cat => {
      categoryMap[cat.name] = cat._id;
    });
    
    // Menu items data
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
    console.log(`   Categories in database: ${finalCategories}`);
    console.log(`   Menu items in database: ${finalMenuItems}`);
    
    console.log('\n🎉 Menu update completed successfully!');
    console.log('📊 Summary:');
    console.log(`   - Categories: ${categoryResult.insertedCount}`);
    console.log(`   - Menu Items: ${menuItemsResult.insertedCount}`);
    
  } catch (error) {
    console.error('❌ Error updating menu:', error);
    throw error;
  } finally {
    if (client) {
      await client.close();
      console.log('\n🔌 Disconnected from MongoDB');
    }
  }
}

// Run the script
updateMenuDirectly().catch(console.error);

