import mongoose, { Schema, Model } from 'mongoose';

export interface ILocation {
  _id?: string;
  title: string;
  titleEn?: string;
  description?: string;
  descriptionEn?: string;
  images: string[]; // Array of image IDs
  address?: string;
  phone?: string;
  email?: string;
  coordinates?: {
    lat: number;
    lng: number;
  };
  status: 'active' | 'inactive';
  order: number;
  createdAt?: Date;
  updatedAt?: Date;
}

const LocationSchema = new Schema<ILocation>(
  {
    title: {
      type: String,
      required: [true, 'Please provide a location title'],
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
    images: [{
      type: String,
      required: true,
    }],
    address: {
      type: String,
      trim: true,
    },
    phone: {
      type: String,
      trim: true,
    },
    email: {
      type: String,
      trim: true,
    },
    coordinates: {
      lat: {
        type: Number,
      },
      lng: {
        type: Number,
      },
    },
    status: {
      type: String,
      enum: ['active', 'inactive'],
      default: 'active',
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

const Location: Model<ILocation> =
  mongoose.models.Location || mongoose.model<ILocation>('Location', LocationSchema);

export default Location;
