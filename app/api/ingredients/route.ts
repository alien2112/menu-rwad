import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Ingredient from '@/lib/models/Ingredient';

// GET all ingredients
export async function GET() {
  try {
    await dbConnect();
    const ingredients = await Ingredient.find({ status: 'active' }).sort({ name: 1 });
    return NextResponse.json({ success: true, data: ingredients });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 400 }
    );
  }
}

// POST create new ingredient
export async function POST(request: NextRequest) {
  try {
    await dbConnect();
    const body = await request.json();
    const ingredient = await Ingredient.create(body);
    return NextResponse.json({ success: true, data: ingredient }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 400 }
    );
  }
}