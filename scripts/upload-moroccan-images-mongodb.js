#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { MongoClient, GridFSBucket } = require('mongodb');

// MongoDB connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/maraksh';
const DB_NAME = 'maraksh';

// Base path for images
const IMAGES_BASE_PATH = path.join(__dirname, '../public/صور مراكش');

// Category mapping (Arabic to English)
const CATEGORY_MAPPING = {
  'الشاي': 'tea',
  'العصيرات الطبيعية': 'natural-juices', 
  'القهوة الباردة': 'cold-coffee',
  'المكتيلز والمهيتو': 'cocktails'
};

// Function to clean and normalize Arabic text for MongoDB
function normalizeForMongoDB(text) {
  return text
    .replace(/[^\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF\w\s-]/g, '') // Keep Arabic, Latin, numbers, spaces, hyphens
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-') // Replace multiple hyphens with single
    .replace(/^-|-$/g, '') // Remove leading/trailing hyphens
    .toLowerCase();
}

// Function to create MongoDB-friendly filename
function createMongoDBFilename(originalName, category) {
  const baseName = path.parse(originalName).name;
  const extension = path.parse(originalName).ext;
  
  // Normalize the Arabic name
  const normalizedName = normalizeForMongoDB(baseName);
  
  // Create category prefix
  const categoryPrefix = CATEGORY_MAPPING[category] || 'other';
  
  return `${categoryPrefix}-${normalizedName}${extension}`;
}

// Function to upload file to MongoDB GridFS
async function uploadToGridFS(filePath, filename, category) {
  const client = new MongoClient(MONGODB_URI);
  
  try {
    await client.connect();
    const db = client.db(DB_NAME);
    const bucket = new GridFSBucket(db, { bucketName: 'images' });
    
    // Check if file already exists
    const existingFiles = await bucket.find({ filename }).toArray();
    if (existingFiles.length > 0) {
      console.log(`   ⏭️  File already exists: ${filename}`);
      return {
        filename,
        url: `/api/images/${filename}`,
        category,
        exists: true
      };
    }
    
    // Upload the file
    const uploadStream = bucket.openUploadStream(filename, {
      metadata: {
        category,
        originalName: path.basename(filePath),
        uploadedAt: new Date()
      }
    });
    
    const fileStream = fs.createReadStream(filePath);
    
    return new Promise((resolve, reject) => {
      fileStream.pipe(uploadStream);
      
      uploadStream.on('error', (error) => {
        console.error(`   ❌ Upload error for ${filename}:`, error);
        reject(error);
      });
      
      uploadStream.on('finish', () => {
        console.log(`   ✅ Uploaded: ${filename}`);
        resolve({
          filename,
          url: `/api/images/${filename}`,
          category,
          fileId: uploadStream.id,
          exists: false
        });
      });
    });
    
  } catch (error) {
    console.error(`   ❌ Database error for ${filename}:`, error);
    throw error;
  } finally {
    await client.close();
  }
}

// Function to delay execution
function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Main function to process all images
async function uploadAllImages() {
  console.log('🚀 Starting Moroccan images upload to MongoDB GridFS...\n');
  
  if (!fs.existsSync(IMAGES_BASE_PATH)) {
    console.error('❌ Images folder not found:', IMAGES_BASE_PATH);
    return;
  }

  console.log(`📂 Images path: ${IMAGES_BASE_PATH}`);
  console.log(`🗄️  MongoDB URI: ${MONGODB_URI}`);
  console.log(`📊 Database: ${DB_NAME}\n`);

  const uploadResults = [];
  const errors = [];

  // Process each category folder
  for (const [categoryName, categoryFolder] of Object.entries(CATEGORY_MAPPING)) {
    const categoryPath = path.join(IMAGES_BASE_PATH, categoryName);
    
    if (!fs.existsSync(categoryPath)) {
      console.log(`⚠️  Category folder not found: ${categoryName}`);
      continue;
    }

    console.log(`📁 Processing category: ${categoryName} (${categoryFolder})`);
    
    const files = fs.readdirSync(categoryPath);
    const imageFiles = files.filter(file => 
      /\.(jpg|jpeg|png|gif|webp)$/i.test(file)
    );

    console.log(`   Found ${imageFiles.length} images`);

    for (const imageFile of imageFiles) {
      const originalPath = path.join(categoryPath, imageFile);
      const mongoFilename = createMongoDBFilename(imageFile, categoryName);

      try {
        console.log(`   Processing: ${imageFile} → ${mongoFilename}`);
        
        // Upload the file
        const result = await uploadToGridFS(originalPath, mongoFilename, categoryName);
        
        uploadResults.push({
          original: imageFile,
          filename: mongoFilename,
          category: categoryName,
          url: result.url,
          fileId: result.fileId,
          exists: result.exists
        });

        // Add small delay
        await delay(500);

      } catch (error) {
        console.error(`   ❌ Error uploading ${imageFile}:`, error.message);
        errors.push({
          file: imageFile,
          error: error.message
        });
      }
    }
  }

  // Print summary
  console.log('\n📊 Upload Summary:');
  console.log(`✅ Successfully uploaded: ${uploadResults.filter(r => !r.exists).length} images`);
  console.log(`⏭️  Already existed: ${uploadResults.filter(r => r.exists).length} images`);
  console.log(`❌ Failed uploads: ${errors.length} images`);

  if (uploadResults.length > 0) {
    console.log('\n📋 Uploaded files:');
    uploadResults.forEach(result => {
      const status = result.exists ? '⏭️' : '✅';
      console.log(`  ${status} ${result.original} → ${result.filename}`);
      console.log(`     URL: ${result.url}`);
    });
  }

  if (errors.length > 0) {
    console.log('\n❌ Failed uploads:');
    errors.forEach(error => {
      console.log(`  ${error.file}: ${error.error}`);
    });
  }

  // Generate database update script
  if (uploadResults.length > 0) {
    console.log('\n🔧 Generating database update script...');
    generateDatabaseUpdateScript(uploadResults);
  }
}

// Function to generate database update script
function generateDatabaseUpdateScript(uploadResults) {
  const scriptContent = `// Auto-generated script to update menu items with GridFS image URLs
const { MongoClient } = require('mongodb');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/maraksh';
const DB_NAME = 'maraksh';

// Image mappings
const imageMappings = ${JSON.stringify(uploadResults, null, 2)};

async function updateMenuItems() {
  const client = new MongoClient(MONGODB_URI);
  
  try {
    await client.connect();
    const db = client.db(DB_NAME);
    const collection = db.collection('menuitems');
    
    console.log('🔄 Updating menu items with GridFS image URLs...');
    
    for (const mapping of imageMappings) {
      const originalName = mapping.original.replace(/\\.[^/.]+$/, ""); // Remove extension
      
      // Try to find matching menu item by name (case-insensitive)
      const result = await collection.updateMany(
        { 
          name: { $regex: originalName, $options: 'i' },
          categoryId: { $exists: true }
        },
        { 
          $set: { 
            image: mapping.url
          } 
        }
      );
      
      if (result.modifiedCount > 0) {
        console.log(\`✅ Updated \${result.modifiedCount} items for: \${originalName}\`);
      } else {
        console.log(\`⚠️  No items found for: \${originalName}\`);
      }
    }
    
    console.log('✅ Database update completed!');
    
  } catch (error) {
    console.error('❌ Database update failed:', error);
  } finally {
    await client.close();
  }
}

updateMenuItems();
`;

  const scriptPath = path.join(__dirname, 'update-moroccan-images-db.js');
  fs.writeFileSync(scriptPath, scriptContent);
  console.log(`📝 Database update script created: ${scriptPath}`);
}

// Run the upload
if (require.main === module) {
  uploadAllImages().catch(console.error);
}

module.exports = { uploadAllImages, createMongoDBFilename, normalizeForMongoDB };










