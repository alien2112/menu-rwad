import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import User from '@/lib/models/User';

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await dbConnect();
    
    const user = await User.findById(params.id);
    
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }
    
    // Toggle active status
    user.isActive = !user.isActive;
    await user.save();
    
    // Return user without password
    const userResponse = user.toObject();
    delete userResponse.password;
    
    return NextResponse.json({
      success: true,
      data: userResponse
    });
  } catch (error) {
    console.error('Error toggling user status:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to toggle user status' },
      { status: 500 }
    );
  }
}






