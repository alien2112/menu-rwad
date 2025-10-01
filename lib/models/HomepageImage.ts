import mongoose, { Schema, Model } from 'mongoose';

export interface IHomepageImage {
  _id?: string;
  section: 'signature-drinks' | 'offers' | 'journey';
  title: string;
  titleEn?: string;
  description?: string;
  descriptionEn?: string;
  imageId: string; // GridFS file ID
  imageUrl?: string; // For backward compatibility or CDN
  order: number;
  status: 'active' | 'inactive';
  journeyPosition?: 'left' | 'right'; // For journey section images
  createdAt?: Date;
  updatedAt?: Date;
}

const HomepageImageSchema = new Schema<IHomepageImage>(
  {
    section: {
      type: String,
      enum: ['signature-drinks', 'offers', 'journey'],
      required: [true, 'Please provide a section'],
    },
    title: {
      type: String,
      required: [true, 'Please provide a title'],
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
    imageId: {
      type: String,
      required: [true, 'Please provide an image'],
    },
    imageUrl: {
      type: String,
    },
    order: {
      type: Number,
      default: 0,
    },
    status: {
      type: String,
      enum: ['active', 'inactive'],
      default: 'active',
    },
    journeyPosition: {
      type: String,
      enum: ['left', 'right'],
    },
  },
  {
    timestamps: true,
  }
);

// Index for efficient queries
HomepageImageSchema.index({ section: 1, order: 1 });

const HomepageImage: Model<IHomepageImage> =
  mongoose.models.HomepageImage ||
  mongoose.model<IHomepageImage>('HomepageImage', HomepageImageSchema);

export default HomepageImage;
