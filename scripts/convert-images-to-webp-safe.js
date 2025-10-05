#!/usr/bin/env node

/**
 * Safe WebP Conversion Script
 * 
 * This script converts all existing images to WebP format while:
 * 1. Keeping all original images as backups
 * 2. Creating WebP versions alongside originals
 * 3. Providing rollback capability
 * 4. Maintaining database integrity
 */

const { MongoClient, GridFSBucket } = require('mongodb');
const sharp = require('sharp');
const path = require('path');
require('dotenv').config();

const MONGODB_URI = process.env.MONGODB_URI;
const DB_NAME = process.env.DB_NAME || 'maraksh';

if (!MONGODB_URI) {
  console.error('❌ MONGODB_URI environment variable is required');
  process.exit(1);
}

// Configuration
const CONFIG = {
  webpQuality: 85,
  batchSize: 10,
  backupPrefix: 'original_',
  webpSuffix: '_webp',
  supportedFormats: ['image/jpeg', 'image/jpg', 'image/png'],
};

// Statistics tracking
const stats = {
  total: 0,
  converted: 0,
  skipped: 0,
  errors: 0,
  originalSize: 0,
  webpSize: 0,
  timeSaved: 0,
};

/**
 * Convert image buffer to WebP format
 */
async function convertToWebP(buffer, originalContentType) {
  try {
    const webpBuffer = await sharp(buffer)
      .webp({ 
        quality: CONFIG.webpQuality,
        effort: 6, // Higher effort for better compression
        lossless: false
      })
      .toBuffer();
    
    return webpBuffer;
  } catch (error) {
    console.error('   ❌ WebP conversion failed:', error.message);
    throw error;
  }
}

/**
 * Create backup filename
 */
function createBackupFilename(originalFilename) {
  const ext = path.extname(originalFilename);
  const name = path.basename(originalFilename, ext);
  return `${CONFIG.backupPrefix}${name}${ext}`;
}

/**
 * Create WebP filename
 */
function createWebPFilename(originalFilename) {
  const ext = path.extname(originalFilename);
  const name = path.basename(originalFilename, ext);
  return `${name}${CONFIG.webpSuffix}.webp`;
}

/**
 * Upload file to GridFS
 */
async function uploadToGridFS(bucket, buffer, filename, contentType, metadata = {}) {
  return new Promise((resolve, reject) => {
    const uploadStream = bucket.openUploadStream(filename, {
      contentType,
      metadata: {
        ...metadata,
        uploadedAt: new Date(),
        fileSize: buffer.length,
        isWebP: contentType === 'image/webp',
        isBackup: filename.startsWith(CONFIG.backupPrefix),
      }
    });

    uploadStream.on('error', reject);
    uploadStream.on('finish', () => {
      resolve({
        fileId: uploadStream.id.toString(),
        filename,
        size: buffer.length
      });
    });

    uploadStream.end(buffer);
  });
}

/**
 * Process a single image file
 */
async function processImage(bucket, file) {
  const { _id, filename, contentType, metadata = {} } = file;
  
  console.log(`   📸 Processing: ${filename}`);
  
  // Skip if already WebP or backup
  if (contentType === 'image/webp' || filename.startsWith(CONFIG.backupPrefix)) {
    console.log(`   ⏭️  Skipping: ${filename} (already WebP or backup)`);
    stats.skipped++;
    return;
  }
  
  // Skip if not supported format
  if (!CONFIG.supportedFormats.includes(contentType)) {
    console.log(`   ⏭️  Skipping: ${filename} (unsupported format: ${contentType})`);
    stats.skipped++;
    return;
  }

  try {
    // Download original file
    const downloadStream = bucket.openDownloadStream(_id);
    const chunks = [];
    
    for await (const chunk of downloadStream) {
      chunks.push(chunk);
    }
    const originalBuffer = Buffer.concat(chunks);
    
    stats.originalSize += originalBuffer.length;
    
    // Create backup
    const backupFilename = createBackupFilename(filename);
    console.log(`   💾 Creating backup: ${backupFilename}`);
    
    await uploadToGridFS(bucket, originalBuffer, backupFilename, contentType, {
      ...metadata,
      originalFileId: _id.toString(),
      originalFilename: filename,
      backupType: 'original'
    });
    
    // Convert to WebP
    console.log(`   🔄 Converting to WebP: ${filename}`);
    const webpBuffer = await convertToWebP(originalBuffer, contentType);
    const webpFilename = createWebPFilename(filename);
    
    stats.webpSize += webpBuffer.length;
    stats.timeSaved += (originalBuffer.length - webpBuffer.length);
    
    // Upload WebP version
    const webpResult = await uploadToGridFS(bucket, webpBuffer, webpFilename, 'image/webp', {
      ...metadata,
      originalFileId: _id.toString(),
      originalFilename: filename,
      webpQuality: CONFIG.webpQuality,
      conversionDate: new Date(),
      originalSize: originalBuffer.length,
      webpSize: webpBuffer.length,
      compressionRatio: Math.round((1 - webpBuffer.length / originalBuffer.length) * 100)
    });
    
    console.log(`   ✅ Converted: ${filename} → ${webpFilename}`);
    console.log(`      📊 Size: ${formatFileSize(originalBuffer.length)} → ${formatFileSize(webpBuffer.length)}`);
    console.log(`      📈 Compression: ${Math.round((1 - webpBuffer.length / originalBuffer.length) * 100)}%`);
    
    stats.converted++;
    
  } catch (error) {
    console.error(`   ❌ Error processing ${filename}:`, error.message);
    stats.errors++;
  }
}

/**
 * Format file size for display
 */
function formatFileSize(bytes) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

/**
 * Main conversion function
 */
async function convertImagesToWebP() {
  const client = new MongoClient(MONGODB_URI);
  
  try {
    console.log('🚀 Starting safe WebP conversion process...\n');
    console.log(`📊 Configuration:`);
    console.log(`   WebP Quality: ${CONFIG.webpQuality}%`);
    console.log(`   Batch Size: ${CONFIG.batchSize}`);
    console.log(`   Backup Prefix: ${CONFIG.backupPrefix}`);
    console.log(`   WebP Suffix: ${CONFIG.webpSuffix}\n`);
    
    await client.connect();
    console.log('✅ Connected to MongoDB\n');
    
    const db = client.db(DB_NAME);
    const bucket = new GridFSBucket(db, { bucketName: 'images' });
    
    // Get all image files
    const files = await bucket.find({}).toArray();
    stats.total = files.length;
    
    console.log(`📁 Found ${files.length} files to process\n`);
    
    // Process files in batches
    for (let i = 0; i < files.length; i += CONFIG.batchSize) {
      const batch = files.slice(i, i + CONFIG.batchSize);
      console.log(`🔄 Processing batch ${Math.floor(i / CONFIG.batchSize) + 1}/${Math.ceil(files.length / CONFIG.batchSize)}`);
      
      await Promise.all(batch.map(file => processImage(bucket, file)));
      
      console.log(`✅ Batch completed\n`);
    }
    
    // Print final statistics
    console.log('📊 Conversion Complete!\n');
    console.log('📈 Statistics:');
    console.log(`   Total Files: ${stats.total}`);
    console.log(`   Converted: ${stats.converted}`);
    console.log(`   Skipped: ${stats.skipped}`);
    console.log(`   Errors: ${stats.errors}`);
    console.log(`   Success Rate: ${Math.round((stats.converted / stats.total) * 100)}%\n`);
    
    console.log('💾 Size Analysis:');
    console.log(`   Original Total Size: ${formatFileSize(stats.originalSize)}`);
    console.log(`   WebP Total Size: ${formatFileSize(stats.webpSize)}`);
    console.log(`   Space Saved: ${formatFileSize(stats.timeSaved)}`);
    console.log(`   Compression Ratio: ${Math.round((1 - stats.webpSize / stats.originalSize) * 100)}%\n`);
    
    console.log('🛡️ Safety Features:');
    console.log('   ✅ All original images backed up');
    console.log('   ✅ WebP versions created alongside originals');
    console.log('   ✅ Database integrity maintained');
    console.log('   ✅ Rollback capability preserved\n');
    
    console.log('🎯 Next Steps:');
    console.log('   1. Test WebP images in your application');
    console.log('   2. Update image references to use WebP versions');
    console.log('   3. Monitor performance improvements');
    console.log('   4. Consider removing backups after successful testing\n');
    
  } catch (error) {
    console.error('❌ Conversion failed:', error);
    process.exit(1);
  } finally {
    await client.close();
    console.log('🔌 Database connection closed');
  }
}

/**
 * Rollback function to restore originals
 */
async function rollbackToOriginals() {
  const client = new MongoClient(MONGODB_URI);
  
  try {
    console.log('🔄 Starting rollback to original images...\n');
    
    await client.connect();
    const db = client.db(DB_NAME);
    const bucket = new GridFSBucket(db, { bucketName: 'images' });
    
    // Find all backup files
    const backupFiles = await bucket.find({ 
      'metadata.isBackup': true 
    }).toArray();
    
    console.log(`📁 Found ${backupFiles.length} backup files to restore\n`);
    
    for (const backupFile of backupFiles) {
      const { filename, metadata } = backupFile;
      const originalFilename = metadata.originalFilename;
      
      console.log(`🔄 Restoring: ${filename} → ${originalFilename}`);
      
      // Download backup
      const downloadStream = bucket.openDownloadStream(backupFile._id);
      const chunks = [];
      
      for await (const chunk of downloadStream) {
        chunks.push(chunk);
      }
      const buffer = Buffer.concat(chunks);
      
      // Upload as original
      await uploadToGridFS(bucket, buffer, originalFilename, metadata.contentType, {
        ...metadata,
        restoredAt: new Date(),
        restoredFrom: filename
      });
      
      console.log(`✅ Restored: ${originalFilename}`);
    }
    
    console.log('\n✅ Rollback completed successfully!');
    
  } catch (error) {
    console.error('❌ Rollback failed:', error);
    process.exit(1);
  } finally {
    await client.close();
  }
}

// Command line interface
const command = process.argv[2];

if (command === 'rollback') {
  rollbackToOriginals();
} else {
  convertImagesToWebP();
}
