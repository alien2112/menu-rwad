import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import PrintJob from '@/lib/models/PrintJob';
import Printer from '@/lib/models/Printer';
import Order from '@/lib/models/Order';

// GET print jobs
export async function GET(request: NextRequest) {
  try {
    await dbConnect();
    
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const printerId = searchParams.get('printerId');
    const department = searchParams.get('department');
    const orderId = searchParams.get('orderId');
    const limit = parseInt(searchParams.get('limit') || '50');
    const page = parseInt(searchParams.get('page') || '1');
    const skip = (page - 1) * limit;

    let query: any = {};
    
    if (status) {
      query.status = status;
    }
    
    if (printerId) {
      query.printerId = printerId;
    }
    
    if (department) {
      query.department = department;
    }
    
    if (orderId) {
      query.orderId = orderId;
    }

    const printJobs = await PrintJob.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    const totalCount = await PrintJob.countDocuments(query);

    return NextResponse.json({
      success: true,
      data: {
        printJobs,
        pagination: {
          total: totalCount,
          page,
          limit,
          totalPages: Math.ceil(totalCount / limit)
        }
      }
    });

  } catch (error: any) {
    console.error('[Print Jobs API] Error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// POST create print job
export async function POST(request: NextRequest) {
  try {
    await dbConnect();
    
    const body = await request.json();
    
    const {
      printerId,
      orderId,
      jobType = 'order',
      priority = 'normal',
      printSettings,
      createdBy
    } = body;

    if (!printerId || !orderId || !createdBy) {
      return NextResponse.json(
        { success: false, error: 'Printer ID, Order ID, and Created By are required' },
        { status: 400 }
      );
    }

    // Get printer details
    const printer = await Printer.findById(printerId);
    if (!printer) {
      return NextResponse.json(
        { success: false, error: 'Printer not found' },
        { status: 404 }
      );
    }

    if (!printer.isActive) {
      return NextResponse.json(
        { success: false, error: 'Printer is not active' },
        { status: 400 }
      );
    }

    // Get order details
    const order = await Order.findById(orderId);
    if (!order) {
      return NextResponse.json(
        { success: false, error: 'Order not found' },
        { status: 404 }
      );
    }

    // Filter items by department for this printer
    const departmentItems = order.items.filter((item: any) => item.department === printer.department);
    
    if (departmentItems.length === 0) {
      return NextResponse.json(
        { success: false, error: 'No items found for this department' },
        { status: 400 }
      );
    }

    // Generate job ID
    const jobId = PrintJob.generateJobId();

    // Create print job
    const printJob = await PrintJob.create({
      jobId,
      printerId: printer._id.toString(),
      printerName: printer.name,
      department: printer.department,
      orderId: order._id.toString(),
      orderNumber: order.orderNumber,
      jobType,
      priority,
      ticketData: {
        items: departmentItems.map((item: any) => ({
          name: item.menuItemName,
          nameEn: item.menuItemNameEn,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          totalPrice: item.totalPrice,
          customizations: item.customizations,
          notes: item.notes
        })),
        customerInfo: {
          name: order.customerInfo?.name,
          phone: order.customerInfo?.phone,
          tableNumber: order.notes?.includes('طاولة') ? 
            order.notes.match(/طاولة\s*(\d+)/)?.[1] : undefined
        },
        orderInfo: {
          orderNumber: order.orderNumber,
          orderDate: order.orderDate,
          totalAmount: order.totalAmount,
          taxInfo: order.taxInfo
        },
        departmentInfo: {
          department: printer.department,
          assignedTo: order.assignedTo?.[printer.department],
          estimatedPrepTime: departmentItems.reduce((sum: number, item: any) => 
            sum + (item.estimatedPrepTime || 15), 0)
        }
      },
      printSettings: {
        ...printer.settings,
        ...printSettings
      },
      createdBy
    });

    // Process the print job immediately
    const printResult = await processPrintJob(printJob, printer);

    return NextResponse.json({
      success: printResult.success,
      data: printJob,
      message: printResult.success ? 'Print job created and sent successfully' : 'Print job created but failed to print'
    });

  } catch (error: any) {
    console.error('[Print Jobs API] Error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// PUT update print job (for reprinting, cancelling, etc.)
export async function PUT(request: NextRequest) {
  try {
    await dbConnect();
    
    const { searchParams } = new URL(request.url);
    const jobId = searchParams.get('jobId');
    const action = searchParams.get('action'); // reprint, cancel, retry
    
    if (!jobId || !action) {
      return NextResponse.json(
        { success: false, error: 'Job ID and action are required' },
        { status: 400 }
      );
    }

    const printJob = await PrintJob.findOne({ jobId });
    if (!printJob) {
      return NextResponse.json(
        { success: false, error: 'Print job not found' },
        { status: 404 }
      );
    }

    switch (action) {
      case 'reprint':
        if (printJob.status === 'completed' || printJob.status === 'failed') {
          // Create a new reprint job
          const reprintJobId = PrintJob.generateJobId();
          const reprintJob = await PrintJob.create({
            ...printJob.toObject(),
            _id: undefined,
            jobId: reprintJobId,
            jobType: 'reprint',
            status: 'pending',
            attempts: 0,
            errorMessage: undefined,
            startedAt: undefined,
            completedAt: undefined,
            createdAt: new Date(),
            updatedAt: new Date()
          });

          // Get printer and process reprint
          const printer = await Printer.findById(printJob.printerId);
          if (printer) {
            const printResult = await processPrintJob(reprintJob, printer);
            return NextResponse.json({
              success: printResult.success,
              data: reprintJob,
              message: printResult.success ? 'Reprint sent successfully' : 'Reprint failed'
            });
          }
        }
        break;

      case 'cancel':
        if (printJob.status === 'pending' || printJob.status === 'printing') {
          await printJob.cancelPrint();
          return NextResponse.json({
            success: true,
            data: printJob,
            message: 'Print job cancelled successfully'
          });
        }
        break;

      case 'retry':
        if (printJob.canRetry()) {
          const printer = await Printer.findById(printJob.printerId);
          if (printer) {
            const printResult = await processPrintJob(printJob, printer);
            return NextResponse.json({
              success: printResult.success,
              data: printJob,
              message: printResult.success ? 'Retry successful' : 'Retry failed'
            });
          }
        }
        break;

      default:
        return NextResponse.json(
          { success: false, error: 'Invalid action' },
          { status: 400 }
        );
    }

    return NextResponse.json(
      { success: false, error: 'Action not allowed for current job status' },
      { status: 400 }
    );

  } catch (error: any) {
    console.error('[Print Jobs API] Error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// Helper function to process print job
async function processPrintJob(printJob: any, printer: any) {
  try {
    await printJob.startPrint();
    
    // This is a placeholder for actual printing
    // In a real implementation, you would:
    // 1. Format the ticket data using ESC/POS commands
    // 2. Send the data to the printer based on connection type
    // 3. Handle the response and update job status
    
    // Simulate printing delay
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    await printJob.completePrint();
    await printer.recordPrint(printJob.orderNumber);
    
    return { success: true, error: null };
  } catch (error) {
    await printJob.failPrint(error.message);
    return { success: false, error: error.message };
  }
}





