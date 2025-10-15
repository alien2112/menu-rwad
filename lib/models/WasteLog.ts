import mongoose, { Schema, Model, Document } from 'mongoose';

export interface IWasteLog extends Document {
  itemName: string;
  itemId?: string; // Optional reference to menu item or material
  category: 'food' | 'beverage' | 'material' | 'equipment' | 'other';
  quantity: number;
  unit: string;
  cost: number;
  reason: 'spoiled' | 'broken' | 'expired' | 'damaged' | 'overcooked' | 'spilled' | 'other';
  description?: string;
  department: 'kitchen' | 'barista' | 'shisha' | 'general';
  loggedBy: string; // User who logged the waste
  wasteDate: Date;
  isRecoverable: boolean; // Can this waste be recovered/reused?
  recoveryAction?: string; // What was done with the waste
  createdAt?: Date;
  updatedAt?: Date;
}

const WasteLogSchema = new Schema<IWasteLog>(
  {
    itemName: {
      type: String,
      required: [true, 'Item name is required'],
      trim: true,
      index: true,
    },
    itemId: {
      type: String,
      trim: true,
      index: true,
    },
    category: {
      type: String,
      enum: ['food', 'beverage', 'material', 'equipment', 'other'],
      required: [true, 'Category is required'],
      index: true,
    },
    quantity: {
      type: Number,
      required: [true, 'Quantity is required'],
      min: 0,
    },
    unit: {
      type: String,
      required: [true, 'Unit is required'],
      trim: true,
    },
    cost: {
      type: Number,
      required: [true, 'Cost is required'],
      min: 0,
    },
    reason: {
      type: String,
      enum: ['spoiled', 'broken', 'expired', 'damaged', 'overcooked', 'spilled', 'other'],
      required: [true, 'Reason is required'],
      index: true,
    },
    description: {
      type: String,
      trim: true,
    },
    department: {
      type: String,
      enum: ['kitchen', 'barista', 'shisha', 'general'],
      required: [true, 'Department is required'],
      index: true,
    },
    loggedBy: {
      type: String,
      required: [true, 'Logged by is required'],
      trim: true,
      index: true,
    },
    wasteDate: {
      type: Date,
      required: [true, 'Waste date is required'],
      default: Date.now,
      index: true,
    },
    isRecoverable: {
      type: Boolean,
      default: false,
    },
    recoveryAction: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for efficient analytics queries
WasteLogSchema.index({ wasteDate: -1, department: 1 });
WasteLogSchema.index({ category: 1, wasteDate: -1 });
WasteLogSchema.index({ reason: 1, wasteDate: -1 });
WasteLogSchema.index({ loggedBy: 1, wasteDate: -1 });

// Static methods for waste analytics
WasteLogSchema.statics.getWasteSummary = async function(
  startDate: Date,
  endDate: Date,
  department?: string
) {
  const matchStage: any = {
    wasteDate: { $gte: startDate, $lte: endDate }
  };
  
  if (department) {
    matchStage.department = department;
  }

  return this.aggregate([
    { $match: matchStage },
    {
      $group: {
        _id: null,
        totalCost: { $sum: '$cost' },
        totalItems: { $sum: '$quantity' },
        totalLogs: { $sum: 1 },
        averageCost: { $avg: '$cost' },
        byCategory: {
          $push: {
            category: '$category',
            cost: '$cost',
            quantity: '$quantity'
          }
        },
        byReason: {
          $push: {
            reason: '$reason',
            cost: '$cost',
            quantity: '$quantity'
          }
        },
        byDepartment: {
          $push: {
            department: '$department',
            cost: '$cost',
            quantity: '$quantity'
          }
        }
      }
    }
  ]);
};

WasteLogSchema.statics.getWasteTrends = async function(
  startDate: Date,
  endDate: Date,
  groupBy: 'day' | 'week' | 'month' = 'day'
) {
  let dateFormat: string;
  switch (groupBy) {
    case 'day':
      dateFormat = '%Y-%m-%d';
      break;
    case 'week':
      dateFormat = '%Y-%U';
      break;
    case 'month':
      dateFormat = '%Y-%m';
      break;
    default:
      dateFormat = '%Y-%m-%d';
  }

  return this.aggregate([
    {
      $match: {
        wasteDate: { $gte: startDate, $lte: endDate }
      }
    },
    {
      $group: {
        _id: {
          $dateToString: {
            format: dateFormat,
            date: '$wasteDate'
          }
        },
        totalCost: { $sum: '$cost' },
        totalItems: { $sum: '$quantity' },
        totalLogs: { $sum: 1 }
      }
    },
    { $sort: { _id: 1 } }
  ]);
};

WasteLogSchema.statics.getTopWasteItems = async function(
  startDate: Date,
  endDate: Date,
  limit: number = 10
) {
  return this.aggregate([
    {
      $match: {
        wasteDate: { $gte: startDate, $lte: endDate }
      }
    },
    {
      $group: {
        _id: '$itemName',
        totalCost: { $sum: '$cost' },
        totalQuantity: { $sum: '$quantity' },
        frequency: { $sum: 1 },
        averageCost: { $avg: '$cost' },
        categories: { $addToSet: '$category' },
        reasons: { $addToSet: '$reason' }
      }
    },
    { $sort: { totalCost: -1 } },
    { $limit: limit }
  ]);
};

const WasteLog: Model<IWasteLog> = mongoose.models.WasteLog || 
  mongoose.model<IWasteLog>('WasteLog', WasteLogSchema);

export default WasteLog;





