import mongoose, { Schema, Model, Document } from 'mongoose';

export interface OpeningHours {
  day: string;
  open: string;
  close: string;
  isClosed?: boolean;
}

export interface BranchLocation {
  lat: number;
  lng: number;
  address?: string;
}

export interface BranchDocument extends Document {
  name: string;
  nameEn?: string;
  slug: string;
  address: string;
  phone: string;
  email?: string;
  location?: BranchLocation;
  openingHours: OpeningHours[];
  themeId?: string;
  logoUrl?: string;
  layoutTemplate?: 'classic' | 'modern' | 'minimal' | 'elegant';
  isMainBranch: boolean;
  isActive: boolean;
  order: number;
  status: 'active' | 'inactive' | 'coming_soon';
  createdAt: Date;
  updatedAt: Date;
}

const OpeningHoursSchema = new Schema({
  day: {
    type: String,
    required: true,
    enum: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'],
  },
  open: {
    type: String,
    required: true,
  },
  close: {
    type: String,
    required: true,
  },
  isClosed: {
    type: Boolean,
    default: false,
  },
}, { _id: false });

const BranchSchema = new Schema<BranchDocument>({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  nameEn: {
    type: String,
    trim: true,
  },
  slug: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
  },
  address: {
    type: String,
    required: true,
    trim: true,
  },
  phone: {
    type: String,
    required: true,
    trim: true,
  },
  email: {
    type: String,
    trim: true,
    lowercase: true,
  },
  location: {
    lat: {
      type: Number,
      required: false,
    },
    lng: {
      type: Number,
      required: false,
    },
    address: {
      type: String,
    },
  },
  openingHours: {
    type: [OpeningHoursSchema],
    default: () => [
      { day: 'monday', open: '09:00', close: '23:00', isClosed: false },
      { day: 'tuesday', open: '09:00', close: '23:00', isClosed: false },
      { day: 'wednesday', open: '09:00', close: '23:00', isClosed: false },
      { day: 'thursday', open: '09:00', close: '23:00', isClosed: false },
      { day: 'friday', open: '09:00', close: '23:00', isClosed: false },
      { day: 'saturday', open: '09:00', close: '23:00', isClosed: false },
      { day: 'sunday', open: '09:00', close: '23:00', isClosed: false },
    ],
  },
  themeId: {
    type: String,
  },
  logoUrl: {
    type: String,
  },
  layoutTemplate: {
    type: String,
    enum: ['classic', 'modern', 'minimal', 'elegant'],
    default: 'classic',
  },
  isMainBranch: {
    type: Boolean,
    default: false,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  order: {
    type: Number,
    default: 0,
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'coming_soon'],
    default: 'active',
  },
  createdAt: {
    type: Date,
    default: () => new Date(),
  },
  updatedAt: {
    type: Date,
    default: () => new Date(),
  },
}, {
  timestamps: true,
});

// Indexes for performance
BranchSchema.index({ slug: 1 });
BranchSchema.index({ isActive: 1, order: 1 });
BranchSchema.index({ status: 1 });
BranchSchema.index({ 'location.lat': 1, 'location.lng': 1 });

// Generate slug before saving
BranchSchema.pre('save', function(next) {
  if (!this.slug || this.isModified('name')) {
    this.slug = this.name
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
  }
  this.updatedAt = new Date();
  next();
});

// Method to check if branch is currently open
BranchSchema.methods.isOpenNow = function(): boolean {
  const now = new Date();
  const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
  const currentDay = dayNames[now.getDay()];

  const todayHours = this.openingHours.find((h: OpeningHours) => h.day === currentDay);

  if (!todayHours || todayHours.isClosed) {
    return false;
  }

  const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

  return currentTime >= todayHours.open && currentTime <= todayHours.close;
};

const Branch = (mongoose.models.Branch as Model<BranchDocument>) ||
  mongoose.model<BranchDocument>('Branch', BranchSchema);

export default Branch;
