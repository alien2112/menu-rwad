import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import { InventoryItem } from '@/lib/models/Inventory';
import Ingredient from '@/lib/models/Ingredient';
import { sanitizeString, sanitizePagination } from '@/lib/sanitize';

export async function GET(request: NextRequest) {
  try {
    await dbConnect();

    const { searchParams } = new URL(request.url);
    
    // Pagination parameters
    const { page, limit } = sanitizePagination({
      page: searchParams.get('page'),
      limit: searchParams.get('limit'),
      maxLimit: 100
    });
    
    // Search parameter
    const search = sanitizeString(searchParams.get('search'));
    
    // Status filter
    const status = sanitizeString(searchParams.get('status'));
    
    // Low stock filter
    const lowStock = searchParams.get('lowStock') === 'true';

    // Build query
    const query: any = {};
    
    if (status) {
      query.status = status;
    }
    
    if (lowStock) {
      query.status = { $in: ['low_stock', 'out_of_stock'] };
    }
    
    if (search) {
      query.$or = [
        { ingredientName: { $regex: search, $options: 'i' } },
        { ingredientId: { $regex: search, $options: 'i' } }
      ];
    }

    // Calculate skip for pagination
    const skip = (page - 1) * limit;

    // Get total count for pagination info
    const totalCount = await InventoryItem.countDocuments(query);

    // Get inventory items with pagination
    const inventoryItems = await InventoryItem
      .find(query)
      .sort({ ingredientName: 1 })
      .skip(skip)
      .limit(limit)
      .lean()
      .exec();

    // Calculate pagination info
    const totalPages = Math.ceil(totalCount / limit);
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;

    const paginationInfo = {
      currentPage: page,
      totalPages,
      totalCount,
      limit,
      hasNextPage,
      hasPrevPage,
      nextPage: hasNextPage ? page + 1 : null,
      prevPage: hasPrevPage ? page - 1 : null
    };

    return NextResponse.json({
      success: true,
      data: inventoryItems,
      pagination: paginationInfo
    });

  } catch (error) {
    console.error('Error fetching inventory items:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch inventory items' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    await dbConnect();

    const body = await request.json();
    console.log('📦 Creating inventory item with data:', body);
    
    const { ingredientId, ingredientName, currentStock, minStockLevel, maxStockLevel, unit } = body;

    // Validate required fields
    if (!ingredientId || !ingredientName || currentStock === undefined || !minStockLevel || !maxStockLevel || !unit) {
      console.log('❌ Missing required fields:', { ingredientId, ingredientName, currentStock, minStockLevel, maxStockLevel, unit });
      return NextResponse.json(
        { success: false, error: 'Missing required fields: ingredientId, ingredientName, currentStock, minStockLevel, maxStockLevel, unit' },
        { status: 400 }
      );
    }

    // Check if inventory item already exists
    const existingItem = await InventoryItem.findOne({ ingredientId });
    if (existingItem) {
      console.log('❌ Inventory item already exists for ingredientId:', ingredientId);
      return NextResponse.json(
        { success: false, error: 'Inventory item already exists for this ingredient' },
        { status: 400 }
      );
    }

    // Determine status based on stock level
    let status = 'in_stock';
    if (currentStock <= 0) {
      status = 'out_of_stock';
    } else if (currentStock <= minStockLevel) {
      status = 'low_stock';
    }

    console.log('✅ Creating inventory item with status:', status);

    const inventoryItem = new InventoryItem({
      ingredientId,
      ingredientName,
      currentStock,
      unit,
      minStockLevel,
      maxStockLevel,
      status,
      lastUpdated: new Date()
    });

    await inventoryItem.save();
    console.log('✅ Inventory item created successfully:', inventoryItem._id);

    return NextResponse.json({
      success: true,
      data: inventoryItem,
      message: 'Inventory item created successfully'
    });

  } catch (error) {
    console.error('❌ Error creating inventory item:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create inventory item' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    await dbConnect();

    const body = await request.json();
    const { id, currentStock, minStockLevel, maxStockLevel } = body;

    const inventoryItem = await InventoryItem.findById(id);
    if (!inventoryItem) {
      return NextResponse.json(
        { success: false, error: 'Inventory item not found' },
        { status: 404 }
      );
    }

    // Update fields
    if (currentStock !== undefined) {
      inventoryItem.currentStock = currentStock;
    }
    if (minStockLevel !== undefined) {
      inventoryItem.minStockLevel = minStockLevel;
    }
    if (maxStockLevel !== undefined) {
      inventoryItem.maxStockLevel = maxStockLevel;
    }

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

    return NextResponse.json({
      success: true,
      data: inventoryItem,
      message: 'Inventory item updated successfully'
    });

  } catch (error) {
    console.error('Error updating inventory item:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update inventory item' },
      { status: 500 }
    );
  }
}



