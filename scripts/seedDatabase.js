#!/usr/bin/env node

/**
 * 🧪 MongoDB Test Data Seeding Script for Menu Website
 * 
 * This script populates your MongoDB database with realistic test data
 * for all collections (ingredients, inventory, menu items, orders, etc.)
 * 
 * Usage: node scripts/seedDatabase.js
 * Or: npm run seed:db
 */

const mongoose = require('mongoose');
require('dotenv').config();

// Define schemas directly since we can't import TypeScript models in JS
const IngredientSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  nameEn: { type: String, trim: true },
  description: { type: String, trim: true },
  image: { type: String },
  unit: { type: String, required: true, default: 'g' },
  defaultPortion: { type: Number, required: true, default: 1 },
  minPortion: { type: Number, default: 0 },
  maxPortion: { type: Number, default: 10 },
  pricePerUnit: { type: Number, required: true, default: 0 },
  color: { type: String, default: '#00BF89' },
  allergens: [{ type: String }],
  status: { type: String, enum: ['active', 'inactive'], default: 'active' }
}, { timestamps: true });

const InventoryItemSchema = new mongoose.Schema({
  ingredientId: { type: String, required: true },
  ingredientName: { type: String, required: true, trim: true },
  currentStock: { type: Number, required: true, min: 0, default: 0 },
  unit: { type: String, required: true, default: 'g' },
  minStockLevel: { type: Number, required: true, min: 0, default: 10 },
  maxStockLevel: { type: Number, required: true, min: 0, default: 100 },
  lastUpdated: { type: Date, default: Date.now },
  status: { type: String, enum: ['in_stock', 'low_stock', 'out_of_stock'], default: 'in_stock' }
}, { timestamps: true });

const CategorySchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  nameEn: { type: String, trim: true },
  description: { type: String, trim: true },
  descriptionEn: { type: String, trim: true },
  image: { type: String },
  color: { type: String, default: '#4F3500' },
  icon: { type: String },
  order: { type: Number, default: 0 },
  featured: { type: Boolean, default: false },
  featuredOrder: { type: Number },
  status: { type: String, enum: ['active', 'inactive'], default: 'active' }
}, { timestamps: true });

const MenuItemSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  nameEn: { type: String, trim: true },
  description: { type: String, trim: true },
  descriptionEn: { type: String, trim: true },
  categoryId: { type: String, required: true, index: true },
  branchId: { type: String, index: true },
  restaurantId: { type: String, index: true },
  price: { type: Number, required: true, min: 0 },
  cost: { type: Number, min: 0, default: 0 },
  discountPrice: { type: Number, min: 0 },
  image: { type: String },
  images: [{ type: String }],
  color: { type: String, default: '#4F3500' },
  ingredients: [{
    ingredientId: { type: String, required: true },
    portion: { type: Number, required: true, default: 1 },
    required: { type: Boolean, default: true }
  }],
  preparationTime: { type: Number, default: 0 },
  calories: { type: Number, default: 0 },
  servingSize: { type: String },
  tags: [{ type: String }],
  allergens: [{ type: String }],
  status: { type: String, enum: ['active', 'inactive', 'out_of_stock'], default: 'active', index: true },
  featured: { type: Boolean, default: false, index: true },
  order: { type: Number, default: 0 },
  rating: { type: Number, min: 0, max: 5, default: 0 },
  reviewCount: { type: Number, min: 0, default: 0 }
}, { timestamps: true });

const OrderItemSchema = new mongoose.Schema({
  menuItemId: { type: String, required: true },
  menuItemName: { type: String, required: true },
  menuItemNameEn: { type: String },
  quantity: { type: Number, required: true, min: 1 },
  unitPrice: { type: Number, required: true, min: 0 },
  totalPrice: { type: Number, required: true, min: 0 },
  customizations: [{ type: String }],
  department: { type: String, enum: ['kitchen', 'barista', 'shisha'], required: true, index: true },
  departmentStatus: { type: String, enum: ['pending', 'in_progress', 'ready', 'served'], default: 'pending', index: true },
  estimatedPrepTime: { type: Number, min: 0 }
});

const CustomerInfoSchema = new mongoose.Schema({
  name: { type: String, trim: true },
  phone: { type: String, trim: true },
  address: { type: String, trim: true }
});

const OrderSchema = new mongoose.Schema({
  orderNumber: { type: String, required: true, unique: true, trim: true },
  branchId: { type: String, index: true },
  restaurantId: { type: String, index: true },
  tableNumber: { type: String, trim: true },
  items: [OrderItemSchema],
  totalAmount: { type: Number, required: true, min: 0 },
  discountAmount: { type: Number, min: 0 },
  taxInfo: {
    subtotal: { type: Number, min: 0 },
    taxRate: { type: Number, min: 0, max: 100 },
    taxAmount: { type: Number, min: 0 },
    includeTaxInPrice: { type: Boolean, default: true }
  },
  customerInfo: { type: CustomerInfoSchema, required: true },
  status: { type: String, enum: ['pending', 'confirmed', 'preparing', 'ready', 'delivered', 'cancelled'], default: 'pending' },
  departmentStatuses: {
    kitchen: { type: String, enum: ['pending', 'in_progress', 'ready', 'served'], default: 'pending' },
    barista: { type: String, enum: ['pending', 'in_progress', 'ready', 'served'], default: 'pending' },
    shisha: { type: String, enum: ['pending', 'in_progress', 'ready', 'served'], default: 'pending' }
  },
  orderDate: { type: Date, required: true },
  deliveryDate: { type: Date },
  source: { type: String, enum: ['website_whatsapp', 'manual', 'website'], default: 'website_whatsapp' },
  notes: { type: String, trim: true },
  whatsappMessageId: { type: String, trim: true },
  assignedTo: {
    kitchen: { type: String, trim: true },
    barista: { type: String, trim: true },
    shisha: { type: String, trim: true }
  }
}, { timestamps: true });

const WasteLogSchema = new mongoose.Schema({
  itemName: { type: String, required: true, trim: true, index: true },
  itemId: { type: String, trim: true, index: true },
  category: { type: String, enum: ['food', 'beverage', 'material', 'equipment', 'other'], required: true, index: true },
  quantity: { type: Number, required: true, min: 0 },
  unit: { type: String, required: true, trim: true },
  cost: { type: Number, required: true, min: 0 },
  reason: { type: String, enum: ['spoiled', 'broken', 'expired', 'damaged', 'overcooked', 'spilled', 'other'], required: true, index: true },
  description: { type: String, trim: true },
  department: { type: String, enum: ['kitchen', 'barista', 'shisha', 'general'], required: true, index: true },
  loggedBy: { type: String, required: true, trim: true, index: true },
  wasteDate: { type: Date, required: true, default: Date.now, index: true },
  isRecoverable: { type: Boolean, default: false },
  recoveryAction: { type: String, trim: true }
}, { timestamps: true });

const UserSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true, trim: true },
  password: { type: String, required: true },
  role: { type: String, required: true, enum: ['admin', 'kitchen', 'barista', 'shisha', 'staff'] },
  name: { type: String, required: true, trim: true },
  isActive: { type: Boolean, default: true },
  lastLogin: { type: Date }
}, { timestamps: true });

const LocationSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  nameEn: { type: String, trim: true },
  address: { type: String, required: true, trim: true },
  city: { type: String, required: true, trim: true },
  state: { type: String, trim: true },
  country: { type: String, trim: true },
  postalCode: { type: String, trim: true },
  phone: { type: String, trim: true },
  email: { type: String, trim: true },
  coordinates: {
    latitude: { type: Number },
    longitude: { type: Number }
  },
  isActive: { type: Boolean, default: true },
  openingHours: {
    monday: { open: String, close: String, isOpen: Boolean },
    tuesday: { open: String, close: String, isOpen: Boolean },
    wednesday: { open: String, close: String, isOpen: Boolean },
    thursday: { open: String, close: String, isOpen: Boolean },
    friday: { open: String, close: String, isOpen: Boolean },
    saturday: { open: String, close: String, isOpen: Boolean },
    sunday: { open: String, close: String, isOpen: Boolean }
  }
}, { timestamps: true });

const OfferSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  titleEn: { type: String, trim: true },
  description: { type: String, trim: true },
  descriptionEn: { type: String, trim: true },
  discountType: { type: String, enum: ['percentage', 'fixed', 'buy_x_get_y'], required: true },
  discountValue: { type: Number, required: true, min: 0 },
  minOrderAmount: { type: Number, min: 0 },
  maxDiscountAmount: { type: Number, min: 0 },
  validFrom: { type: Date, required: true },
  validTo: { type: Date, required: true },
  isActive: { type: Boolean, default: true },
  applicableItems: [{ type: String }],
  applicableCategories: [{ type: String }],
  usageLimit: { type: Number, min: 0 },
  usedCount: { type: Number, min: 0, default: 0 },
  image: { type: String }
}, { timestamps: true });

const ReviewSchema = new mongoose.Schema({
  menuItemId: { type: String, required: true, index: true },
  customerName: { type: String, required: true, trim: true },
  customerEmail: { type: String, trim: true },
  rating: { type: Number, required: true, min: 1, max: 5 },
  comment: { type: String, trim: true },
  isVerified: { type: Boolean, default: false },
  helpfulCount: { type: Number, min: 0, default: 0 },
  images: [{ type: String }]
}, { timestamps: true });

// Create models
const Ingredient = mongoose.model('Ingredient', IngredientSchema);
const InventoryItem = mongoose.model('InventoryItem', InventoryItemSchema);
const Category = mongoose.model('Category', CategorySchema);
const MenuItem = mongoose.model('MenuItem', MenuItemSchema);
const Order = mongoose.model('Order', OrderSchema);
const WasteLog = mongoose.model('WasteLog', WasteLogSchema);
const User = mongoose.model('User', UserSchema);
const Location = mongoose.model('Location', LocationSchema);
const Offer = mongoose.model('Offer', OfferSchema);
const Review = mongoose.model('Review', ReviewSchema);

// Constants
const DEMO_TENANT_ID = 'demo-tenant-1';
const DEMO_BRANCH_ID = 'demo-branch-1';
const DEMO_RESTAURANT_ID = 'demo-restaurant-1';

// Realistic ingredient data
const INGREDIENT_DATA = [
  // Vegetables
  { name: 'طماطم', nameEn: 'Tomato', unit: 'kg', pricePerUnit: 8.5, allergens: [] },
  { name: 'بصل', nameEn: 'Onion', unit: 'kg', pricePerUnit: 6.0, allergens: [] },
  { name: 'خس', nameEn: 'Lettuce', unit: 'kg', pricePerUnit: 12.0, allergens: [] },
  { name: 'جزر', nameEn: 'Carrot', unit: 'kg', pricePerUnit: 7.5, allergens: [] },
  { name: 'فلفل أخضر', nameEn: 'Green Pepper', unit: 'kg', pricePerUnit: 15.0, allergens: [] },
  
  // Dairy & Proteins
  { name: 'جبن موزاريلا', nameEn: 'Mozzarella Cheese', unit: 'kg', pricePerUnit: 45.0, allergens: ['dairy'] },
  { name: 'جبن شيدر', nameEn: 'Cheddar Cheese', unit: 'kg', pricePerUnit: 50.0, allergens: ['dairy'] },
  { name: 'لحم بقري', nameEn: 'Beef', unit: 'kg', pricePerUnit: 120.0, allergens: [] },
  { name: 'دجاج', nameEn: 'Chicken', unit: 'kg', pricePerUnit: 35.0, allergens: [] },
  { name: 'بيض', nameEn: 'Eggs', unit: 'dozen', pricePerUnit: 15.0, allergens: ['eggs'] },
  
  // Grains & Bread
  { name: 'دقيق', nameEn: 'Flour', unit: 'kg', pricePerUnit: 4.5, allergens: ['gluten'] },
  { name: 'خبز عربي', nameEn: 'Arabic Bread', unit: 'piece', pricePerUnit: 1.5, allergens: ['gluten'] },
  { name: 'معكرونة', nameEn: 'Pasta', unit: 'kg', pricePerUnit: 8.0, allergens: ['gluten'] },
  
  // Beverages
  { name: 'قهوة', nameEn: 'Coffee Beans', unit: 'kg', pricePerUnit: 80.0, allergens: [] },
  { name: 'شاي', nameEn: 'Tea Leaves', unit: 'kg', pricePerUnit: 25.0, allergens: [] },
  { name: 'حليب', nameEn: 'Milk', unit: 'liter', pricePerUnit: 6.5, allergens: ['dairy'] },
  { name: 'عصير برتقال', nameEn: 'Orange Juice', unit: 'liter', pricePerUnit: 12.0, allergens: [] },
  
  // Condiments & Spices
  { name: 'ملح', nameEn: 'Salt', unit: 'kg', pricePerUnit: 2.0, allergens: [] },
  { name: 'فلفل أسود', nameEn: 'Black Pepper', unit: 'kg', pricePerUnit: 60.0, allergens: [] },
  { name: 'زيت زيتون', nameEn: 'Olive Oil', unit: 'liter', pricePerUnit: 35.0, allergens: [] },
  { name: 'ثوم', nameEn: 'Garlic', unit: 'kg', pricePerUnit: 20.0, allergens: [] },
  
  // Shisha & Special
  { name: 'تبغ شيشة', nameEn: 'Shisha Tobacco', unit: 'kg', pricePerUnit: 150.0, allergens: [] },
  { name: 'فحم شيشة', nameEn: 'Shisha Coal', unit: 'kg', pricePerUnit: 25.0, allergens: [] },
  { name: 'عسل', nameEn: 'Honey', unit: 'kg', pricePerUnit: 40.0, allergens: [] },
];

// Realistic menu items with ingredients
const MENU_ITEMS_DATA = [
  {
    name: 'بيتزا مارغريتا',
    nameEn: 'Margherita Pizza',
    description: 'بيتزا إيطالية كلاسيكية مع الطماطم والجبن والريحان',
    descriptionEn: 'Classic Italian pizza with tomatoes, mozzarella, and basil',
    categoryId: 'pizza',
    price: 85,
    cost: 25,
    preparationTime: 15,
    calories: 320,
    servingSize: 'Medium',
    tags: ['vegetarian', 'popular'],
    allergens: ['dairy', 'gluten'],
    ingredients: [
      { ingredientId: '', portion: 0.3, required: true }, // Flour
      { ingredientId: '', portion: 0.2, required: true }, // Tomato
      { ingredientId: '', portion: 0.15, required: true }, // Mozzarella
      { ingredientId: '', portion: 0.05, required: true }, // Olive Oil
    ]
  },
  {
    name: 'برجر كلاسيك',
    nameEn: 'Classic Burger',
    description: 'برجر لحم بقري مع الخس والطماطم والبصل',
    descriptionEn: 'Beef burger with lettuce, tomato, and onion',
    categoryId: 'sandwiches',
    price: 65,
    cost: 20,
    preparationTime: 12,
    calories: 450,
    servingSize: 'Large',
    tags: ['popular', 'halal'],
    allergens: ['gluten', 'eggs'],
    ingredients: [
      { ingredientId: '', portion: 0.2, required: true }, // Beef
      { ingredientId: '', portion: 1, required: true }, // Bread
      { ingredientId: '', portion: 0.1, required: true }, // Lettuce
      { ingredientId: '', portion: 0.05, required: true }, // Tomato
      { ingredientId: '', portion: 0.05, required: true }, // Onion
    ]
  },
  {
    name: 'سلطة سيزر',
    nameEn: 'Caesar Salad',
    description: 'سلطة خس مع الجبن والصلصة الخاصة',
    descriptionEn: 'Lettuce salad with cheese and special dressing',
    categoryId: 'salads',
    price: 45,
    cost: 12,
    preparationTime: 8,
    calories: 180,
    servingSize: 'Medium',
    tags: ['vegetarian', 'healthy'],
    allergens: ['dairy'],
    ingredients: [
      { ingredientId: '', portion: 0.2, required: true }, // Lettuce
      { ingredientId: '', portion: 0.1, required: true }, // Cheddar Cheese
      { ingredientId: '', portion: 0.05, required: true }, // Olive Oil
    ]
  },
  {
    name: 'قهوة أمريكية',
    nameEn: 'Americano Coffee',
    description: 'قهوة أمريكية قوية ومميزة',
    descriptionEn: 'Strong and distinctive American coffee',
    categoryId: 'hot-coffee',
    price: 18,
    cost: 5,
    preparationTime: 3,
    calories: 5,
    servingSize: 'Medium',
    tags: ['popular'],
    allergens: [],
    ingredients: [
      { ingredientId: '', portion: 0.02, required: true }, // Coffee Beans
    ]
  },
  {
    name: 'شاي بالنعناع',
    nameEn: 'Mint Tea',
    description: 'شاي أخضر مع النعناع الطازج',
    descriptionEn: 'Green tea with fresh mint',
    categoryId: 'tea',
    price: 12,
    cost: 3,
    preparationTime: 5,
    calories: 2,
    servingSize: 'Medium',
    tags: ['traditional'],
    allergens: [],
    ingredients: [
      { ingredientId: '', portion: 0.01, required: true }, // Tea Leaves
    ]
  },
  {
    name: 'كيك الشوكولاتة',
    nameEn: 'Chocolate Cake',
    description: 'كيك شوكولاتة غني ولذيذ',
    descriptionEn: 'Rich and delicious chocolate cake',
    categoryId: 'desserts',
    price: 35,
    cost: 10,
    preparationTime: 0,
    calories: 380,
    servingSize: 'Medium',
    tags: ['sweet', 'popular'],
    allergens: ['dairy', 'eggs', 'gluten'],
    ingredients: [
      { ingredientId: '', portion: 0.2, required: true }, // Flour
      { ingredientId: '', portion: 0.1, required: true }, // Eggs
      { ingredientId: '', portion: 0.05, required: true }, // Milk
    ]
  },
  {
    name: 'ساندويتش دجاج',
    nameEn: 'Chicken Sandwich',
    description: 'ساندويتش دجاج مشوي مع الخضار',
    descriptionEn: 'Grilled chicken sandwich with vegetables',
    categoryId: 'sandwiches',
    price: 55,
    cost: 18,
    preparationTime: 10,
    calories: 420,
    servingSize: 'Large',
    tags: ['halal', 'popular'],
    allergens: ['gluten'],
    ingredients: [
      { ingredientId: '', portion: 0.15, required: true }, // Chicken
      { ingredientId: '', portion: 1, required: true }, // Bread
      { ingredientId: '', portion: 0.1, required: true }, // Lettuce
      { ingredientId: '', portion: 0.05, required: true }, // Tomato
    ]
  },
  {
    name: 'شيشة تفاح',
    nameEn: 'Apple Shisha',
    description: 'شيشة بنكهة التفاح الطبيعية',
    descriptionEn: 'Shisha with natural apple flavor',
    categoryId: 'shisha',
    price: 120,
    cost: 35,
    preparationTime: 8,
    calories: 0,
    servingSize: 'Large',
    tags: ['traditional'],
    allergens: [],
    ingredients: [
      { ingredientId: '', portion: 0.05, required: true }, // Shisha Tobacco
      { ingredientId: '', portion: 0.1, required: true }, // Shisha Coal
    ]
  }
];

// Realistic categories
const CATEGORIES_DATA = [
  { name: 'البيتزا', nameEn: 'Pizza', icon: '🍕', color: '#FF6B6B' },
  { name: 'الساندويتش', nameEn: 'Sandwiches', icon: '🥪', color: '#4ECDC4' },
  { name: 'السلطات', nameEn: 'Salads', icon: '🥗', color: '#45B7D1' },
  { name: 'المشروبات الساخنة', nameEn: 'Hot Drinks', icon: '☕', color: '#96CEB4' },
  { name: 'الشاي', nameEn: 'Tea', icon: '🍵', color: '#FFEAA7' },
  { name: 'الحلويات', nameEn: 'Desserts', icon: '🍰', color: '#DDA0DD' },
  { name: 'الشيشة', nameEn: 'Shisha', icon: '💨', color: '#98FB98' },
];

// Sample users
const USERS_DATA = [
  { username: 'admin', password: 'admin2024', role: 'admin', name: 'مدير النظام', isActive: true },
  { username: 'kitchen', password: 'kitchen2024', role: 'kitchen', name: 'طاهي المطبخ', isActive: true },
  { username: 'barista', password: 'barista2024', role: 'barista', name: 'بارستا', isActive: true },
  { username: 'shisha', password: 'shisha2024', role: 'shisha', name: 'مشغل الشيشة', isActive: true },
];

// Sample locations
const LOCATIONS_DATA = [
  {
    name: 'الفرع الرئيسي',
    nameEn: 'Main Branch',
    address: 'شارع الملك فهد، الرياض',
    city: 'الرياض',
    state: 'منطقة الرياض',
    country: 'السعودية',
    postalCode: '12345',
    phone: '+966501234567',
    email: 'main@maraksh.com',
    coordinates: { latitude: 24.7136, longitude: 46.6753 },
    isActive: true,
    openingHours: {
      monday: { open: '09:00', close: '22:00', isOpen: true },
      tuesday: { open: '09:00', close: '22:00', isOpen: true },
      wednesday: { open: '09:00', close: '22:00', isOpen: true },
      thursday: { open: '09:00', close: '22:00', isOpen: true },
      friday: { open: '09:00', close: '23:00', isOpen: true },
      saturday: { open: '10:00', close: '23:00', isOpen: true },
      sunday: { open: '10:00', close: '22:00', isOpen: true },
    }
  }
];

async function connectDB() {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/maraksh';
    await mongoose.connect(mongoUri);
    console.log('✅ Connected to MongoDB');
  } catch (error) {
    console.error('❌ MongoDB connection failed:', error);
    process.exit(1);
  }
}

async function clearDatabase() {
  console.log('🧹 Clearing existing data...');
  
  const collections = [
    'ingredients', 'inventoryitems', 'menuitems', 'orders', 
    'wastelogs', 'categories', 'users', 'locations', 'offers', 'reviews'
  ];
  
  for (const collectionName of collections) {
    try {
      await mongoose.connection.db.collection(collectionName).deleteMany({});
      console.log(`   ✅ Cleared ${collectionName}`);
    } catch (error) {
      console.log(`   ⚠️  Collection ${collectionName} not found or already empty`);
    }
  }
}

async function seedIngredients() {
  console.log('🍅 Creating ingredients...');
  const ingredients = [];
  
  for (const ingredientData of INGREDIENT_DATA) {
    const ingredient = new Ingredient({
      ...ingredientData,
      defaultPortion: 1,
      minPortion: 0,
      maxPortion: 10,
      color: '#00BF89',
      status: 'active'
    });
    
    await ingredient.save();
    ingredients.push(ingredient);
  }
  
  console.log(`✅ Created ${ingredients.length} ingredients`);
  return ingredients;
}

async function seedInventory(ingredients) {
  console.log('📦 Creating inventory records...');
  const inventoryItems = [];
  
  for (const ingredient of ingredients) {
    // Create realistic stock levels
    const currentStock = Math.floor(Math.random() * 100) + 10;
    const minStockLevel = Math.floor(currentStock * 0.2) + 5;
    const maxStockLevel = Math.floor(currentStock * 1.5) + 20;
    
    // Simulate some low-stock cases for testing alerts
    const finalStock = Math.random() > 0.8 ? Math.floor(minStockLevel * 0.5) : currentStock;
    
    const inventoryItem = new InventoryItem({
      ingredientId: ingredient._id.toString(),
      ingredientName: ingredient.name,
      currentStock: finalStock,
      unit: ingredient.unit,
      minStockLevel,
      maxStockLevel,
      lastUpdated: new Date(),
      status: finalStock <= minStockLevel ? 'low_stock' : 'in_stock'
    });
    
    await inventoryItem.save();
    inventoryItems.push(inventoryItem);
  }
  
  console.log(`✅ Created ${inventoryItems.length} inventory records`);
  return inventoryItems;
}

async function seedCategories() {
  console.log('📂 Creating categories...');
  const categories = [];
  
  for (let i = 0; i < CATEGORIES_DATA.length; i++) {
    const categoryData = CATEGORIES_DATA[i];
    const category = new Category({
      ...categoryData,
      description: `وصف ${categoryData.name}`,
      descriptionEn: `Description for ${categoryData.nameEn}`,
      image: `https://picsum.photos/300/200?random=${i}`,
      order: i,
      featured: i < 3,
      featuredOrder: i < 3 ? i : undefined,
      status: 'active'
    });
    
    await category.save();
    categories.push(category);
  }
  
  console.log(`✅ Created ${categories.length} categories`);
  return categories;
}

async function seedMenuItems(ingredients, categories) {
  console.log('🍽️ Creating menu items...');
  const menuItems = [];
  
  // Create a map of ingredient names to IDs for easy lookup
  const ingredientMap = {};
  ingredients.forEach(ing => {
    ingredientMap[ing.nameEn.toLowerCase()] = ing._id.toString();
  });
  
  // Create a map of category names to IDs
  const categoryMap = {};
  categories.forEach(cat => {
    categoryMap[cat.nameEn.toLowerCase()] = cat._id.toString();
  });
  
  for (let i = 0; i < MENU_ITEMS_DATA.length; i++) {
    const itemData = MENU_ITEMS_DATA[i];
    
    // Map ingredients based on common names
    const mappedIngredients = itemData.ingredients.map((ing, idx) => {
      let ingredientId;
      switch (idx) {
        case 0: // First ingredient - usually main component
          if (itemData.name.includes('بيتزا') || itemData.name.includes('كيك')) {
            ingredientId = ingredientMap['flour'];
          } else if (itemData.name.includes('برجر') || itemData.name.includes('دجاج')) {
            ingredientId = itemData.name.includes('دجاج') ? ingredientMap['chicken'] : ingredientMap['beef'];
          } else if (itemData.name.includes('سلطة')) {
            ingredientId = ingredientMap['lettuce'];
          } else if (itemData.name.includes('قهوة')) {
            ingredientId = ingredientMap['coffee beans'];
          } else if (itemData.name.includes('شاي')) {
            ingredientId = ingredientMap['tea leaves'];
          } else if (itemData.name.includes('شيشة')) {
            ingredientId = ingredientMap['shisha tobacco'];
          }
          break;
        case 1: // Second ingredient
          if (itemData.name.includes('بيتزا')) {
            ingredientId = ingredientMap['tomato'];
          } else if (itemData.name.includes('برجر') || itemData.name.includes('ساندويتش')) {
            ingredientId = ingredientMap['arabic bread'];
          } else if (itemData.name.includes('سلطة')) {
            ingredientId = ingredientMap['cheddar cheese'];
          }
          break;
        case 2: // Third ingredient
          if (itemData.name.includes('بيتزا')) {
            ingredientId = ingredientMap['mozzarella cheese'];
          } else if (itemData.name.includes('برجر') || itemData.name.includes('ساندويتش')) {
            ingredientId = ingredientMap['lettuce'];
          } else if (itemData.name.includes('سلطة')) {
            ingredientId = ingredientMap['olive oil'];
          }
          break;
        case 3: // Fourth ingredient
          if (itemData.name.includes('بيتزا')) {
            ingredientId = ingredientMap['olive oil'];
          } else if (itemData.name.includes('برجر') || itemData.name.includes('ساندويتش')) {
            ingredientId = ingredientMap['tomato'];
          }
          break;
      }
      
      return {
        ingredientId: ingredientId || ingredients[Math.floor(Math.random() * ingredients.length)]._id.toString(),
        portion: ing.portion,
        required: ing.required
      };
    });
    
    const menuItem = new MenuItem({
      ...itemData,
      categoryId: categoryMap[itemData.categoryId] || categories[0]._id.toString(),
      branchId: DEMO_BRANCH_ID,
      restaurantId: DEMO_RESTAURANT_ID,
      ingredients: mappedIngredients,
      image: `https://picsum.photos/400/300?random=${i + 100}`,
      images: Array.from({ length: Math.floor(Math.random() * 3) + 1 }, (_, j) => 
        `https://picsum.photos/400/300?random=${i + 100 + j}`
      ),
      status: Math.random() > 0.1 ? 'active' : 'out_of_stock',
      featured: i < 3,
      order: i,
      rating: Math.random() * 2 + 3, // 3-5 stars
      reviewCount: Math.floor(Math.random() * 50) + 5
    });
    
    await menuItem.save();
    menuItems.push(menuItem);
  }
  
  console.log(`✅ Created ${menuItems.length} menu items`);
  return menuItems;
}

async function seedOrders(menuItems) {
  console.log('📋 Creating sample orders...');
  const orders = [];
  
  for (let i = 0; i < 15; i++) {
    const orderItems = Array.from({ length: Math.floor(Math.random() * 3) + 1 }, () => {
      const menuItem = menuItems[Math.floor(Math.random() * menuItems.length)];
      const quantity = Math.floor(Math.random() * 3) + 1;
      const unitPrice = menuItem.price;
      
      return {
        menuItemId: menuItem._id.toString(),
        menuItemName: menuItem.name,
        menuItemNameEn: menuItem.nameEn,
        quantity,
        unitPrice,
        totalPrice: unitPrice * quantity,
        customizations: [],
        department: ['kitchen', 'barista', 'shisha'][Math.floor(Math.random() * 3)],
        departmentStatus: 'pending',
        estimatedPrepTime: menuItem.preparationTime || Math.floor(Math.random() * 20) + 5,
      };
    });

    const subtotal = orderItems.reduce((sum, item) => sum + item.totalPrice, 0);
    const taxRate = 15;
    const taxAmount = subtotal * (taxRate / 100);
    const discountAmount = Math.random() > 0.8 ? Math.random() * 20 : 0;
    const totalAmount = subtotal + taxAmount - discountAmount;

    const order = new Order({
      orderNumber: `ORD-${String(i + 1).padStart(6, '0')}`,
      branchId: DEMO_BRANCH_ID,
      restaurantId: DEMO_RESTAURANT_ID,
      items: orderItems,
      totalAmount,
      discountAmount,
      taxInfo: {
        subtotal,
        taxRate,
        taxAmount,
        includeTaxInPrice: true,
      },
      customerInfo: {
        name: `عميل ${i + 1}`,
        phone: `+966501234${String(i).padStart(3, '0')}`,
        address: `عنوان ${i + 1}`,
      },
      status: ['pending', 'confirmed', 'preparing', 'ready', 'delivered'][Math.floor(Math.random() * 5)],
      orderDate: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000),
      deliveryDate: new Date(Date.now() + Math.random() * 24 * 60 * 60 * 1000),
      source: ['website_whatsapp', 'manual', 'website'][Math.floor(Math.random() * 3)],
      notes: Math.random() > 0.5 ? `ملاحظات الطلب ${i + 1}` : undefined,
      whatsappMessageId: Math.random() > 0.5 ? `msg_${i + 1}` : undefined,
      departmentStatuses: {
        kitchen: ['pending', 'in_progress', 'ready', 'served'][Math.floor(Math.random() * 4)],
        barista: ['pending', 'in_progress', 'ready', 'served'][Math.floor(Math.random() * 4)],
        shisha: ['pending', 'in_progress', 'ready', 'served'][Math.floor(Math.random() * 4)],
      },
      assignedTo: {
        kitchen: Math.random() > 0.5 ? 'طاهي المطبخ' : undefined,
        barista: Math.random() > 0.5 ? 'بارستا' : undefined,
        shisha: Math.random() > 0.5 ? 'مشغل الشيشة' : undefined,
      },
    });
    
    await order.save();
    orders.push(order);
  }
  
  console.log(`✅ Created ${orders.length} orders`);
  return orders;
}

async function seedWasteLogs(ingredients) {
  console.log('🚮 Creating waste logs...');
  const wasteLogs = [];
  
  for (let i = 0; i < 8; i++) {
    const ingredient = ingredients[Math.floor(Math.random() * ingredients.length)];
    const quantity = Math.random() * 5 + 0.5;
    const cost = quantity * ingredient.pricePerUnit;
    
    const wasteLog = new WasteLog({
      itemName: ingredient.name,
      itemId: ingredient._id.toString(),
      category: ['food', 'beverage', 'material'][Math.floor(Math.random() * 3)],
      quantity,
      unit: ingredient.unit,
      cost,
      reason: ['spoiled', 'overcooked', 'expired', 'damaged'][Math.floor(Math.random() * 4)],
      description: `تم إهدار ${ingredient.name} بسبب ${['التلف', 'الطبخ الزائد', 'انتهاء الصلاحية', 'التلف'][Math.floor(Math.random() * 4)]}`,
      department: ['kitchen', 'barista', 'shisha', 'general'][Math.floor(Math.random() * 4)],
      loggedBy: 'admin',
      wasteDate: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000),
      isRecoverable: Math.random() > 0.7,
      recoveryAction: Math.random() > 0.7 ? 'تم التبرع به' : undefined,
    });
    
    await wasteLog.save();
    wasteLogs.push(wasteLog);
  }
  
  console.log(`✅ Created ${wasteLogs.length} waste logs`);
  return wasteLogs;
}

async function seedUsers() {
  console.log('👥 Creating users...');
  const users = [];
  
  for (const userData of USERS_DATA) {
    const user = new User({
      ...userData,
      lastLogin: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000),
    });
    
    await user.save();
    users.push(user);
  }
  
  console.log(`✅ Created ${users.length} users`);
  return users;
}

async function seedLocations() {
  console.log('📍 Creating locations...');
  const locations = [];
  
  for (const locationData of LOCATIONS_DATA) {
    const location = new Location(locationData);
    await location.save();
    locations.push(location);
  }
  
  console.log(`✅ Created ${locations.length} locations`);
  return locations;
}

async function seedOffers(menuItems, categories) {
  console.log('🎁 Creating offers...');
  const offers = [];
  
  const offerTitles = [
    { title: 'خصم 20% على البيتزا', titleEn: '20% Off Pizza', discountType: 'percentage', discountValue: 20 },
    { title: 'عرض المشروبات', titleEn: 'Drinks Offer', discountType: 'fixed', discountValue: 5 },
    { title: 'خصم العائلة', titleEn: 'Family Discount', discountType: 'percentage', discountValue: 15 },
    { title: 'عرض نهاية الأسبوع', titleEn: 'Weekend Offer', discountType: 'fixed', discountValue: 10 },
  ];
  
  for (let i = 0; i < offerTitles.length; i++) {
    const offerData = offerTitles[i];
    const offer = new Offer({
      ...offerData,
      description: `عرض خاص: ${offerData.title}`,
      descriptionEn: `Special offer: ${offerData.titleEn}`,
      minOrderAmount: Math.floor(Math.random() * 100) + 50,
      maxDiscountAmount: Math.floor(Math.random() * 50) + 20,
      validFrom: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000),
      validTo: new Date(Date.now() + Math.random() * 30 * 24 * 60 * 60 * 1000),
      isActive: Math.random() > 0.2,
      applicableItems: menuItems.slice(0, Math.floor(Math.random() * 5) + 1).map(item => item._id.toString()),
      applicableCategories: categories.slice(0, Math.floor(Math.random() * 3) + 1).map(cat => cat._id.toString()),
      usageLimit: Math.floor(Math.random() * 100) + 10,
      usedCount: Math.floor(Math.random() * 20),
      image: `https://picsum.photos/400/200?random=${i + 500}`,
    });
    
    await offer.save();
    offers.push(offer);
  }
  
  console.log(`✅ Created ${offers.length} offers`);
  return offers;
}

async function seedReviews(menuItems) {
  console.log('⭐ Creating reviews...');
  const reviews = [];
  
  for (let i = 0; i < 25; i++) {
    const menuItem = menuItems[Math.floor(Math.random() * menuItems.length)];
    const review = new Review({
      menuItemId: menuItem._id.toString(),
      customerName: `عميل ${i + 1}`,
      customerEmail: `customer${i + 1}@example.com`,
      rating: Math.floor(Math.random() * 5) + 1,
      comment: `رائع! ${menuItem.name} كان لذيذ جداً. أنصح به بشدة.`,
      isVerified: Math.random() > 0.3,
      helpfulCount: Math.floor(Math.random() * 10),
      images: Math.random() > 0.7 ? [`https://picsum.photos/300/200?random=${i + 600}`] : [],
    });
    
    await review.save();
    reviews.push(review);
  }
  
  console.log(`✅ Created ${reviews.length} reviews`);
  return reviews;
}

async function seedDatabase() {
  try {
    console.log('🌱 Starting MongoDB test data seeding...');
    console.log('=' .repeat(50));
    
    await connectDB();
    await clearDatabase();
    
    // Seed in dependency order
    const ingredients = await seedIngredients();
    const inventoryItems = await seedInventory(ingredients);
    const categories = await seedCategories();
    const menuItems = await seedMenuItems(ingredients, categories);
    const orders = await seedOrders(menuItems);
    const wasteLogs = await seedWasteLogs(ingredients);
    const users = await seedUsers();
    const locations = await seedLocations();
    const offers = await seedOffers(menuItems, categories);
    const reviews = await seedReviews(menuItems);
    
    console.log('=' .repeat(50));
    console.log('🎉 Database seeding completed successfully!');
    console.log('📊 Summary:');
    console.log(`   - Ingredients: ${ingredients.length}`);
    console.log(`   - Inventory Items: ${inventoryItems.length}`);
    console.log(`   - Categories: ${categories.length}`);
    console.log(`   - Menu Items: ${menuItems.length}`);
    console.log(`   - Orders: ${orders.length}`);
    console.log(`   - Waste Logs: ${wasteLogs.length}`);
    console.log(`   - Users: ${users.length}`);
    console.log(`   - Locations: ${locations.length}`);
    console.log(`   - Offers: ${offers.length}`);
    console.log(`   - Reviews: ${reviews.length}`);
    
    console.log('\n🔗 Data Relationships:');
    console.log('   ✅ Menu items reference ingredients');
    console.log('   ✅ Inventory tracks ingredient stock levels');
    console.log('   ✅ Orders reference menu items');
    console.log('   ✅ Waste logs track ingredient losses');
    console.log('   ✅ Reviews linked to menu items');
    console.log('   ✅ Offers applicable to menu items and categories');
    
    console.log('\n🧪 Test Scenarios Ready:');
    console.log('   ✅ Low stock alerts (some ingredients below threshold)');
    console.log('   ✅ Order processing with inventory deduction');
    console.log('   ✅ Waste tracking and cost analysis');
    console.log('   ✅ Multi-language support (Arabic/English)');
    console.log('   ✅ Department-specific workflows');
    
    return {
      ingredients,
      inventoryItems,
      categories,
      menuItems,
      orders,
      wasteLogs,
      users,
      locations,
      offers,
      reviews,
    };
    
  } catch (error) {
    console.error('❌ Database seeding failed:', error);
    throw error;
  } finally {
    await mongoose.connection.close();
    console.log('🔌 Database connection closed');
  }
}

// Run seeding if called directly
if (require.main === module) {
  seedDatabase()
    .then(() => {
      console.log('\n✅ Seeding completed successfully!');
      console.log('🚀 Your database is now ready for testing!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n❌ Seeding failed:', error);
      process.exit(1);
    });
}

module.exports = { seedDatabase };
