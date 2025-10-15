import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import User from '@/lib/models/User';
import bcrypt from 'bcryptjs';

export async function GET() {
  try {
    await dbConnect();
    
    const users = await User.find({}).select('-password').sort({ createdAt: -1 });
    
    // Add mock performance data for demonstration
    const usersWithPerformance = users.map(user => ({
      ...user.toObject(),
      performance: {
        totalOrders: Math.floor(Math.random() * 100),
        totalRevenue: Math.floor(Math.random() * 10000),
        averageOrderValue: Math.floor(Math.random() * 200),
        efficiency: Math.floor(Math.random() * 100),
        rating: Math.random() * 5,
        tasksCompleted: Math.floor(Math.random() * 50),
        tasksPending: Math.floor(Math.random() * 10)
      },
      activity: {
        loginCount: Math.floor(Math.random() * 100),
        lastActivity: new Date(Date.now() - Math.random() * 86400000),
        hoursWorked: Math.floor(Math.random() * 40),
        status: ['online', 'offline', 'busy'][Math.floor(Math.random() * 3)]
      }
    }));
    
    return NextResponse.json({
      success: true,
      data: usersWithPerformance
    });
  } catch (error) {
    console.error('Error fetching staff:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch staff' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    await dbConnect();
    
    const { username, name, password, role, isActive } = await request.json();
    
    // Validate required fields
    if (!username || !name || !password || !role) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }
    
    // Check if username already exists
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return NextResponse.json(
        { success: false, error: 'Username already exists' },
        { status: 400 }
      );
    }
    
    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);
    
    // Create new user
    const newUser = new User({
      username,
      name,
      password: hashedPassword,
      role,
      isActive: isActive !== false
    });
    
    await newUser.save();
    
    // Return user without password
    const userResponse = newUser.toObject();
    delete userResponse.password;
    
    return NextResponse.json({
      success: true,
      data: userResponse
    });
  } catch (error) {
    console.error('Error creating staff member:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create staff member' },
      { status: 500 }
    );
  }
}






