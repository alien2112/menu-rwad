import mongoose, { Schema, Document, Model } from 'mongoose';

export interface PageHeroDocument extends Document {
  pageRoute: string;
  mediaType: 'image' | 'video';
  mediaId?: string; // GridFS file ID
  mediaUrl?: string; // external URL fallback
  title?: string;
  status: 'active' | 'inactive';
  createdAt: Date;
  updatedAt: Date;
}

const PageHeroSchema = new Schema<PageHeroDocument>(
  {
    pageRoute: { type: String, required: true, index: true },
    mediaType: { type: String, enum: ['image', 'video'], required: true },
    mediaId: { type: String },
    mediaUrl: { type: String },
    title: { type: String },
    status: { type: String, enum: ['active', 'inactive'], default: 'active' },
  },
  { timestamps: true }
);

const PageHero: Model<PageHeroDocument> =
  mongoose.models.PageHero || mongoose.model<PageHeroDocument>('PageHero', PageHeroSchema);

export default PageHero;








