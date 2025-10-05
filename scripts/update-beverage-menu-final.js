const mongoose = require('mongoose');

// Category Schema
const categorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  nameEn: {
    type: String,
    trim: true,
  },
  description: {
    type: String,
    trim: true,
  },
  image: {
    type: String,
  },
  color: {
    type: String,
    default: '#4F3500',
  },
  icon: {
    type: String,
  },
  order: {
    type: Number,
    default: 0,
  },
  featured: {
    type: Boolean,
    default: false,
  },
  featuredOrder: {
    type: Number,
    default: 0,
  },
  status: {
    type: String,
    enum: ['active', 'inactive'],
    default: 'active',
  },
}, {
  timestamps: true,
});

// MenuItem Schema
const menuItemSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  nameEn: {
    type: String,
    trim: true,
  },
  description: {
    type: String,
    trim: true,
  },
  descriptionEn: {
    type: String,
    trim: true,
  },
  categoryId: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    required: true,
    min: 0,
  },
  discountPrice: {
    type: Number,
    min: 0,
  },
  image: {
    type: String,
  },
  images: [{
    type: String,
  }],
  color: {
    type: String,
    default: '#4F3500',
  },
  ingredients: [{
    ingredientId: {
      type: String,
      required: true,
    },
    portion: {
      type: Number,
      required: true,
      default: 1,
    },
    required: {
      type: Boolean,
      default: true,
    },
  }],
  preparationTime: {
    type: Number,
    default: 0,
  },
  calories: {
    type: Number,
    default: 0,
  },
  servingSize: {
    type: String,
  },
  tags: [{
    type: String,
  }],
  allergens: [{
    type: String,
  }],
  status: {
    type: String,
    enum: ['active', 'inactive', 'out_of_stock'],
    default: 'active',
  },
  featured: {
    type: Boolean,
    default: false,
  },
  order: {
    type: Number,
    default: 0,
  },
}, {
  timestamps: true,
});

const Category = mongoose.models.Category || mongoose.model('Category', categorySchema);
const MenuItem = mongoose.models.MenuItem || mongoose.model('MenuItem', menuItemSchema);

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
    status: 'active'
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
    status: 'active'
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
    status: 'active'
  },
  {
    name: 'مشروبات الطاقة',
    nameEn: 'Energy Drinks',
    description: 'مشروبات الطاقة المنعشة',
    color: '#FFD700',
    icon: '⚡',
    order: 4,
    featured: false,
    status: 'active'
  },
  {
    name: 'مشروبات المهيتو',
    nameEn: 'Mojito Drinks',
    description: 'مشروبات المهيتو المنعشة بالنعناع',
    color: '#32CD32',
    icon: '🌿',
    order: 5,
    featured: false,
    status: 'active'
  },
  {
    name: 'المشروبات الغازية',
    nameEn: 'Soft Drinks',
    description: 'المشروبات الغازية والموسي',
    color: '#FF69B4',
    icon: '🥤',
    order: 6,
    featured: false,
    status: 'active'
  },
  {
    name: 'القهوة المقطرة',
    nameEn: 'Drip Coffee',
    description: 'قهوة مقطرة طازجة',
    color: '#654321',
    icon: '☕',
    order: 7,
    featured: false,
    status: 'active'
  },
  {
    name: 'الشاي',
    nameEn: 'Tea',
    description: 'شاي أثاي وطائفي وأحمر',
    color: '#8B0000',
    icon: '🍵',
    order: 8,
    featured: false,
    status: 'active'
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
    status: 'active'
  }
];

async function updateBeverageMenu() {
  try {
    console.log('Connecting to MongoDB...');
    
    // Connect to MongoDB using the same connection string as the app
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/maraksh-restaurant';
    await mongoose.connect(mongoUri);
    
    console.log('Clearing existing categories and menu items...');
    await MenuItem.deleteMany({});
    await Category.deleteMany({});
    
    console.log('Creating new beverage categories...');
    const createdCategories = await Category.insertMany(beverageCategories);
    
    console.log(`Successfully created ${createdCategories.length} categories:`);
    createdCategories.forEach((category, index) => {
      console.log(`${index + 1}. ${category.name} (${category.nameEn}) - Order: ${category.order}`);
    });
    
    // Create category map for menu items
    const categoryMap = {};
    createdCategories.forEach(cat => {
      categoryMap[cat.name] = cat._id;
    });
    
    // Menu items data
    const menuItems = [
      // Hot Coffee
      { name: 'اسبريسو', categoryId: categoryMap['القهوة الساخنة'], price: 12, order: 1, status: 'active' },
      { name: 'مكاتو', categoryId: categoryMap['القهوة الساخنة'], price: 14, order: 2, status: 'active' },
      { name: 'امريكانو', categoryId: categoryMap['القهوة الساخنة'], price: 14, order: 3, status: 'active' },
      { name: 'كورتادو', categoryId: categoryMap['القهوة الساخنة'], price: 15, order: 4, status: 'active' },
      { name: 'فلات وايت', categoryId: categoryMap['القهوة الساخنة'], price: 16, order: 5, status: 'active' },
      { name: 'لاتيه', categoryId: categoryMap['القهوة الساخنة'], price: 17, order: 6, status: 'active' },
      { name: 'كابتشينو', categoryId: categoryMap['القهوة الساخنة'], price: 17, order: 7, status: 'active' },
      { name: 'سبنش لاتيه', categoryId: categoryMap['القهوة الساخنة'], price: 19, order: 8, status: 'active' },
      { name: 'وايت موكا حار', categoryId: categoryMap['القهوة الساخنة'], price: 19, order: 9, status: 'active' },
      { name: 'موكا حار', categoryId: categoryMap['القهوة الساخنة'], price: 19, order: 10, status: 'active' },

      // Cold Beverages
      { name: 'ايس امريكانو', categoryId: categoryMap['المشروبات الباردة'], price: 18, order: 1, status: 'active' },
      { name: 'ايس لاتيه', categoryId: categoryMap['المشروبات الباردة'], price: 18, order: 2, status: 'active' },
      { name: 'ايس سبنش لاتيه', categoryId: categoryMap['المشروبات الباردة'], price: 20, order: 3, status: 'active' },
      { name: 'أيس وايت موكا', categoryId: categoryMap['المشروبات الباردة'], price: 20, order: 4, status: 'active' },
      { name: 'أيس موكا', categoryId: categoryMap['المشروبات الباردة'], price: 20, order: 5, status: 'active' },
      { name: 'أيس كركديه', categoryId: categoryMap['المشروبات الباردة'], price: 19, order: 6, status: 'active' },

      // Fresh Juices
      { name: 'برتقال', categoryId: categoryMap['عصائر طازجة'], price: 19, order: 1, status: 'active' },
      { name: 'منجا سادة', categoryId: categoryMap['عصائر طازجة'], price: 19, order: 2, status: 'active' },
      { name: 'منجا حليب', categoryId: categoryMap['عصائر طازجة'], price: 19, order: 3, status: 'active' },
      { name: 'ليمون سادة', categoryId: categoryMap['عصائر طازجة'], price: 16, order: 4, status: 'active' },
      { name: 'ليمون نعناع', categoryId: categoryMap['عصائر طازجة'], price: 19, order: 5, status: 'active' },
      { name: 'افكادو حليب', categoryId: categoryMap['عصائر طازجة'], price: 19, order: 6, status: 'active' },

      // Energy Drinks
      { name: 'ردبول', categoryId: categoryMap['مشروبات الطاقة'], price: 20, order: 1, status: 'active' },
      { name: 'كودرد', categoryId: categoryMap['مشروبات الطاقة'], price: 18, order: 2, status: 'active' },
      { name: 'ريتا', categoryId: categoryMap['مشروبات الطاقة'], price: 15, order: 3, status: 'active' },

      // Mojito Drinks
      { name: 'مهيتو ردبول', categoryId: categoryMap['مشروبات المهيتو'], price: 25, order: 1, status: 'active' },
      { name: 'مهيتو كودرد', categoryId: categoryMap['مشروبات المهيتو'], price: 22, order: 2, status: 'active' },
      { name: 'مهيتو ريتا', categoryId: categoryMap['مشروبات المهيتو'], price: 20, order: 3, status: 'active' },
      { name: 'مهيتو سفن', categoryId: categoryMap['مشروبات المهيتو'], price: 18, order: 4, status: 'active' },

      // Soft Drinks
      { name: 'سفن', categoryId: categoryMap['المشروبات الغازية'], price: 7, order: 1, status: 'active' },
      { name: 'حمضيات', categoryId: categoryMap['المشروبات الغازية'], price: 7, order: 2, status: 'active' },
      { name: 'ببسي', categoryId: categoryMap['المشروبات الغازية'], price: 7, order: 3, status: 'active' },
      { name: 'موسي فرولة', categoryId: categoryMap['المشروبات الغازية'], price: 19, order: 4, status: 'active' },
      { name: 'موسي شعير', categoryId: categoryMap['المشروبات الغازية'], price: 19, order: 5, status: 'active' },
      { name: 'موسي رمان', categoryId: categoryMap['المشروبات الغازية'], price: 19, order: 6, status: 'active' },

      // Drip Coffee
      { name: 'في60', categoryId: categoryMap['القهوة المقطرة'], price: 18, order: 1, status: 'active' },
      { name: 'ايس دريب', categoryId: categoryMap['القهوة المقطرة'], price: 18, order: 2, status: 'active' },

      // Tea
      { name: 'شاي أثاي براد كبير', categoryId: categoryMap['الشاي'], price: 25, order: 1, status: 'active' },
      { name: 'شاي أثاي براد وسط', categoryId: categoryMap['الشاي'], price: 18, order: 2, status: 'active' },
      { name: 'شاي أثاي براد صغير', categoryId: categoryMap['الشاي'], price: 14, order: 3, status: 'active' },
      { name: 'شاي طائفي براد كبير', categoryId: categoryMap['الشاي'], price: 25, order: 4, status: 'active' },
      { name: 'شاي طائفي براد وسط', categoryId: categoryMap['الشاي'], price: 18, order: 5, status: 'active' },
      { name: 'شاي طائفي براد صغير', categoryId: categoryMap['الشاي'], price: 14, order: 6, status: 'active' },
      { name: 'شاي أحمر براد كبير', categoryId: categoryMap['الشاي'], price: 25, order: 7, status: 'active' },
      { name: 'شاي أحمر براد وسط', categoryId: categoryMap['الشاي'], price: 18, order: 8, status: 'active' },
      { name: 'شاي أحمر براد صغير', categoryId: categoryMap['الشاي'], price: 14, order: 9, status: 'active' },

      // Coffee of the Day
      { name: 'قهوة اليوم حار', categoryId: categoryMap['قهوة اليوم'], price: 12, order: 1, status: 'active' },
      { name: 'قهوة اليوم بارد', categoryId: categoryMap['قهوة اليوم'], price: 12, order: 2, status: 'active' }
    ];
    
    console.log('Creating menu items...');
    const createdItems = await MenuItem.insertMany(menuItems);
    
    console.log(`Successfully created ${createdItems.length} menu items`);
    
    console.log('\n✅ Beverage menu update completed successfully!');
    console.log('📊 Summary:');
    console.log(`   - Categories: ${createdCategories.length}`);
    console.log(`   - Menu Items: ${createdItems.length}`);
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error updating beverage menu:', error);
    process.exit(1);
  }
}

// Run the script
updateBeverageMenu();

