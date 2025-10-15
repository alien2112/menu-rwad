import mongoose, { Schema, Model } from 'mongoose';

export interface IDepartment {
  _id?: string;
  name: string;
  nameEn?: string;
  type: 'kitchen' | 'barista' | 'shisha';
  description?: string;
  color: string;
  icon?: string;
  isActive: boolean;
  order: number;
  createdAt?: Date;
  updatedAt?: Date;
}

const DepartmentSchema = new Schema<IDepartment>(
  {
    name: {
      type: String,
      required: [true, 'Please provide a department name'],
      trim: true,
    },
    nameEn: {
      type: String,
      trim: true,
    },
    type: {
      type: String,
      enum: ['kitchen', 'barista', 'shisha'],
      required: [true, 'Please provide department type'],
      unique: true,
      index: true,
    },
    description: {
      type: String,
      trim: true,
    },
    color: {
      type: String,
      default: '#4F3500',
    },
    icon: {
      type: String,
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
    order: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Index for active departments
DepartmentSchema.index({ isActive: 1, order: 1 });

const Department: Model<IDepartment> =
  mongoose.models.Department || mongoose.model<IDepartment>('Department', DepartmentSchema);

export default Department;

