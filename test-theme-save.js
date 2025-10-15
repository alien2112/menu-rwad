// Test script to verify theme colors are being saved correctly
require('dotenv').config();
const mongoose = require('mongoose');

const MONGODB_URI = process.env.MONGODB_URI;

// Define the schema inline to test
const SiteSettingsSchema = new mongoose.Schema({
  logoUrl: {
    type: String,
    default: '/موال مراكش طواجن  1 (1).png',
    trim: true,
  },
  logoPosition: {
    type: String,
    enum: ['left', 'center', 'right'],
    default: 'center',
  },
  theme: {
    type: mongoose.Schema.Types.Mixed,
    default: undefined,
  },
  updatedAt: {
    type: Date,
    default: () => new Date(),
  },
}, {
  strict: true,
  minimize: false
});

SiteSettingsSchema.pre('save', function (next) {
  this.updatedAt = new Date();
  next();
});

SiteSettingsSchema.statics.getSettings = async function () {
  const existing = await this.findOne();
  if (existing) return existing;
  return this.create({});
};

async function testThemeSave() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✓ Connected to MongoDB');

    const SiteSettings = mongoose.models.SiteSettings || mongoose.model('SiteSettings', SiteSettingsSchema);

    // Get current settings
    console.log('\n1. Fetching current settings...');
    let settings = await SiteSettings.getSettings();
    console.log('Current theme:', JSON.stringify(settings.theme, null, 2));

    // Test saving a new theme
    console.log('\n2. Saving test theme colors...');
    const testTheme = {
      background: '#FF0000',
      foreground: '#00FF00',
      primary: '#0000FF',
      secondary: '#FFFF00',
      accent: '#FF00FF',
      card: '#00FFFF',
      'card-foreground': '#FFFFFF',
    };

    settings.theme = testTheme;
    settings.markModified('theme');
    await settings.save();
    console.log('✓ Theme saved');

    // Verify the save by fetching again
    console.log('\n3. Verifying saved theme...');
    const freshSettings = await SiteSettings.findOne();
    console.log('Saved theme:', JSON.stringify(freshSettings.theme, null, 2));

    if (JSON.stringify(freshSettings.theme) === JSON.stringify(testTheme)) {
      console.log('✓ Theme save verification PASSED');
    } else {
      console.log('✗ Theme save verification FAILED');
      console.log('Expected:', testTheme);
      console.log('Got:', freshSettings.theme);
    }

    // Clean up test data
    console.log('\n4. Cleaning up test data...');
    settings.theme = undefined;
    settings.markModified('theme');
    await settings.save();
    console.log('✓ Test data cleaned up');

    await mongoose.connection.close();
    console.log('\n✓ Test completed successfully');
  } catch (error) {
    console.error('✗ Test failed:', error);
    process.exit(1);
  }
}

testThemeSave();
