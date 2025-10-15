import mongoose, { Schema, Model } from 'mongoose';

export interface IInventoryItem {
  _id?: string;
  ingredientId: string;
  ingredientName: string;
  currentStock: number;
  unit: string;
  minStockLevel: number;
  maxStockLevel: number;
  lastUpdated: Date;
  status: 'in_stock' | 'low_stock' | 'out_of_stock';
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IInventoryConsumption {
  _id?: string;
  ingredientId: string;
  ingredientName: string;
  quantityConsumed: number;
  unit: string;
  reason: 'order' | 'waste' | 'spoilage' | 'manual_adjustment' | 'other';
  orderId?: string; // If consumption is due to an order
  menuItemId?: string; // If consumption is due to a specific menu item
  notes?: string;
  recordedBy: string; // User who recorded the consumption
  recordedAt: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

const InventoryItemSchema = new Schema<IInventoryItem>(
  {
    ingredientId: {
      type: String,
      required: [true, 'Please provide an ingredient ID'],
    },
    ingredientName: {
      type: String,
      required: [true, 'Please provide an ingredient name'],
      trim: true,
    },
    currentStock: {
      type: Number,
      required: [true, 'Please provide current stock'],
      min: 0,
      default: 0,
    },
    unit: {
      type: String,
      required: [true, 'Please provide a unit'],
      default: 'g',
    },
    minStockLevel: {
      type: Number,
      required: [true, 'Please provide minimum stock level'],
      min: 0,
      default: 10,
    },
    maxStockLevel: {
      type: Number,
      required: [true, 'Please provide maximum stock level'],
      min: 0,
      default: 100,
    },
    lastUpdated: {
      type: Date,
      default: Date.now,
    },
    status: {
      type: String,
      enum: ['in_stock', 'low_stock', 'out_of_stock'],
      default: 'in_stock',
    },
  },
  {
    timestamps: true,
  }
);

const InventoryConsumptionSchema = new Schema<IInventoryConsumption>(
  {
    ingredientId: {
      type: String,
      required: [true, 'Please provide an ingredient ID'],
    },
    ingredientName: {
      type: String,
      required: [true, 'Please provide an ingredient name'],
      trim: true,
    },
    quantityConsumed: {
      type: Number,
      required: [true, 'Please provide quantity consumed'],
      min: 0,
    },
    unit: {
      type: String,
      required: [true, 'Please provide a unit'],
      default: 'g',
    },
    reason: {
      type: String,
      enum: ['order', 'waste', 'spoilage', 'manual_adjustment', 'other'],
      required: [true, 'Please provide a reason for consumption'],
    },
    orderId: {
      type: String,
    },
    menuItemId: {
      type: String,
    },
    notes: {
      type: String,
      trim: true,
    },
    recordedBy: {
      type: String,
      required: [true, 'Please provide who recorded this consumption'],
    },
    recordedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for efficient queries
InventoryItemSchema.index({ ingredientId: 1 }, { unique: true });
InventoryItemSchema.index({ status: 1, currentStock: 1 });
InventoryConsumptionSchema.index({ ingredientId: 1, recordedAt: -1 });
InventoryConsumptionSchema.index({ orderId: 1 });
InventoryConsumptionSchema.index({ reason: 1, recordedAt: -1 });

const InventoryItem: Model<IInventoryItem> =
  mongoose.models.InventoryItem || mongoose.model<IInventoryItem>('InventoryItem', InventoryItemSchema);

const InventoryConsumption: Model<IInventoryConsumption> =
  mongoose.models.InventoryConsumption || mongoose.model<IInventoryConsumption>('InventoryConsumption', InventoryConsumptionSchema);

export { InventoryItem, InventoryConsumption };
export default InventoryItem;



