import mongoose, { Schema, Model, Document } from 'mongoose';

export interface IUser extends Document {
  username: string;
  password: string;
  role: 'admin' | 'kitchen' | 'barista' | 'shisha' | 'manager' | 'staff';
  name: string;
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
  createdAt?: Date;
  updatedAt?: Date;
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
  },
  { timestamps: true }
);

UserSchema.index({ role: 1, isActive: 1 });
UserSchema.index({ restaurantId: 1 });
UserSchema.index({ primaryBranchId: 1 });

const User: Model<IUser> =
  mongoose.models.User || mongoose.model<IUser>('User', UserSchema);

export default User;

