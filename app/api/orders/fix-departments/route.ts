import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Order from '@/lib/models/Order';
import MenuItem from '@/lib/models/MenuItem';
import Category from '@/lib/models/Category';

export async function POST() {
  try {
    await dbConnect();

    // Get all orders
    const orders = await Order.find();
    console.log(`Found ${orders.length} orders to fix`);

    let updatedCount = 0;
    let errorCount = 0;

    for (const order of orders) {
      try {
        let needsUpdate = false;
        const updatedItems = [];

        // Process each item in the order
        for (const item of order.items) {
          // Get the menu item
          const menuItem = await MenuItem.findById(item.menuItemId);

          if (!menuItem) {
            console.warn(`Menu item not found: ${item.menuItemId}`);
            updatedItems.push(item);
            continue;
          }

          // Get the category
          const category = await Category.findById(menuItem.categoryId);

          if (!category) {
            console.warn(`Category not found: ${menuItem.categoryId}`);
            updatedItems.push(item);
            continue;
          }

          // Check if department needs updating
          const correctDepartment = category.department || 'kitchen';
          if (item.department !== correctDepartment) {
            needsUpdate = true;
            updatedItems.push({
              ...item.toObject(),
              department: correctDepartment
            });
            console.log(`Updating ${item.menuItemName}: ${item.department} -> ${correctDepartment}`);
          } else {
            updatedItems.push(item);
          }
        }

        // Update the order if needed
        if (needsUpdate) {
          order.items = updatedItems;
          await order.save();
          updatedCount++;
        }

      } catch (error) {
        console.error(`Error updating order ${order.orderNumber}:`, error);
        errorCount++;
      }
    }

    return NextResponse.json({
      success: true,
      message: `Fixed ${updatedCount} orders`,
      details: {
        totalOrders: orders.length,
        updatedOrders: updatedCount,
        errors: errorCount
      }
    });

  } catch (error) {
    console.error('Error fixing order departments:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fix order departments' },
      { status: 500 }
    );
  }
}
