import mongoose, { Schema, Model, Document } from 'mongoose';
import { hashPassword } from '@/lib/auth/password';

export interface IUser extends Document {
  username: string;
  password: string;
  role: 'admin' | 'kitchen' | 'barista' | 'shisha' | 'manager' | 'staff';
  name: string;
  email?: string;
  restaurantId?: string; // For multi-tenant support
  assignedBranches?: string[]; // Branch IDs this user can access
  primaryBranchId?: string; // Main branch for this user
  permissions?: {
    canManageAllBranches?: boolean; // Typically for 'admin' role
    canViewReports?: boolean;
    canManageMenu?: boolean;
    canManageOrders?: boolean;
    canManageStaff?: boolean;
  };
  isActive: boolean;
  lastLogin?: Date;
  failedLoginAttempts?: number;
  lockUntil?: Date;
  createdAt?: Date;
  updatedAt?: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

const UserSchema = new Schema<IUser>(
  {
    username: { type: String, required: true, unique: true, trim: true },
    password: { type: String, required: true },
    role: {
      type: String,
      enum: ['admin', 'kitchen', 'barista', 'shisha', 'manager', 'staff'],
      required: true
    },
    name: { type: String, required: true, trim: true },
    email: { type: String, trim: true, lowercase: true, sparse: true },
    restaurantId: {
      type: String,
      trim: true,
      index: true
    },
    assignedBranches: [{
      type: String,
      trim: true
    }],
    primaryBranchId: {
      type: String,
      trim: true,
      index: true
    },
    permissions: {
      canManageAllBranches: { type: Boolean, default: false },
      canViewReports: { type: Boolean, default: false },
      canManageMenu: { type: Boolean, default: false },
      canManageOrders: { type: Boolean, default: false },
      canManageStaff: { type: Boolean, default: false },
    },
    isActive: { type: Boolean, default: true },
    lastLogin: { type: Date },
    failedLoginAttempts: { type: Number, default: 0 },
    lockUntil: { type: Date },
  },
  { timestamps: true }
);

// Indexes
UserSchema.index({ role: 1, isActive: 1 });
UserSchema.index({ restaurantId: 1 });
UserSchema.index({ primaryBranchId: 1 });
UserSchema.index({ email: 1 }, { sparse: true });

// Password hashing middleware - hash password before saving
UserSchema.pre('save', async function (next) {
  // Only hash the password if it has been modified (or is new)
  if (!this.isModified('password')) {
    return next();
  }

  try {
    // Hash the password
    this.password = await hashPassword(this.password);
    next();
  } catch (error: unknown) {
    next(error as Error);
  }
});

// Method to compare passwords
UserSchema.methods.comparePassword = async function (
  candidatePassword: string
): Promise<boolean> {
  try {
    const { verifyPassword } = await import('@/lib/auth/password');
    return await verifyPassword(candidatePassword, this.password);
  } catch (error) {
    console.error('Error comparing passwords:', error);
    return false;
  }
};

const User: Model<IUser> =
  mongoose.models.User || mongoose.model<IUser>('User', UserSchema);

export default User;

