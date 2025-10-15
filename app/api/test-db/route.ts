import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import mongoose from 'mongoose';

export async function GET(request: NextRequest) {
  try {
    console.log('Testing database connection...');
    
    // Test basic connection
    await dbConnect();
    console.log('Database connected successfully');
    
    // Test database name
    const dbName = mongoose.connection.db.databaseName;
    console.log('Database name:', dbName);
    
    // Test collections
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log('Collections:', collections.map(c => c.name));
    
    // Test Category model
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
    
    const categoryCount = await Category.countDocuments();
    console.log('Category count:', categoryCount);
    
    // Test MenuItem model
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
    
    const menuItemCount = await MenuItem.countDocuments();
    console.log('MenuItem count:', menuItemCount);
    
    return NextResponse.json({
      success: true,
      data: {
        databaseName: dbName,
        collections: collections.map(c => c.name),
        categoryCount,
        menuItemCount,
        connectionStatus: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
      }
    });
    
  } catch (error: any) {
    console.error('Database test error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}





