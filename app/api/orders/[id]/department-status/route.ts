import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Order from '@/lib/models/Order';

// PUT /api/orders/[id]/department-status - Update department status for an order
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await dbConnect();

    const updateData = await request.json();
    const { department, status, itemId } = updateData;

    if (!department || !status) {
      return NextResponse.json(
        { success: false, error: 'Department and status are required' },
        { status: 400 }
      );
    }

    if (!['kitchen', 'barista', 'shisha'].includes(department)) {
      return NextResponse.json(
        { success: false, error: 'Invalid department' },
        { status: 400 }
      );
    }

    if (!['pending', 'in_progress', 'ready', 'served'].includes(status)) {
      return NextResponse.json(
        { success: false, error: 'Invalid status' },
        { status: 400 }
      );
    }

    const order = await Order.findById(params.id);
    if (!order) {
      return NextResponse.json(
        { success: false, error: 'Order not found' },
        { status: 404 }
      );
    }

    // Update department status
    const updateQuery: any = {
      [`departmentStatuses.${department}`]: status,
      updatedAt: new Date()
    };

    // If updating a specific item
    if (itemId) {
      const itemIndex = order.items.findIndex((item: any) => 
        item.menuItemId === itemId && item.department === department
      );
      
      if (itemIndex !== -1) {
        order.items[itemIndex].departmentStatus = status;
        await order.save();
      }
    } else {
      // Update all items in the department
      order.items.forEach((item: any) => {
        if (item.department === department) {
          item.departmentStatus = status;
        }
      });
    }

    // Update the order
    const updatedOrder = await Order.findByIdAndUpdate(
      params.id,
      updateQuery,
      { new: true }
    );

    // Also update individual items
    if (itemId) {
      await Order.updateOne(
        { _id: params.id, 'items.menuItemId': itemId, 'items.department': department },
        { $set: { 'items.$.departmentStatus': status } }
      );
    } else {
      await Order.updateOne(
        { _id: params.id },
        { $set: { 'items.$[elem].departmentStatus': status } },
        { arrayFilters: [{ 'elem.department': department }] }
      );
    }

    // Get the updated order
    const finalOrder = await Order.findById(params.id);

    return NextResponse.json({
      success: true,
      data: finalOrder,
      message: 'Department status updated successfully'
    });

  } catch (error) {
    console.error('Error updating department status:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update department status' },
      { status: 500 }
    );
  }
}

