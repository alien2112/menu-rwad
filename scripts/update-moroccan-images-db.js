// Auto-generated script to update menu items with GridFS image URLs
const { MongoClient } = require('mongodb');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://eslamabdaltif:oneone2@cluster0marakshv2.ltf0bnd.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0marakshv2';
const DB_NAME = 'maraksh';

// Image mappings
const imageMappings = [
  {
    "original": "شاي أتاي.jpg",
    "filename": "tea-شاي-أتاي.jpg",
    "category": "الشاي",
    "categoryFolder": "tea",
    "url": "/api/images/tea-شاي-أتاي.jpg",
    "fileId": "68e0dc0b8c827f20fa2ae5ab",
    "exists": false,
    "fileSize": 83082
  },
  {
    "original": "شاي أخضر.jpg",
    "filename": "tea-شاي-أخضر.jpg",
    "category": "الشاي",
    "categoryFolder": "tea",
    "url": "/api/images/tea-شاي-أخضر.jpg",
    "fileId": "68e0dc0c8c827f20fa2ae5ad",
    "exists": false,
    "fileSize": 67279
  },
  {
    "original": "شاي احمر.jpg",
    "filename": "tea-شاي-احمر.jpg",
    "category": "الشاي",
    "categoryFolder": "tea",
    "url": "/api/images/tea-شاي-احمر.jpg",
    "fileId": "68e0dc0c8c827f20fa2ae5af",
    "exists": false,
    "fileSize": 70036
  },
  {
    "original": "عصير افوكادو.jpg",
    "filename": "natural-juices-عصير-افوكادو.jpg",
    "category": "العصيرات الطبيعية",
    "categoryFolder": "natural-juices",
    "url": "/api/images/natural-juices-عصير-افوكادو.jpg",
    "fileId": "68e0dc0d8c827f20fa2ae5b1",
    "exists": false,
    "fileSize": 74470
  },
  {
    "original": "عصير برتقال.jpg",
    "filename": "natural-juices-عصير-برتقال.jpg",
    "category": "العصيرات الطبيعية",
    "categoryFolder": "natural-juices",
    "url": "/api/images/natural-juices-عصير-برتقال.jpg",
    "fileId": "68e0dc0e8c827f20fa2ae5b3",
    "exists": false,
    "fileSize": 67080
  },
  {
    "original": "عصير رمان.jpg",
    "filename": "natural-juices-عصير-رمان.jpg",
    "category": "العصيرات الطبيعية",
    "categoryFolder": "natural-juices",
    "url": "/api/images/natural-juices-عصير-رمان.jpg",
    "fileId": "68e0dc0e8c827f20fa2ae5b5",
    "exists": false,
    "fileSize": 64316
  },
  {
    "original": "عصير فراوله فريش.jpg",
    "filename": "natural-juices-عصير-فراوله-فريش.jpg",
    "category": "العصيرات الطبيعية",
    "categoryFolder": "natural-juices",
    "url": "/api/images/natural-juices-عصير-فراوله-فريش.jpg",
    "fileId": "68e0dc0f8c827f20fa2ae5b7",
    "exists": false,
    "fileSize": 5229
  },
  {
    "original": "عصير ليمون نعناع.jpg",
    "filename": "natural-juices-عصير-ليمون-نعناع.jpg",
    "category": "العصيرات الطبيعية",
    "categoryFolder": "natural-juices",
    "url": "/api/images/natural-juices-عصير-ليمون-نعناع.jpg",
    "fileId": "68e0dc0f8c827f20fa2ae5b9",
    "exists": false,
    "fileSize": 107978
  },
  {
    "original": "عصير مانجو.jpg",
    "filename": "natural-juices-عصير-مانجو.jpg",
    "category": "العصيرات الطبيعية",
    "categoryFolder": "natural-juices",
    "url": "/api/images/natural-juices-عصير-مانجو.jpg",
    "fileId": "68e0dc108c827f20fa2ae5bb",
    "exists": false,
    "fileSize": 104206
  },
  {
    "original": "عصير موال مراكش.jpg",
    "filename": "natural-juices-عصير-موال-مراكش.jpg",
    "category": "العصيرات الطبيعية",
    "categoryFolder": "natural-juices",
    "url": "/api/images/natural-juices-عصير-موال-مراكش.jpg",
    "fileId": "68e0dc118c827f20fa2ae5bd",
    "exists": false,
    "fileSize": 104981
  },
  {
    "original": "أيس موكا.jpg",
    "filename": "cold-coffee-أيس-موكا.jpg",
    "category": "القهوة الباردة",
    "categoryFolder": "cold-coffee",
    "url": "/api/images/cold-coffee-أيس-موكا.jpg",
    "fileId": "68e0dc128c827f20fa2ae5bf",
    "exists": false,
    "fileSize": 95163
  },
  {
    "original": "ايس أمريكانو.jpg",
    "filename": "cold-coffee-ايس-أمريكانو.jpg",
    "category": "القهوة الباردة",
    "categoryFolder": "cold-coffee",
    "url": "/api/images/cold-coffee-ايس-أمريكانو.jpg",
    "fileId": "68e0dc138c827f20fa2ae5c1",
    "exists": false,
    "fileSize": 414905
  },
  {
    "original": "ايس بيستاشيو لاتيه.jpg",
    "filename": "cold-coffee-ايس-بيستاشيو-لاتيه.jpg",
    "category": "القهوة الباردة",
    "categoryFolder": "cold-coffee",
    "url": "/api/images/cold-coffee-ايس-بيستاشيو-لاتيه.jpg",
    "fileId": "68e0dc158c827f20fa2ae5c4",
    "exists": false,
    "fileSize": 4421
  },
  {
    "original": "ايس دريب.png",
    "filename": "cold-coffee-ايس-دريب.png",
    "category": "القهوة الباردة",
    "categoryFolder": "cold-coffee",
    "url": "/api/images/cold-coffee-ايس-دريب.png",
    "fileId": "68e0dc158c827f20fa2ae5c6",
    "exists": false,
    "fileSize": 161629
  },
  {
    "original": "ايس سبانيش لايته.jpg",
    "filename": "cold-coffee-ايس-سبانيش-لايته.jpg",
    "category": "القهوة الباردة",
    "categoryFolder": "cold-coffee",
    "url": "/api/images/cold-coffee-ايس-سبانيش-لايته.jpg",
    "fileId": "68e0dc168c827f20fa2ae5c8",
    "exists": false,
    "fileSize": 68028
  },
  {
    "original": "ايس لايته.jpg",
    "filename": "cold-coffee-ايس-لايته.jpg",
    "category": "القهوة الباردة",
    "categoryFolder": "cold-coffee",
    "url": "/api/images/cold-coffee-ايس-لايته.jpg",
    "fileId": "68e0dc178c827f20fa2ae5ca",
    "exists": false,
    "fileSize": 64494
  },
  {
    "original": "ايس وايت موكا.jpg",
    "filename": "cold-coffee-ايس-وايت-موكا.jpg",
    "category": "القهوة الباردة",
    "categoryFolder": "cold-coffee",
    "url": "/api/images/cold-coffee-ايس-وايت-موكا.jpg",
    "fileId": "68e0dc188c827f20fa2ae5cc",
    "exists": false,
    "fileSize": 7286
  },
  {
    "original": "قهوة اليوم باردة.png",
    "filename": "cold-coffee-قهوة-اليوم-باردة.png",
    "category": "القهوة الباردة",
    "categoryFolder": "cold-coffee",
    "url": "/api/images/cold-coffee-قهوة-اليوم-باردة.png",
    "fileId": "68e0dc188c827f20fa2ae5ce",
    "exists": false,
    "fileSize": 370007
  },
  {
    "original": "ايس تي.jpg",
    "filename": "cocktails-ايس-تي.jpg",
    "category": "المكتيلز والمهيتو",
    "categoryFolder": "cocktails",
    "url": "/api/images/cocktails-ايس-تي.jpg",
    "fileId": "68e0dc1a8c827f20fa2ae5d1",
    "exists": false,
    "fileSize": 40998
  },
  {
    "original": "ايس كركديه.jpg",
    "filename": "cocktails-ايس-كركديه.jpg",
    "category": "المكتيلز والمهيتو",
    "categoryFolder": "cocktails",
    "url": "/api/images/cocktails-ايس-كركديه.jpg",
    "fileId": "68e0dc1b8c827f20fa2ae5d3",
    "exists": false,
    "fileSize": 80578
  },
  {
    "original": "بيرة.jpg",
    "filename": "cocktails-بيرة.jpg",
    "category": "المكتيلز والمهيتو",
    "categoryFolder": "cocktails",
    "url": "/api/images/cocktails-بيرة.jpg",
    "fileId": "68e0dc1b8c827f20fa2ae5d5",
    "exists": false,
    "fileSize": 4555
  },
  {
    "original": "ريد بول موهيتو.png",
    "filename": "cocktails-ريد-بول-موهيتو.png",
    "category": "المكتيلز والمهيتو",
    "categoryFolder": "cocktails",
    "url": "/api/images/cocktails-ريد-بول-موهيتو.png",
    "fileId": "68e0dc1c8c827f20fa2ae5d7",
    "exists": false,
    "fileSize": 289722
  },
  {
    "original": "سفن موهيتو.jpg",
    "filename": "cocktails-سفن-موهيتو.jpg",
    "category": "المكتيلز والمهيتو",
    "categoryFolder": "cocktails",
    "url": "/api/images/cocktails-سفن-موهيتو.jpg",
    "fileId": "68e0dc1d8c827f20fa2ae5da",
    "exists": false,
    "fileSize": 11144
  },
  {
    "original": "كودريد موهيتو.jpg",
    "filename": "cocktails-كودريد-موهيتو.jpg",
    "category": "المكتيلز والمهيتو",
    "categoryFolder": "cocktails",
    "url": "/api/images/cocktails-كودريد-موهيتو.jpg",
    "fileId": "68e0dc1e8c827f20fa2ae5dc",
    "exists": false,
    "fileSize": 21960
  },
  {
    "original": "كودريد.jpg",
    "filename": "cocktails-كودريد.jpg",
    "category": "المكتيلز والمهيتو",
    "categoryFolder": "cocktails",
    "url": "/api/images/cocktails-كودريد.jpg",
    "fileId": "68e0dc1e8c827f20fa2ae5de",
    "exists": false,
    "fileSize": 5091
  },
  {
    "original": "مشروب غازي.jpg",
    "filename": "cocktails-مشروب-غازي.jpg",
    "category": "المكتيلز والمهيتو",
    "categoryFolder": "cocktails",
    "url": "/api/images/cocktails-مشروب-غازي.jpg",
    "fileId": "68e0dc1f8c827f20fa2ae5e0",
    "exists": false,
    "fileSize": 118215
  },
  {
    "original": "موهيتو ريتا.jpg",
    "filename": "cocktails-موهيتو-ريتا.jpg",
    "category": "المكتيلز والمهيتو",
    "categoryFolder": "cocktails",
    "url": "/api/images/cocktails-موهيتو-ريتا.jpg",
    "fileId": "68e0dc208c827f20fa2ae5e2",
    "exists": false,
    "fileSize": 62653
  }
];

async function updateMenuItems() {
  const client = new MongoClient(MONGODB_URI);
  
  try {
    await client.connect();
    const db = client.db(DB_NAME);
    const collection = db.collection('menuitems');
    
    console.log('🔄 Updating menu items with GridFS image URLs...');
    
    let updatedCount = 0;
    
    for (const mapping of imageMappings) {
      const originalName = mapping.original.replace(/\.[^/.]+$/, ""); // Remove extension
      
      // Try to find matching menu item by name (case-insensitive)
      const result = await collection.updateMany(
        { 
          name: { $regex: originalName, $options: 'i' },
          categoryId: { $exists: true }
        },
        { 
          $set: { 
            image: mapping.url,
            updatedAt: new Date()
          } 
        }
      );
      
      if (result.modifiedCount > 0) {
        console.log(`✅ Updated ${result.modifiedCount} items for: ${originalName}`);
        updatedCount += result.modifiedCount;
      } else {
        console.log(`⚠️  No items found for: ${originalName}`);
      }
    }
    
    console.log(`✅ Database update completed! Updated ${updatedCount} menu items.`);
    
  } catch (error) {
    console.error('❌ Database update failed:', error);
  } finally {
    await client.close();
  }
}

updateMenuItems();
