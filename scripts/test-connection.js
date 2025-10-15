/**
 * Test MongoDB Connection
 * Simple test to verify the connection works
 */

const mongoose = require('mongoose');

async function testConnection() {
  console.log('🔍 Testing MongoDB Connection...\n');
  
  try {
    // Test connection
    await mongoose.connect('mongodb+srv://eslamabdaltif:oneone2@cluster0.p8b1qnv.mongodb.net/menurwad?retryWrites=true&w=majority&appName=Cluster0');
    console.log('✅ Connected to MongoDB Atlas');
    
    // Test database name
    console.log('Database name:', mongoose.connection.db.databaseName);
    
    // Test collections
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log('Collections found:', collections.map(c => c.name));
    
    // Test Category collection
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
    
    const categories = await Category.find({}).limit(5);
    console.log('Sample categories:', categories.map(c => ({ name: c.name, nameEn: c.nameEn })));
    
    // Test MenuItem collection
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
    
    const menuItems = await MenuItem.find({}).limit(5);
    console.log('Sample menu items:', menuItems.map(m => ({ name: m.name, nameEn: m.nameEn, price: m.price })));
    
    console.log('\n✅ Connection test successful!');
    console.log('The database is accessible and contains the fake data.');
    
  } catch (error) {
    console.error('❌ Connection test failed:', error);
  } finally {
    await mongoose.connection.close();
    console.log('\n🔌 Connection closed');
  }
}

testConnection();





