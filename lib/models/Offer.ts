import mongoose, { Schema, Model } from 'mongoose';

export interface IOffer {
  _id?: string;
  title: string;
  titleEn?: string;
  description?: string;
  descriptionEn?: string;
  type: 'percentage' | 'fixed' | 'buy_x_get_y' | 'free_item';
  discountValue?: number; // percentage or fixed amount
  minPurchase?: number;
  maxDiscount?: number;
  image?: string;
  color?: string;
  applicableCategories?: string[]; // category IDs
  applicableItems?: string[]; // item IDs
  buyQuantity?: number; // for buy X get Y
  getQuantity?: number; // for buy X get Y
  freeItemId?: string; // for free item offers
  code?: string; // promo code
  startDate: Date;
  endDate: Date;
  status: 'active' | 'inactive' | 'expired';
  usageLimit?: number;
  usedCount: number;
  order: number;
  createdAt?: Date;
  updatedAt?: Date;
}

const OfferSchema = new Schema<IOffer>(
  {
    title: {
      type: String,
      required: [true, 'Please provide an offer title'],
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
    type: {
      type: String,
      enum: ['percentage', 'fixed', 'buy_x_get_y', 'free_item'],
      required: [true, 'Please provide an offer type'],
    },
    discountValue: {
      type: Number,
      min: 0,
    },
    minPurchase: {
      type: Number,
      default: 0,
    },
    maxDiscount: {
      type: Number,
    },
    image: {
      type: String,
    },
    color: {
      type: String,
      default: '#FF6B6B',
    },
    applicableCategories: [{
      type: String,
    }],
    applicableItems: [{
      type: String,
    }],
    buyQuantity: {
      type: Number,
    },
    getQuantity: {
      type: Number,
    },
    freeItemId: {
      type: String,
    },
    code: {
      type: String,
      trim: true,
      uppercase: true,
    },
    startDate: {
      type: Date,
      required: [true, 'Please provide a start date'],
    },
    endDate: {
      type: Date,
      required: [true, 'Please provide an end date'],
    },
    status: {
      type: String,
      enum: ['active', 'inactive', 'expired'],
      default: 'active',
    },
    usageLimit: {
      type: Number,
    },
    usedCount: {
      type: Number,
      default: 0,
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

const Offer: Model<IOffer> =
  mongoose.models.Offer || mongoose.model<IOffer>('Offer', OfferSchema);

export default Offer;
