#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { MongoClient, GridFSBucket } = require('mongodb');

// MongoDB connection - using the same URI as your existing setup
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://eslamabdaltif:oneone2@cluster0marakshv2.ltf0bnd.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0marakshv2';
const DB_NAME = 'maraksh';

// Category mapping (Arabic to English) - same as upload script
const CATEGORY_MAPPING = {
  'الشاي': 'tea',
  'العصيرات الطبيعية': 'natural-juices', 
  'القهوة الباردة': 'cold-coffee',
  'المكتيلز والمهيتو': 'cocktails'
};

// Function to clean and normalize Arabic text for MongoDB (same as upload script)
function normalizeForMongoDB(text) {
  return text
    .replace(/[^\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF\w\s-]/g, '') // Keep Arabic, Latin, numbers, spaces, hyphens
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-') // Replace multiple hyphens with single
    .replace(/^-|-$/g, '') // Remove leading/trailing hyphens
    .toLowerCase();
}

// Function to create MongoDB-friendly filename (same as upload script)
function createMongoDBFilename(originalName, category) {
  const baseName = path.parse(originalName).name;
  const extension = path.parse(originalName).ext;
  
  // Normalize the Arabic name
  const normalizedName = normalizeForMongoDB(baseName);
  
  // Create category prefix
  const categoryPrefix = CATEGORY_MAPPING[category] || 'other';
  
  return `${categoryPrefix}-${normalizedName}${extension}`;
}

// Function to delete file from MongoDB GridFS
async function deleteFromGridFS(filename, client) {
  try {
    const db = client.db(DB_NAME);
    const bucket = new GridFSBucket(db, { bucketName: 'images' });
    
    // Find the file
    const files = await bucket.find({ filename }).toArray();
    if (files.length === 0) {
      console.log(`   ⚠️  File not found: ${filename}`);
      return {
        filename,
        deleted: false,
        reason: 'not_found'
      };
    }
    
    const file = files[0];
    const fileId = file._id;
    
    // Delete the file
    await bucket.delete(fileId);
    
    console.log(`   ✅ Deleted: ${filename} (${formatFileSize(file.length || 0)})`);
    return {
      filename,
      deleted: true,
      fileId: fileId.toString(),
      fileSize: file.length || 0
    };
    
  } catch (error) {
    console.error(`   ❌ Delete error for ${filename}:`, error);
    throw error;
  }
}

// Function to format file size
function formatFileSize(bytes) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// Function to delay execution
function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Main function to delete all Moroccan images
async function deleteAllMoroccanImages() {
  console.log('🗑️  Starting Moroccan images deletion from MongoDB GridFS...\n');
  
  console.log(`🗄️  MongoDB URI: ${MONGODB_URI.replace(/\/\/.*@/, '//***:***@')}`); // Hide credentials
  console.log(`📊 Database: ${DB_NAME}\n`);

  const client = new MongoClient(MONGODB_URI);
  const deleteResults = [];
  const errors = [];
  let totalSizeDeleted = 0;

  try {
    // Connect to MongoDB
    console.log('🔌 Connecting to MongoDB...');
    await client.connect();
    console.log('✅ Connected to MongoDB successfully!\n');

    // Process each category folder
    for (const [categoryName, categoryFolder] of Object.entries(CATEGORY_MAPPING)) {
      console.log(`📁 Processing category: ${categoryName} (${categoryFolder})`);
      
      // Get the images path to list files
      const imagesPath = path.join(__dirname, '../public/صور مراكش', categoryName);
      
      if (!fs.existsSync(imagesPath)) {
        console.log(`⚠️  Category folder not found: ${categoryName}`);
        continue;
      }
      
      const files = fs.readdirSync(imagesPath);
      const imageFiles = files.filter(file => 
        /\.(jpg|jpeg|png|gif|webp)$/i.test(file)
      );

      console.log(`   Found ${imageFiles.length} images to delete`);

      for (const imageFile of imageFiles) {
        const mongoFilename = createMongoDBFilename(imageFile, categoryName);

        try {
          console.log(`   Deleting: ${imageFile} → ${mongoFilename}`);
          
          // Delete the file
          const result = await deleteFromGridFS(mongoFilename, client);
          
          deleteResults.push({
            original: imageFile,
            filename: mongoFilename,
            category: categoryName,
            categoryFolder,
            deleted: result.deleted,
            fileId: result.fileId,
            fileSize: result.fileSize || 0,
            reason: result.reason
          });

          if (result.deleted) {
            totalSizeDeleted += result.fileSize || 0;
          }

          // Add small delay to avoid overwhelming the database
          await delay(200);

        } catch (error) {
          console.error(`   ❌ Error deleting ${imageFile}:`, error.message);
          errors.push({
            file: imageFile,
            error: error.message
          });
        }
      }
    }
  } catch (error) {
    console.error('❌ Failed to connect to MongoDB:', error);
    return;
  } finally {
    // Close the MongoDB connection
    await client.close();
    console.log('🔌 MongoDB connection closed.');
  }

  // Print summary
  console.log('\n📊 Deletion Summary:');
  console.log(`✅ Successfully deleted: ${deleteResults.filter(r => r.deleted).length} images`);
  console.log(`⚠️  Not found: ${deleteResults.filter(r => !r.deleted).length} images`);
  console.log(`❌ Failed deletions: ${errors.length} images`);
  console.log(`📦 Total size deleted: ${formatFileSize(totalSizeDeleted)}`);

  if (deleteResults.length > 0) {
    console.log('\n📋 Deletion results:');
    deleteResults.forEach(result => {
      const status = result.deleted ? '✅' : '⚠️';
      const size = result.fileSize ? ` (${formatFileSize(result.fileSize)})` : '';
      const reason = result.reason ? ` - ${result.reason}` : '';
      console.log(`  ${status} ${result.original} → ${result.filename}${size}${reason}`);
    });
  }

  if (errors.length > 0) {
    console.log('\n❌ Failed deletions:');
    errors.forEach(error => {
      console.log(`  ${error.file}: ${error.error}`);
    });
  }

  // Generate deletion report
  if (deleteResults.length > 0) {
    console.log('\n📄 Generating deletion report...');
    generateDeletionReport(deleteResults);
  }
}

// Function to generate deletion report
function generateDeletionReport(deleteResults) {
  const reportData = {
    generatedAt: new Date().toISOString(),
    totalProcessed: deleteResults.length,
    successfullyDeleted: deleteResults.filter(r => r.deleted).length,
    notFound: deleteResults.filter(r => !r.deleted).length,
    categories: {},
    deletions: deleteResults
  };

  // Group by categories
  deleteResults.forEach(result => {
    if (!reportData.categories[result.categoryFolder]) {
      reportData.categories[result.categoryFolder] = [];
    }
    reportData.categories[result.categoryFolder].push({
      original: result.original,
      filename: result.filename,
      deleted: result.deleted,
      fileId: result.fileId,
      reason: result.reason
    });
  });

  const reportPath = path.join(__dirname, 'moroccan-images-deletion-report.json');
  fs.writeFileSync(reportPath, JSON.stringify(reportData, null, 2));
  console.log(`📄 Deletion report created: ${reportPath}`);
}

// Run the deletion
if (require.main === module) {
  deleteAllMoroccanImages().catch(console.error);
}

module.exports = { deleteAllMoroccanImages, createMongoDBFilename, normalizeForMongoDB };





