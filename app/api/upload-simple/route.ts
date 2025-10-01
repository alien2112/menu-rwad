import { NextRequest, NextResponse } from 'next/server';
import { uploadToGridFS } from '@/lib/gridfs';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json(
        { success: false, error: 'No file provided' },
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

    return NextResponse.json({
      success: true,
      data: { id: fileId },
    });
  } catch (error: any) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
