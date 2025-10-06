import mongoose, { Schema, Model } from 'mongoose';

export interface IMenuItemIngredient {
  ingredientId: string;
  portion: number;
  required: boolean;
}

export interface IMenuItem {
  _id?: string;
  name: string;
  nameEn?: string;
  description?: string;
  descriptionEn?: string;
  categoryId: string;
  price: number;
  discountPrice?: number;
  image?: string;
  images?: string[];
  color?: string;
  ingredients: IMenuItemIngredient[];
  preparationTime?: number; // in minutes
  calories?: number;
  servingSize?: string;
  tags?: string[];
  allergens?: string[];
  status: 'active' | 'inactive' | 'out_of_stock';
  featured: boolean;
  order: number;
  createdAt?: Date;
  updatedAt?: Date;
}

const MenuItemSchema = new Schema<IMenuItem>(
  {
    name: {
      type: String,
      required: [true, 'Please provide an item name'],
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
    descriptionEn: {
      type: String,
      trim: true,
    },
    categoryId: {
      type: String,
      required: [true, 'Please provide a category'],
      index: true, // Index for fast category filtering
    },
    price: {
      type: Number,
      required: [true, 'Please provide a price'],
      min: 0,
    },
    cost: {
      type: Number,
      min: 0,
      default: 0,
    },
    discountPrice: {
      type: Number,
      min: 0,
    },
    image: {
      type: String,
    },
    images: [{
      type: String,
    }],
    color: {
      type: String,
      default: '#4F3500',
    },
    ingredients: [{
      ingredientId: {
        type: String,
        required: true,
      },
      portion: {
        type: Number,
        required: true,
        default: 1,
      },
      required: {
        type: Boolean,
        default: true,
      },
    }],
    preparationTime: {
      type: Number,
      default: 0,
    },
    calories: {
      type: Number,
      default: 0,
    },
    servingSize: {
      type: String,
    },
    tags: [{
      type: String,
    }],
    allergens: [{
      type: String,
    }],
    status: {
      type: String,
      enum: ['active', 'inactive', 'out_of_stock'],
      default: 'active',
      index: true, // Index for status filtering
    },
    featured: {
      type: Boolean,
      default: false,
      index: true, // Index for featured items
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

// Composite indexes for common queries
MenuItemSchema.index({ categoryId: 1, status: 1, order: 1 }); // Most common query pattern
MenuItemSchema.index({ status: 1, featured: 1, order: 1 }); // Featured items query
MenuItemSchema.index({ discountPrice: 1, price: 1 }); // Offers query

const MenuItem: Model<IMenuItem> =
  mongoose.models.MenuItem || mongoose.model<IMenuItem>('MenuItem', MenuItemSchema);

export default MenuItem;
