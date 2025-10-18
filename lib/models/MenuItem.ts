import mongoose, { Schema, Model } from 'mongoose';

export interface IMenuItemInventoryItem {
  inventoryItemId: string;
  portion: number;
  required: boolean;
}

export interface IMenuItemSizeOption {
  id: string;
  name: string;
  nameEn?: string;
  priceModifier: number; // Additional price for this size
  description?: string;
}

export interface IMenuItemAddonOption {
  id: string;
  name: string;
  nameEn?: string;
  price: number;
  category: string;
  required: boolean;
  maxQuantity?: number;
}

export interface IMenuItem {
  _id?: string;
  name: string;
  nameEn?: string;
  description?: string;
  descriptionEn?: string;
  categoryId: string;
  branchId?: string; // Branch-specific menu items (optional for global items)
  restaurantId?: string; // For multi-tenant support
  price: number;
  discountPrice?: number;
  image?: string;
  images?: string[];
  color?: string;
  inventoryItems: IMenuItemInventoryItem[];
  preparationTime?: number; // in minutes
  calories?: number;
  servingSize?: string;
  tags?: string[];
  allergens?: string[];
  status: 'active' | 'inactive' | 'out_of_stock';
  featured: boolean;
  order: number;
  // Customization features
  sizeOptions?: IMenuItemSizeOption[];
  addonOptions?: IMenuItemAddonOption[];
  dietaryModifications?: string[];
  modifiers?: string[]; // Array of Modifier IDs
  rating?: number;
  reviewCount?: number;
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
    branchId: {
      type: String,
      index: true, // Index for branch filtering
    },
    restaurantId: {
      type: String,
      index: true,
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
    inventoryItems: [{
      inventoryItemId: {
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
    // Customization features
    sizeOptions: [{
      id: {
        type: String,
        required: true,
      },
      name: {
        type: String,
        required: true,
      },
      nameEn: {
        type: String,
      },
      priceModifier: {
        type: Number,
        required: true,
        default: 0,
      },
      description: {
        type: String,
      },
    }],
    addonOptions: [{
      id: {
        type: String,
        required: true,
      },
      name: {
        type: String,
        required: true,
      },
      nameEn: {
        type: String,
      },
      price: {
        type: Number,
        required: true,
        min: 0,
      },
      category: {
        type: String,
        required: true,
      },
      required: {
        type: Boolean,
        default: false,
      },
      maxQuantity: {
        type: Number,
        min: 1,
      },
    }],
    dietaryModifications: [{
      type: String,
    }],
    modifiers: [{
      type: String,
      ref: 'Modifier',
    }],
    rating: {
      type: Number,
      min: 0,
      max: 5,
      default: 0,
    },
    reviewCount: {
      type: Number,
      min: 0,
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
MenuItemSchema.index({ branchId: 1, categoryId: 1, status: 1 }); // Branch-specific menu queries
MenuItemSchema.index({ restaurantId: 1, branchId: 1 }); // Multi-tenant queries

const MenuItem: Model<IMenuItem> =
  mongoose.models.MenuItem || mongoose.model<IMenuItem>('MenuItem', MenuItemSchema);

export default MenuItem;
