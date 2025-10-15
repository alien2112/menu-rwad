import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Notification from '@/lib/models/Notification';

export async function GET(request: NextRequest) {
  try {
    await dbConnect();
    
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') || searchParams.get('category');
    const priority = searchParams.get('priority');
    const read = searchParams.get('read');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');
    
    // Build query
    const query: any = {};
    if (type) query.type = type;
    if (priority) query.priority = priority;
    if (read !== null) query.read = read === 'true';
    
    const notifications = await Notification.find(query)
      .sort({ timestamp: -1 })
      .limit(limit)
      .skip(offset);
    
    const total = await Notification.countDocuments(query);
    
    return NextResponse.json({
      success: true,
      data: notifications,
      pagination: {
        total,
        limit,
        offset,
        hasMore: offset + limit < total
      }
    });
  } catch (error) {
    console.error('Error fetching notifications:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch notifications' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    await dbConnect();
    
    const notificationData = await request.json();
    
    const notification = new Notification({
      ...notificationData,
      timestamp: new Date(),
      read: false,
      dismissed: false
    });
    
    await notification.save();
    
    return NextResponse.json({
      success: true,
      data: notification
    });
  } catch (error) {
    console.error('Error creating notification:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create notification' },
      { status: 500 }
    );
  }
}