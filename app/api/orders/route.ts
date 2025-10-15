import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Order from '@/lib/models/Order';
import MenuItem from '@/lib/models/MenuItem';
import TaxSettings from '@/lib/models/TaxSettings';
import MaterialUsage from '@/lib/models/MaterialUsage';
import Notification from '@/lib/models/Notification';
import Printer from '@/lib/models/Printer';
import PrintJob from '@/lib/models/PrintJob';
import { sanitizeOrderData, sanitizePagination, sanitizeString, sanitizeObjectId, checkRateLimit } from '@/lib/sanitize';
import { sendOrderNotification, sendLowStockNotification, sendOutOfStockNotification } from '@/lib/notificationUtils';
import { autoDisableMenuItems } from '@/lib/menuItemStatusManager';
import { optimizedAutoConsumeInventory } from '@/lib/queryOptimizer';

// Generate unique order number
function generateOrderNumber(): string {
  const date = new Date();
  const timestamp = date.getTime().toString().slice(-6);
  const random = Math.floor(Math.random() * 100).toString().padStart(2, '0');
  return `#${timestamp}${random}`;
}

// Helper function to determine department based on category
function getDepartmentFromCategory(categoryId: string): 'kitchen' | 'barista' | 'shisha' {
  // This mapping should be based on your actual category structure
  // You can enhance this by storing department info in categories
  const categoryToDepartment: { [key: string]: 'kitchen' | 'barista' | 'shisha' } = {
    // Food categories -> Kitchen
    'pizza': 'kitchen',
    'sandwiches': 'kitchen',
    'manakish': 'kitchen',
    'desserts': 'kitchen',
    
    // Beverage categories -> Barista
    'hot-coffee': 'barista',
    'cold-coffee': 'barista',
    'tea': 'barista',
    'cocktails': 'barista',
    'natural-juices': 'barista',
    
    // Shisha category -> Shisha
    'shisha': 'shisha'
  };
  
  return categoryToDepartment[categoryId] || 'kitchen';
}

// Validate inventory availability before processing order
async function validateInventoryAvailability(orderItems: any[]): Promise<{ valid: boolean; errors: string[] }> {
  try {
    const { InventoryItem } = await import('@/lib/models/Inventory');
    const errors: string[] = [];
    
    // Batch fetch all menu items
    const menuItemIds = orderItems.map(item => item.menuItemId);
    const menuItems = await MenuItem.find({ _id: { $in: menuItemIds } });
    const menuItemsMap = new Map(menuItems.map(item => [item._id.toString(), item]));
    
    // Batch fetch all inventory items
    const ingredientIds = new Set<string>();
    menuItems.forEach(item => {
      item.ingredients.forEach(ingredient => {
        ingredientIds.add(ingredient.ingredientId);
      });
    });
    
    const inventoryItems = await InventoryItem.find({ ingredientId: { $in: Array.from(ingredientIds) } });
    const inventoryMap = new Map(inventoryItems.map(item => [item.ingredientId, item]));
    
    // Validate each order item
    for (const orderItem of orderItems) {
      const menuItem = menuItemsMap.get(orderItem.menuItemId);
      if (!menuItem) {
        errors.push(`Menu item not found: ${orderItem.menuItemId}`);
        continue;
      }
      
      // Check each ingredient
      for (const ingredient of menuItem.ingredients) {
        const inventoryItem = inventoryMap.get(ingredient.ingredientId);
        if (!inventoryItem) {
          errors.push(`Inventory item not found for ingredient: ${ingredient.ingredientId}`);
          continue;
        }
        
        const requiredQuantity = ingredient.portion * orderItem.quantity;
        if (inventoryItem.currentStock < requiredQuantity) {
          errors.push(`Insufficient stock for ${inventoryItem.ingredientName}: ${inventoryItem.currentStock} available, ${requiredQuantity} required`);
        }
      }
    }
    
    return {
      valid: errors.length === 0,
      errors
    };
  } catch (error) {
    console.error('Error validating inventory:', error);
    return {
      valid: false,
      errors: ['Error validating inventory availability']
    };
  }
}

// Auto-consume inventory based on order items
async function autoConsumeInventory(order: any) {
  try {
    const { InventoryItem, InventoryConsumption } = await import('@/lib/models/Inventory');
    
    for (const orderItem of order.items) {
      const { menuItemId, quantity } = orderItem;

      // Get menu item details
      const menuItem = await MenuItem.findById(menuItemId);
      if (!menuItem) {
        console.warn(`Menu item not found: ${menuItemId}`);
        continue;
      }

      // Process each ingredient in the menu item
      for (const ingredient of menuItem.ingredients) {
        const { ingredientId, portion } = ingredient;
        const totalConsumption = portion * quantity;

        // Find inventory item
        const inventoryItem = await InventoryItem.findOne({ ingredientId });
        if (!inventoryItem) {
          console.warn(`Inventory item not found for ingredient: ${ingredientId}`);
          continue;
        }

        // Check if there's enough stock
        if (inventoryItem.currentStock < totalConsumption) {
          console.warn(`Insufficient stock for ingredient ${ingredientId}: ${inventoryItem.currentStock} < ${totalConsumption}`);
          continue;
        }

        // Create consumption record
        const consumptionRecord = new InventoryConsumption({
          ingredientId,
          ingredientName: inventoryItem.ingredientName,
          quantityConsumed: totalConsumption,
          unit: inventoryItem.unit,
          reason: 'order',
          orderId: order._id.toString(),
          menuItemId,
          notes: `Auto-consumption for order ${order.orderNumber}`,
          recordedBy: 'system',
          recordedAt: new Date()
        });

        await consumptionRecord.save();

        // Update inventory stock
        inventoryItem.currentStock -= totalConsumption;
        
        // Update status based on new stock level
        if (inventoryItem.currentStock <= 0) {
          inventoryItem.status = 'out_of_stock';
        } else if (inventoryItem.currentStock <= inventoryItem.minStockLevel) {
          inventoryItem.status = 'low_stock';
        } else {
          inventoryItem.status = 'in_stock';
        }

        inventoryItem.lastUpdated = new Date();
        await inventoryItem.save();

        // Send notifications based on stock status
        if (inventoryItem.status === 'out_of_stock') {
          await sendOutOfStockNotification(inventoryItem.ingredientName);
          // Auto-disable menu items that depend on this ingredient
          await autoDisableMenuItems(ingredientId);
        } else if (inventoryItem.status === 'low_stock') {
          await sendLowStockNotification(
            inventoryItem.ingredientName, 
            inventoryItem.currentStock, 
            inventoryItem.minStockLevel
          );
        }
      }
    }
  } catch (error) {
    console.error('Error in auto-consume inventory:', error);
    // Don't throw error to avoid breaking order creation
  }
}

export async function POST(request: NextRequest) {
  try {
    // Rate limiting
    const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown';
    const rateLimit = checkRateLimit(`order:${ip}`, 20, 60000); // 20 requests per minute

    if (!rateLimit.allowed) {
      return NextResponse.json(
        { success: false, error: 'Too many requests. Please try again later.' },
        { status: 429, headers: { 'Retry-After': String(Math.ceil((rateLimit.resetAt - Date.now()) / 1000)) } }
      );
    }

    await dbConnect();

    const rawData = await request.json();

    // Sanitize and validate order data
    let orderData;
    try {
      orderData = sanitizeOrderData(rawData);
    } catch (error: any) {
      return NextResponse.json(
        { success: false, error: error.message || 'Invalid order data' },
        { status: 400 }
      );
    }

    // Validate required fields after sanitization
    if (!orderData.items || !Array.isArray(orderData.items) || orderData.items.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Order items are required' },
        { status: 400 }
      );
    }

    if (!orderData.totalAmount || orderData.totalAmount <= 0) {
      return NextResponse.json(
        { success: false, error: 'Valid total amount is required' },
        { status: 400 }
      );
    }

    if (!orderData.customerInfo || !orderData.customerInfo.name || !orderData.customerInfo.phone) {
      return NextResponse.json(
        { success: false, error: 'Customer information (name and phone) is required' },
        { status: 400 }
      );
    }

    // Validate inventory availability before processing order
    const inventoryValidation = await validateInventoryAvailability(orderData.items);
    if (!inventoryValidation.valid) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Insufficient inventory for order',
          details: inventoryValidation.errors
        },
        { status: 400 }
      );
    }

    // Generate order number
    const orderNumber = generateOrderNumber();

    // Get tax settings for order
    const taxSettings = await TaxSettings.getTaxSettings();
    
    // Calculate tax information
    let taxInfo = null;
    if (taxSettings.enableTaxHandling) {
      const taxRate = taxSettings.vatRate / 100;
      let subtotal, taxAmount;
      
      if (taxSettings.includeTaxInPrice) {
        // Tax is included in price
        subtotal = orderData.totalAmount / (1 + taxRate);
        taxAmount = orderData.totalAmount - subtotal;
      } else {
        // Tax is added to price
        subtotal = orderData.totalAmount;
        taxAmount = orderData.totalAmount * taxRate;
      }
      
      taxInfo = {
        subtotal: Number(subtotal.toFixed(2)),
        taxRate: taxSettings.vatRate,
        taxAmount: Number(taxAmount.toFixed(2)),
        includeTaxInPrice: taxSettings.includeTaxInPrice
      };
    }

    // Process items and assign departments
    const processedItems = [];
    const departmentStatuses = {
      kitchen: 'pending' as const,
      barista: 'pending' as const,
      shisha: 'pending' as const
    };

    for (const item of orderData.items) {
      // Get menu item details to determine department
      const menuItem = await MenuItem.findById(item.menuItemId);
      const department = menuItem ? getDepartmentFromCategory(menuItem.categoryId) : 'kitchen';
      
      const processedItem = {
        ...item,
        department,
        departmentStatus: 'pending' as const,
        estimatedPrepTime: menuItem?.preparationTime || 15
      };
      
      processedItems.push(processedItem);
      
      // Update department status if this department has items
      if (departmentStatuses[department] === 'pending') {
        departmentStatuses[department] = 'pending';
      }
    }

    // Create order
    const order = new Order({
      orderNumber,
      items: processedItems,
      totalAmount: orderData.totalAmount,
      discountAmount: orderData.discountAmount || 0,
      taxInfo,
      customerInfo: orderData.customerInfo,
      status: 'pending',
      departmentStatuses,
      orderDate: new Date(),
      source: orderData.source || 'website',
      notes: orderData.notes || '',
    });

    await order.save();

    // Auto-consume inventory based on order items (optimized)
    const inventoryResult = await optimizedAutoConsumeInventory(order);
    
    if (!inventoryResult.success && inventoryResult.errors.length > 0) {
      console.warn('Inventory consumption warnings:', inventoryResult.errors);
    }
    
    console.log(`✅ Consumed ${inventoryResult.consumedItems} inventory items`);

    // Record material usage for each item
    await recordMaterialUsage(order);

    // Send order to printers automatically
    await sendOrderToPrinters(order);

    // Send order notification
    await sendOrderNotification(order);

    return NextResponse.json({
      success: true,
      data: order,
      message: 'Order created successfully'
    });

  } catch (error) {
    console.error('Error creating order:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create order' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    await dbConnect();

    const { searchParams } = new URL(request.url);
    const status = sanitizeString(searchParams.get('status'));
    const department = sanitizeString(searchParams.get('department'));
    const departmentStatus = sanitizeString(searchParams.get('departmentStatus'));

    // Sanitize pagination
    const { page, limit } = sanitizePagination({
      page: searchParams.get('page'),
      limit: searchParams.get('limit'),
      maxLimit: 100
    });

    const skip = (page - 1) * limit;
    const from = sanitizeString(searchParams.get('from'));
    const to = sanitizeString(searchParams.get('to'));

    // Build query
    const query: any = {};
    if (status) {
      query.status = status;
    }
    
    // Department filtering
    if (department) {
      query['items.department'] = department;
    }
    
    if (departmentStatus) {
      query[`departmentStatuses.${department}`] = departmentStatus;
    }
    
    // Optional date range filter by orderDate
    if (from || to) {
      query.orderDate = {};
      if (from) {
        const fromDate = new Date(from);
        if (!isNaN(fromDate.getTime())) {
          query.orderDate.$gte = fromDate;
        }
      }
      if (to) {
        const toDate = new Date(to);
        if (!isNaN(toDate.getTime())) {
          // include the full day for date-only strings by setting time to end of day
          if (/^\d{4}-\d{2}-\d{2}$/.test(to)) {
            toDate.setHours(23, 59, 59, 999);
          }
          query.orderDate.$lte = toDate;
        }
      }
      if (Object.keys(query.orderDate).length === 0) {
        delete query.orderDate;
      }
    }

    // Get orders with pagination
    const orders = await Order.find(query)
      .sort({ orderDate: -1 })
      .skip(skip)
      .limit(limit);

    // Get total count
    const totalCount = await Order.countDocuments(query);

    return NextResponse.json({
      success: true,
      data: orders,
      pagination: {
        page,
        limit,
        totalCount,
        totalPages: Math.ceil(totalCount / limit),
      }
    });

  } catch (error) {
    console.error('Error fetching orders:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch orders' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    await dbConnect();

    const { searchParams } = new URL(request.url);
    const orderId = sanitizeObjectId(searchParams.get('id'));

    if (!orderId) {
      return NextResponse.json(
        { success: false, error: 'Valid Order ID is required' },
        { status: 400 }
      );
    }

    const rawData = await request.json();

    // Sanitize allowed fields for update
    const updateData: any = {};
    if (rawData.status) updateData.status = sanitizeString(rawData.status);
    if (rawData.notes) updateData.notes = sanitizeString(rawData.notes);
    if (rawData.departmentStatuses) {
      updateData.departmentStatuses = {};
      ['kitchen', 'barista', 'shisha'].forEach(dept => {
        if (rawData.departmentStatuses[dept]) {
          updateData.departmentStatuses[dept] = sanitizeString(rawData.departmentStatuses[dept]);
        }
      });
    }

    // Validate status if provided
    if (updateData.status && !['pending', 'confirmed', 'preparing', 'ready', 'delivered', 'cancelled'].includes(updateData.status)) {
      return NextResponse.json(
        { success: false, error: 'Invalid status' },
        { status: 400 }
      );
    }

    const order = await Order.findByIdAndUpdate(
      orderId,
      { ...updateData, updatedAt: new Date() },
      { new: true }
    );

    if (!order) {
      return NextResponse.json(
        { success: false, error: 'Order not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: order,
      message: 'Order updated successfully'
    });

  } catch (error) {
    console.error('Error updating order:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update order' },
      { status: 500 }
    );
  }
}

// Helper function to record material usage for an order
async function recordMaterialUsage(order: any) {
  try {
    for (const item of order.items) {
      // Get menu item with ingredients
      const menuItem = await MenuItem.findById(item.menuItemId);
      if (!menuItem || !menuItem.ingredients) continue;

      for (const ingredient of menuItem.ingredients) {
        // Calculate total quantity needed (portion * order quantity)
        const totalQuantity = ingredient.portion * item.quantity;

        // Record material usage
        const usage = new MaterialUsage({
          materialId: ingredient.ingredientId,
          materialName: `Ingredient ${ingredient.ingredientId}`, // You might want to fetch the actual name
          quantityUsed: totalQuantity,
          unit: 'g', // Default unit, should be fetched from material
          orderId: order._id.toString(),
          orderNumber: order.orderNumber,
          menuItemId: item.menuItemId,
          menuItemName: item.menuItemName,
          department: item.department,
          usageType: 'order',
          usageDate: new Date()
        });

        await usage.save();
      }
    }
  } catch (error) {
    console.error('Error recording material usage:', error);
  }
}

// Helper function to send order to appropriate printers
async function sendOrderToPrinters(order: any) {
  try {
    // Get all active printers
    const printers = await Printer.find({ isActive: true, isOnline: true });
    
    if (printers.length === 0) {
      console.log('No active printers found');
      return;
    }

    // Group items by department
    const itemsByDepartment = new Map<string, any[]>();
    order.items.forEach((item: any) => {
      const dept = item.department;
      if (!itemsByDepartment.has(dept)) {
        itemsByDepartment.set(dept, []);
      }
      itemsByDepartment.get(dept)!.push(item);
    });

    // Create print jobs for each department that has items
    for (const [department, items] of itemsByDepartment) {
      // Find printer for this department
      const printer = printers.find(p => p.department === department);
      
      if (!printer) {
        console.log(`No printer found for department: ${department}`);
        continue;
      }

      // Create print job
      const jobId = PrintJob.generateJobId();
      
      const printJob = await PrintJob.create({
        jobId,
        printerId: printer._id.toString(),
        printerName: printer.name,
        department: printer.department,
        orderId: order._id.toString(),
        orderNumber: order.orderNumber,
        jobType: 'order',
        priority: 'normal',
        ticketData: {
          items: items.map((item: any) => ({
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
            estimatedPrepTime: items.reduce((sum: number, item: any) => 
              sum + (item.estimatedPrepTime || 15), 0)
          }
        },
        printSettings: printer.settings,
        createdBy: 'system'
      });

      // Process the print job
      await processPrintJob(printJob, printer);
    }
  } catch (error) {
    console.error('Error sending order to printers:', error);
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
    
    console.log(`Print job ${printJob.jobId} completed successfully`);
  } catch (error) {
    await printJob.failPrint(error.message);
    console.error(`Print job ${printJob.jobId} failed:`, error.message);
  }
}


