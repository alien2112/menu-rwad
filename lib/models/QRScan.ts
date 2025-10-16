import mongoose, { Document, Schema } from 'mongoose';

export interface QRScanDocument extends Document {
  qrCodeId: mongoose.Types.ObjectId;
  token: string; // Denormalized for quick queries

  // Scan details
  scannedAt: Date;
  deviceType: 'mobile' | 'tablet' | 'desktop' | 'unknown';
  userAgent?: string;
  ipAddress?: string;

  // Location data (approximate)
  country?: string;
  city?: string;

  // Context from QR code
  branchId?: mongoose.Types.ObjectId;
  tableNumber?: string;
  categoryId?: mongoose.Types.ObjectId;

  // Session tracking (optional)
  sessionId?: string;
}

const QRScanSchema = new Schema<QRScanDocument>(
  {
    qrCodeId: {
      type: Schema.Types.ObjectId,
      ref: 'QRCode',
      required: true,
      index: true,
    },
    token: {
      type: String,
      required: true,
      index: true,
    },

    // Scan details
    scannedAt: {
      type: Date,
      default: Date.now,
      index: true,
    },
    deviceType: {
      type: String,
      enum: ['mobile', 'tablet', 'desktop', 'unknown'],
      default: 'unknown',
    },
    userAgent: {
      type: String,
    },
    ipAddress: {
      type: String,
    },

    // Location data
    country: {
      type: String,
    },
    city: {
      type: String,
    },

    // Context from QR code
    branchId: {
      type: Schema.Types.ObjectId,
      ref: 'Branch',
    },
    tableNumber: {
      type: String,
    },
    categoryId: {
      type: Schema.Types.ObjectId,
      ref: 'Category',
    },

    // Session tracking
    sessionId: {
      type: String,
    },
  },
  {
    timestamps: false, // We use scannedAt instead
  }
);

// Indexes for analytics queries
QRScanSchema.index({ qrCodeId: 1, scannedAt: -1 });
QRScanSchema.index({ branchId: 1, scannedAt: -1 });
QRScanSchema.index({ scannedAt: -1 });
QRScanSchema.index({ deviceType: 1 });

// Static method to get scan statistics
QRScanSchema.statics.getStatistics = async function(qrCodeId: string, startDate?: Date, endDate?: Date) {
  const match: any = { qrCodeId: new mongoose.Types.ObjectId(qrCodeId) };

  if (startDate || endDate) {
    match.scannedAt = {};
    if (startDate) match.scannedAt.$gte = startDate;
    if (endDate) match.scannedAt.$lte = endDate;
  }

  const stats = await this.aggregate([
    { $match: match },
    {
      $group: {
        _id: null,
        totalScans: { $sum: 1 },
        mobileScans: {
          $sum: { $cond: [{ $eq: ['$deviceType', 'mobile'] }, 1, 0] }
        },
        tabletScans: {
          $sum: { $cond: [{ $eq: ['$deviceType', 'tablet'] }, 1, 0] }
        },
        desktopScans: {
          $sum: { $cond: [{ $eq: ['$deviceType', 'desktop'] }, 1, 0] }
        },
      }
    }
  ]);

  return stats[0] || {
    totalScans: 0,
    mobileScans: 0,
    tabletScans: 0,
    desktopScans: 0,
  };
};

// Static method to get scans by day
QRScanSchema.statics.getScansByDay = async function(qrCodeId: string, days: number = 30) {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  const scans = await this.aggregate([
    {
      $match: {
        qrCodeId: new mongoose.Types.ObjectId(qrCodeId),
        scannedAt: { $gte: startDate }
      }
    },
    {
      $group: {
        _id: {
          $dateToString: { format: '%Y-%m-%d', date: '$scannedAt' }
        },
        count: { $sum: 1 }
      }
    },
    { $sort: { _id: 1 } }
  ]);

  return scans;
};

const QRScan = mongoose.models.QRScan || mongoose.model<QRScanDocument>('QRScan', QRScanSchema);

export default QRScan;
