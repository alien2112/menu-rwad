import { NextRequest, NextResponse } from 'next/server';
import { getFromGridFS } from '@/lib/gridfs';
import sharp from 'sharp';
import { cache, CacheTTL } from '@/lib/cache';

// GET image from GridFS with optimization
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(request.url);

    // Parse optimization params
    const width = parseInt(searchParams.get('w') || '0', 10);
    const height = parseInt(searchParams.get('h') || '0', 10);
    const quality = Math.min(parseInt(searchParams.get('q') || '85', 10), 100);
    const format = searchParams.get('f') || 'webp'; // Default to WebP, fallback to auto
    const acceptHeader = request.headers.get('accept') || '';
    const supportsWebP = acceptHeader.includes('image/webp');

    // Create cache key based on params
    const cacheKey = `image:${id}:${width}:${height}:${quality}:${format}`;

    // Try to get from cache
    const cachedImage = cache.get<{ buffer: Buffer; contentType: string }>(cacheKey);
    if (cachedImage) {
      return new NextResponse(cachedImage.buffer as any, {
        headers: {
          'Content-Type': cachedImage.contentType,
          'Cache-Control': 'public, max-age=31536000, immutable',
          'X-Cache-Status': 'HIT',
        },
      });
    }

    const { stream, contentType } = await getFromGridFS(id);

    // Convert stream to buffer
    const chunks: any[] = [];
    for await (const chunk of stream) {
      chunks.push(chunk);
    }
    let buffer = Buffer.concat(chunks);

    // Optimize image with sharp if it's an image
    const isImage = contentType.startsWith('image/');
    let outputContentType = contentType;

    if (isImage) {
      let sharpInstance = sharp(buffer);

      // Resize if dimensions specified
      if (width > 0 || height > 0) {
        sharpInstance = sharpInstance.resize(width || undefined, height || undefined, {
          fit: 'inside',
          withoutEnlargement: true,
        });
      }

      // Convert format with WebP preference and fallback
      if (format === 'webp' && supportsWebP) {
        sharpInstance = sharpInstance.webp({ quality });
        outputContentType = 'image/webp';
      } else if (format === 'webp' && !supportsWebP) {
        // Fallback to original format if WebP not supported
        if (contentType.includes('jpeg') || contentType.includes('jpg')) {
          sharpInstance = sharpInstance.jpeg({ quality, progressive: true });
          outputContentType = 'image/jpeg';
        } else if (contentType.includes('png')) {
          sharpInstance = sharpInstance.png({ quality, progressive: true });
          outputContentType = 'image/png';
        }
      } else if (format === 'auto') {
        // Auto format selection with WebP preference
        if (supportsWebP) {
          sharpInstance = sharpInstance.webp({ quality });
          outputContentType = 'image/webp';
        } else if (contentType.includes('jpeg') || contentType.includes('jpg')) {
          sharpInstance = sharpInstance.jpeg({ quality, progressive: true });
          outputContentType = 'image/jpeg';
        } else if (contentType.includes('png')) {
          sharpInstance = sharpInstance.png({ quality, progressive: true });
          outputContentType = 'image/png';
        }
      } else if (format === 'jpeg' || format === 'jpg') {
        sharpInstance = sharpInstance.jpeg({ quality, progressive: true });
        outputContentType = 'image/jpeg';
      } else if (format === 'png') {
        sharpInstance = sharpInstance.png({ quality, progressive: true });
        outputContentType = 'image/png';
      }

      // Process the image
      buffer = await sharpInstance.toBuffer();
    }

    // Cache the optimized image for 1 day
    cache.set(cacheKey, { buffer, contentType: outputContentType }, CacheTTL.ONE_DAY);

    return new NextResponse(buffer as any, {
      headers: {
        'Content-Type': outputContentType,
        'Cache-Control': 'public, max-age=31536000, immutable',
        'X-Cache-Status': 'MISS',
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
