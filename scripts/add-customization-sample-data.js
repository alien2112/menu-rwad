const mongoose = require('mongoose');
require('dotenv').config();

// Connect to MongoDB
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://eslamabdaltif:oneone2@cluster0.p8b1qnv.mongodb.net/menurwad?retryWrites=true&w=majority';

async function connectDB() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
}

// Menu Item Schema
const MenuItemSchema = new mongoose.Schema({
  name: { type: String, required: true },
  nameEn: { type: String },
  description: { type: String },
  descriptionEn: { type: String },
  categoryId: { type: String, required: true },
  price: { type: Number, required: true },
  discountPrice: { type: Number },
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
  status: { type: String, enum: ['active', 'inactive', 'out_of_stock'], default: 'active' },
  featured: { type: Boolean, default: false },
  order: { type: Number, default: 0 },
  // Customization features
  sizeOptions: [{
    id: { type: String, required: true },
    name: { type: String, required: true },
    nameEn: { type: String },
    priceModifier: { type: Number, required: true, default: 0 },
    description: { type: String }
  }],
  addonOptions: [{
    id: { type: String, required: true },
    name: { type: String, required: true },
    nameEn: { type: String },
    price: { type: Number, required: true, min: 0 },
    category: { type: String, required: true },
    required: { type: Boolean, default: false },
    maxQuantity: { type: Number, min: 1 }
  }],
  dietaryModifications: [{ type: String }],
  rating: { type: Number, min: 0, max: 5, default: 0 },
  reviewCount: { type: Number, min: 0, default: 0 }
}, { timestamps: true });

const MenuItem = mongoose.model('MenuItem', MenuItemSchema);

// Sample data with customization features
const sampleMenuItems = [
  {
    name: "قهوة أمريكانو",
    nameEn: "Americano Coffee",
    description: "قهوة أمريكانو قوية ومكثفة",
    categoryId: "hot-coffee",
    price: 15,
    image: "/coffee-americano.jpg",
    preparationTime: 5,
    calories: 5,
    tags: ["vegan", "gluten-free", "low-calorie"],
    allergens: [],
    rating: 4.5,
    reviewCount: 120,
    sizeOptions: [
      { id: "small", name: "صغير", nameEn: "Small", priceModifier: 0, description: "8 أونصة" },
      { id: "medium", name: "متوسط", nameEn: "Medium", priceModifier: 3, description: "12 أونصة" },
      { id: "large", name: "كبير", nameEn: "Large", priceModifier: 6, description: "16 أونصة" }
    ],
    addonOptions: [
      { id: "extra-shot", name: "طلقة إضافية", nameEn: "Extra Shot", price: 2, category: "coffee", required: false },
      { id: "decaf", name: "بدون كافيين", nameEn: "Decaf", price: 0, category: "coffee", required: false },
      { id: "extra-hot", name: "ساخن جداً", nameEn: "Extra Hot", price: 0, category: "temperature", required: false }
    ],
    dietaryModifications: ["no-sugar", "low-sugar", "extra-hot", "mild"]
  },
  {
    name: "بيتزا مارجريتا",
    nameEn: "Margherita Pizza",
    description: "بيتزا إيطالية تقليدية مع الجبن والطماطم",
    categoryId: "pizza",
    price: 45,
    image: "/pizza-margherita.jpg",
    preparationTime: 20,
    calories: 280,
    tags: ["vegetarian", "italian"],
    allergens: ["gluten", "dairy"],
    rating: 4.8,
    reviewCount: 89,
    sizeOptions: [
      { id: "small", name: "صغير", nameEn: "Small", priceModifier: -10, description: "8 بوصة" },
      { id: "medium", name: "متوسط", nameEn: "Medium", priceModifier: 0, description: "12 بوصة" },
      { id: "large", name: "كبير", nameEn: "Large", priceModifier: 15, description: "16 بوصة" }
    ],
    addonOptions: [
      { id: "extra-cheese", name: "جبن إضافي", nameEn: "Extra Cheese", price: 5, category: "toppings", required: false },
      { id: "extra-sauce", name: "صلصة إضافية", nameEn: "Extra Sauce", price: 3, category: "toppings", required: false },
      { id: "basil", name: "ريحان طازج", nameEn: "Fresh Basil", price: 2, category: "herbs", required: false },
      { id: "olive-oil", name: "زيت زيتون", nameEn: "Olive Oil", price: 1, category: "oils", required: false }
    ],
    dietaryModifications: ["no-cheese", "extra-cheese", "well-done", "thin-crust"]
  },
  {
    name: "سموذي التوت",
    nameEn: "Berry Smoothie",
    description: "سموذي صحي مع التوت والموز",
    categoryId: "natural-juices",
    price: 25,
    image: "/berry-smoothie.jpg",
    preparationTime: 8,
    calories: 180,
    tags: ["vegan", "gluten-free", "healthy", "low-calorie"],
    allergens: [],
    rating: 4.3,
    reviewCount: 67,
    sizeOptions: [
      { id: "regular", name: "عادي", nameEn: "Regular", priceModifier: 0, description: "16 أونصة" },
      { id: "large", name: "كبير", nameEn: "Large", priceModifier: 8, description: "24 أونصة" }
    ],
    addonOptions: [
      { id: "protein-powder", name: "مسحوق البروتين", nameEn: "Protein Powder", price: 5, category: "supplements", required: false },
      { id: "chia-seeds", name: "بذور الشيا", nameEn: "Chia Seeds", price: 3, category: "supplements", required: false },
      { id: "coconut-milk", name: "حليب جوز الهند", nameEn: "Coconut Milk", price: 2, category: "milk", required: false },
      { id: "honey", name: "عسل", nameEn: "Honey", price: 2, category: "sweeteners", required: false }
    ],
    dietaryModifications: ["no-sugar", "extra-sweet", "dairy-free", "keto"]
  },
  {
    name: "برجر كلاسيك",
    nameEn: "Classic Burger",
    description: "برجر لحم بقري مع الخضار والصلصة",
    categoryId: "sandwiches",
    price: 35,
    image: "/classic-burger.jpg",
    preparationTime: 15,
    calories: 650,
    tags: ["halal", "meat"],
    allergens: ["gluten", "dairy"],
    rating: 4.6,
    reviewCount: 156,
    sizeOptions: [
      { id: "single", name: "واحد", nameEn: "Single", priceModifier: 0, description: "لحم واحد" },
      { id: "double", name: "مزدوج", nameEn: "Double", priceModifier: 12, description: "لحم مزدوج" }
    ],
    addonOptions: [
      { id: "bacon", name: "لحم مقدد", nameEn: "Bacon", price: 8, category: "meat", required: false },
      { id: "cheese", name: "جبن", nameEn: "Cheese", price: 4, category: "dairy", required: false },
      { id: "avocado", name: "أفوكادو", nameEn: "Avocado", price: 6, category: "vegetables", required: false },
      { id: "mushrooms", name: "فطر", nameEn: "Mushrooms", price: 3, category: "vegetables", required: false },
      { id: "onion-rings", name: "حلقات البصل", nameEn: "Onion Rings", price: 5, category: "sides", required: false }
    ],
    dietaryModifications: ["no-onions", "no-pickles", "extra-spicy", "well-done", "medium-rare"]
  },
  {
    name: "شاي تركي",
    nameEn: "Turkish Tea",
    description: "شاي تركي أصيل مع السكر",
    categoryId: "tea",
    price: 8,
    image: "/turkish-tea.jpg",
    preparationTime: 3,
    calories: 2,
    tags: ["vegan", "gluten-free", "traditional"],
    allergens: [],
    rating: 4.7,
    reviewCount: 203,
    sizeOptions: [
      { id: "small", name: "صغير", nameEn: "Small", priceModifier: 0, description: "كوب صغير" },
      { id: "large", name: "كبير", nameEn: "Large", priceModifier: 2, description: "كوب كبير" }
    ],
    addonOptions: [
      { id: "extra-sugar", name: "سكر إضافي", nameEn: "Extra Sugar", price: 0, category: "sweeteners", required: false },
      { id: "lemon", name: "ليمون", nameEn: "Lemon", price: 1, category: "additions", required: false },
      { id: "mint", name: "نعناع", nameEn: "Mint", price: 1, category: "herbs", required: false }
    ],
    dietaryModifications: ["no-sugar", "extra-sweet", "mild", "strong"]
  }
];

async function addSampleData() {
  try {
    await connectDB();
    
    // Clear existing items
    await MenuItem.deleteMany({});
    console.log('Cleared existing menu items');
    
    // Add sample items
    const createdItems = await MenuItem.insertMany(sampleMenuItems);
    console.log(`Added ${createdItems.length} menu items with customization features`);
    
    // Display summary
    console.log('\n=== Sample Menu Items Added ===');
    createdItems.forEach(item => {
      console.log(`- ${item.name} (${item.nameEn})`);
      console.log(`  Price: ${item.price} SAR`);
      console.log(`  Sizes: ${item.sizeOptions?.length || 0} options`);
      console.log(`  Addons: ${item.addonOptions?.length || 0} options`);
      console.log(`  Dietary: ${item.dietaryModifications?.length || 0} modifications`);
      console.log(`  Rating: ${item.rating}/5 (${item.reviewCount} reviews)`);
      console.log('');
    });
    
    console.log('✅ Sample data with customization features added successfully!');
    
  } catch (error) {
    console.error('Error adding sample data:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

// Run the script
addSampleData();







