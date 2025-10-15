/**
 * Comprehensive Fake Data Generation Script
 * Generates realistic test data for all system components
 */

const mongoose = require('mongoose');

// Connect to MongoDB
async function connectDB() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/menurwad');
    console.log('✅ Connected to MongoDB');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  }
}

// Fake data generators
const fakeData = {
  // Arabic restaurant names and items
  restaurantNames: [
    'مقهى مراكش',
    'مطعم الأصالة',
    'كافيه الرياض',
    'مقهى الحرمين',
    'مطعم الشام'
  ],

  // Menu categories with Arabic names
  categories: [
    { name: 'المشروبات الساخنة', nameEn: 'Hot Beverages', department: 'barista' },
    { name: 'المشروبات الباردة', nameEn: 'Cold Beverages', department: 'barista' },
    { name: 'القهوة العربية', nameEn: 'Arabic Coffee', department: 'barista' },
    { name: 'الشاي', nameEn: 'Tea', department: 'barista' },
    { name: 'العصائر الطبيعية', nameEn: 'Natural Juices', department: 'barista' },
    { name: 'الكوكتيلات', nameEn: 'Cocktails', department: 'barista' },
    { name: 'الأطباق الرئيسية', nameEn: 'Main Dishes', department: 'kitchen' },
    { name: 'المقبلات', nameEn: 'Appetizers', department: 'kitchen' },
    { name: 'البرجر', nameEn: 'Burgers', department: 'kitchen' },
    { name: 'البيتزا', nameEn: 'Pizza', department: 'kitchen' },
    { name: 'الساندويتشات', nameEn: 'Sandwiches', department: 'kitchen' },
    { name: 'الحلويات', nameEn: 'Desserts', department: 'kitchen' },
    { name: 'الشيشة', nameEn: 'Shisha', department: 'shisha' },
    { name: 'التبغ', nameEn: 'Tobacco', department: 'shisha' }
  ],

  // Menu items with Arabic names
  menuItems: [
    // Hot Beverages
    { name: 'قهوة عربية', nameEn: 'Arabic Coffee', category: 'القهوة العربية', price: 25, cost: 8, prepTime: 5 },
    { name: 'قهوة تركية', nameEn: 'Turkish Coffee', category: 'القهوة العربية', price: 30, cost: 10, prepTime: 8 },
    { name: 'قهوة إسبريسو', nameEn: 'Espresso', category: 'المشروبات الساخنة', price: 20, cost: 6, prepTime: 3 },
    { name: 'قهوة لاتيه', nameEn: 'Latte', category: 'المشروبات الساخنة', price: 35, cost: 12, prepTime: 5 },
    { name: 'كابتشينو', nameEn: 'Cappuccino', category: 'المشروبات الساخنة', price: 32, cost: 11, prepTime: 4 },
    { name: 'شاي أحمر', nameEn: 'Red Tea', category: 'الشاي', price: 15, cost: 5, prepTime: 3 },
    { name: 'شاي أخضر', nameEn: 'Green Tea', category: 'الشاي', price: 18, cost: 6, prepTime: 3 },
    { name: 'شاي بالحليب', nameEn: 'Tea with Milk', category: 'الشاي', price: 20, cost: 7, prepTime: 4 },

    // Cold Beverages
    { name: 'قهوة باردة', nameEn: 'Cold Coffee', category: 'المشروبات الباردة', price: 28, cost: 9, prepTime: 4 },
    { name: 'فرابتشينو', nameEn: 'Frappuccino', category: 'المشروبات الباردة', price: 40, cost: 14, prepTime: 6 },
    { name: 'عصير برتقال', nameEn: 'Orange Juice', category: 'العصائر الطبيعية', price: 22, cost: 8, prepTime: 3 },
    { name: 'عصير تفاح', nameEn: 'Apple Juice', category: 'العصائر الطبيعية', price: 25, cost: 9, prepTime: 3 },
    { name: 'عصير مانجو', nameEn: 'Mango Juice', category: 'العصائر الطبيعية', price: 30, cost: 11, prepTime: 4 },
    { name: 'كوكتيل فواكه', nameEn: 'Fruit Cocktail', category: 'الكوكتيلات', price: 35, cost: 13, prepTime: 5 },

    // Main Dishes
    { name: 'برجر لحم', nameEn: 'Beef Burger', category: 'البرجر', price: 45, cost: 18, prepTime: 15 },
    { name: 'برجر دجاج', nameEn: 'Chicken Burger', category: 'البرجر', price: 42, cost: 16, prepTime: 12 },
    { name: 'بيتزا مارغريتا', nameEn: 'Margherita Pizza', category: 'البيتزا', price: 65, cost: 25, prepTime: 20 },
    { name: 'بيتزا بيبروني', nameEn: 'Pepperoni Pizza', category: 'البيتزا', price: 75, cost: 30, prepTime: 22 },
    { name: 'ساندويتش لحم', nameEn: 'Meat Sandwich', category: 'الساندويتشات', price: 35, cost: 14, prepTime: 10 },
    { name: 'ساندويتش دجاج', nameEn: 'Chicken Sandwich', category: 'الساندويتشات', price: 32, cost: 13, prepTime: 8 },
    { name: 'كباب لحم', nameEn: 'Meat Kebab', category: 'الأطباق الرئيسية', price: 55, cost: 22, prepTime: 18 },
    { name: 'كباب دجاج', nameEn: 'Chicken Kebab', category: 'الأطباق الرئيسية', price: 50, cost: 20, prepTime: 15 },

    // Appetizers
    { name: 'حمص', nameEn: 'Hummus', category: 'المقبلات', price: 25, cost: 10, prepTime: 5 },
    { name: 'متبل', nameEn: 'Moutabal', category: 'المقبلات', price: 28, cost: 11, prepTime: 6 },
    { name: 'فتوش', nameEn: 'Fattoush', category: 'المقبلات', price: 30, cost: 12, prepTime: 8 },
    { name: 'تبولة', nameEn: 'Tabbouleh', category: 'المقبلات', price: 25, cost: 10, prepTime: 7 },

    // Desserts
    { name: 'كنافة', nameEn: 'Knafeh', category: 'الحلويات', price: 35, cost: 14, prepTime: 10 },
    { name: 'بقلاوة', nameEn: 'Baklava', category: 'الحلويات', price: 40, cost: 16, prepTime: 5 },
    { name: 'أم علي', nameEn: 'Umm Ali', category: 'الحلويات', price: 30, cost: 12, prepTime: 8 },
    { name: 'مهلبية', nameEn: 'Muhallabia', category: 'الحلويات', price: 25, cost: 10, prepTime: 6 },

    // Shisha
    { name: 'شيشة تفاح', nameEn: 'Apple Shisha', category: 'الشيشة', price: 60, cost: 20, prepTime: 5 },
    { name: 'شيشة عنب', nameEn: 'Grape Shisha', category: 'الشيشة', price: 65, cost: 22, prepTime: 5 },
    { name: 'شيشة فراولة', nameEn: 'Strawberry Shisha', category: 'الشيشة', price: 70, cost: 24, prepTime: 5 },
    { name: 'شيشة نعناع', nameEn: 'Mint Shisha', category: 'الشيشة', price: 55, cost: 18, prepTime: 5 }
  ],

  // Customer names (Arabic)
  customerNames: [
    'أحمد محمد',
    'فاطمة علي',
    'محمد عبدالله',
    'عائشة حسن',
    'عبدالرحمن سالم',
    'نورا أحمد',
    'خالد المطيري',
    'سارة العتيبي',
    'يوسف القحطاني',
    'مريم الشهري',
    'عبدالعزيز الغامدي',
    'لينا الحربي',
    'سعد الدوسري',
    'ريم الزهراني',
    'تركي العنزي'
  ],

  // Phone numbers (Saudi format)
  phoneNumbers: [
    '0501234567', '0502345678', '0503456789', '0504567890',
    '0505678901', '0506789012', '0507890123', '0508901234',
    '0509012345', '0500123456', '0511234567', '0512345678',
    '0513456789', '0514567890', '0515678901'
  ],

  // Staff names
  staffNames: [
    { name: 'محمد الشيف', role: 'kitchen' },
    { name: 'أحمد الطباخ', role: 'kitchen' },
    { name: 'فاطمة البارستا', role: 'barista' },
    { name: 'علي البارستا', role: 'barista' },
    { name: 'سارة الشيشة', role: 'shisha' },
    { name: 'خالد الشيشة', role: 'shisha' }
  ],

  // Materials for inventory
  materials: [
    { name: 'قهوة عربية', category: 'food', unit: 'kg', costPerUnit: 45, currentQuantity: 10, minLimit: 2 },
    { name: 'حليب', category: 'beverage', unit: 'liter', costPerUnit: 8, currentQuantity: 20, minLimit: 5 },
    { name: 'سكر', category: 'food', unit: 'kg', costPerUnit: 6, currentQuantity: 15, minLimit: 3 },
    { name: 'لحم بقري', category: 'food', unit: 'kg', costPerUnit: 85, currentQuantity: 8, minLimit: 2 },
    { name: 'دجاج', category: 'food', unit: 'kg', costPerUnit: 35, currentQuantity: 12, minLimit: 3 },
    { name: 'خبز', category: 'food', unit: 'piece', costPerUnit: 2, currentQuantity: 100, minLimit: 20 },
    { name: 'جبن', category: 'food', unit: 'kg', costPerUnit: 25, currentQuantity: 6, minLimit: 2 },
    { name: 'طماطم', category: 'food', unit: 'kg', costPerUnit: 12, currentQuantity: 10, minLimit: 3 },
    { name: 'بصل', category: 'food', unit: 'kg', costPerUnit: 8, currentQuantity: 8, minLimit: 2 },
    { name: 'تبغ الشيشة', category: 'shisha', unit: 'kg', costPerUnit: 120, currentQuantity: 5, minLimit: 1 },
    { name: 'فحم الشيشة', category: 'shisha', unit: 'kg', costPerUnit: 15, currentQuantity: 20, minLimit: 5 },
    { name: 'أكياس الشيشة', category: 'shisha', unit: 'piece', costPerUnit: 3, currentQuantity: 50, minLimit: 10 }
  ],

  // Waste reasons
  wasteReasons: [
    'spoiled', 'broken', 'expired', 'damaged', 'overcooked', 'spilled', 'other'
  ],

  // Waste items
  wasteItems: [
    'خبز منتهي الصلاحية',
    'حليب فاسد',
    'طماطم تالفة',
    'بيض مكسور',
    'لحم محترق',
    'قهوة منسكبة',
    'صحن مكسور',
    'كوب مكسور'
  ]
};

// Generate random date within range
function randomDate(start, end) {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}

// Generate random number within range
function randomBetween(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Generate random item from array
function randomItem(array) {
  return array[Math.floor(Math.random() * array.length)];
}

// Generate multiple random items from array
function randomItems(array, count) {
  const shuffled = [...array].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
}

async function generateCategories() {
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

  const categories = fakeData.categories.map((cat, index) => ({
    name: cat.name,
    nameEn: cat.nameEn,
    description: `فئة ${cat.name}`,
    image: `/images/categories/${cat.nameEn.toLowerCase().replace(/\s+/g, '-')}.jpg`,
    color: ['#C2914A', '#B8853F', '#8B6B2D', '#6A5122'][index % 4],
    order: index + 1,
    featured: index < 6, // First 6 categories are featured
    status: 'active',
    createdAt: new Date(),
    updatedAt: new Date()
  }));

  await Category.insertMany(categories);
  console.log(`✅ Generated ${categories.length} categories`);
  
  return categories;
}

async function generateMenuItems(categories) {
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
    createdAt: Date,
    updatedAt: Date
  }));

  const menuItems = fakeData.menuItems.map((item, index) => {
    const category = categories.find(cat => cat.name === item.category);
    const categoryId = category ? category._id : categories[0]._id;
    
    return {
      name: item.name,
      nameEn: item.nameEn,
      description: `وصف ${item.name}`,
      categoryId: categoryId,
      price: item.price,
      cost: item.cost,
      image: `/images/items/${item.nameEn.toLowerCase().replace(/\s+/g, '-')}.jpg`,
      preparationTime: item.prepTime,
      calories: randomBetween(100, 800),
      status: 'active',
      featured: index < 10, // First 10 items are featured
      order: index + 1,
      createdAt: new Date(),
      updatedAt: new Date()
    };
  });

  await MenuItem.insertMany(menuItems);
  console.log(`✅ Generated ${menuItems.length} menu items`);
  
  return menuItems;
}

async function generateMaterials() {
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

  const materials = fakeData.materials.map((mat, index) => ({
    name: mat.name,
    nameEn: mat.name,
    description: `مادة ${mat.name}`,
    unit: mat.unit,
    currentQuantity: mat.currentQuantity,
    minLimit: mat.minLimit,
    alertLimit: mat.minLimit + 2,
    costPerUnit: mat.costPerUnit,
    supplier: `مورد ${index + 1}`,
    category: mat.category,
    status: 'active',
    createdAt: new Date(),
    updatedAt: new Date()
  }));

  await Material.insertMany(materials);
  console.log(`✅ Generated ${materials.length} materials`);
  
  return materials;
}

async function generateUsers() {
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
    ...fakeData.staffNames.map((staff, index) => ({
      username: `staff${index + 1}`,
      password: 'staff2024',
      role: staff.role,
      name: staff.name,
      isActive: true,
      lastLogin: randomDate(new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), new Date())
    }))
  ];

  await User.insertMany(users);
  console.log(`✅ Generated ${users.length} users`);
  
  return users;
}

async function generatePrinters() {
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
      name: 'طابعة المطبخ',
      department: 'kitchen',
      connectionType: 'LAN',
      connectionDetails: {
        ipAddress: '192.168.1.100',
        port: 9100
      },
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
      printCount: randomBetween(50, 200),
      errorCount: randomBetween(0, 5),
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      name: 'طابعة البارستا',
      department: 'barista',
      connectionType: 'WiFi',
      connectionDetails: {
        ipAddress: '192.168.1.101',
        port: 9100
      },
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
      printCount: randomBetween(30, 150),
      errorCount: randomBetween(0, 3),
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      name: 'طابعة الشيشة',
      department: 'shisha',
      connectionType: 'LAN',
      connectionDetails: {
        ipAddress: '192.168.1.102',
        port: 9100
      },
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
      printCount: randomBetween(20, 100),
      errorCount: randomBetween(0, 2),
      createdAt: new Date(),
      updatedAt: new Date()
    }
  ];

  await Printer.insertMany(printers);
  console.log(`✅ Generated ${printers.length} printers`);
  
  return printers;
}

async function generateOrders(menuItems, users, categories) {
  console.log('📋 Generating Orders...');
  
  const Order = mongoose.model('Order', new mongoose.Schema({
    orderNumber: String,
    items: Array,
    totalAmount: Number,
    discountAmount: Number,
    taxInfo: Object,
    customerInfo: Object,
    status: String,
    departmentStatuses: Object,
    orderDate: Date,
    source: String,
    notes: String,
    assignedTo: Object,
    createdAt: Date,
    updatedAt: Date
  }));

  const orders = [];
  const now = new Date();
  const startDate = new Date(now.getTime() - (30 * 24 * 60 * 60 * 1000)); // 30 days ago

  for (let i = 0; i < 100; i++) {
    const orderDate = randomDate(startDate, now);
    const customerName = randomItem(fakeData.customerNames);
    const phone = randomItem(fakeData.phoneNumbers);
    const tableNumber = randomBetween(1, 20);
    
    // Generate 1-5 random items per order
    const itemCount = randomBetween(1, 5);
    const selectedItems = randomItems(menuItems, itemCount);
    
    const orderItems = selectedItems.map(item => {
      const quantity = randomBetween(1, 3);
      const unitPrice = item.price;
      const totalPrice = unitPrice * quantity;
      
      // Determine department based on category name
      let department = 'kitchen';
      const category = categories.find(cat => cat._id.toString() === item.categoryId);
      const categoryName = category?.name || '';
      if (categoryName.includes('قهوة') || categoryName.includes('شاي') || categoryName.includes('عصير') || categoryName.includes('كوكتيل') || categoryName.includes('مشروب')) {
        department = 'barista';
      } else if (categoryName.includes('شيشة') || categoryName.includes('تبغ')) {
        department = 'shisha';
      }
      
      return {
        menuItemId: item._id.toString(),
        menuItemName: item.name,
        menuItemNameEn: item.nameEn,
        quantity: quantity,
        unitPrice: unitPrice,
        totalPrice: totalPrice,
        department: department,
        departmentStatus: randomItem(['pending', 'in_progress', 'ready', 'served']),
        estimatedPrepTime: item.preparationTime || randomBetween(5, 20)
      };
    });

    const totalAmount = orderItems.reduce((sum, item) => sum + item.totalPrice, 0);
    const discountAmount = Math.random() > 0.8 ? randomBetween(5, 20) : 0; // 20% chance of discount
    
    // Calculate tax (15% VAT)
    const subtotal = totalAmount - discountAmount;
    const taxAmount = (subtotal * 15) / 115; // Tax included in price
    const finalAmount = subtotal;

    const statuses = ['pending', 'confirmed', 'preparing', 'ready', 'delivered', 'cancelled'];
    const status = randomItem(statuses);
    
    // Assign staff based on departments in order
    const departments = [...new Set(orderItems.map(item => item.department))];
    const assignedTo = {};
    departments.forEach(dept => {
      const staffForDept = users.filter(user => user.role === dept);
      if (staffForDept.length > 0) {
        assignedTo[dept] = randomItem(staffForDept)._id.toString();
      }
    });

    const order = {
      orderNumber: `#${Date.now().toString().slice(-6)}${i.toString().padStart(2, '0')}`,
      items: orderItems,
      totalAmount: finalAmount,
      discountAmount: discountAmount,
      taxInfo: {
        subtotal: subtotal - taxAmount,
        taxRate: 15,
        taxAmount: taxAmount,
        includeTaxInPrice: true
      },
      customerInfo: {
        name: customerName,
        phone: phone,
        address: `الرياض، المملكة العربية السعودية`
      },
      status: status,
      departmentStatuses: {
        kitchen: randomItem(['pending', 'in_progress', 'ready', 'served']),
        barista: randomItem(['pending', 'in_progress', 'ready', 'served']),
        shisha: randomItem(['pending', 'in_progress', 'ready', 'served'])
      },
      orderDate: orderDate,
      source: randomItem(['website_whatsapp', 'manual', 'website']),
      notes: `طاولة رقم ${tableNumber}`,
      assignedTo: assignedTo,
      createdAt: orderDate,
      updatedAt: orderDate
    };

    orders.push(order);
  }

  await Order.insertMany(orders);
  console.log(`✅ Generated ${orders.length} orders`);
  
  return orders;
}

async function generateWasteLogs(materials, users) {
  console.log('🗑️ Generating Waste Logs...');
  
  const WasteLog = mongoose.model('WasteLog', new mongoose.Schema({
    itemName: String,
    itemId: String,
    category: String,
    quantity: Number,
    unit: String,
    cost: Number,
    reason: String,
    description: String,
    department: String,
    loggedBy: String,
    wasteDate: Date,
    isRecoverable: Boolean,
    recoveryAction: String,
    createdAt: Date,
    updatedAt: Date
  }));

  const wasteLogs = [];
  const now = new Date();
  const startDate = new Date(now.getTime() - (7 * 24 * 60 * 60 * 1000)); // 7 days ago

  for (let i = 0; i < 50; i++) {
    const material = randomItem(materials);
    const user = randomItem(users);
    const wasteDate = randomDate(startDate, now);
    const quantity = randomBetween(1, 5);
    const cost = quantity * material.costPerUnit * (0.1 + Math.random() * 0.9); // 10-100% of material cost
    
    const wasteLog = {
      itemName: material.name,
      itemId: material._id.toString(),
      category: material.category,
      quantity: quantity,
      unit: material.unit,
      cost: Math.round(cost * 100) / 100,
      reason: randomItem(fakeData.wasteReasons),
      description: `هدر ${material.name}`,
      department: randomItem(['kitchen', 'barista', 'shisha', 'general']),
      loggedBy: user.name,
      wasteDate: wasteDate,
      isRecoverable: Math.random() > 0.7, // 30% chance of being recoverable
      recoveryAction: Math.random() > 0.7 ? 'إعادة تدوير' : undefined,
      createdAt: wasteDate,
      updatedAt: wasteDate
    };

    wasteLogs.push(wasteLog);
  }

  await WasteLog.insertMany(wasteLogs);
  console.log(`✅ Generated ${wasteLogs.length} waste logs`);
  
  return wasteLogs;
}

async function generateMaterialUsage(orders, materials) {
  console.log('📊 Generating Material Usage...');
  
  const MaterialUsage = mongoose.model('MaterialUsage', new mongoose.Schema({
    materialId: String,
    materialName: String,
    quantityUsed: Number,
    unit: String,
    orderId: String,
    orderNumber: String,
    menuItemId: String,
    menuItemName: String,
    department: String,
    usageType: String,
    usedBy: String,
    usageDate: Date,
    createdAt: Date,
    updatedAt: Date
  }));

  const materialUsage = [];
  
  orders.forEach(order => {
    order.items.forEach(item => {
      // Generate 1-3 material usages per item
      const usageCount = randomBetween(1, 3);
      const selectedMaterials = randomItems(materials, usageCount);
      
      selectedMaterials.forEach(material => {
        const quantityUsed = randomBetween(1, 5);
        
        materialUsage.push({
          materialId: material._id.toString(),
          materialName: material.name,
          quantityUsed: quantityUsed,
          unit: material.unit,
          orderId: order._id.toString(),
          orderNumber: order.orderNumber,
          menuItemId: item.menuItemId,
          menuItemName: item.menuItemName,
          department: item.department,
          usageType: 'order',
          usedBy: 'system',
          usageDate: order.orderDate,
          createdAt: order.orderDate,
          updatedAt: order.orderDate
        });
      });
    });
  });

  await MaterialUsage.insertMany(materialUsage);
  console.log(`✅ Generated ${materialUsage.length} material usage records`);
  
  return materialUsage;
}

async function generatePrintJobs(orders, printers) {
  console.log('🖨️ Generating Print Jobs...');
  
  const PrintJob = mongoose.model('PrintJob', new mongoose.Schema({
    jobId: String,
    printerId: String,
    printerName: String,
    department: String,
    orderId: String,
    orderNumber: String,
    jobType: String,
    status: String,
    priority: String,
    ticketData: Object,
    printSettings: Object,
    attempts: Number,
    maxAttempts: Number,
    errorMessage: String,
    startedAt: Date,
    completedAt: Date,
    createdBy: String,
    createdAt: Date,
    updatedAt: Date
  }));

  const printJobs = [];
  
  orders.forEach(order => {
    // Group items by department
    const itemsByDepartment = new Map();
    order.items.forEach(item => {
      const dept = item.department;
      if (!itemsByDepartment.has(dept)) {
        itemsByDepartment.set(dept, []);
      }
      itemsByDepartment.get(dept).push(item);
    });

    // Create print jobs for each department
    itemsByDepartment.forEach((items, department) => {
      const printer = printers.find(p => p.department === department);
      if (printer) {
        const jobId = `job_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;
        const status = randomItem(['completed', 'completed', 'completed', 'failed', 'pending']); // 75% success rate
        const startedAt = new Date(order.orderDate.getTime() + randomBetween(1, 300) * 1000); // 1-5 minutes after order
        const completedAt = status === 'completed' ? new Date(startedAt.getTime() + randomBetween(2, 10) * 1000) : undefined;
        
        const printJob = {
          jobId: jobId,
          printerId: printer._id.toString(),
          printerName: printer.name,
          department: department,
          orderId: order._id.toString(),
          orderNumber: order.orderNumber,
          jobType: 'order',
          status: status,
          priority: randomItem(['normal', 'normal', 'normal', 'high']), // 75% normal, 25% high
          ticketData: {
            items: items.map(item => ({
              name: item.menuItemName,
              nameEn: item.menuItemNameEn,
              quantity: item.quantity,
              unitPrice: item.unitPrice,
              totalPrice: item.totalPrice
            })),
            customerInfo: order.customerInfo,
            orderInfo: {
              orderNumber: order.orderNumber,
              orderDate: order.orderDate,
              totalAmount: order.totalAmount,
              taxInfo: order.taxInfo
            },
            departmentInfo: {
              department: department,
              assignedTo: order.assignedTo?.[department],
              estimatedPrepTime: items.reduce((sum, item) => sum + (item.estimatedPrepTime || 15), 0)
            }
          },
          printSettings: printer.settings,
          attempts: status === 'failed' ? randomBetween(1, 3) : 1,
          maxAttempts: 3,
          errorMessage: status === 'failed' ? 'فشل في الاتصال بالطابعة' : undefined,
          startedAt: startedAt,
          completedAt: completedAt,
          createdBy: 'system',
          createdAt: order.orderDate,
          updatedAt: completedAt || startedAt
        };

        printJobs.push(printJob);
      }
    });
  });

  await PrintJob.insertMany(printJobs);
  console.log(`✅ Generated ${printJobs.length} print jobs`);
  
  return printJobs;
}

async function generateTaxSettings() {
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
  
  return taxSettings;
}

async function generateAnalyticsReports(orders, wasteLogs, materialUsage) {
  console.log('📊 Generating Analytics Reports...');
  
  const AnalyticsReport = mongoose.model('AnalyticsReport', new mongoose.Schema({
    reportType: String,
    period: String,
    startDate: Date,
    endDate: Date,
    generatedAt: Date,
    generatedBy: String,
    salesData: Object,
    revenueData: Object,
    profitData: Object,
    bestSellingData: Object,
    peakHoursData: Object,
    staffPerformanceData: Array,
    inventoryData: Object,
    wasteData: Object,
    kpis: Object,
    createdAt: Date,
    updatedAt: Date
  }));

  // Generate comprehensive report for last 30 days
  const endDate = new Date();
  const startDate = new Date(endDate.getTime() - (30 * 24 * 60 * 60 * 1000));
  
  const recentOrders = orders.filter(order => 
    order.orderDate >= startDate && order.orderDate <= endDate
  );

  const totalSales = recentOrders.reduce((sum, order) => sum + order.totalAmount, 0);
  const totalOrders = recentOrders.length;
  const averageOrderValue = totalOrders > 0 ? totalSales / totalOrders : 0;

  const report = {
    reportType: 'comprehensive',
    period: 'month',
    startDate: startDate,
    endDate: endDate,
    generatedAt: new Date(),
    generatedBy: 'system',
    salesData: {
      totalSales: totalSales,
      totalOrders: totalOrders,
      averageOrderValue: averageOrderValue,
      salesByDay: [], // Would be calculated in real implementation
      salesByHour: [] // Would be calculated in real implementation
    },
    revenueData: {
      totalRevenue: totalSales,
      revenueByDepartment: [
        { department: 'kitchen', revenue: totalSales * 0.4, percentage: 40 },
        { department: 'barista', revenue: totalSales * 0.35, percentage: 35 },
        { department: 'shisha', revenue: totalSales * 0.25, percentage: 25 }
      ],
      revenueByCategory: [] // Would be calculated in real implementation
    },
    profitData: {
      totalProfit: totalSales * 0.3, // 30% profit margin
      totalCost: totalSales * 0.7,
      profitMargin: 30,
      topProfitableItems: [],
      topProfitableCategories: []
    },
    bestSellingData: {
      topItems: [],
      topCategories: []
    },
    peakHoursData: {
      peakHours: [],
      busiestDay: 'الجمعة',
      quietestDay: 'الثلاثاء',
      averageOrdersPerHour: totalOrders / (30 * 12) // Assuming 12 hours operation
    },
    staffPerformanceData: [],
    inventoryData: {
      turnoverRate: 2.5,
      fastMovingItems: [],
      slowMovingItems: [],
      totalInventoryValue: 5000,
      costOfGoodsSold: totalSales * 0.7
    },
    wasteData: {
      totalWasteCost: wasteLogs.reduce((sum, log) => sum + log.cost, 0),
      wasteByCategory: [],
      wasteTrends: [],
      topWasteItems: []
    },
    kpis: {
      totalSales: totalSales,
      totalProfit: totalSales * 0.3,
      ordersToday: recentOrders.filter(order => 
        order.orderDate.toDateString() === endDate.toDateString()
      ).length,
      topItem: 'قهوة عربية',
      averageOrderValue: averageOrderValue,
      profitMargin: 30,
      inventoryTurnover: 2.5,
      staffEfficiency: 8.5
    },
    createdAt: new Date(),
    updatedAt: new Date()
  };

  await AnalyticsReport.create(report);
  console.log('✅ Generated analytics report');
  
  return report;
}

async function generateAllFakeData() {
  console.log('🚀 Starting Fake Data Generation...\n');
  
  try {
    await connectDB();
    
    // Clear existing data (optional - uncomment if you want to start fresh)
    console.log('🧹 Clearing existing data...');
    const collections = ['categories', 'menuitems', 'materials', 'users', 'orders', 'wastelogs', 'materialusages', 'printjobs', 'printers', 'taxsettings', 'analyticsreports'];
    
    for (const collection of collections) {
      try {
        await mongoose.connection.db.collection(collection).deleteMany({});
        console.log(`   Cleared ${collection}`);
      } catch (error) {
        // Collection might not exist, that's okay
      }
    }
    
    console.log('');

    // Generate data in order of dependencies
    const categories = await generateCategories();
    const menuItems = await generateMenuItems(categories);
    const materials = await generateMaterials();
    const users = await generateUsers();
    const printers = await generatePrinters();
    const orders = await generateOrders(menuItems, users, categories);
    const wasteLogs = await generateWasteLogs(materials, users);
    const materialUsage = await generateMaterialUsage(orders, materials);
    const printJobs = await generatePrintJobs(orders, printers);
    const taxSettings = await generateTaxSettings();
    const analyticsReport = await generateAnalyticsReports(orders, wasteLogs, materialUsage);

    console.log('\n🎉 Fake Data Generation Complete!');
    console.log('\n📊 Generated Data Summary:');
    console.log(`• Categories: ${categories.length}`);
    console.log(`• Menu Items: ${menuItems.length}`);
    console.log(`• Materials: ${materials.length}`);
    console.log(`• Users: ${users.length}`);
    console.log(`• Printers: ${printers.length}`);
    console.log(`• Orders: ${orders.length}`);
    console.log(`• Waste Logs: ${wasteLogs.length}`);
    console.log(`• Material Usage: ${materialUsage.length}`);
    console.log(`• Print Jobs: ${printJobs.length}`);
    console.log(`• Tax Settings: 1`);
    console.log(`• Analytics Reports: 1`);

    console.log('\n🔧 Test Data Features:');
    console.log('• Realistic Arabic restaurant data');
    console.log('• Multi-department orders (kitchen, barista, shisha)');
    console.log('• Complete order lifecycle (pending to delivered)');
    console.log('• Tax calculations with 15% VAT');
    console.log('• Staff assignments and performance tracking');
    console.log('• Material usage and inventory tracking');
    console.log('• Waste logging with various reasons');
    console.log('• Print job history with success/failure rates');
    console.log('• Analytics data for comprehensive reporting');

    console.log('\n📋 Test Scenarios Available:');
    console.log('1. View orders in admin dashboard');
    console.log('2. Test printer management and connections');
    console.log('3. Generate analytics reports');
    console.log('4. View waste tracking and management');
    console.log('5. Test tax compliance features');
    console.log('6. Monitor print jobs and performance');
    console.log('7. Test staff performance metrics');
    console.log('8. View inventory turnover analysis');

    console.log('\n🎯 Ready for Testing!');
    console.log('All systems are now populated with realistic test data.');

  } catch (error) {
    console.error('❌ Error generating fake data:', error);
  } finally {
    await mongoose.connection.close();
    console.log('\n🔌 Database connection closed');
  }
}

// Run the generation
generateAllFakeData();
