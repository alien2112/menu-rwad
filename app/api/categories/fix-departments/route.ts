import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Category from '@/lib/models/Category';

export async function POST() {
  try {
    await dbConnect();

    // Define department mappings based on category names
    const departmentMappings = [
      // Barista (drinks/beverages)
      { keywords: ['مشروبات', 'قهوة', 'شاي', 'عصير', 'drinks', 'coffee', 'tea', 'juice', 'beverages'], department: 'barista' },
      // Shisha
      { keywords: ['شيشة', 'معسل', 'shisha', 'hookah'], department: 'shisha' },
      // Everything else goes to kitchen (food)
    ];

    const categories = await Category.find();
    const updates = [];

    for (const category of categories) {
      let assignedDepartment = 'kitchen'; // Default to kitchen

      // Check if category name matches any barista or shisha keywords
      const categoryNameLower = (category.name + ' ' + (category.nameEn || '')).toLowerCase();

      for (const mapping of departmentMappings) {
        if (mapping.keywords.some(keyword => categoryNameLower.includes(keyword))) {
          assignedDepartment = mapping.department;
          break;
        }
      }

      // Update the category with proper options
      const updatedCategory = await Category.findByIdAndUpdate(
        category._id,
        { $set: { department: assignedDepartment } },
        { new: true, runValidators: true, strict: true }
      );

      updates.push({
        id: category._id,
        name: category.name,
        nameEn: category.nameEn,
        oldDepartment: category.department,
        newDepartment: updatedCategory?.department || assignedDepartment,
        assignedDepartment: assignedDepartment
      });
    }

    return NextResponse.json({
      success: true,
      message: `Updated ${updates.length} categories`,
      updates
    });

  } catch (error) {
    console.error('Error fixing category departments:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fix category departments' },
      { status: 500 }
    );
  }
}
