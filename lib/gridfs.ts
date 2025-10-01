import mongoose from 'mongoose';
import dbConnect from './mongodb';

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

  return new Promise((resolve, reject) => {
    const uploadStream = bucket.openUploadStream(filename, {
      contentType,
      metadata: {
        uploadedAt: new Date(),
      },
    });

    uploadStream.on('error', reject);
    uploadStream.on('finish', () => {
      resolve(uploadStream.id.toString());
    });

    uploadStream.end(file);
  });
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
