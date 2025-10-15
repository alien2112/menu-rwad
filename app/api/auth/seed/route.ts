import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import User from '@/lib/models/User';

export async function POST(request: NextRequest) {
  try {
    await dbConnect();

    // Check if users already exist
    const existingUsers = await User.countDocuments();
    if (existingUsers > 0) {
      return NextResponse.json({
        success: false,
        error: 'Users already exist'
      });
    }

    // Create default users
    const defaultUsers = [
      {
        username: 'admin',
        password: 'admin2024',
        role: 'admin' as const,
        name: 'مدير النظام'
      },
      {
        username: 'kitchen',
        password: 'kitchen2024',
        role: 'kitchen' as const,
        name: 'طاهي المطبخ'
      },
      {
        username: 'barista',
        password: 'barista2024',
        role: 'barista' as const,
        name: 'بارستا'
      },
      {
        username: 'shisha',
        password: 'shisha2024',
        role: 'shisha' as const,
        name: 'مشغل الشيشة'
      }
    ];

    const createdUsers = await User.insertMany(defaultUsers);

    return NextResponse.json({
      success: true,
      data: createdUsers.map(user => ({
        id: user._id,
        username: user.username,
        role: user.role,
        name: user.name
      })),
      message: 'Default users created successfully'
    });

  } catch (error) {
    console.error('Seed users error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create users' },
      { status: 500 }
    );
  }
}

