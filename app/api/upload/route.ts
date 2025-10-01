import { NextRequest, NextResponse } from 'next/server';
import { uploadToGridFS } from '@/lib/gridfs';
import HomepageImage from '@/lib/models/HomepageImage';
import dbConnect from '@/lib/mongodb';

export async function POST(request: NextRequest) {
  try {
    await dbConnect();

    const formData = await request.formData();
    const file = formData.get('file') as File;
    const section = formData.get('section') as string;
    const title = formData.get('title') as string;
    const titleEn = formData.get('titleEn') as string;
    const description = formData.get('description') as string;
    const descriptionEn = formData.get('descriptionEn') as string;
    const order = parseInt(formData.get('order') as string) || 0;
    const journeyPosition = formData.get('journeyPosition') as string;

    if (!file) {
      return NextResponse.json(
        { success: false, error: 'No file provided' },
        { status: 400 }
      );
    }

    if (!section || !title) {
      return NextResponse.json(
        { success: false, error: 'Section and title are required' },
        { status: 400 }
      );
    }

    // Convert file to buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Upload to GridFS
    const fileId = await uploadToGridFS(
      buffer,
      file.name,
      file.type || 'image/jpeg'
    );

    // Create database entry
    const homepageImage = await HomepageImage.create({
      section,
      title,
      titleEn: titleEn || undefined,
      description: description || undefined,
      descriptionEn: descriptionEn || undefined,
      imageId: fileId,
      order,
      journeyPosition: journeyPosition || undefined,
      status: 'active',
    });

    return NextResponse.json({
      success: true,
      data: homepageImage,
    });
  } catch (error: any) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
