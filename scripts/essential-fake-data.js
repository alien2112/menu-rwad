/**
 * Essential Fake Data Generation Script
 * Generates only the essential test data
 */

const mongoose = require('mongoose');

// Connect to MongoDB
async function connectDB() {
  try {
    await mongoose.connect('mongodb+srv://eslamabdaltif:oneone2@cluster0.p8b1qnv.mongodb.net/menurwad?retryWrites=true&w=majority&appName=Cluster0');
    console.log('✅ Connected to MongoDB Atlas');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  }
}

async function generateEssentialData() {
  console.log('🚀 Starting Essential Fake Data Generation...\n');
  
  try {
    await connectDB();
    
    // Clear existing data
    console.log('🧹 Clearing existing data...');
    const collections = [
      'categories', 'menuitems', 'materials', 'users', 'orders', 
      'wastelogs', 'materialusages', 'printjobs', 'printers', 
      'taxsettings', 'analyticsreports', 'notifications'
    ];
    
    for (const collection of collections) {
      try {
        await mongoose.connection.db.collection(collection).deleteMany({});
        console.log(`   Cleared ${collection}`);
      } catch (error) {
        // Collection might not exist, that's okay
      }
    }
    
    console.log('');

    // Generate Categories
    console.log('📂 Generating Categories...');
    const Category = mongoose.model('Category', new mongoose.Schema({
      name: String,
      nameEn: String,
      description: String,
      image: String,
      color: String,
      order: Number,
      featured: Boolean,
      status: String,
      createdAt: Date,
      updatedAt: Date
    }));

    const categories = [
      { name: 'المشروبات الساخنة', nameEn: 'Hot Beverages', description: 'مشروبات ساخنة متنوعة', color: '#C2914A', order: 1, featured: true, status: 'active' },
      { name: 'المشروبات الباردة', nameEn: 'Cold Beverages', description: 'مشروبات باردة منعشة', color: '#B8853F', order: 2, featured: true, status: 'active' },
      { name: 'القهوة العربية', nameEn: 'Arabic Coffee', description: 'قهوة عربية أصيلة', color: '#8B6B2D', order: 3, featured: true, status: 'active' },
      { name: 'الشاي', nameEn: 'Tea', description: 'شاي بأنواع مختلفة', color: '#6A5122', order: 4, featured: true, status: 'active' },
      { name: 'العصائر الطبيعية', nameEn: 'Natural Juices', description: 'عصائر طبيعية 100%', color: '#D9A65A', order: 5, featured: true, status: 'active' },
      { name: 'الكوكتيلات', nameEn: 'Cocktails', description: 'كوكتيلات منعشة', color: '#E0B777', order: 6, featured: true, status: 'active' },
      { name: 'الأطباق الرئيسية', nameEn: 'Main Dishes', description: 'أطباق رئيسية شهية', color: '#A67939', order: 7, featured: false, status: 'active' },
      { name: 'المقبلات', nameEn: 'Appetizers', description: 'مقبلات لذيذة', color: '#8B6914', order: 8, featured: false, status: 'active' },
      { name: 'البرجر', nameEn: 'Burgers', description: 'برجر طازج', color: '#CD853F', order: 9, featured: false, status: 'active' },
      { name: 'البيتزا', nameEn: 'Pizza', description: 'بيتزا إيطالية', color: '#DAA520', order: 10, featured: false, status: 'active' },
      { name: 'الساندويتشات', nameEn: 'Sandwiches', description: 'ساندويتشات متنوعة', color: '#B8860B', order: 11, featured: false, status: 'active' },
      { name: 'الحلويات', nameEn: 'Desserts', description: 'حلويات شرقية', color: '#D2691E', order: 12, featured: false, status: 'active' },
      { name: 'الشيشة', nameEn: 'Shisha', description: 'شيشة بنكهات مختلفة', color: '#C2914A', order: 13, featured: false, status: 'active' },
      { name: 'التبغ', nameEn: 'Tobacco', description: 'تبغ عالي الجودة', color: '#B8853F', order: 14, featured: false, status: 'active' }
    ];

    const categoriesWithIds = categories.map(cat => ({
      ...cat,
      image: `/images/categories/${cat.nameEn.toLowerCase().replace(/\s+/g, '-')}.jpg`,
      createdAt: new Date(),
      updatedAt: new Date()
    }));

    await Category.insertMany(categoriesWithIds);
    console.log(`✅ Generated ${categoriesWithIds.length} categories`);

    // Get the inserted categories with their _id fields
    const insertedCategories = await Category.find({}).sort({ order: 1 });
    console.log(`📋 Retrieved ${insertedCategories.length} categories with IDs`);

    // Generate Menu Items
    console.log('🍽️ Generating Menu Items...');
    const MenuItem = mongoose.model('MenuItem', new mongoose.Schema({
      name: String,
      nameEn: String,
      description: String,
      categoryId: String,
      price: Number,
      cost: Number,
      image: String,
      preparationTime: Number,
      calories: Number,
      status: String,
      featured: Boolean,
      order: Number,
      ingredients: Array,
      allergens: Array,
      createdAt: Date,
      updatedAt: Date
    }));

    const menuItems = [
      // Hot Beverages (index 0)
      { name: 'قهوة إسبريسو', nameEn: 'Espresso', categoryId: insertedCategories[0]._id, price: 20, cost: 6, prepTime: 3, calories: 40, featured: true },
      { name: 'قهوة لاتيه', nameEn: 'Latte', categoryId: insertedCategories[0]._id, price: 35, cost: 12, prepTime: 5, calories: 120, featured: true },
      { name: 'كابتشينو', nameEn: 'Cappuccino', categoryId: insertedCategories[0]._id, price: 32, cost: 11, prepTime: 4, calories: 100, featured: true },
      { name: 'موكا', nameEn: 'Mocha', categoryId: insertedCategories[0]._id, price: 38, cost: 14, prepTime: 6, calories: 150, featured: false },
      { name: 'أمريكانو', nameEn: 'Americano', categoryId: insertedCategories[0]._id, price: 22, cost: 7, prepTime: 4, calories: 45, featured: false },
      { name: 'ماكياتو', nameEn: 'Macchiato', categoryId: insertedCategories[0]._id, price: 28, cost: 9, prepTime: 4, calories: 80, featured: false },

      // Cold Beverages (index 1)
      { name: 'قهوة باردة', nameEn: 'Cold Coffee', categoryId: insertedCategories[1]._id, price: 28, cost: 9, prepTime: 4, calories: 150, featured: true },
      { name: 'فرابتشينو', nameEn: 'Frappuccino', categoryId: insertedCategories[1]._id, price: 40, cost: 14, prepTime: 6, calories: 200, featured: true },
      { name: 'آيس لاتيه', nameEn: 'Iced Latte', categoryId: insertedCategories[1]._id, price: 32, cost: 11, prepTime: 5, calories: 130, featured: false },
      { name: 'آيس كابتشينو', nameEn: 'Iced Cappuccino', categoryId: insertedCategories[1]._id, price: 30, cost: 10, prepTime: 5, calories: 110, featured: false },

      // Arabic Coffee (index 2)
      { name: 'قهوة عربية', nameEn: 'Arabic Coffee', categoryId: insertedCategories[2]._id, price: 25, cost: 8, prepTime: 5, calories: 50, featured: true },
      { name: 'قهوة تركية', nameEn: 'Turkish Coffee', categoryId: insertedCategories[2]._id, price: 30, cost: 10, prepTime: 8, calories: 60, featured: true },

      // Tea (index 3)
      { name: 'شاي أحمر', nameEn: 'Red Tea', categoryId: insertedCategories[3]._id, price: 15, cost: 5, prepTime: 3, calories: 30, featured: true },
      { name: 'شاي أخضر', nameEn: 'Green Tea', categoryId: insertedCategories[3]._id, price: 18, cost: 6, prepTime: 3, calories: 25, featured: true },
      { name: 'شاي بالحليب', nameEn: 'Tea with Milk', categoryId: insertedCategories[3]._id, price: 20, cost: 7, prepTime: 4, calories: 80, featured: true },
      { name: 'شاي بالنعناع', nameEn: 'Mint Tea', categoryId: insertedCategories[3]._id, price: 22, cost: 8, prepTime: 4, calories: 35, featured: false },
      { name: 'شاي بالزعفران', nameEn: 'Saffron Tea', categoryId: insertedCategories[3]._id, price: 35, cost: 15, prepTime: 5, calories: 40, featured: false },

      // Natural Juices (index 4)
      { name: 'عصير برتقال', nameEn: 'Orange Juice', categoryId: insertedCategories[4]._id, price: 22, cost: 8, prepTime: 3, calories: 120, featured: true },
      { name: 'عصير تفاح', nameEn: 'Apple Juice', categoryId: insertedCategories[4]._id, price: 25, cost: 9, prepTime: 3, calories: 110, featured: true },
      { name: 'عصير مانجو', nameEn: 'Mango Juice', categoryId: insertedCategories[4]._id, price: 30, cost: 11, prepTime: 4, calories: 140, featured: true },
      { name: 'عصير فراولة', nameEn: 'Strawberry Juice', categoryId: insertedCategories[4]._id, price: 28, cost: 10, prepTime: 4, calories: 130, featured: false },
      { name: 'عصير أناناس', nameEn: 'Pineapple Juice', categoryId: insertedCategories[4]._id, price: 32, cost: 12, prepTime: 4, calories: 150, featured: false },
      { name: 'عصير جزر', nameEn: 'Carrot Juice', categoryId: insertedCategories[4]._id, price: 26, cost: 9, prepTime: 4, calories: 100, featured: false },

      // Cocktails (index 5)
      { name: 'كوكتيل فواكه', nameEn: 'Fruit Cocktail', categoryId: insertedCategories[5]._id, price: 35, cost: 13, prepTime: 5, calories: 180, featured: true },
      { name: 'كوكتيل تروبيكال', nameEn: 'Tropical Cocktail', categoryId: insertedCategories[5]._id, price: 40, cost: 15, prepTime: 6, calories: 200, featured: false },
      { name: 'كوكتيل منعش', nameEn: 'Refreshing Cocktail', categoryId: insertedCategories[5]._id, price: 38, cost: 14, prepTime: 5, calories: 190, featured: false },

      // Main Dishes (index 6)
      { name: 'كباب لحم', nameEn: 'Meat Kebab', categoryId: insertedCategories[6]._id, price: 55, cost: 22, prepTime: 18, calories: 700, featured: true },
      { name: 'كباب دجاج', nameEn: 'Chicken Kebab', categoryId: insertedCategories[6]._id, price: 50, cost: 20, prepTime: 15, calories: 650, featured: true },
      { name: 'كباب مشكل', nameEn: 'Mixed Kebab', categoryId: insertedCategories[6]._id, price: 65, cost: 26, prepTime: 20, calories: 750, featured: false },
      { name: 'مشاوي لحم', nameEn: 'Grilled Meat', categoryId: insertedCategories[6]._id, price: 60, cost: 24, prepTime: 16, calories: 720, featured: false },
      { name: 'مشاوي دجاج', nameEn: 'Grilled Chicken', categoryId: insertedCategories[6]._id, price: 52, cost: 21, prepTime: 14, calories: 680, featured: false },

      // Appetizers (index 7)
      { name: 'حمص', nameEn: 'Hummus', categoryId: insertedCategories[7]._id, price: 25, cost: 10, prepTime: 5, calories: 200, featured: true },
      { name: 'متبل', nameEn: 'Moutabal', categoryId: insertedCategories[7]._id, price: 28, cost: 11, prepTime: 6, calories: 220, featured: true },
      { name: 'فتوش', nameEn: 'Fattoush', categoryId: insertedCategories[7]._id, price: 30, cost: 12, prepTime: 8, calories: 150, featured: true },
      { name: 'تبولة', nameEn: 'Tabbouleh', categoryId: insertedCategories[7]._id, price: 25, cost: 10, prepTime: 7, calories: 120, featured: false },
      { name: 'سلطة خضراء', nameEn: 'Green Salad', categoryId: insertedCategories[7]._id, price: 22, cost: 9, prepTime: 5, calories: 100, featured: false },
      { name: 'سلطة قيصر', nameEn: 'Caesar Salad', categoryId: insertedCategories[7]._id, price: 35, cost: 14, prepTime: 8, calories: 250, featured: false },

      // Burgers (index 8)
      { name: 'برجر لحم', nameEn: 'Beef Burger', categoryId: insertedCategories[8]._id, price: 45, cost: 18, prepTime: 15, calories: 600, featured: true },
      { name: 'برجر دجاج', nameEn: 'Chicken Burger', categoryId: insertedCategories[8]._id, price: 42, cost: 16, prepTime: 12, calories: 550, featured: true },
      { name: 'برجر نباتي', nameEn: 'Veggie Burger', categoryId: insertedCategories[8]._id, price: 38, cost: 15, prepTime: 10, calories: 450, featured: false },
      { name: 'برجر دبل', nameEn: 'Double Burger', categoryId: insertedCategories[8]._id, price: 65, cost: 26, prepTime: 18, calories: 850, featured: false },
      { name: 'برجر بالجبن', nameEn: 'Cheese Burger', categoryId: insertedCategories[8]._id, price: 48, cost: 19, prepTime: 16, calories: 650, featured: false },

      // Pizza (index 9)
      { name: 'بيتزا مارغريتا', nameEn: 'Margherita Pizza', categoryId: insertedCategories[9]._id, price: 65, cost: 25, prepTime: 20, calories: 800, featured: true },
      { name: 'بيتزا بيبروني', nameEn: 'Pepperoni Pizza', categoryId: insertedCategories[9]._id, price: 75, cost: 30, prepTime: 22, calories: 900, featured: true },
      { name: 'بيتزا خضار', nameEn: 'Vegetable Pizza', categoryId: insertedCategories[9]._id, price: 70, cost: 28, prepTime: 21, calories: 750, featured: false },
      { name: 'بيتزا دجاج', nameEn: 'Chicken Pizza', categoryId: insertedCategories[9]._id, price: 80, cost: 32, prepTime: 23, calories: 850, featured: false },
      { name: 'بيتزا مشكل', nameEn: 'Mixed Pizza', categoryId: insertedCategories[9]._id, price: 85, cost: 34, prepTime: 25, calories: 950, featured: false },

      // Sandwiches (index 10)
      { name: 'ساندويتش لحم', nameEn: 'Meat Sandwich', categoryId: insertedCategories[10]._id, price: 35, cost: 14, prepTime: 10, calories: 400, featured: true },
      { name: 'ساندويتش دجاج', nameEn: 'Chicken Sandwich', categoryId: insertedCategories[10]._id, price: 32, cost: 13, prepTime: 8, calories: 350, featured: true },
      { name: 'ساندويتش تونة', nameEn: 'Tuna Sandwich', categoryId: insertedCategories[10]._id, price: 30, cost: 12, prepTime: 8, calories: 380, featured: false },
      { name: 'ساندويتش جبن', nameEn: 'Cheese Sandwich', categoryId: insertedCategories[10]._id, price: 28, cost: 11, prepTime: 7, calories: 320, featured: false },
      { name: 'ساندويتش خضار', nameEn: 'Vegetable Sandwich', categoryId: insertedCategories[10]._id, price: 25, cost: 10, prepTime: 6, calories: 280, featured: false },

      // Desserts (index 11)
      { name: 'كنافة', nameEn: 'Knafeh', categoryId: insertedCategories[11]._id, price: 35, cost: 14, prepTime: 10, calories: 400, featured: true },
      { name: 'بقلاوة', nameEn: 'Baklava', categoryId: insertedCategories[11]._id, price: 40, cost: 16, prepTime: 5, calories: 350, featured: true },
      { name: 'أم علي', nameEn: 'Umm Ali', categoryId: insertedCategories[11]._id, price: 30, cost: 12, prepTime: 8, calories: 300, featured: true },
      { name: 'مهلبية', nameEn: 'Muhallabia', categoryId: insertedCategories[11]._id, price: 25, cost: 10, prepTime: 6, calories: 250, featured: false },
      { name: 'رز بالحليب', nameEn: 'Rice Pudding', categoryId: insertedCategories[11]._id, price: 28, cost: 11, prepTime: 7, calories: 280, featured: false },
      { name: 'لقيمات', nameEn: 'Luqaimat', categoryId: insertedCategories[11]._id, price: 32, cost: 13, prepTime: 9, calories: 320, featured: false },

      // Shisha (index 12)
      { name: 'شيشة تفاح', nameEn: 'Apple Shisha', categoryId: insertedCategories[12]._id, price: 60, cost: 20, prepTime: 5, calories: 0, featured: true },
      { name: 'شيشة عنب', nameEn: 'Grape Shisha', categoryId: insertedCategories[12]._id, price: 65, cost: 22, prepTime: 5, calories: 0, featured: true },
      { name: 'شيشة فراولة', nameEn: 'Strawberry Shisha', categoryId: insertedCategories[12]._id, price: 70, cost: 24, prepTime: 5, calories: 0, featured: true },
      { name: 'شيشة نعناع', nameEn: 'Mint Shisha', categoryId: insertedCategories[12]._id, price: 55, cost: 18, prepTime: 5, calories: 0, featured: false },
      { name: 'شيشة ورد', nameEn: 'Rose Shisha', categoryId: insertedCategories[12]._id, price: 68, cost: 23, prepTime: 5, calories: 0, featured: false },
      { name: 'شيشة مشكل', nameEn: 'Mixed Shisha', categoryId: insertedCategories[12]._id, price: 75, cost: 25, prepTime: 5, calories: 0, featured: false },

      // Tobacco (index 13)
      { name: 'تبغ عالي الجودة', nameEn: 'Premium Tobacco', categoryId: insertedCategories[13]._id, price: 45, cost: 15, prepTime: 0, calories: 0, featured: true },
      { name: 'تبغ بنكهة التفاح', nameEn: 'Apple Flavored Tobacco', categoryId: insertedCategories[13]._id, price: 50, cost: 18, prepTime: 0, calories: 0, featured: true },
      { name: 'تبغ بنكهة العنب', nameEn: 'Grape Flavored Tobacco', categoryId: insertedCategories[13]._id, price: 55, cost: 20, prepTime: 0, calories: 0, featured: false }
    ];

    const itemsWithIds = menuItems.map((item, index) => ({
      ...item,
      description: `وصف ${item.name} - طبق لذيذ ومشهي`,
      image: `/images/items/${item.nameEn.toLowerCase().replace(/\s+/g, '-')}.jpg`,
      preparationTime: item.prepTime,
      status: 'active',
      featured: item.featured,
      order: index + 1,
      ingredients: [
        { name: 'مكون أساسي', portion: 1, unit: 'piece' },
        { name: 'توابل', portion: 0.1, unit: 'g' }
      ],
      allergens: ['لا يحتوي على مسببات حساسية'],
      createdAt: new Date(),
      updatedAt: new Date()
    }));

    await MenuItem.insertMany(itemsWithIds);
    console.log(`✅ Generated ${itemsWithIds.length} menu items`);

    // Generate Materials
    console.log('📦 Generating Materials...');
    const Material = mongoose.model('Material', new mongoose.Schema({
      name: String,
      nameEn: String,
      description: String,
      unit: String,
      currentQuantity: Number,
      minLimit: Number,
      alertLimit: Number,
      costPerUnit: Number,
      supplier: String,
      category: String,
      status: String,
      createdAt: Date,
      updatedAt: Date
    }));

    const materials = [
      { name: 'قهوة عربية', unit: 'kg', currentQuantity: 15, minLimit: 3, costPerUnit: 45, category: 'food', supplier: 'مورد القهوة الأصيل' },
      { name: 'حليب طازج', unit: 'liter', currentQuantity: 25, minLimit: 5, costPerUnit: 8, category: 'beverage', supplier: 'مورد الألبان الطازجة' },
      { name: 'سكر أبيض', unit: 'kg', currentQuantity: 20, minLimit: 4, costPerUnit: 6, category: 'food', supplier: 'مورد السكر' },
      { name: 'لحم بقري طازج', unit: 'kg', currentQuantity: 12, minLimit: 3, costPerUnit: 85, category: 'food', supplier: 'مورد اللحوم الطازجة' },
      { name: 'دجاج طازج', unit: 'kg', currentQuantity: 18, minLimit: 4, costPerUnit: 35, category: 'food', supplier: 'مورد الدجاج الطازج' },
      { name: 'خبز عربي', unit: 'piece', currentQuantity: 150, minLimit: 30, costPerUnit: 2, category: 'food', supplier: 'مخبز الأصالة' },
      { name: 'جبن موزاريلا', unit: 'kg', currentQuantity: 8, minLimit: 2, costPerUnit: 25, category: 'food', supplier: 'مورد الأجبان' },
      { name: 'طماطم طازجة', unit: 'kg', currentQuantity: 15, minLimit: 4, costPerUnit: 12, category: 'food', supplier: 'مورد الخضار الطازجة' },
      { name: 'بصل أبيض', unit: 'kg', currentQuantity: 10, minLimit: 3, costPerUnit: 8, category: 'food', supplier: 'مورد الخضار الطازجة' },
      { name: 'خيار طازج', unit: 'kg', currentQuantity: 12, minLimit: 3, costPerUnit: 10, category: 'food', supplier: 'مورد الخضار الطازجة' },
      { name: 'زيت زيتون', unit: 'liter', currentQuantity: 8, minLimit: 2, costPerUnit: 35, category: 'food', supplier: 'مورد الزيوت' },
      { name: 'ليمون طازج', unit: 'kg', currentQuantity: 6, minLimit: 2, costPerUnit: 15, category: 'food', supplier: 'مورد الفواكه' },
      { name: 'نعناع طازج', unit: 'kg', currentQuantity: 4, minLimit: 1, costPerUnit: 20, category: 'food', supplier: 'مورد الأعشاب' },
      { name: 'تبغ الشيشة عالي الجودة', unit: 'kg', currentQuantity: 8, minLimit: 2, costPerUnit: 120, category: 'shisha', supplier: 'مورد التبغ الأصيل' },
      { name: 'فحم الشيشة', unit: 'kg', currentQuantity: 30, minLimit: 8, costPerUnit: 15, category: 'shisha', supplier: 'مورد الفحم الطبيعي' },
      { name: 'أكياس الشيشة', unit: 'piece', currentQuantity: 80, minLimit: 20, costPerUnit: 3, category: 'shisha', supplier: 'مورد الشيشة' },
      { name: 'أنابيب الشيشة', unit: 'piece', currentQuantity: 15, minLimit: 5, costPerUnit: 25, category: 'shisha', supplier: 'مورد الشيشة' },
      { name: 'مياه معدنية', unit: 'bottle', currentQuantity: 100, minLimit: 20, costPerUnit: 3, category: 'beverage', supplier: 'مورد المياه' }
    ];

    const materialsWithIds = materials.map(mat => ({
      ...mat,
      nameEn: mat.name,
      description: `مادة ${mat.name} عالية الجودة`,
      alertLimit: mat.minLimit + 3,
      status: 'active',
      createdAt: new Date(),
      updatedAt: new Date()
    }));

    await Material.insertMany(materialsWithIds);
    console.log(`✅ Generated ${materialsWithIds.length} materials`);

    // Generate Users
    console.log('👥 Generating Users...');
    const User = mongoose.model('User', new mongoose.Schema({
      username: String,
      password: String,
      role: String,
      name: String,
      isActive: Boolean,
      lastLogin: Date,
      createdAt: Date,
      updatedAt: Date
    }));

    const users = [
      { username: 'admin', password: 'admin2024', role: 'admin', name: 'مدير النظام', isActive: true },
      { username: 'kitchen', password: 'kitchen2024', role: 'kitchen', name: 'مطبخ', isActive: true },
      { username: 'barista', password: 'barista2024', role: 'barista', name: 'بارستا', isActive: true },
      { username: 'shisha', password: 'shisha2024', role: 'shisha', name: 'شيشة', isActive: true },
      { username: 'chef1', password: 'chef2024', role: 'kitchen', name: 'محمد الشيف', isActive: true },
      { username: 'chef2', password: 'chef2024', role: 'kitchen', name: 'أحمد الطباخ', isActive: true },
      { username: 'chef3', password: 'chef2024', role: 'kitchen', name: 'علي الشيف', isActive: true },
      { username: 'barista1', password: 'barista2024', role: 'barista', name: 'فاطمة البارستا', isActive: true },
      { username: 'barista2', password: 'barista2024', role: 'barista', name: 'علي البارستا', isActive: true },
      { username: 'barista3', password: 'barista2024', role: 'barista', name: 'سارة البارستا', isActive: true },
      { username: 'shisha1', password: 'shisha2024', role: 'shisha', name: 'سارة الشيشة', isActive: true },
      { username: 'shisha2', password: 'shisha2024', role: 'shisha', name: 'خالد الشيشة', isActive: true },
      { username: 'shisha3', password: 'shisha2024', role: 'shisha', name: 'نورا الشيشة', isActive: true }
    ];

    const usersWithIds = users.map(user => ({
      ...user,
      lastLogin: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000),
      createdAt: new Date(),
      updatedAt: new Date()
    }));

    await User.insertMany(usersWithIds);
    console.log(`✅ Generated ${usersWithIds.length} users`);

    // Generate Printers
    console.log('🖨️ Generating Printers...');
    const Printer = mongoose.model('Printer', new mongoose.Schema({
      name: String,
      department: String,
      connectionType: String,
      connectionDetails: Object,
      paperWidth: Number,
      isActive: Boolean,
      isOnline: Boolean,
      settings: Object,
      printCount: Number,
      errorCount: Number,
      createdAt: Date,
      updatedAt: Date
    }));

    const printers = [
      {
        name: 'طابعة المطبخ الرئيسية',
        department: 'kitchen',
        connectionType: 'LAN',
        connectionDetails: { ipAddress: '192.168.1.100', port: 9100 },
        paperWidth: 58,
        isActive: true,
        isOnline: true,
        settings: {
          copies: 1,
          printCustomerCopy: true,
          printInternalCopy: true,
          includeLogo: false,
          includeQRCode: true,
          fontSize: 'medium',
          paperCut: true,
          buzzer: true
        },
        printCount: 250,
        errorCount: 3
      },
      {
        name: 'طابعة البارستا الرئيسية',
        department: 'barista',
        connectionType: 'WiFi',
        connectionDetails: { ipAddress: '192.168.1.101', port: 9100 },
        paperWidth: 58,
        isActive: true,
        isOnline: true,
        settings: {
          copies: 1,
          printCustomerCopy: true,
          printInternalCopy: true,
          includeLogo: false,
          includeQRCode: true,
          fontSize: 'medium',
          paperCut: true,
          buzzer: true
        },
        printCount: 180,
        errorCount: 2
      },
      {
        name: 'طابعة الشيشة الرئيسية',
        department: 'shisha',
        connectionType: 'LAN',
        connectionDetails: { ipAddress: '192.168.1.102', port: 9100 },
        paperWidth: 80,
        isActive: true,
        isOnline: true,
        settings: {
          copies: 1,
          printCustomerCopy: true,
          printInternalCopy: true,
          includeLogo: false,
          includeQRCode: true,
          fontSize: 'medium',
          paperCut: true,
          buzzer: true
        },
        printCount: 120,
        errorCount: 1
      }
    ];

    const printersWithIds = printers.map(printer => ({
      ...printer,
      createdAt: new Date(),
      updatedAt: new Date()
    }));

    await Printer.insertMany(printersWithIds);
    console.log(`✅ Generated ${printersWithIds.length} printers`);

    // Generate Tax Settings
    console.log('💰 Generating Tax Settings...');
    const TaxSettings = mongoose.model('TaxSettings', new mongoose.Schema({
      enableTaxHandling: Boolean,
      taxType: String,
      vatRate: Number,
      includeTaxInPrice: Boolean,
      displayTaxBreakdown: Boolean,
      generateTaxReports: Boolean,
      taxNumber: String,
      complianceMode: String,
      createdAt: Date,
      updatedAt: Date
    }));

    const taxSettings = {
      enableTaxHandling: true,
      taxType: 'VAT',
      vatRate: 15,
      includeTaxInPrice: true,
      displayTaxBreakdown: true,
      generateTaxReports: true,
      taxNumber: '312345678901234',
      complianceMode: 'Saudi ZATCA',
      createdAt: new Date(),
      updatedAt: new Date()
    };

    await TaxSettings.create(taxSettings);
    console.log('✅ Generated tax settings');

    console.log('\n🎉 Essential Fake Data Generation Complete!');
    console.log('\n📊 Generated Data Summary:');
    console.log(`• Categories: ${categoriesWithIds.length}`);
    console.log(`• Menu Items: ${itemsWithIds.length}`);
    console.log(`• Materials: ${materialsWithIds.length}`);
    console.log(`• Users: ${usersWithIds.length}`);
    console.log(`• Printers: ${printersWithIds.length}`);
    console.log(`• Tax Settings: 1`);

    console.log('\n🔧 Test Data Features:');
    console.log('• Comprehensive Arabic restaurant menu');
    console.log('• Multi-department categories and items');
    console.log('• Tax calculations with Saudi VAT compliance');
    console.log('• Staff accounts for all departments');
    console.log('• Material inventory with costs and suppliers');
    console.log('• Printer configurations for all departments');
    console.log('• Rich menu data with prices and descriptions');

    console.log('\n📋 Ready for Testing!');
    console.log('Essential data is now available for testing all features.');

  } catch (error) {
    console.error('❌ Error generating essential fake data:', error);
  } finally {
    await mongoose.connection.close();
    console.log('\n🔌 Database connection closed');
  }
}

// Run the generation
generateEssentialData();
