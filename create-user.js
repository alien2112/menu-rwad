// Simple test to create a user manually and test login
const mongoose = require('mongoose');

// MongoDB connection
const MONGODB_URI = 'mongodb+srv://eslamabdaltif:oneone2@cluster0.p8b1qnv.mongodb.net/menurwad?retryWrites=true&w=majority&appName=Cluster0';

// User schema
const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true, trim: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['admin', 'kitchen', 'barista', 'shisha', 'manager', 'staff'], required: true },
  name: { type: String, required: true, trim: true },
  email: { type: String, trim: true, lowercase: true },
  isActive: { type: Boolean, default: true },
  lastLogin: { type: Date },
  failedLoginAttempts: { type: Number, default: 0 },
  lockUntil: { type: Date },
}, { timestamps: true });

// Password hashing middleware
const bcrypt = require('bcryptjs');
const SALT_ROUNDS = 12;

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    return next();
  }
  try {
    this.password = await bcrypt.hash(this.password, SALT_ROUNDS);
    next();
  } catch (error) {
    next(error);
  }
});

// Password comparison method
userSchema.methods.comparePassword = async function (candidatePassword) {
  try {
    return await bcrypt.compare(candidatePassword, this.password);
  } catch (error) {
    console.error('Error comparing passwords:', error);
    return false;
  }
};

const User = mongoose.model('User', userSchema);

async function createTestUser() {
  try {
    console.log('🔌 Connecting to database...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Database connected');

    // Check if admin user exists
    const existingUser = await User.findOne({ username: 'admin' });
    if (existingUser) {
      console.log('👤 Admin user already exists:', existingUser.username);
      console.log('🔓 Testing password verification...');
      
      const isValid = await existingUser.comparePassword('Admin@2024');
      console.log('🔐 Password verification result:', isValid);
      
      if (isValid) {
        console.log('✅ Login should work with: admin / Admin@2024');
      } else {
        console.log('❌ Password verification failed');
        console.log('🔧 Creating new admin user...');
        
        // Delete old user and create new one
        await User.deleteOne({ username: 'admin' });
        const newUser = await User.create({
          username: 'admin',
          password: 'Admin@2024',
          role: 'admin',
          name: 'مدير النظام',
          email: 'admin@restaurant.com',
          isActive: true
        });
        console.log('✅ New admin user created');
      }
    } else {
      console.log('👤 No admin user found, creating one...');
      const newUser = await User.create({
        username: 'admin',
        password: 'Admin@2024',
        role: 'admin',
        name: 'مدير النظام',
        email: 'admin@restaurant.com',
        isActive: true
      });
      console.log('✅ Admin user created:', newUser.username);
    }

    // Test login
    console.log('🔐 Testing login...');
    const user = await User.findOne({ username: 'admin', isActive: true });
    if (user) {
      const isValid = await user.comparePassword('Admin@2024');
      console.log('🔑 Login test result:', isValid ? 'SUCCESS' : 'FAILED');
      
      if (isValid) {
        console.log('🎉 You can now login with:');
        console.log('   Username: admin');
        console.log('   Password: Admin@2024');
      }
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

createTestUser();