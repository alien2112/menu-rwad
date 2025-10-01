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
  status: {
    type: String,
    enum: ['active', 'inactive'],
    default: 'active',
  },
}, {
  timestamps: true,
});

const Category = mongoose.models.Category || mongoose.model('Category', categorySchema);

// Current static categories from the application
const staticCategories = [
  {
    name: "العروض",
    nameEn: "Offers",
    description: "Special offers and promotions",
    icon: "https://api.builder.io/api/v1/image/assets/TEMP/24894209132cff55cd4cfb4dabe8b570960c19bc?width=68",
    color: "#FF6B6B",
    order: 1,
    status: "active"
  },
  {
    name: "الشاي",
    nameEn: "Tea",
    description: "Traditional and specialty teas",
    icon: "https://api.builder.io/api/v1/image/assets/TEMP/f342ec3b49d01d7e9eb71093eec45dae50e1c06b?width=72",
    color: "#4ECDC4",
    order: 2,
    status: "active"
  },
  {
    name: "قهوة بارده",
    nameEn: "Cold Coffee",
    description: "Refreshing cold coffee beverages",
    icon: "https://api.builder.io/api/v1/image/assets/TEMP/32aef080205f82b8f4b103c0cd979308b95d2d19?width=68",
    color: "#45B7D1",
    order: 3,
    status: "active"
  },
  {
    name: "قهوه ساخنة",
    nameEn: "Hot Coffee",
    description: "Warm and aromatic coffee drinks",
    icon: "https://api.builder.io/api/v1/image/assets/TEMP/6e4972442f216b34607ffaa20412dd755012a4d2?width=60",
    color: "#F39C12",
    order: 4,
    status: "active"
  },
  {
    name: "العصائر الطبيعية",
    nameEn: "Natural Juices",
    description: "Fresh and natural fruit juices",
    icon: "https://api.builder.io/api/v1/image/assets/TEMP/0061650c9228a74090b6905e5a3c5f396dea26b6?width=54",
    color: "#2ECC71",
    order: 5,
    status: "active"
  },
  {
    name: "الكوكتيل و الموهيتو",
    nameEn: "Cocktails & Mojitos",
    description: "Refreshing cocktails and mojitos",
    icon: "https://api.builder.io/api/v1/image/assets/TEMP/c5fe8d5173faa0d9b636382c2f32a34375dae1d1?width=66",
    color: "#9B59B6",
    order: 6,
    status: "active"
  },
  {
    name: "المناقيش و الفطائر",
    nameEn: "Manakish & Pastries",
    description: "Traditional Lebanese flatbreads and pastries",
    icon: "https://api.builder.io/api/v1/image/assets/TEMP/621674a75978c3bcd6e88400c0dc63fefc51776d?width=52",
    color: "#E67E22",
    order: 7,
    status: "active"
  },
  {
    name: "البيتزا",
    nameEn: "Pizza",
    description: "Freshly made pizzas with various toppings",
    icon: "https://api.builder.io/api/v1/image/assets/TEMP/b68ed657334a268ff8c023e2831ae25d0988520a?width=54",
    color: "#E74C3C",
    order: 8,
    status: "active"
  },
  {
    name: "السندوتش و البرجر",
    nameEn: "Sandwiches & Burgers",
    description: "Delicious sandwiches and burgers",
    icon: "https://api.builder.io/api/v1/image/assets/TEMP/25389b4fee72a8c437f2dfee9b468b47da34a3cc?width=64",
    color: "#8E44AD",
    order: 9,
    status: "active"
  },
  {
    name: "الحلا",
    nameEn: "Desserts",
    description: "Sweet treats and desserts",
    icon: "https://api.builder.io/api/v1/image/assets/TEMP/f400aa2409f2a47ba2ba36ea8fe85c63e55cfd1c?width=52",
    color: "#F1C40F",
    order: 10,
    status: "active"
  },
  {
    name: "الشيشة",
    nameEn: "Shisha",
    description: "Traditional hookah and shisha",
    icon: "https://api.builder.io/api/v1/image/assets/TEMP/9b45510037581f790556bf8fdd013550346c228b?width=72",
    color: "#34495E",
    order: 11,
    status: "active"
  }
];

async function uploadCategories() {
  try {
    console.log('Connecting to MongoDB...');
    
    // Connect to MongoDB using the same connection string as the app
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/maraksh-restaurant';
    await mongoose.connect(mongoUri);
    
    console.log('Clearing existing categories...');
    await Category.deleteMany({});
    
    console.log('Uploading categories...');
    const createdCategories = await Category.insertMany(staticCategories);
    
    console.log(`Successfully uploaded ${createdCategories.length} categories:`);
    createdCategories.forEach((category, index) => {
      console.log(`${index + 1}. ${category.name} (${category.nameEn}) - Order: ${category.order}`);
    });
    
    console.log('\nCategories upload completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error uploading categories:', error);
    process.exit(1);
  }
}

// Run the script
uploadCategories();
