import mongoose, { Schema, Model } from 'mongoose';

export interface IPageBackground {
  _id?: string;
  pageRoute: string; // e.g., '/natural-juices', '/tea', '/hot-coffee'
  pageName: string; // e.g., 'العصائر الطبيعية', 'الشاي', 'القهوة الساخنة'
  backgroundImageId?: string; // GridFS file ID
  backgroundImageUrl?: string; // For backward compatibility or CDN
  status: 'active' | 'inactive';
  createdAt?: Date;
  updatedAt?: Date;
}

const PageBackgroundSchema = new Schema<IPageBackground>(
  {
    pageRoute: {
      type: String,
      required: [true, 'Please provide a page route'],
      unique: true,
      trim: true,
    },
    pageName: {
      type: String,
      required: [true, 'Please provide a page name'],
      trim: true,
    },
    backgroundImageId: {
      type: String,
    },
    backgroundImageUrl: {
      type: String,
    },
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

const PageBackground: Model<IPageBackground> =
  mongoose.models.PageBackground || mongoose.model<IPageBackground>('PageBackground', PageBackgroundSchema);

export default PageBackground;
