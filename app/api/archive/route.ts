import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Order from '@/lib/models/Order';
import MaterialUsage from '@/lib/models/MaterialUsage';
import Notification from '@/lib/models/Notification';
import ArchiveLog from '@/lib/models/ArchiveLog';
import * as XLSX from 'xlsx';

// Google Drive API setup (kept for future use)
const getGoogleDriveAuth = () => {
  const auth = new google.auth.GoogleAuth({
    credentials: {
      client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
      private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    },
    scopes: ['https://www.googleapis.com/auth/drive.file'],
  });
  
  return google.drive({ version: 'v3', auth });
};

// POST /api/archive - Create archive
export async function POST(request: NextRequest) {
  try {
    await dbConnect();

    const { archiveType, startDate, endDate } = await request.json();

    if (!archiveType || !startDate || !endDate) {
      return NextResponse.json(
        { success: false, error: 'Archive type, start date, and end date are required' },
        { status: 400 }
      );
    }

    const start = new Date(startDate);
    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999); // Include full day

    // Create archive log entry
    const archiveLog = new ArchiveLog({
      archiveType,
      period: { startDate: start, endDate: end },
      recordCount: 0,
      status: 'processing'
    });

    await archiveLog.save();

    try {
      let data: any[] = [];
      let fileName = '';

      switch (archiveType) {
        case 'orders':
          data = await Order.find({
            orderDate: { $gte: start, $lte: end }
          }).lean();
          fileName = `orders_${start.toISOString().split('T')[0]}_to_${end.toISOString().split('T')[0]}.xlsx`;
          break;

        case 'usage':
          data = await MaterialUsage.find({
            usageDate: { $gte: start, $lte: end }
          }).lean();
          fileName = `material_usage_${start.toISOString().split('T')[0]}_to_${end.toISOString().split('T')[0]}.xlsx`;
          break;

        case 'notifications':
          data = await Notification.find({
            createdAt: { $gte: start, $lte: end }
          }).lean();
          fileName = `notifications_${start.toISOString().split('T')[0]}_to_${end.toISOString().split('T')[0]}.xlsx`;
          break;

        default:
          throw new Error('Invalid archive type');
      }

      // Update record count
      await ArchiveLog.findByIdAndUpdate(archiveLog._id, {
        recordCount: data.length
      });

      if (data.length === 0) {
        await ArchiveLog.findByIdAndUpdate(archiveLog._id, {
          status: 'completed',
          completedAt: new Date()
        });

        return NextResponse.json({
          success: true,
          message: 'No data found for the specified period',
          archiveId: archiveLog._id
        });
      }

      // Convert to Excel
      const workbook = XLSX.utils.book_new();
      const worksheet = XLSX.utils.json_to_sheet(data);
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Data');
      
      // Generate Excel buffer
      const excelBuffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
      
      // Convert to base64 for download
      const base64Data = excelBuffer.toString('base64');
      
      // Update archive log
      await ArchiveLog.findByIdAndUpdate(archiveLog._id, {
        status: 'completed',
        filePath: fileName,
        completedAt: new Date()
      });

      return NextResponse.json({
        success: true,
        data: {
          archiveId: archiveLog._id,
          recordCount: data.length,
          fileName: fileName,
          downloadData: base64Data,
          mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        },
        message: 'Archive created successfully'
      });

    } catch (error) {
      console.error('Error creating archive:', error);
      
      await ArchiveLog.findByIdAndUpdate(archiveLog._id, {
        status: 'failed',
        errorMessage: error instanceof Error ? error.message : 'Unknown error'
      });

      return NextResponse.json(
        { success: false, error: 'Failed to create archive' },
        { status: 500 }
      );
    }

  } catch (error) {
    console.error('Error in archive creation:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create archive' },
      { status: 500 }
    );
  }
}

// GET /api/archive - Get archive logs
export async function GET(request: NextRequest) {
  try {
    await dbConnect();

    const { searchParams } = new URL(request.url);
    const archiveType = searchParams.get('type');
    const status = searchParams.get('status');
    const limit = parseInt(searchParams.get('limit') || '50');
    const page = parseInt(searchParams.get('page') || '1');
    const skip = (page - 1) * limit;

    const query: any = {};
    if (archiveType) query.archiveType = archiveType;
    if (status) query.status = status;

    const archives = await ArchiveLog.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const totalCount = await ArchiveLog.countDocuments(query);

    return NextResponse.json({
      success: true,
      data: archives,
      pagination: {
        page,
        limit,
        totalCount,
        totalPages: Math.ceil(totalCount / limit),
      }
    });

  } catch (error) {
    console.error('Error fetching archives:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch archives' },
      { status: 500 }
    );
  }
}

// Helper function to find or create Google Drive folder (kept for future use)
async function findOrCreateFolder(drive: any, folderName: string): Promise<string> {
  try {
    // Search for existing folder
    const response = await drive.files.list({
      q: `name='${folderName}' and mimeType='application/vnd.google-apps.folder'`,
      fields: 'files(id, name)',
    });

    if (response.data.files.length > 0) {
      return response.data.files[0].id;
    }

    // Create new folder
    const folderMetadata = {
      name: folderName,
      mimeType: 'application/vnd.google-apps.folder',
    };

    const folder = await drive.files.create({
      requestBody: folderMetadata,
      fields: 'id',
    });

    return folder.data.id;
  } catch (error) {
    console.error('Error finding/creating folder:', error);
    throw error;
  }
}
