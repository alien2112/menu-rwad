import { NextRequest, NextResponse } from 'next/server';
import { ContactSettings } from '@/lib/models/ContactSettings';
import dbConnect from '@/lib/mongodb';

// GET /api/contact-settings - Fetch contact settings
export async function GET() {
  try {
    await dbConnect();
    
    const settings = await ContactSettings.findOne({ isActive: true }).lean();
    
    if (!settings) {
      // Return default settings if none exist
      return NextResponse.json({
        success: true,
        data: {
          phone: '966567833138',
          email: 'info@maraksh.com',
          address: 'المدينة المنورة - حي النبلاء',
          addressEn: 'Al Madinah Al Munawwarah - Al Nubala District',
          workingHours: {
            open: 'من 8:00 صباحاً إلى 12:00 منتصف الليل',
            days: 'يومياً',
            openEn: 'From 8:00 AM to 12:00 AM',
            daysEn: 'Daily'
          },
          socialMedia: {
            facebook: 'https://www.facebook.com/cafemwalmarakish',
            instagram: '',
            twitter: 'https://x.com/mwal_marakish',
            tiktok: 'https://www.tiktok.com/@mwal_marakish/video/7508959966254927122',
            whatsapp: 'https://wa.me/966567833138',
            youtube: '',
            linkedin: ''
          },
          mapSettings: {
            latitude: 24.4672,
            longitude: 39.6142,
            zoom: 15,
            addressQuery: 'المدينة المنورة - حي النبلاء'
          },
          additionalInfo: {
            description: 'نرحب بكم في مطعم موال مراكش',
            descriptionEn: 'Welcome to Maraksh Restaurant'
          },
          isActive: true
        }
      });
    }
    
    return NextResponse.json({
      success: true,
      data: settings
    });
  } catch (error) {
    console.error('Error fetching contact settings:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch contact settings' },
      { status: 500 }
    );
  }
}

// PUT /api/contact-settings - Update contact settings
export async function PUT(request: NextRequest) {
  try {
    await dbConnect();
    
    const body = await request.json();
    
    // Validate required fields
    if (!body.phone || !body.email || !body.address) {
      return NextResponse.json(
        { success: false, error: 'Phone, email, and address are required' },
        { status: 400 }
      );
    }
    
    // Validate map settings
    if (!body.mapSettings?.latitude || !body.mapSettings?.longitude) {
      return NextResponse.json(
        { success: false, error: 'Map latitude and longitude are required' },
        { status: 400 }
      );
    }
    
    // Generate map URLs if not provided
    const mapSettings = {
      ...body.mapSettings,
      mapUrl: body.mapSettings.mapUrl || `https://www.google.com/maps?q=${encodeURIComponent(body.mapSettings.addressQuery || body.address)}`,
      embedUrl: body.mapSettings.embedUrl || `https://www.google.com/maps/embed/v1/place?key=YOUR_API_KEY&q=${encodeURIComponent(body.mapSettings.addressQuery || body.address)}`
    };
    
    const updateData = {
      ...body,
      mapSettings,
      updatedAt: new Date()
    };
    
    // Find existing active settings or create new ones
    let settings = await ContactSettings.findOne({ isActive: true });
    
    if (settings) {
      // Update existing settings
      Object.assign(settings, updateData);
      await settings.save();
    } else {
      // Create new settings
      settings = new ContactSettings(updateData);
      await settings.save();
    }
    
    return NextResponse.json({
      success: true,
      data: settings
    });
  } catch (error) {
    console.error('Error updating contact settings:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update contact settings' },
      { status: 500 }
    );
  }
}

// POST /api/contact-settings - Create new contact settings
export async function POST(request: NextRequest) {
  try {
    await dbConnect();
    
    const body = await request.json();
    
    // Validate required fields
    if (!body.phone || !body.email || !body.address) {
      return NextResponse.json(
        { success: false, error: 'Phone, email, and address are required' },
        { status: 400 }
      );
    }
    
    // Deactivate any existing settings
    await ContactSettings.updateMany({ isActive: true }, { isActive: false });
    
    // Create new settings
    const settings = new ContactSettings({
      ...body,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    });
    
    await settings.save();
    
    return NextResponse.json({
      success: true,
      data: settings
    });
  } catch (error) {
    console.error('Error creating contact settings:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create contact settings' },
      { status: 500 }
    );
  }
}
