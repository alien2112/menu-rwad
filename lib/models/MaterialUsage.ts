import mongoose, { Schema, Model } from 'mongoose';

/**
 * MaterialUsage - Tracks inventory consumption for analytics and reporting
 *
 * NOTE: Despite the name "Material", this model tracks INVENTORY ITEM usage
 * - materialId = inventoryItem.ingredientId (for backward compatibility)
 * - materialName = inventoryItem.ingredientName
 *
 * This model is ACTIVELY USED for:
 * - Order tracking and history
 * - Analytics and reporting
 * - Consumption patterns analysis
 * - Archive operations
 *
 * DO NOT REMOVE - This is a critical part of the analytics system
 */
export interface IMaterialUsage {
  _id?: string;
  materialId: string; // Actually stores inventoryItem.ingredientId
  materialName: string; // Actually stores inventoryItem.ingredientName
  quantityUsed: number;
  unit: string;
  orderId?: string;
  orderNumber?: string;
  menuItemId?: string;
  menuItemName?: string;
  department: 'kitchen' | 'barista' | 'shisha';
  usageType: 'order' | 'manual' | 'waste' | 'adjustment';
  notes?: string;
  usedBy?: string; // User who recorded the usage
  usageDate: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

const MaterialUsageSchema = new Schema<IMaterialUsage>(
  {
    materialId: {
      type: String,
      required: [true, 'Material ID is required'],
      index: true,
    },
    materialName: {
      type: String,
      required: [true, 'Material name is required'],
    },
    quantityUsed: {
      type: Number,
      required: [true, 'Quantity used is required'],
      min: 0,
    },
    unit: {
      type: String,
      required: [true, 'Unit is required'],
    },
    orderId: {
      type: String,
      index: true,
    },
    orderNumber: {
      type: String,
      index: true,
    },
    menuItemId: {
      type: String,
      index: true,
    },
    menuItemName: {
      type: String,
    },
    department: {
      type: String,
      enum: ['kitchen', 'barista', 'shisha'],
      required: [true, 'Department is required'],
      index: true,
    },
    usageType: {
      type: String,
      enum: ['order', 'manual', 'waste', 'adjustment'],
      default: 'order',
      index: true,
    },
    notes: {
      type: String,
      trim: true,
    },
    usedBy: {
      type: String,
      trim: true,
    },
    usageDate: {
      type: Date,
      required: [true, 'Usage date is required'],
      default: Date.now,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for analytics queries
MaterialUsageSchema.index({ materialId: 1, usageDate: -1 });
MaterialUsageSchema.index({ department: 1, usageDate: -1 });
MaterialUsageSchema.index({ usageType: 1, usageDate: -1 });
MaterialUsageSchema.index({ usageDate: -1 });

const MaterialUsage: Model<IMaterialUsage> =
  mongoose.models.MaterialUsage || mongoose.model<IMaterialUsage>('MaterialUsage', MaterialUsageSchema);

export default MaterialUsage;

