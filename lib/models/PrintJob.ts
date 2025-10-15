import mongoose, { Schema, Model, Document } from 'mongoose';

export interface IPrintJob extends Document {
  jobId: string;
  printerId: string;
  printerName: string;
  department: 'kitchen' | 'barista' | 'shisha' | 'general';
  orderId: string;
  orderNumber: string;
  jobType: 'order' | 'test' | 'reprint';
  status: 'pending' | 'printing' | 'completed' | 'failed' | 'cancelled';
  priority: 'low' | 'normal' | 'high' | 'urgent';
  ticketData: {
    items: Array<{
      name: string;
      nameEn?: string;
      quantity: number;
      unitPrice: number;
      totalPrice: number;
      customizations?: string[];
      notes?: string;
    }>;
    customerInfo: {
      name?: string;
      phone?: string;
      tableNumber?: string;
    };
    orderInfo: {
      orderNumber: string;
      orderDate: Date;
      totalAmount: number;
      taxInfo?: {
        subtotal: number;
        taxRate: number;
        taxAmount: number;
      };
    };
    departmentInfo: {
      department: string;
      assignedTo?: string;
      estimatedPrepTime?: number;
    };
  };
  printSettings: {
    copies: number;
    includeLogo: boolean;
    includeQRCode: boolean;
    fontSize: 'small' | 'medium' | 'large';
    paperCut: boolean;
    buzzer: boolean;
  };
  attempts: number;
  maxAttempts: number;
  errorMessage?: string;
  startedAt?: Date;
  completedAt?: Date;
  createdBy: string;
  createdAt?: Date;
  updatedAt?: Date;
}

const PrintJobSchema = new Schema<IPrintJob>(
  {
    jobId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    printerId: {
      type: String,
      required: true,
      index: true,
    },
    printerName: {
      type: String,
      required: true,
    },
    department: {
      type: String,
      enum: ['kitchen', 'barista', 'shisha', 'general'],
      required: true,
      index: true,
    },
    orderId: {
      type: String,
      required: true,
    },
    orderNumber: {
      type: String,
      required: true,
      index: true,
    },
    jobType: {
      type: String,
      enum: ['order', 'test', 'reprint'],
      required: true,
      default: 'order',
      index: true,
    },
    status: {
      type: String,
      enum: ['pending', 'printing', 'completed', 'failed', 'cancelled'],
      required: true,
      default: 'pending',
      index: true,
    },
    priority: {
      type: String,
      enum: ['low', 'normal', 'high', 'urgent'],
      required: true,
      default: 'normal',
      index: true,
    },
    ticketData: {
      items: [{
        name: String,
        nameEn: String,
        quantity: Number,
        unitPrice: Number,
        totalPrice: Number,
        customizations: [String],
        notes: String,
      }],
      customerInfo: {
        name: String,
        phone: String,
        tableNumber: String,
      },
      orderInfo: {
        orderNumber: String,
        orderDate: Date,
        totalAmount: Number,
        taxInfo: {
          subtotal: Number,
          taxRate: Number,
          taxAmount: Number,
        },
      },
      departmentInfo: {
        department: String,
        assignedTo: String,
        estimatedPrepTime: Number,
      },
    },
    printSettings: {
      copies: {
        type: Number,
        default: 1,
        min: 1,
        max: 5,
      },
      includeLogo: {
        type: Boolean,
        default: false,
      },
      includeQRCode: {
        type: Boolean,
        default: true,
      },
      fontSize: {
        type: String,
        enum: ['small', 'medium', 'large'],
        default: 'medium',
      },
      paperCut: {
        type: Boolean,
        default: true,
      },
      buzzer: {
        type: Boolean,
        default: true,
      },
    },
    attempts: {
      type: Number,
      default: 0,
      min: 0,
    },
    maxAttempts: {
      type: Number,
      default: 3,
      min: 1,
    },
    errorMessage: {
      type: String,
      trim: true,
    },
    startedAt: {
      type: Date,
    },
    completedAt: {
      type: Date,
    },
    createdBy: {
      type: String,
      required: true,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for efficient querying
PrintJobSchema.index({ status: 1, priority: -1, createdAt: 1 });
PrintJobSchema.index({ printerId: 1, status: 1 });
PrintJobSchema.index({ department: 1, status: 1 });
PrintJobSchema.index({ orderId: 1 });
PrintJobSchema.index({ jobType: 1, status: 1 });

// Static methods
PrintJobSchema.statics.getPendingJobs = async function() {
  return this.find({ status: 'pending' })
    .sort({ priority: -1, createdAt: 1 })
    .limit(50);
};

PrintJobSchema.statics.getJobsByPrinter = async function(printerId: string, limit: number = 20) {
  return this.find({ printerId })
    .sort({ createdAt: -1 })
    .limit(limit);
};

PrintJobSchema.statics.getJobsByOrder = async function(orderId: string) {
  return this.find({ orderId }).sort({ createdAt: -1 });
};

PrintJobSchema.statics.getFailedJobs = async function() {
  return this.find({ status: 'failed', attempts: { $lt: 3 } })
    .sort({ createdAt: 1 });
};

// Instance methods
PrintJobSchema.methods.startPrint = async function() {
  this.status = 'printing';
  this.startedAt = new Date();
  this.attempts += 1;
  await this.save();
};

PrintJobSchema.methods.completePrint = async function() {
  this.status = 'completed';
  this.completedAt = new Date();
  await this.save();
};

PrintJobSchema.methods.failPrint = async function(errorMessage: string) {
  this.status = 'failed';
  this.errorMessage = errorMessage;
  this.completedAt = new Date();
  await this.save();
};

PrintJobSchema.methods.cancelPrint = async function() {
  this.status = 'cancelled';
  this.completedAt = new Date();
  await this.save();
};

PrintJobSchema.methods.canRetry = function() {
  return this.attempts < this.maxAttempts && this.status === 'failed';
};

// Generate unique job ID
PrintJobSchema.statics.generateJobId = function() {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substr(2, 5);
  return `job_${timestamp}_${random}`;
};

const PrintJob: Model<IPrintJob> = mongoose.models.PrintJob || 
  mongoose.model<IPrintJob>('PrintJob', PrintJobSchema);

export default PrintJob;





