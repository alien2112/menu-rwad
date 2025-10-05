import mongoose from 'mongoose';
import dbConnect from './mongodb';
import sharp from 'sharp';

let bucket: any = null;

export async function getGridFSBucket() {
  if (bucket) {
    return bucket;
  }

  await dbConnect();

  const db = mongoose.connection.db;
  if (!db) {
    throw new Error('Database connection not established');
  }

  const gridfsBucket = new mongoose.mongo.GridFSBucket(db, {
    bucketName: 'images',
  });

  bucket = gridfsBucket;
  return bucket;
}

export async function uploadToGridFS(
  file: Buffer,
  filename: string,
  contentType: string
): Promise<string> {
  const bucket = await getGridFSBucket();

  // Check if it's an image that can be converted to WebP
  const isImage = contentType.startsWith('image/');
  const canConvertToWebP = ['image/jpeg', 'image/jpg', 'image/png'].includes(contentType);

  let finalBuffer = file;
  let finalContentType = contentType;
  let finalFilename = filename;

  // Convert to WebP if possible
  if (isImage && canConvertToWebP) {
    try {
      const webpBuffer = await sharp(file)
        .webp({ 
          quality: 85,
          effort: 6,
          lossless: false
        })
        .toBuffer();

      // Create backup of original
      const originalFilename = `original_${filename}`;
      await uploadOriginalFile(bucket, file, originalFilename, contentType);

      // Use WebP version as primary
      finalBuffer = webpBuffer;
      finalContentType = 'image/webp';
      finalFilename = filename.replace(/\.(jpg|jpeg|png)$/i, '.webp');
      
      console.log(`🔄 Converted ${filename} to WebP: ${formatFileSize(file.length)} → ${formatFileSize(webpBuffer.length)}`);
    } catch (error) {
      console.warn(`⚠️ WebP conversion failed for ${filename}, using original:`, error);
      // Keep original if conversion fails
    }
  }

  return new Promise((resolve, reject) => {
    const uploadStream = bucket.openUploadStream(finalFilename, {
      contentType: finalContentType,
      metadata: {
        uploadedAt: new Date(),
        originalFilename: filename,
        originalContentType: contentType,
        isWebP: finalContentType === 'image/webp',
        originalSize: file.length,
        webpSize: finalBuffer.length,
        compressionRatio: finalContentType === 'image/webp' ? 
          Math.round((1 - finalBuffer.length / file.length) * 100) : 0
      },
    });

    uploadStream.on('error', reject);
    uploadStream.on('finish', () => {
      resolve(uploadStream.id.toString());
    });

    uploadStream.end(finalBuffer);
  });
}

/**
 * Upload original file as backup
 */
async function uploadOriginalFile(
  bucket: any,
  file: Buffer,
  filename: string,
  contentType: string
): Promise<void> {
  return new Promise((resolve, reject) => {
    const uploadStream = bucket.openUploadStream(filename, {
      contentType,
      metadata: {
        uploadedAt: new Date(),
        isBackup: true,
        backupType: 'original'
      },
    });

    uploadStream.on('error', reject);
    uploadStream.on('finish', () => {
      resolve();
    });

    uploadStream.end(file);
  });
}

/**
 * Format file size for display
 */
function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

export async function getFromGridFS(fileId: string): Promise<{
  stream: any;
  contentType: string;
}> {
  const bucket = await getGridFSBucket();

  const _id = new mongoose.Types.ObjectId(fileId);

  // Get file info
  const files = await bucket.find({ _id }).toArray();
  if (!files || files.length === 0) {
    throw new Error('File not found');
  }

  const file = files[0];
  const downloadStream = bucket.openDownloadStream(_id);

  return {
    stream: downloadStream,
    contentType: file.contentType || 'application/octet-stream',
  };
}

export async function deleteFromGridFS(fileId: string): Promise<void> {
  const bucket = await getGridFSBucket();
  const _id = new mongoose.Types.ObjectId(fileId);

  try {
    await bucket.delete(_id);
  } catch (error) {
    console.error('Error deleting file from GridFS:', error);
    throw error;
  }
}
