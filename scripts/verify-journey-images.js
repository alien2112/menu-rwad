const mongoose = require('mongoose');

// Use the same schema as the app
const HomepageImageSchema = new mongoose.Schema({
  section: {
    type: String,
    enum: ['signature-drinks', 'offers', 'journey'],
    required: true,
  },
  title: {
    type: String,
    required: true,
    trim: true,
  },
  titleEn: {
    type: String,
    trim: true,
  },
  description: {
    type: String,
    trim: true,
  },
  descriptionEn: {
    type: String,
    trim: true,
  },
  imageId: {
    type: String,
    required: true,
  },
  imageUrl: {
    type: String,
  },
  order: {
    type: Number,
    default: 0,
  },
  status: {
    type: String,
    enum: ['active', 'inactive'],
    default: 'active',
  },
  journeyPosition: {
    type: String,
    enum: ['left', 'right'],
  },
}, {
  timestamps: true,
});

const HomepageImage = mongoose.model('HomepageImage', HomepageImageSchema);

async function verifyJourneyImages() {
  try {
    const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://eslamabdaltif:oneone2@cluster0marakshv2.ltf0bnd.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0marakshv2';
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

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

    // Test the exact API query
    const activeImages = await HomepageImage.find({ section: 'journey', status: 'active' }).sort({ order: 1, createdAt: 1 });
    console.log(`Active journey images (API query): ${activeImages.length}`);
    
    // Test without status filter
    const allImages = await HomepageImage.find({ section: 'journey' }).sort({ order: 1, createdAt: 1 });
    console.log(`All journey images (no status filter): ${allImages.length}`);

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.disconnect();
  }
}

verifyJourneyImages();
