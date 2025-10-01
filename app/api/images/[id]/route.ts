import { NextRequest, NextResponse } from 'next/server';
import { getFromGridFS } from '@/lib/gridfs';

// GET image from GridFS
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const { stream, contentType } = await getFromGridFS(id);

    // Convert stream to buffer
    const chunks: any[] = [];
    for await (const chunk of stream) {
      chunks.push(chunk);
    }
    const buffer = Buffer.concat(chunks);

    return new NextResponse(buffer, {
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    });
  } catch (error: any) {
    console.error('Error fetching image:', error);
    return NextResponse.json(
      { success: false, error: 'Image not found' },
      { status: 404 }
    );
  }
}
