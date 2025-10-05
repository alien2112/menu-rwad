const { MongoClient } = require('mongodb');

// Your MongoDB Atlas connection string
const MONGODB_URI = 'mongodb+srv://eslamabdaltif:oneone2@cluster0marakshv2.ltf0bnd.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0marakshv2';

async function addImageUrlsToFoodItems() {
  let client;
  
  try {
    console.log('🌐 Connecting to MongoDB Atlas...');
    console.log('Connection string:', MONGODB_URI.replace(/\/\/.*@/, '//***:***@')); // Hide credentials
    
    client = new MongoClient(MONGODB_URI);
    await client.connect();
    
    const db = client.db();
    console.log('✅ Connected to Atlas database:', db.databaseName);
    
    const menuItemsCollection = db.collection('menuitems');
    
    // Get all menu items
    const menuItems = await menuItemsCollection.find({}).toArray();
    console.log(`\n📋 Found ${menuItems.length} menu items to update`);
    
    // Image mapping based on food categories and available images
    const imageMappings = {
      // Moroccan Food images
      'شكشوكة': '/download (1).jpeg',
      'بيض اومليت': '/download (2).jpeg',
      'كبده': '/download (3).jpeg',
      'فول': '/download (4).jpeg',
      'صينية مشكله': '/download.jpeg',
      'حريره مفربية': '/download (1).jpeg',
      'بيصاره مغربية': '/download (2).jpeg',
      'مسمن مغربي': '/download (3).jpeg',
      'حرشه مغربية': '/download (4).jpeg',
      'طاقوس مغربي': '/download.jpeg',
      'بوكاديوس': '/download (1).jpeg',
      'بطبوط جبن': '/download (2).jpeg',
      'بطبوط لحم': '/download (3).jpeg',
      'بطبوط خضار': '/download (4).jpeg',
      'سلطة مغربية': '/download.jpeg',
      'جراتان': '/download (1).jpeg',
      
      // Pizza images
      'بيتزا خضار': '/pngegg.png',
      'بيتزا دجاج': '/pngegg (1).png',
      'بيتزا مشكل': '/pngegg.png',
      
      // Desserts images
      'تشيز كيك توت ازرق': '/Turkish Tea.jpeg',
      'تشيز كيك فراوله': '/Turkish Tea.jpeg',
      'كيك سنيكرس': '/Turkish Tea.jpeg',
      'كيك ترامسيو': '/Turkish Tea.jpeg',
      'تشيز كيك لوتس': '/Turkish Tea.jpeg',
      'بودينج': '/Turkish Tea.jpeg',
      'كوكيز': '/Turkish Tea.jpeg',
      'كيك عسل': '/Turkish Tea.jpeg',
      'سان سبيستيان': '/Turkish Tea.jpeg',
      'كيك نوتيلا': '/Turkish Tea.jpeg',
      'كرانشي كيك': '/Turkish Tea.jpeg',
      
      // Coffee images
      'اسبريسو': '/Cafea boabe.jpeg',
      'مكاتو': '/Cafea boabe.jpeg',
      'امريكانو': '/Cafea boabe.jpeg',
      'كورتادو': '/Cafea boabe.jpeg',
      'فلات وايت': '/Cafea boabe.jpeg',
      'لاتيه': '/Cafea boabe.jpeg',
      'كابتشينو': '/Cafea boabe.jpeg',
      'سبنش لاتيه': '/Cafea boabe.jpeg',
      'وايت موكا حار': '/Cafea boabe.jpeg',
      'موكا حار': '/Cafea boabe.jpeg',
      'ايس امريكانو': '/Cafea boabe.jpeg',
      'ايس لاتيه': '/Cafea boabe.jpeg',
      'ايس سبنش لاتيه': '/Cafea boabe.jpeg',
      'أيس وايت موكا': '/Cafea boabe.jpeg',
      'أيس موكا': '/Cafea boabe.jpeg',
      'قهوة اليوم حار': '/Cafea boabe.jpeg',
      'قهوة اليوم بارد': '/Cafea boabe.jpeg',
      
      // Natural Juices images
      'أيس كركديه': '/Cup With Straw.png',
      'برتقال': '/Cup With Straw.png',
      'منجا سادة': '/Cup With Straw.png',
      'منجا حليب': '/Cup With Straw.png',
      'ليمون سادة': '/Cup With Straw.png',
      'ليمون نعناع': '/Cup With Straw.png',
      'افكادو حليب': '/Cup With Straw.png',
      
      // Energy Drinks images
      'ردبول': '/High Voltage.png',
      'كودرد': '/High Voltage.png',
      'ريتا': '/High Voltage.png',
      'مهيتو ردبول': '/High Voltage.png',
      'مهيتو كودرد': '/High Voltage.png',
      'مهيتو ريتا': '/High Voltage.png',
      'مهيتو سفن': '/High Voltage.png',
      'سفن': '/High Voltage.png',
      'حمضيات': '/High Voltage.png',
      'ببسي': '/High Voltage.png',
      
      // Smoothies images
      'موسي فرولة': '/Tropical Drink.png',
      'موسي شعير': '/Tropical Drink.png',
      'موسي رمان': '/Tropical Drink.png',
      'في60': '/Tropical Drink.png',
      'ايس دريب': '/Tropical Drink.png',
      
      // Tea images
      'شاي أثاي براد كبير': '/Turkish Tea.jpeg',
      'شاي أثاي براد وسط': '/Turkish Tea.jpeg',
      'شاي أثاي براد صغير': '/Turkish Tea.jpeg',
      'شاي طائفي براد كبير': '/Turkish Tea.jpeg',
      'شاي طائفي براد وسط': '/Turkish Tea.jpeg',
      'شاي طائفي براد صغير': '/Turkish Tea.jpeg',
      'شاي أحمر براد كبير': '/Turkish Tea.jpeg',
      'شاي أحمر براد وسط': '/Turkish Tea.jpeg',
      'شاي أحمر براد صغير': '/Turkish Tea.jpeg'
    };
    
    console.log('\n🖼️  Updating menu items with image URLs...');
    
    let updatedCount = 0;
    let skippedCount = 0;
    
    for (const item of menuItems) {
      const imageUrl = imageMappings[item.name];
      
      if (imageUrl) {
        await menuItemsCollection.updateOne(
          { _id: item._id },
          { 
            $set: { 
              imageUrl: imageUrl,
              updatedAt: new Date()
            }
          }
        );
        console.log(`   ✅ Updated: ${item.name} -> ${imageUrl}`);
        updatedCount++;
      } else {
        console.log(`   ⚠️  No image mapping found for: ${item.name}`);
        skippedCount++;
      }
    }
    
    console.log(`\n📊 Summary:`);
    console.log(`   Updated: ${updatedCount} items`);
    console.log(`   Skipped: ${skippedCount} items`);
    
    // Verify the updates
    console.log('\n✅ Verification:');
    const itemsWithImages = await menuItemsCollection.countDocuments({ imageUrl: { $exists: true } });
    const totalItems = await menuItemsCollection.countDocuments();
    console.log(`   Items with images: ${itemsWithImages}/${totalItems}`);
    
    console.log('\n🎉 Image URLs added successfully!');
    
  } catch (error) {
    console.error('❌ Error adding image URLs:', error);
    throw error;
  } finally {
    if (client) {
      await client.close();
      console.log('\n🔌 Disconnected from MongoDB Atlas');
    }
  }
}

// Run the script
addImageUrlsToFoodItems().catch(console.error);
