// Auto-generated script to update menu items with GridFS image URLs
const { MongoClient } = require('mongodb');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://eslamabdaltif:oneone2@cluster0marakshv2.ltf0bnd.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0marakshv2';
const DB_NAME = 'maraksh';

// Image mappings
const imageMappings = [
  {
    "original": "شاي-أتاي-براد-كبير.jpg",
    "filename": "tea-شاي-أتاي-براد-كبير.jpg",
    "category": "الشاي",
    "categoryFolder": "tea",
    "url": "/api/images/tea-شاي-أتاي-براد-كبير.jpg",
    "fileId": "68e0dded03f856d7b2d44916",
    "exists": false,
    "fileSize": 83082
  },
  {
    "original": "شاي-أحمر-براد-كبير.jpg",
    "filename": "tea-شاي-أحمر-براد-كبير.jpg",
    "category": "الشاي",
    "categoryFolder": "tea",
    "url": "/api/images/tea-شاي-أحمر-براد-كبير.jpg",
    "fileId": "68e0ddee03f856d7b2d44918",
    "exists": false,
    "fileSize": 70036
  },
  {
    "original": "شاي-طائفي-براد-كبير.jpg",
    "filename": "tea-شاي-طائفي-براد-كبير.jpg",
    "category": "الشاي",
    "categoryFolder": "tea",
    "url": "/api/images/tea-شاي-طائفي-براد-كبير.jpg",
    "fileId": "68e0ddef03f856d7b2d4491a",
    "exists": false,
    "fileSize": 67279
  },
  {
    "original": "أفوكادو-حليب.jpg",
    "filename": "natural-juices-أفوكادو-حليب.jpg",
    "category": "العصيرات الطبيعية",
    "categoryFolder": "natural-juices",
    "url": "/api/images/natural-juices-أفوكادو-حليب.jpg",
    "fileId": "68e0ddf003f856d7b2d4491c",
    "exists": false,
    "fileSize": 74470
  },
  {
    "original": "برتقال.jpg",
    "filename": "natural-juices-برتقال.jpg",
    "category": "العصيرات الطبيعية",
    "categoryFolder": "natural-juices",
    "url": "/api/images/natural-juices-برتقال.jpg",
    "fileId": "68e0ddf003f856d7b2d4491e",
    "exists": false,
    "fileSize": 67080
  },
  {
    "original": "ليمون-نعناع.jpg",
    "filename": "natural-juices-ليمون-نعناع.jpg",
    "category": "العصيرات الطبيعية",
    "categoryFolder": "natural-juices",
    "url": "/api/images/natural-juices-ليمون-نعناع.jpg",
    "fileId": "68e0ddf103f856d7b2d44920",
    "exists": false,
    "fileSize": 107978
  },
  {
    "original": "منجا-سادة.jpg",
    "filename": "natural-juices-منجا-سادة.jpg",
    "category": "العصيرات الطبيعية",
    "categoryFolder": "natural-juices",
    "url": "/api/images/natural-juices-منجا-سادة.jpg",
    "fileId": "68e0ddf203f856d7b2d44922",
    "exists": false,
    "fileSize": 104206
  },
  {
    "original": "موسي-رمان.jpg",
    "filename": "natural-juices-موسي-رمان.jpg",
    "category": "العصيرات الطبيعية",
    "categoryFolder": "natural-juices",
    "url": "/api/images/natural-juices-موسي-رمان.jpg",
    "fileId": "68e0ddf303f856d7b2d44924",
    "exists": false,
    "fileSize": 64316
  },
  {
    "original": "موسي-شعير.jpg",
    "filename": "natural-juices-موسي-شعير.jpg",
    "category": "العصيرات الطبيعية",
    "categoryFolder": "natural-juices",
    "url": "/api/images/natural-juices-موسي-شعير.jpg",
    "fileId": "68e0ddf303f856d7b2d44926",
    "exists": false,
    "fileSize": 104981
  },
  {
    "original": "موسي-فرولة.jpg",
    "filename": "natural-juices-موسي-فرولة.jpg",
    "category": "العصيرات الطبيعية",
    "categoryFolder": "natural-juices",
    "url": "/api/images/natural-juices-موسي-فرولة.jpg",
    "fileId": "68e0ddf403f856d7b2d44928",
    "exists": false,
    "fileSize": 5229
  },
  {
    "original": "أيس-موكا.jpg",
    "filename": "cold-coffee-أيس-موكا.jpg",
    "category": "القهوة الباردة",
    "categoryFolder": "cold-coffee",
    "url": "/api/images/cold-coffee-أيس-موكا.jpg",
    "fileId": "68e0ddf503f856d7b2d4492a",
    "exists": false,
    "fileSize": 95163
  },
  {
    "original": "أيس-وايت-موكا.jpg",
    "filename": "cold-coffee-أيس-وايت-موكا.jpg",
    "category": "القهوة الباردة",
    "categoryFolder": "cold-coffee",
    "url": "/api/images/cold-coffee-أيس-وايت-موكا.jpg",
    "fileId": "68e0ddf503f856d7b2d4492c",
    "exists": false,
    "fileSize": 7286
  },
  {
    "original": "ايس سبانيش لايته.jpg",
    "filename": "cold-coffee-ايس-سبانيش-لايته.jpg",
    "category": "القهوة الباردة",
    "categoryFolder": "cold-coffee",
    "url": "/api/images/cold-coffee-ايس-سبانيش-لايته.jpg",
    "fileId": "68e0ddf603f856d7b2d4492e",
    "exists": false,
    "fileSize": 68028
  },
  {
    "original": "ايس-امريكانو.jpg",
    "filename": "cold-coffee-ايس-امريكانو.jpg",
    "category": "القهوة الباردة",
    "categoryFolder": "cold-coffee",
    "url": "/api/images/cold-coffee-ايس-امريكانو.jpg",
    "fileId": "68e0ddf603f856d7b2d44930",
    "exists": false,
    "fileSize": 414905
  },
  {
    "original": "ايس-دريب.png",
    "filename": "cold-coffee-ايس-دريب.png",
    "category": "القهوة الباردة",
    "categoryFolder": "cold-coffee",
    "url": "/api/images/cold-coffee-ايس-دريب.png",
    "fileId": "68e0ddf903f856d7b2d44933",
    "exists": false,
    "fileSize": 161629
  },
  {
    "original": "ايس-سبنش-لاتيه.jpg",
    "filename": "cold-coffee-ايس-سبنش-لاتيه.jpg",
    "category": "القهوة الباردة",
    "categoryFolder": "cold-coffee",
    "url": "/api/images/cold-coffee-ايس-سبنش-لاتيه.jpg",
    "fileId": "68e0ddfa03f856d7b2d44935",
    "exists": false,
    "fileSize": 4421
  },
  {
    "original": "ايس-لاتيه.jpg",
    "filename": "cold-coffee-ايس-لاتيه.jpg",
    "category": "القهوة الباردة",
    "categoryFolder": "cold-coffee",
    "url": "/api/images/cold-coffee-ايس-لاتيه.jpg",
    "fileId": "68e0ddfb03f856d7b2d44937",
    "exists": false,
    "fileSize": 64494
  },
  {
    "original": "قهوة-اليوم-بارد.png",
    "filename": "cold-coffee-قهوة-اليوم-بارد.png",
    "category": "القهوة الباردة",
    "categoryFolder": "cold-coffee",
    "url": "/api/images/cold-coffee-قهوة-اليوم-بارد.png",
    "fileId": "68e0ddfb03f856d7b2d44939",
    "exists": false,
    "fileSize": 370007
  },
  {
    "original": "أيس-كركديه.jpg",
    "filename": "cocktails-أيس-كركديه.jpg",
    "category": "المكتيلز والمهيتو",
    "categoryFolder": "cocktails",
    "url": "/api/images/cocktails-أيس-كركديه.jpg",
    "fileId": "68e0ddfd03f856d7b2d4493c",
    "exists": false,
    "fileSize": 80578
  },
  {
    "original": "ايس-تي.jpg",
    "filename": "cocktails-ايس-تي.jpg",
    "category": "المكتيلز والمهيتو",
    "categoryFolder": "cocktails",
    "url": "/api/images/cocktails-ايس-تي.jpg",
    "fileId": "68e0ddfe03f856d7b2d4493e",
    "exists": false,
    "fileSize": 40998
  },
  {
    "original": "بيرة.jpg",
    "filename": "cocktails-بيرة.jpg",
    "category": "المكتيلز والمهيتو",
    "categoryFolder": "cocktails",
    "url": "/api/images/cocktails-بيرة.jpg",
    "fileId": "68e0ddfe03f856d7b2d44940",
    "exists": false,
    "fileSize": 4555
  },
  {
    "original": "كودرد.jpg",
    "filename": "cocktails-كودرد.jpg",
    "category": "المكتيلز والمهيتو",
    "categoryFolder": "cocktails",
    "url": "/api/images/cocktails-كودرد.jpg",
    "fileId": "68e0ddff03f856d7b2d44942",
    "exists": false,
    "fileSize": 5091
  },
  {
    "original": "مشروب-غازي.jpg",
    "filename": "cocktails-مشروب-غازي.jpg",
    "category": "المكتيلز والمهيتو",
    "categoryFolder": "cocktails",
    "url": "/api/images/cocktails-مشروب-غازي.jpg",
    "fileId": "68e0ddff03f856d7b2d44944",
    "exists": false,
    "fileSize": 118215
  },
  {
    "original": "مهيتو-ردبول.png",
    "filename": "cocktails-مهيتو-ردبول.png",
    "category": "المكتيلز والمهيتو",
    "categoryFolder": "cocktails",
    "url": "/api/images/cocktails-مهيتو-ردبول.png",
    "fileId": "68e0de0003f856d7b2d44946",
    "exists": false,
    "fileSize": 289722
  },
  {
    "original": "مهيتو-ريتا.jpg",
    "filename": "cocktails-مهيتو-ريتا.jpg",
    "category": "المكتيلز والمهيتو",
    "categoryFolder": "cocktails",
    "url": "/api/images/cocktails-مهيتو-ريتا.jpg",
    "fileId": "68e0de0203f856d7b2d44949",
    "exists": false,
    "fileSize": 62653
  },
  {
    "original": "مهيتو-سفن.jpg",
    "filename": "cocktails-مهيتو-سفن.jpg",
    "category": "المكتيلز والمهيتو",
    "categoryFolder": "cocktails",
    "url": "/api/images/cocktails-مهيتو-سفن.jpg",
    "fileId": "68e0de0203f856d7b2d4494b",
    "exists": false,
    "fileSize": 11144
  },
  {
    "original": "مهيتو-كودرد.jpg",
    "filename": "cocktails-مهيتو-كودرد.jpg",
    "category": "المكتيلز والمهيتو",
    "categoryFolder": "cocktails",
    "url": "/api/images/cocktails-مهيتو-كودرد.jpg",
    "fileId": "68e0de0303f856d7b2d4494d",
    "exists": false,
    "fileSize": 21960
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
