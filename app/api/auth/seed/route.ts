import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import User from '@/lib/models/User';

/**
 * Seed demo users with secure hashed passwords
 * Password hashing happens automatically via User model middleware
 * Use POST /api/auth/seed to create/reset demo users
 */
export async function POST() {
  try {
    await dbConnect();

    // Define demo users with secure passwords
    const defaultUsers = [
      {
        username: 'admin',
        password: 'Admin@2024', // Will be hashed by model middleware
        role: 'admin' as const,
        name: 'مدير النظام',
        email: 'admin@restaurant.com',
        permissions: {
          canManageAllBranches: true,
          canViewReports: true,
          canManageMenu: true,
          canManageOrders: true,
          canManageStaff: true,
        },
        isActive: true,
      },
      {
        username: 'kitchen',
        password: 'Kitchen@2024', // Will be hashed by model middleware
        role: 'kitchen' as const,
        name: 'طاهي المطبخ',
        email: 'kitchen@restaurant.com',
        permissions: {
          canManageOrders: true,
        },
        isActive: true,
      },
      {
        username: 'barista',
        password: 'Barista@2024', // Will be hashed by model middleware
        role: 'barista' as const,
        name: 'بارستا',
        email: 'barista@restaurant.com',
        permissions: {
          canManageOrders: true,
        },
        isActive: true,
      },
      {
        username: 'shisha',
        password: 'Shisha@2024', // Will be hashed by model middleware
        role: 'shisha' as const,
        name: 'مشغل الشيشة',
        email: 'shisha@restaurant.com',
        permissions: {
          canManageOrders: true,
        },
        isActive: true,
      },
    ];

    // Create or update users
    const results = [];
    for (const userData of defaultUsers) {
      // Delete existing user if any
      await User.deleteOne({ username: userData.username });

      // Create new user (password will be hashed by middleware)
      const newUser = await User.create(userData);

      results.push({
        id: newUser._id,
        username: newUser.username,
        role: newUser.role,
        name: newUser.name,
      });
    }

    return NextResponse.json({
      success: true,
      data: results,
      message: 'Demo users created successfully',
      credentials: {
        admin: { username: 'admin', password: 'Admin@2024' },
        kitchen: { username: 'kitchen', password: 'Kitchen@2024' },
        barista: { username: 'barista', password: 'Barista@2024' },
        shisha: { username: 'shisha', password: 'Shisha@2024' },
      },
    });
  } catch (error) {
    console.error('Seed users error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create users' },
      { status: 500 }
    );
  }
}

