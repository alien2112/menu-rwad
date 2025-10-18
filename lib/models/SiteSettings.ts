import mongoose, { Schema, Model, Document } from 'mongoose';

export interface SiteSettingsDocument extends Document {
  logoUrl: string;
  logoPosition: 'left' | 'center' | 'right';
  layoutTemplate?: 'classic' | 'modern' | 'minimal' | 'elegant' | 'luxe' | 'vintage' | 'artistic' | 'compact' | 'futuristic' | 'natural' | 'original';
  theme?: {
    background?: string;
    foreground?: string;
    primary?: string;
    secondary?: string;
    accent?: string;
    card?: string;
    'card-foreground'?: string;
    muted?: string;
    'muted-foreground'?: string;
    ring?: string;
    'scroll-thumb-start'?: string;
    'scroll-thumb-end'?: string;
    'scroll-track'?: string;
  };
  updatedAt: Date;
}

const SiteSettingsSchema = new Schema<SiteSettingsDocument>({
  logoUrl: {
    type: String,
    default: '/موال مراكش طواجن  1 (1).png',
    trim: true,
  },
  logoPosition: {
    type: String,
    enum: ['left', 'center', 'right'],
    default: 'center',
  },
  layoutTemplate: {
    type: String,
    enum: ['classic', 'modern', 'minimal', 'elegant', 'luxe', 'vintage', 'artistic', 'compact', 'futuristic', 'natural', 'original'],
    default: 'classic',
  },
  theme: {
    type: Schema.Types.Mixed,
    default: undefined,
  },
  updatedAt: {
    type: Date,
    default: () => new Date(),
  },
}, {
  strict: true,
  minimize: false,  // Prevent Mongoose from removing empty objects
  toJSON: {
    transform: function(doc, ret) {
      // Always include theme field even if undefined
      if (!('theme' in ret)) {
        ret.theme = undefined;
      }
      return ret;
    }
  },
  toObject: {
    transform: function(doc, ret) {
      // Always include theme field even if undefined
      if (!('theme' in ret)) {
        ret.theme = undefined;
      }
      return ret;
    }
  }
});

SiteSettingsSchema.pre('save', function (next) {
  this.updatedAt = new Date();
  next();
});

export interface SiteSettingsModel extends Model<SiteSettingsDocument> {
  getSettings(): Promise<SiteSettingsDocument>;
}

SiteSettingsSchema.statics.getSettings = async function () {
  const existing = await this.findOne();
  if (existing) return existing;
  return this.create({});
};

const SiteSettings = (mongoose.models.SiteSettings as SiteSettingsModel) || mongoose.model<SiteSettingsDocument, SiteSettingsModel>('SiteSettings', SiteSettingsSchema);

export default SiteSettings;


