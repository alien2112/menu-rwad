import mongoose, { Schema, Model } from 'mongoose';

export interface ICategory {
  _id?: string;
  name: string;
  nameEn?: string;
  description?: string;
  image?: string;
  color: string;
  icon?: string;
  department?: 'kitchen' | 'barista' | 'shisha'; // Department for routing orders
  order: number;
  featured?: boolean;
  featuredOrder?: number;
  status: 'active' | 'inactive';
  createdAt?: Date;
  updatedAt?: Date;
}

const CategorySchema = new Schema<ICategory>(
  {
    name: {
      type: String,
      required: [true, 'Please provide a category name'],
      trim: true,
    },
    nameEn: {
      type: String,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    image: {
      type: String,
    },
    color: {
      type: String,
      default: '#4F3500',
    },
    icon: {
      type: String,
    },
    department: {
      type: String,
      enum: ['kitchen', 'barista', 'shisha'],
      default: 'kitchen',
    },
    order: {
      type: Number,
      default: 0,
    },
    featured: {
      type: Boolean,
      default: false,
      index: true,
    },
    featuredOrder: {
      type: Number,
      default: 0,
    },
    status: {
      type: String,
      enum: ['active', 'inactive'],
      default: 'active',
    },
  },
  {
    timestamps: true,
    strict: false,
  }
);

// Add index for featured categories
CategorySchema.index({ featured: 1, featuredOrder: 1 });

// Delete the existing model to force recompilation
if (mongoose.models.Category) {
  delete mongoose.models.Category;
}

const Category: Model<ICategory> = mongoose.model<ICategory>('Category', CategorySchema);

export default Category;
