// Create all demo users
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

async function createAllUsers() {
  try {
    console.log('🔌 Connecting to database...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Database connected');

    // Define all demo users
    const demoUsers = [
      {
        username: 'admin',
        password: 'Admin@2024',
        role: 'admin',
        name: 'مدير النظام',
        email: 'admin@restaurant.com',
        permissions: {
          canManageAllBranches: true,
          canViewReports: true,
          canManageMenu: true,
          canManageOrders: true,
          canManageStaff: true,
        },
        isActive: true,
      },
      {
        username: 'kitchen',
        password: 'Kitchen@2024',
        role: 'kitchen',
        name: 'طاهي المطبخ',
        email: 'kitchen@restaurant.com',
        permissions: {
          canManageOrders: true,
        },
        isActive: true,
      },
      {
        username: 'barista',
        password: 'Barista@2024',
        role: 'barista',
        name: 'بارستا',
        email: 'barista@restaurant.com',
        permissions: {
          canManageOrders: true,
        },
        isActive: true,
      },
      {
        username: 'shisha',
        password: 'Shisha@2024',
        role: 'shisha',
        name: 'مشغل الشيشة',
        email: 'shisha@restaurant.com',
        permissions: {
          canManageOrders: true,
        },
        isActive: true,
      },
    ];

    console.log('👥 Creating all demo users...');
    
    for (const userData of demoUsers) {
      // Delete existing user if any
      await User.deleteOne({ username: userData.username });
      
      // Create new user
      const newUser = await User.create(userData);
      console.log(`✅ Created user: ${newUser.username} (${newUser.role})`);
      
      // Test password verification
      const isValid = await newUser.comparePassword(userData.password);
      console.log(`🔐 Password test for ${newUser.username}: ${isValid ? 'SUCCESS' : 'FAILED'}`);
    }

    console.log('\n🎉 All demo users created successfully!');
    console.log('\n📋 Login Credentials:');
    console.log('┌─────────┬──────────┬─────────────┬─────────────────────┐');
    console.log('│ Role    │ Username │ Password    │ Access Level        │');
    console.log('├─────────┼──────────┼─────────────┼─────────────────────┤');
    console.log('│ Admin   │ admin    │ Admin@2024  │ Full system access │');
    console.log('│ Kitchen │ kitchen  │ Kitchen@2024│ Kitchen orders only│');
    console.log('│ Barista │ barista  │ Barista@2024│ Barista orders only│');
    console.log('│ Shisha  │ shisha   │ Shisha@2024 │ Shisha orders only │');
    console.log('└─────────┴──────────┴─────────────┴─────────────────────┘');
    
    console.log('\n🌐 Your app is running on: http://localhost:3007');
    console.log('🔐 Try logging in with any of the credentials above!');

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

createAllUsers();

