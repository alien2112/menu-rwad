import mongoose, { Document, Schema } from 'mongoose';

export interface QRCodeDocument extends Document {
  name: string;
  nameEn?: string;
  type: 'branch' | 'table' | 'category' | 'custom';

  // Reference IDs
  branchId?: mongoose.Types.ObjectId;
  tableNumber?: string;
  categoryId?: mongoose.Types.ObjectId;
  customUrl?: string;

  // Generated URL and token
  url: string;
  token: string; // Unique secure token

  // Customization options
  customization: {
    logoUrl?: string;
    foregroundColor: string;
    backgroundColor: string;
    borderStyle?: 'none' | 'square' | 'rounded' | 'dots';
    size: number; // Size in pixels (default 300)
    errorCorrectionLevel: 'L' | 'M' | 'Q' | 'H'; // Low, Medium, Quality, High
  };

  // Analytics
  totalScans: number;
  lastScannedAt?: Date;

  // Status
  isActive: boolean;

  // Metadata
  createdAt: Date;
  updatedAt: Date;
}

const QRCodeSchema = new Schema<QRCodeDocument>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    nameEn: {
      type: String,
      trim: true,
    },
    type: {
      type: String,
      enum: ['branch', 'table', 'category', 'custom'],
      required: true,
    },

    // Reference IDs
    branchId: {
      type: Schema.Types.ObjectId,
      ref: 'Branch',
    },
    tableNumber: {
      type: String,
      trim: true,
    },
    categoryId: {
      type: Schema.Types.ObjectId,
      ref: 'Category',
    },
    customUrl: {
      type: String,
      trim: true,
    },

    // Generated URL and token
    url: {
      type: String,
      required: true,
    },
    token: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },

    // Customization options
    customization: {
      logoUrl: String,
      foregroundColor: {
        type: String,
        default: '#000000',
      },
      backgroundColor: {
        type: String,
        default: '#FFFFFF',
      },
      borderStyle: {
        type: String,
        enum: ['none', 'square', 'rounded', 'dots'],
        default: 'square',
      },
      size: {
        type: Number,
        default: 300,
        min: 100,
        max: 1000,
      },
      errorCorrectionLevel: {
        type: String,
        enum: ['L', 'M', 'Q', 'H'],
        default: 'M',
      },
    },

    // Analytics
    totalScans: {
      type: Number,
      default: 0,
    },
    lastScannedAt: {
      type: Date,
    },

    // Status
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for performance
QRCodeSchema.index({ type: 1, isActive: 1 });
QRCodeSchema.index({ branchId: 1 });
QRCodeSchema.index({ token: 1 });

// Virtual for generating full QR URL
QRCodeSchema.virtual('fullUrl').get(function() {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
  return `${baseUrl}/menu?qr=${this.token}`;
});

// Method to increment scan count
QRCodeSchema.methods.incrementScans = async function() {
  this.totalScans += 1;
  this.lastScannedAt = new Date();
  await this.save();
};

// Static method to generate unique token
QRCodeSchema.statics.generateToken = function(): string {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let token = '';
  for (let i = 0; i < 12; i++) {
    token += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return token;
};

// Pre-save hook to generate token if not exists
QRCodeSchema.pre('save', async function(next) {
  if (!this.token) {
    let token;
    let isUnique = false;

    while (!isUnique) {
      token = (this.constructor as any).generateToken();
      const existing = await this.constructor.findOne({ token });
      if (!existing) {
        isUnique = true;
      }
    }

    this.token = token!;
  }

  // Generate URL based on type
  if (!this.url) {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
    let url = `${baseUrl}/menu?qr=${this.token}`;

    if (this.branchId) {
      url += `&branch=${this.branchId}`;
    }
    if (this.tableNumber) {
      url += `&table=${this.tableNumber}`;
    }
    if (this.categoryId) {
      url += `&category=${this.categoryId}`;
    }
    if (this.customUrl) {
      url = this.customUrl;
    }

    this.url = url;
  }

  next();
});

const QRCode = mongoose.models.QRCode || mongoose.model<QRCodeDocument>('QRCode', QRCodeSchema);

export default QRCode;
