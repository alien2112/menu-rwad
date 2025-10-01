const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');

// MongoDB connection
    const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://eslamabdaltif:oneone2@cluster0marakshv2.ltf0bnd.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0marakshv2';

// HomepageImage schema
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

// Journey images data
const journeyImages = [
  {
    section: 'journey',
    title: 'رحلتنا مع القهوة',
    titleEn: 'Our Coffee Journey',
    description: 'من الحبة إلى الكوب، نصنع كل قهوة بشغف ودقة، لنقدم لك أرقى النكهات من جميع أنحاء العالم. بدأت رحلتنا بحلم بسيط: مشاركة الطعم الأصيل لثقافة القهوة المغربية.',
    descriptionEn: 'From bean to cup, we craft every coffee with passion and precision, bringing you the finest flavors from around the world. Our journey began with a simple dream: sharing the authentic taste of Moroccan coffee culture.',
    imageId: 'static-journey-1',
    imageUrl: '/Cafea boabe.jpeg',
    order: 1,
    journeyPosition: 'left',
    status: 'active'
  },
  {
    section: 'journey',
    title: 'أجواء أصيلة',
    titleEn: 'Authentic Atmosphere',
    description: 'ادخل إلى عالمنا حيث تلتقي الضيافة المغربية التقليدية بالراحة العصرية، لخلق تجربة لا تُنسى. كل زاوية تحكي قصة من التراث والدفء.',
    descriptionEn: 'Step into our world where traditional Moroccan hospitality meets modern comfort, creating an unforgettable experience. Every corner tells a story of heritage and warmth.',
    imageId: 'static-journey-2',
    imageUrl: '/download (4).jpeg',
    order: 2,
    journeyPosition: 'right',
    status: 'active'
  },
  {
    section: 'journey',
    title: 'مكونات فاخرة',
    titleEn: 'Premium Ingredients',
    description: 'نختار فقط أرقى المكونات، من حبوب القهوة الفاخرة إلى الأعشاب الطازجة، لضمان أن كل رشفة استثنائية. الجودة هي وعدنا لك',
    descriptionEn: 'We select only the finest ingredients, from premium coffee beans to fresh herbs, ensuring every sip is exceptional. Quality is our promise to you.',
    imageId: 'static-journey-3',
    imageUrl: '/Close up of coffee beans roast _ Premium Photo.jpeg',
    order: 3,
    journeyPosition: 'left',
    status: 'active'
  }
];

async function uploadJourneyImages() {
  try {
    // Connect to MongoDB
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    // Clear existing journey images
    await HomepageImage.deleteMany({ section: 'journey' });
    console.log('Cleared existing journey images');

    // Upload new journey images
    for (const imageData of journeyImages) {
      const image = new HomepageImage(imageData);
      await image.save();
      console.log(`Uploaded: ${imageData.title}`);
    }

    console.log('Successfully uploaded all journey images!');
    
    // Verify upload
    const count = await HomepageImage.countDocuments({ section: 'journey' });
    console.log(`Total journey images in database: ${count}`);

  } catch (error) {
    console.error('Error uploading journey images:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

// Run the upload
uploadJourneyImages();
