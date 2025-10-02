import mongoose from 'mongoose';
import HomepageImage from '../lib/models/HomepageImage.js';
import dbConnect from '../lib/mongodb.js';

async function verifyJourneyImages() {
  try {
    await dbConnect();
    console.log('Connected to MongoDB via app connection');

    const journeyImages = await HomepageImage.find({ section: 'journey' });
    console.log(`Found ${journeyImages.length} journey images:`);
    
    journeyImages.forEach((img, index) => {
      console.log(`${index + 1}. ${img.title}`);
      console.log(`   - ID: ${img._id}`);
      console.log(`   - ImageId: ${img.imageId}`);
      console.log(`   - ImageUrl: ${img.imageUrl}`);
      console.log(`   - Order: ${img.order}`);
      console.log(`   - Position: ${img.journeyPosition}`);
      console.log(`   - Status: ${img.status}`);
      console.log(`   - Description: ${img.description?.substring(0, 50)}...`);
      console.log('');
    });

    // Test the API query
    const activeImages = await HomepageImage.find({ section: 'journey', status: 'active' }).sort({ order: 1, createdAt: 1 });
    console.log(`Active journey images: ${activeImages.length}`);

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.disconnect();
  }
}

verifyJourneyImages();


