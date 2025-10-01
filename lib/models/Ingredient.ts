import mongoose, { Schema, Model } from 'mongoose';

export interface IIngredient {
  _id?: string;
  name: string;
  nameEn?: string;
  description?: string;
  image?: string;
  unit: string; // e.g., 'g', 'ml', 'piece', 'cup'
  defaultPortion: number;
  minPortion?: number;
  maxPortion?: number;
  pricePerUnit: number;
  color?: string;
  allergens?: string[];
  status: 'active' | 'inactive';
  createdAt?: Date;
  updatedAt?: Date;
}

const IngredientSchema = new Schema<IIngredient>(
  {
    name: {
      type: String,
      required: [true, 'Please provide an ingredient name'],
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
    unit: {
      type: String,
      required: [true, 'Please provide a unit'],
      default: 'g',
    },
    defaultPortion: {
      type: Number,
      required: [true, 'Please provide a default portion'],
      default: 1,
    },
    minPortion: {
      type: Number,
      default: 0,
    },
    maxPortion: {
      type: Number,
      default: 10,
    },
    pricePerUnit: {
      type: Number,
      required: [true, 'Please provide a price per unit'],
      default: 0,
    },
    color: {
      type: String,
      default: '#00BF89',
    },
    allergens: [{
      type: String,
    }],
    status: {
      type: String,
      enum: ['active', 'inactive'],
      default: 'active',
    },
  },
  {
    timestamps: true,
  }
);

const Ingredient: Model<IIngredient> =
  mongoose.models.Ingredient || mongoose.model<IIngredient>('Ingredient', IngredientSchema);

export default Ingredient;
