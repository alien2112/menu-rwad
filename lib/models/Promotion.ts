import mongoose, { Document, Schema } from 'mongoose';

// Base promotion interface
export interface PromotionDocument extends Document {
  name: string;
  nameEn?: string;
  type: 'discount-code' | 'buy-x-get-y';
  description?: string;
  descriptionEn?: string;
  startDate: Date;
  endDate: Date;
  active: boolean;
  usageCount: number;

  // Discount Code fields
  code?: string;
  discountType?: 'percent' | 'fixed';
  value?: number;
  usageLimit?: number;
  minPurchaseAmount?: number;

  // Buy X Get Y fields
  buyQty?: number;
  getQty?: number;
  applicableItems?: mongoose.Types.ObjectId[];
  applicableCategories?: mongoose.Types.ObjectId[];

  // Metadata
  createdAt: Date;
  updatedAt: Date;

  // Methods
  isValid(): boolean;
  isExpired(): boolean;
  canBeUsed(): boolean;
  incrementUsage(): Promise<void>;
}

const PromotionSchema = new Schema<PromotionDocument>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    nameEn: {
      type: String,
      trim: true,
    },
    type: {
      type: String,
      enum: ['discount-code', 'buy-x-get-y'],
      required: true,
    },
    description: {
      type: String,
      trim: true,
    },
    descriptionEn: {
      type: String,
      trim: true,
    },
    startDate: {
      type: Date,
      required: true,
    },
    endDate: {
      type: Date,
      required: true,
    },
    active: {
      type: Boolean,
      default: true,
    },
    usageCount: {
      type: Number,
      default: 0,
    },

    // Discount Code fields
    code: {
      type: String,
      trim: true,
      uppercase: true,
      sparse: true, // Allow null values, but ensure uniqueness when present
    },
    discountType: {
      type: String,
      enum: ['percent', 'fixed'],
    },
    value: {
      type: Number,
      min: 0,
    },
    usageLimit: {
      type: Number,
      min: 0,
    },
    minPurchaseAmount: {
      type: Number,
      min: 0,
      default: 0,
    },

    // Buy X Get Y fields
    buyQty: {
      type: Number,
      min: 1,
    },
    getQty: {
      type: Number,
      min: 1,
    },
    applicableItems: [{
      type: Schema.Types.ObjectId,
      ref: 'MenuItem',
    }],
    applicableCategories: [{
      type: Schema.Types.ObjectId,
      ref: 'Category',
    }],
  },
  {
    timestamps: true,
  }
);

// Indexes for performance
PromotionSchema.index({ code: 1 }, { unique: true, sparse: true });
PromotionSchema.index({ type: 1, active: 1 });
PromotionSchema.index({ startDate: 1, endDate: 1 });

// Validation: Ensure type-specific fields are present
PromotionSchema.pre('save', function (next) {
  if (this.type === 'discount-code') {
    if (!this.code || !this.discountType || this.value === undefined) {
      return next(new Error('Discount code promotions require code, discountType, and value'));
    }

    // Validate percent discount
    if (this.discountType === 'percent' && this.value > 100) {
      return next(new Error('Percent discount cannot exceed 100%'));
    }
  }

  if (this.type === 'buy-x-get-y') {
    if (!this.buyQty || !this.getQty) {
      return next(new Error('Buy X Get Y promotions require buyQty and getQty'));
    }

    if (!this.applicableItems?.length && !this.applicableCategories?.length) {
      return next(new Error('Buy X Get Y promotions require at least one applicable item or category'));
    }
  }

  // Validate date range
  if (this.startDate >= this.endDate) {
    return next(new Error('End date must be after start date'));
  }

  next();
});

// Method: Check if promotion is currently valid (within date range)
PromotionSchema.methods.isValid = function (): boolean {
  const now = new Date();
  return now >= this.startDate && now <= this.endDate;
};

// Method: Check if promotion is expired
PromotionSchema.methods.isExpired = function (): boolean {
  const now = new Date();
  return now > this.endDate;
};

// Method: Check if promotion can be used
PromotionSchema.methods.canBeUsed = function (): boolean {
  if (!this.active) return false;
  if (!this.isValid()) return false;

  if (this.type === 'discount-code' && this.usageLimit) {
    if (this.usageCount >= this.usageLimit) return false;
  }

  return true;
};

// Method: Increment usage count
PromotionSchema.methods.incrementUsage = async function (): Promise<void> {
  this.usageCount += 1;
  await this.save();
};

// Static method: Find active promotions
PromotionSchema.statics.findActive = function () {
  const now = new Date();
  return this.find({
    active: true,
    startDate: { $lte: now },
    endDate: { $gte: now },
  });
};

// Static method: Find valid Buy X Get Y promotions for specific items
PromotionSchema.statics.findBuyXGetYForItems = function (itemIds: string[]) {
  const now = new Date();
  return this.find({
    type: 'buy-x-get-y',
    active: true,
    startDate: { $lte: now },
    endDate: { $gte: now },
    $or: [
      { applicableItems: { $in: itemIds } },
      { applicableCategories: { $exists: true, $ne: [] } },
    ],
  });
};

const Promotion = mongoose.models.Promotion || mongoose.model<PromotionDocument>('Promotion', PromotionSchema);

export default Promotion;
