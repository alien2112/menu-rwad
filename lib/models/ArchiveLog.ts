import mongoose, { Schema, Model } from 'mongoose';

export interface IArchiveLog {
  _id?: string;
  archiveType: 'orders' | 'usage' | 'notifications';
  period: {
    startDate: Date;
    endDate: Date;
  };
  recordCount: number;
  filePath?: string;
  googleDriveFileId?: string;
  googleDriveUrl?: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  errorMessage?: string;
  createdAt?: Date;
  updatedAt?: Date;
  completedAt?: Date;
}

const ArchiveLogSchema = new Schema<IArchiveLog>(
  {
    archiveType: {
      type: String,
      enum: ['orders', 'usage', 'notifications'],
      required: [true, 'Archive type is required'],
      index: true,
    },
    period: {
      startDate: {
        type: Date,
        required: [true, 'Start date is required'],
      },
      endDate: {
        type: Date,
        required: [true, 'End date is required'],
      },
    },
    recordCount: {
      type: Number,
      required: [true, 'Record count is required'],
      min: 0,
    },
    filePath: {
      type: String,
      trim: true,
    },
    googleDriveFileId: {
      type: String,
      trim: true,
    },
    googleDriveUrl: {
      type: String,
      trim: true,
    },
    status: {
      type: String,
      enum: ['pending', 'processing', 'completed', 'failed'],
      default: 'pending',
      index: true,
    },
    errorMessage: {
      type: String,
      trim: true,
    },
    completedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for efficient queries
ArchiveLogSchema.index({ archiveType: 1, createdAt: -1 });
ArchiveLogSchema.index({ status: 1, createdAt: -1 });
ArchiveLogSchema.index({ 'period.startDate': 1, 'period.endDate': 1 });

const ArchiveLog: Model<IArchiveLog> =
  mongoose.models.ArchiveLog || mongoose.model<IArchiveLog>('ArchiveLog', ArchiveLogSchema);

export default ArchiveLog;

