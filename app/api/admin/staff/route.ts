import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import { sanitizeString, sanitizeObjectId, sanitizePagination } from '@/lib/sanitize';
import { sendStaffNotification } from '@/lib/notificationUtils';

/**
 * Staff management API for admin panel
 * Provides CRUD operations for staff management
 */

// Mock staff data - in production, this would be a proper Staff model
interface Staff {
  _id: string;
  name: string;
  email: string;
  phone: string;
  role: 'admin' | 'kitchen' | 'barista' | 'shisha' | 'cashier';
  status: 'active' | 'inactive';
  department: 'kitchen' | 'barista' | 'shisha' | 'admin';
  hireDate: Date;
  lastLogin?: Date;
  permissions: string[];
}

// In-memory storage for demo - replace with MongoDB in production
let staffData: Staff[] = [
  {
    _id: '1',
    name: 'أحمد محمد',
    email: 'ahmed@maraksh.com',
    phone: '+966501234567',
    role: 'admin',
    status: 'active',
    department: 'admin',
    hireDate: new Date('2023-01-15'),
    permissions: ['all']
  },
  {
    _id: '2',
    name: 'فاطمة علي',
    email: 'fatima@maraksh.com',
    phone: '+966501234568',
    role: 'kitchen',
    status: 'active',
    department: 'kitchen',
    hireDate: new Date('2023-02-01'),
    permissions: ['kitchen', 'inventory']
  }
];

// GET staff members
export async function GET(request: NextRequest) {
  try {
    await dbConnect();
    
    const { searchParams } = new URL(request.url);
    const role = sanitizeString(searchParams.get('role'));
    const department = sanitizeString(searchParams.get('department'));
    const status = sanitizeString(searchParams.get('status'));
    
    // Pagination
    const { page, limit } = sanitizePagination({
      page: searchParams.get('page'),
      limit: searchParams.get('limit'),
      maxLimit: 50
    });
    
    // Filter staff data
    let filteredStaff = [...staffData];
    
    if (role) {
      filteredStaff = filteredStaff.filter(staff => staff.role === role);
    }
    
    if (department) {
      filteredStaff = filteredStaff.filter(staff => staff.department === department);
    }
    
    if (status) {
      filteredStaff = filteredStaff.filter(staff => staff.status === status);
    }
    
    // Pagination
    const skip = (page - 1) * limit;
    const paginatedStaff = filteredStaff.slice(skip, skip + limit);
    
    const totalCount = filteredStaff.length;
    const totalPages = Math.ceil(totalCount / limit);
    
    return NextResponse.json({
      success: true,
      data: paginatedStaff,
      pagination: {
        currentPage: page,
        totalPages,
        totalCount,
        limit
      }
    });
    
  } catch (error) {
    console.error('Error fetching staff:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch staff' },
      { status: 500 }
    );
  }
}

// POST create new staff member
export async function POST(request: NextRequest) {
  try {
    await dbConnect();
    
    const body = await request.json();
    const { name, email, phone, role, department, permissions } = body;
    
    // Validation
    if (!name || !email || !phone || !role || !department) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }
    
    // Check if email already exists
    const existingStaff = staffData.find(staff => staff.email === email);
    if (existingStaff) {
      return NextResponse.json(
        { success: false, error: 'Email already exists' },
        { status: 400 }
      );
    }
    
    // Create new staff member
    const newStaff: Staff = {
      _id: (staffData.length + 1).toString(),
      name,
      email,
      phone,
      role,
      status: 'active',
      department,
      hireDate: new Date(),
      permissions: permissions || []
    };
    
    staffData.push(newStaff);
    
    // Send welcome notification
    await sendStaffNotification(
      newStaff._id,
      `مرحباً ${name}! تم إنشاء حسابك بنجاح في نظام إدارة المطعم.`,
      'medium'
    );
    
    return NextResponse.json({
      success: true,
      data: newStaff,
      message: 'Staff member created successfully'
    }, { status: 201 });
    
  } catch (error) {
    console.error('Error creating staff member:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create staff member' },
      { status: 500 }
    );
  }
}

// PUT update staff member
export async function PUT(request: NextRequest) {
  try {
    await dbConnect();
    
    const { searchParams } = new URL(request.url);
    const staffId = sanitizeObjectId(searchParams.get('id'));
    
    if (!staffId) {
      return NextResponse.json(
        { success: false, error: 'Staff ID required' },
        { status: 400 }
      );
    }
    
    const body = await request.json();
    const { name, email, phone, role, department, status, permissions } = body;
    
    // Find staff member
    const staffIndex = staffData.findIndex(staff => staff._id === staffId);
    if (staffIndex === -1) {
      return NextResponse.json(
        { success: false, error: 'Staff member not found' },
        { status: 404 }
      );
    }
    
    // Update staff member
    const updatedStaff = {
      ...staffData[staffIndex],
      ...(name && { name }),
      ...(email && { email }),
      ...(phone && { phone }),
      ...(role && { role }),
      ...(department && { department }),
      ...(status && { status }),
      ...(permissions && { permissions })
    };
    
    staffData[staffIndex] = updatedStaff;
    
    // Send update notification
    await sendStaffNotification(
      staffId,
      `تم تحديث معلومات حسابك في نظام إدارة المطعم.`,
      'low'
    );
    
    return NextResponse.json({
      success: true,
      data: updatedStaff,
      message: 'Staff member updated successfully'
    });
    
  } catch (error) {
    console.error('Error updating staff member:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update staff member' },
      { status: 500 }
    );
  }
}

// DELETE staff member
export async function DELETE(request: NextRequest) {
  try {
    await dbConnect();
    
    const { searchParams } = new URL(request.url);
    const staffId = sanitizeObjectId(searchParams.get('id'));
    
    if (!staffId) {
      return NextResponse.json(
        { success: false, error: 'Staff ID required' },
        { status: 400 }
      );
    }
    
    // Find staff member
    const staffIndex = staffData.findIndex(staff => staff._id === staffId);
    if (staffIndex === -1) {
      return NextResponse.json(
        { success: false, error: 'Staff member not found' },
        { status: 404 }
      );
    }
    
    // Remove staff member
    const deletedStaff = staffData.splice(staffIndex, 1)[0];
    
    return NextResponse.json({
      success: true,
      data: deletedStaff,
      message: 'Staff member deleted successfully'
    });
    
  } catch (error) {
    console.error('Error deleting staff member:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete staff member' },
      { status: 500 }
    );
  }
}






