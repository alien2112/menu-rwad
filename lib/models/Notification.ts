import mongoose, { Schema, Model, Document } from 'mongoose';

export interface INotification extends Document {
  type: 'order' | 'system' | 'staff' | 'inventory' | 'alert';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  dismissed: boolean;
  data?: any;
  department?: 'kitchen' | 'barista' | 'shisha' | 'admin';
  actionRequired?: boolean;
  targetRoles?: string[];
  targetUsers?: string[];
  createdAt?: Date;
  updatedAt?: Date;
}

const NotificationSchema = new Schema<INotification>(
  {
    type: {
      type: String,
      enum: ['order', 'system', 'staff', 'inventory', 'alert'],
      required: true,
      index: true
    },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high', 'urgent'],
      required: true,
      index: true
    },
    title: {
      type: String,
      required: true,
      trim: true
    },
    message: {
      type: String,
      required: true,
      trim: true
    },
    timestamp: {
      type: Date,
      required: true,
      default: Date.now,
      index: true
    },
    read: {
      type: Boolean,
      default: false,
      index: true
    },
    dismissed: {
      type: Boolean,
      default: false,
      index: true
    },
    data: {
      type: Schema.Types.Mixed
    },
    department: {
      type: String,
      enum: ['kitchen', 'barista', 'shisha', 'admin'],
      index: true
    },
    actionRequired: {
      type: Boolean,
      default: false
    },
    targetRoles: [{
      type: String,
      enum: ['admin', 'kitchen', 'barista', 'shisha']
    }],
    targetUsers: [{
      type: String
    }]
  },
  {
    timestamps: true
  }
);

// Compound indexes for better query performance
NotificationSchema.index({ type: 1, priority: 1 });
NotificationSchema.index({ read: 1, dismissed: 1 });
NotificationSchema.index({ timestamp: -1, read: 1 });
NotificationSchema.index({ department: 1, read: 1 });

const Notification: Model<INotification> =
  mongoose.models.Notification || mongoose.model<INotification>('Notification', NotificationSchema);

export default Notification;