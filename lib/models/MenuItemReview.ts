import mongoose, { Document, Schema } from 'mongoose';

export interface IMenuItemReview extends Document {
  menuItemId: string;
  author_name: string;
  rating: number;
  text: string;
  email?: string;
  phone?: string;
  isApproved: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const MenuItemReviewSchema = new Schema<IMenuItemReview>({
  menuItemId: {
    type: String,
    required: true,
    index: true
  },
  author_name: {
    type: String,
    required: true,
    trim: true
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  text: {
    type: String,
    required: true,
    trim: true,
    maxlength: 500
  },
  email: {
    type: String,
    trim: true,
    lowercase: true
  },
  phone: {
    type: String,
    trim: true
  },
  isApproved: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

export default mongoose.models.MenuItemReview || mongoose.model<IMenuItemReview>('MenuItemReview', MenuItemReviewSchema);
