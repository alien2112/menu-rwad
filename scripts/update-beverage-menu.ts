import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Category from '../lib/models/Category.js';
import MenuItem from '../lib/models/MenuItem.js';

dotenv.config();

// Connect to MongoDB
async function connectDB() {
  try {
    await mongoose.connect(process.env.MONGODB_URI!);
    console.log('Connected to MongoDB');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
}

// Delete existing categories and menu items
async function clearExistingData() {
  try {
    console.log('Deleting existing categories and menu items...');
    
    // Delete all menu items first (due to foreign key constraints)
    const deletedItems = await MenuItem.deleteMany({});
    console.log(`Deleted ${deletedItems.deletedCount} menu items`);
    
    // Delete all categories
    const deletedCategories = await Category.deleteMany({});
    console.log(`Deleted ${deletedCategories.deletedCount} categories`);
    
    console.log('Existing data cleared successfully');
  } catch (error) {
    console.error('Error clearing existing data:', error);
    throw error;
  }
}

// Create new categories
async function createCategories() {
  const categories = [
    {
      name: 'القهوة الساخنة',
      nameEn: 'Hot Coffee',
      description: 'مشروبات القهوة الساخنة الطازجة',
      color: '#8B4513',
      icon: '☕',
      order: 1,
      featured: true,
      featuredOrder: 1,
      status: 'active' as const
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
      status: 'active' as const
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
      status: 'active' as const
    },
    {
      name: 'مشروبات الطاقة',
      nameEn: 'Energy Drinks',
      description: 'مشروبات الطاقة المنعشة',
      color: '#FFD700',
      icon: '⚡',
      order: 4,
      featured: false,
      status: 'active' as const
    },
    {
      name: 'مشروبات المهيتو',
      nameEn: 'Mojito Drinks',
      description: 'مشروبات المهيتو المنعشة بالنعناع',
      color: '#32CD32',
      icon: '🌿',
      order: 5,
      featured: false,
      status: 'active' as const
    },
    {
      name: 'المشروبات الغازية',
      nameEn: 'Soft Drinks',
      description: 'المشروبات الغازية والموسي',
      color: '#FF69B4',
      icon: '🥤',
      order: 6,
      featured: false,
      status: 'active' as const
    },
    {
      name: 'القهوة المقطرة',
      nameEn: 'Drip Coffee',
      description: 'قهوة مقطرة طازجة',
      color: '#654321',
      icon: '☕',
      order: 7,
      featured: false,
      status: 'active' as const
    },
    {
      name: 'الشاي',
      nameEn: 'Tea',
      description: 'شاي أثاي وطائفي وأحمر',
      color: '#8B0000',
      icon: '🍵',
      order: 8,
      featured: false,
      status: 'active' as const
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
      status: 'active' as const
    }
  ];

  try {
    console.log('Creating new categories...');
    const createdCategories = await Category.insertMany(categories);
    console.log(`Created ${createdCategories.length} categories`);
    return createdCategories;
  } catch (error) {
    console.error('Error creating categories:', error);
    throw error;
  }
}

// Create menu items
async function createMenuItems(categories: any[]) {
  const categoryMap: { [key: string]: string } = {};
  categories.forEach(cat => {
    categoryMap[cat.name] = cat._id;
  });

  const menuItems = [
    // Hot Coffee
    { name: 'اسبريسو', categoryId: categoryMap['القهوة الساخنة'], price: 12, order: 1, status: 'active' as const },
    { name: 'مكاتو', categoryId: categoryMap['القهوة الساخنة'], price: 14, order: 2, status: 'active' as const },
    { name: 'امريكانو', categoryId: categoryMap['القهوة الساخنة'], price: 14, order: 3, status: 'active' as const },
    { name: 'كورتادو', categoryId: categoryMap['القهوة الساخنة'], price: 15, order: 4, status: 'active' as const },
    { name: 'فلات وايت', categoryId: categoryMap['القهوة الساخنة'], price: 16, order: 5, status: 'active' as const },
    { name: 'لاتيه', categoryId: categoryMap['القهوة الساخنة'], price: 17, order: 6, status: 'active' as const },
    { name: 'كابتشينو', categoryId: categoryMap['القهوة الساخنة'], price: 17, order: 7, status: 'active' as const },
    { name: 'سبنش لاتيه', categoryId: categoryMap['القهوة الساخنة'], price: 19, order: 8, status: 'active' as const },
    { name: 'وايت موكا حار', categoryId: categoryMap['القهوة الساخنة'], price: 19, order: 9, status: 'active' as const },
    { name: 'موكا حار', categoryId: categoryMap['القهوة الساخنة'], price: 19, order: 10, status: 'active' as const },

    // Cold Beverages
    { name: 'ايس امريكانو', categoryId: categoryMap['المشروبات الباردة'], price: 18, order: 1, status: 'active' as const },
    { name: 'ايس لاتيه', categoryId: categoryMap['المشروبات الباردة'], price: 18, order: 2, status: 'active' as const },
    { name: 'ايس سبنش لاتيه', categoryId: categoryMap['المشروبات الباردة'], price: 20, order: 3, status: 'active' as const },
    { name: 'أيس وايت موكا', categoryId: categoryMap['المشروبات الباردة'], price: 20, order: 4, status: 'active' as const },
    { name: 'أيس موكا', categoryId: categoryMap['المشروبات الباردة'], price: 20, order: 5, status: 'active' as const },
    { name: 'أيس كركديه', categoryId: categoryMap['المشروبات الباردة'], price: 19, order: 6, status: 'active' as const },

    // Fresh Juices
    { name: 'برتقال', categoryId: categoryMap['عصائر طازجة'], price: 19, order: 1, status: 'active' as const },
    { name: 'منجا سادة', categoryId: categoryMap['عصائر طازجة'], price: 19, order: 2, status: 'active' as const },
    { name: 'منجا حليب', categoryId: categoryMap['عصائر طازجة'], price: 19, order: 3, status: 'active' as const },
    { name: 'ليمون سادة', categoryId: categoryMap['عصائر طازجة'], price: 16, order: 4, status: 'active' as const },
    { name: 'ليمون نعناع', categoryId: categoryMap['عصائر طازجة'], price: 19, order: 5, status: 'active' as const },
    { name: 'افكادو حليب', categoryId: categoryMap['عصائر طازجة'], price: 19, order: 6, status: 'active' as const },

    // Energy Drinks
    { name: 'ردبول', categoryId: categoryMap['مشروبات الطاقة'], price: 20, order: 1, status: 'active' as const },
    { name: 'كودرد', categoryId: categoryMap['مشروبات الطاقة'], price: 18, order: 2, status: 'active' as const },
    { name: 'ريتا', categoryId: categoryMap['مشروبات الطاقة'], price: 15, order: 3, status: 'active' as const },

    // Mojito Drinks
    { name: 'مهيتو ردبول', categoryId: categoryMap['مشروبات المهيتو'], price: 25, order: 1, status: 'active' as const },
    { name: 'مهيتو كودرد', categoryId: categoryMap['مشروبات المهيتو'], price: 22, order: 2, status: 'active' as const },
    { name: 'مهيتو ريتا', categoryId: categoryMap['مشروبات المهيتو'], price: 20, order: 3, status: 'active' as const },
    { name: 'مهيتو سفن', categoryId: categoryMap['مشروبات المهيتو'], price: 18, order: 4, status: 'active' as const },

    // Soft Drinks
    { name: 'سفن', categoryId: categoryMap['المشروبات الغازية'], price: 7, order: 1, status: 'active' as const },
    { name: 'حمضيات', categoryId: categoryMap['المشروبات الغازية'], price: 7, order: 2, status: 'active' as const },
    { name: 'ببسي', categoryId: categoryMap['المشروبات الغازية'], price: 7, order: 3, status: 'active' as const },
    { name: 'موسي فرولة', categoryId: categoryMap['المشروبات الغازية'], price: 19, order: 4, status: 'active' as const },
    { name: 'موسي شعير', categoryId: categoryMap['المشروبات الغازية'], price: 19, order: 5, status: 'active' as const },
    { name: 'موسي رمان', categoryId: categoryMap['المشروبات الغازية'], price: 19, order: 6, status: 'active' as const },

    // Drip Coffee
    { name: 'في60', categoryId: categoryMap['القهوة المقطرة'], price: 18, order: 1, status: 'active' as const },
    { name: 'ايس دريب', categoryId: categoryMap['القهوة المقطرة'], price: 18, order: 2, status: 'active' as const },

    // Tea
    { name: 'شاي أثاي براد كبير', categoryId: categoryMap['الشاي'], price: 25, order: 1, status: 'active' as const },
    { name: 'شاي أثاي براد وسط', categoryId: categoryMap['الشاي'], price: 18, order: 2, status: 'active' as const },
    { name: 'شاي أثاي براد صغير', categoryId: categoryMap['الشاي'], price: 14, order: 3, status: 'active' as const },
    { name: 'شاي طائفي براد كبير', categoryId: categoryMap['الشاي'], price: 25, order: 4, status: 'active' as const },
    { name: 'شاي طائفي براد وسط', categoryId: categoryMap['الشاي'], price: 18, order: 5, status: 'active' as const },
    { name: 'شاي طائفي براد صغير', categoryId: categoryMap['الشاي'], price: 14, order: 6, status: 'active' as const },
    { name: 'شاي أحمر براد كبير', categoryId: categoryMap['الشاي'], price: 25, order: 7, status: 'active' as const },
    { name: 'شاي أحمر براد وسط', categoryId: categoryMap['الشاي'], price: 18, order: 8, status: 'active' as const },
    { name: 'شاي أحمر براد صغير', categoryId: categoryMap['الشاي'], price: 14, order: 9, status: 'active' as const },

    // Coffee of the Day
    { name: 'قهوة اليوم حار', categoryId: categoryMap['قهوة اليوم'], price: 12, order: 1, status: 'active' as const },
    { name: 'قهوة اليوم بارد', categoryId: categoryMap['قهوة اليوم'], price: 12, order: 2, status: 'active' as const }
  ];

  try {
    console.log('Creating menu items...');
    const createdItems = await MenuItem.insertMany(menuItems);
    console.log(`Created ${createdItems.length} menu items`);
    return createdItems;
  } catch (error) {
    console.error('Error creating menu items:', error);
    throw error;
  }
}

// Main function
async function updateMenu() {
  try {
    await connectDB();
    await clearExistingData();
    const categories = await createCategories();
    await createMenuItems(categories);
    
    console.log('\n✅ Menu update completed successfully!');
    console.log('📊 Summary:');
    console.log(`   - Categories: ${categories.length}`);
    console.log(`   - Menu Items: ${await MenuItem.countDocuments()}`);
    
  } catch (error) {
    console.error('❌ Error updating menu:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

// Run the script
updateMenu();
