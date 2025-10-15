import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Printer from '@/lib/models/Printer';

// GET all printers
export async function GET(request: NextRequest) {
  try {
    await dbConnect();
    
    const { searchParams } = new URL(request.url);
    const department = searchParams.get('department');
    const activeOnly = searchParams.get('activeOnly') === 'true';
    const onlineOnly = searchParams.get('onlineOnly') === 'true';

    let query: any = {};
    
    if (department) {
      query.department = department;
    }
    
    if (activeOnly) {
      query.isActive = true;
    }
    
    if (onlineOnly) {
      query.isActive = true;
      query.isOnline = true;
    }

    const printers = await Printer.find(query)
      .sort({ department: 1, name: 1 })
      .lean();

    return NextResponse.json({
      success: true,
      data: printers
    });

  } catch (error: any) {
    console.error('[Printers API] Error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// POST create new printer
export async function POST(request: NextRequest) {
  try {
    await dbConnect();
    
    const body = await request.json();
    
    // Validate required fields
    const {
      name,
      department,
      connectionType,
      connectionDetails,
      paperWidth = 58,
      settings
    } = body;

    if (!name || !department || !connectionType) {
      return NextResponse.json(
        { success: false, error: 'Name, department, and connection type are required' },
        { status: 400 }
      );
    }

    // Validate connection details based on connection type
    if (connectionType === 'LAN' || connectionType === 'WiFi') {
      if (!connectionDetails?.ipAddress) {
        return NextResponse.json(
          { success: false, error: 'IP address is required for LAN/WiFi connections' },
          { status: 400 }
        );
      }
    }

    if (connectionType === 'USB') {
      if (!connectionDetails?.usbPath) {
        return NextResponse.json(
          { success: false, error: 'USB path is required for USB connections' },
          { status: 400 }
        );
      }
    }

    if (connectionType === 'Bluetooth') {
      if (!connectionDetails?.bluetoothAddress) {
        return NextResponse.json(
          { success: false, error: 'Bluetooth address is required for Bluetooth connections' },
          { status: 400 }
        );
      }
    }

    // Check for duplicate names
    const existingPrinter = await Printer.findOne({ name });
    if (existingPrinter) {
      return NextResponse.json(
        { success: false, error: 'A printer with this name already exists' },
        { status: 400 }
      );
    }

    const printer = await Printer.create({
      name,
      department,
      connectionType,
      connectionDetails: {
        ipAddress: connectionDetails?.ipAddress,
        port: connectionDetails?.port || 9100,
        deviceId: connectionDetails?.deviceId,
        usbPath: connectionDetails?.usbPath,
        bluetoothAddress: connectionDetails?.bluetoothAddress,
      },
      paperWidth,
      settings: {
        copies: settings?.copies || 1,
        printCustomerCopy: settings?.printCustomerCopy !== false,
        printInternalCopy: settings?.printInternalCopy !== false,
        includeLogo: settings?.includeLogo || false,
        includeQRCode: settings?.includeQRCode !== false,
        fontSize: settings?.fontSize || 'medium',
        paperCut: settings?.paperCut !== false,
        buzzer: settings?.buzzer !== false,
      }
    });

    return NextResponse.json({
      success: true,
      data: printer,
      message: 'Printer created successfully'
    });

  } catch (error: any) {
    console.error('[Printers API] Error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// PUT update printer
export async function PUT(request: NextRequest) {
  try {
    await dbConnect();
    
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Printer ID is required' },
        { status: 400 }
      );
    }

    const body = await request.json();
    
    const printer = await Printer.findByIdAndUpdate(
      id,
      { ...body, updatedAt: new Date() },
      { new: true, runValidators: true }
    );

    if (!printer) {
      return NextResponse.json(
        { success: false, error: 'Printer not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: printer,
      message: 'Printer updated successfully'
    });

  } catch (error: any) {
    console.error('[Printers API] Error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// DELETE printer
export async function DELETE(request: NextRequest) {
  try {
    await dbConnect();
    
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Printer ID is required' },
        { status: 400 }
      );
    }

    const printer = await Printer.findByIdAndDelete(id);

    if (!printer) {
      return NextResponse.json(
        { success: false, error: 'Printer not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Printer deleted successfully'
    });

  } catch (error: any) {
    console.error('[Printers API] Error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}





