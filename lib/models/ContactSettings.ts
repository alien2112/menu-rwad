import mongoose, { Schema, Model, Document } from 'mongoose';

export interface IContactSettings extends Document {
  // Contact Information
  phone: string;
  email: string;
  address: string;
  addressEn?: string;
  
  // Working Hours
  workingHours: {
    open: string;
    days: string;
    openEn?: string;
    daysEn?: string;
  };
  
  // Social Media Links
  socialMedia: {
    facebook?: string;
    instagram?: string;
    twitter?: string;
    tiktok?: string;
    whatsapp?: string;
    youtube?: string;
    linkedin?: string;
  };
  
  // Map Settings
  mapSettings: {
    latitude: number;
    longitude: number;
    zoom: number;
    mapUrl?: string;
    embedUrl?: string;
    addressQuery?: string;
  };
  
  // Additional Information
  additionalInfo?: {
    description?: string;
    descriptionEn?: string;
    specialInstructions?: string;
    specialInstructionsEn?: string;
  };
  
  // Settings
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const ContactSettingsSchema = new Schema<IContactSettings>({
  phone: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    trim: true,
    lowercase: true
  },
  address: {
    type: String,
    required: true,
    trim: true
  },
  addressEn: {
    type: String,
    trim: true
  },
  workingHours: {
    open: {
      type: String,
      required: true,
      trim: true
    },
    days: {
      type: String,
      required: true,
      trim: true
    },
    openEn: {
      type: String,
      trim: true
    },
    daysEn: {
      type: String,
      trim: true
    }
  },
  socialMedia: {
    facebook: {
      type: String,
      trim: true
    },
    instagram: {
      type: String,
      trim: true
    },
    twitter: {
      type: String,
      trim: true
    },
    tiktok: {
      type: String,
      trim: true
    },
    whatsapp: {
      type: String,
      trim: true
    },
    youtube: {
      type: String,
      trim: true
    },
    linkedin: {
      type: String,
      trim: true
    }
  },
  mapSettings: {
    latitude: {
      type: Number,
      required: true,
      min: -90,
      max: 90
    },
    longitude: {
      type: Number,
      required: true,
      min: -180,
      max: 180
    },
    zoom: {
      type: Number,
      default: 15,
      min: 1,
      max: 20
    },
    mapUrl: {
      type: String,
      trim: true
    },
    embedUrl: {
      type: String,
      trim: true
    },
    addressQuery: {
      type: String,
      trim: true
    }
  },
  additionalInfo: {
    description: {
      type: String,
      trim: true
    },
    descriptionEn: {
      type: String,
      trim: true
    },
    specialInstructions: {
      type: String,
      trim: true
    },
    specialInstructionsEn: {
      type: String,
      trim: true
    }
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true,
  collection: 'contactsettings'
});

// Ensure only one contact settings document exists
ContactSettingsSchema.index({ isActive: 1 }, { unique: true, partialFilterExpression: { isActive: true } });

export const ContactSettings: Model<IContactSettings> = mongoose.models.ContactSettings || mongoose.model<IContactSettings>('ContactSettings', ContactSettingsSchema);
