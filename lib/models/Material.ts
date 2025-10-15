import mongoose, { Schema, Model } from 'mongoose';

export interface IMaterial {
  _id?: string;
  name: string;
  nameEn?: string;
  description?: string;
  unit: string; // e.g., 'kg', 'liter', 'piece', 'box'
  currentQuantity: number;
  minLimit: number;
  alertLimit: number;
  costPerUnit: number;
  supplier?: string;
  category: 'food' | 'beverage' | 'shisha' | 'cleaning' | 'other';
  status: 'active' | 'inactive' | 'out_of_stock';
  lastRestocked?: Date;
  expiryDate?: Date;
  image?: string;
  notes?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

const MaterialSchema = new Schema<IMaterial>(
  {
    name: {
      type: String,
      required: [true, 'Please provide a material name'],
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
    unit: {
      type: String,
      required: [true, 'Please provide a unit'],
      default: 'kg',
    },
    currentQuantity: {
      type: Number,
      required: [true, 'Please provide current quantity'],
      min: 0,
      default: 0,
    },
    minLimit: {
      type: Number,
      required: [true, 'Please provide minimum limit'],
      min: 0,
      default: 0,
    },
    alertLimit: {
      type: Number,
      required: [true, 'Please provide alert limit'],
      min: 0,
      default: 0,
    },
    costPerUnit: {
      type: Number,
      required: [true, 'Please provide cost per unit'],
      min: 0,
      default: 0,
    },
    supplier: {
      type: String,
      trim: true,
    },
    category: {
      type: String,
      enum: ['food', 'beverage', 'shisha', 'cleaning', 'other'],
      default: 'food',
      index: true,
    },
    status: {
      type: String,
      enum: ['active', 'inactive', 'out_of_stock'],
      default: 'active',
      index: true,
    },
    lastRestocked: {
      type: Date,
    },
    expiryDate: {
      type: Date,
    },
    image: {
      type: String,
    },
    notes: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for better performance
MaterialSchema.index({ category: 1, status: 1 });
MaterialSchema.index({ currentQuantity: 1 });
MaterialSchema.index({ alertLimit: 1 });

// Virtual for checking if material is low stock
MaterialSchema.virtual('isLowStock').get(function() {
  return this.currentQuantity <= this.alertLimit;
});

// Virtual for checking if material is out of stock
MaterialSchema.virtual('isOutOfStock').get(function() {
  return this.currentQuantity <= 0;
});

const Material: Model<IMaterial> =
  mongoose.models.Material || mongoose.model<IMaterial>('Material', MaterialSchema);

export default Material;

