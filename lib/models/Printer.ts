import mongoose, { Schema, Model, Document } from 'mongoose';

export interface IPrinter extends Document {
  name: string;
  department: 'kitchen' | 'barista' | 'shisha' | 'general';
  connectionType: 'USB' | 'LAN' | 'WiFi' | 'Bluetooth';
  connectionDetails: {
    ipAddress?: string;
    port?: number;
    deviceId?: string;
    usbPath?: string;
    bluetoothAddress?: string;
  };
  paperWidth: 58 | 80; // mm
  isActive: boolean;
  isOnline: boolean;
  lastTestAt?: Date;
  lastPrintAt?: Date;
  lastOrderPrinted?: string;
  printCount: number;
  errorCount: number;
  lastError?: string;
  settings: {
    copies: number;
    printCustomerCopy: boolean;
    printInternalCopy: boolean;
    includeLogo: boolean;
    includeQRCode: boolean;
    fontSize: 'small' | 'medium' | 'large';
    paperCut: boolean;
    buzzer: boolean;
  };
  createdAt?: Date;
  updatedAt?: Date;
}

const PrinterSchema = new Schema<IPrinter>(
  {
    name: {
      type: String,
      required: [true, 'Printer name is required'],
      trim: true,
      index: true,
    },
    department: {
      type: String,
      enum: ['kitchen', 'barista', 'shisha', 'general'],
      required: [true, 'Department is required'],
      index: true,
    },
    connectionType: {
      type: String,
      enum: ['USB', 'LAN', 'WiFi', 'Bluetooth'],
      required: [true, 'Connection type is required'],
    },
    connectionDetails: {
      ipAddress: {
        type: String,
        trim: true,
      },
      port: {
        type: Number,
        min: 1,
        max: 65535,
        default: 9100,
      },
      deviceId: {
        type: String,
        trim: true,
      },
      usbPath: {
        type: String,
        trim: true,
      },
      bluetoothAddress: {
        type: String,
        trim: true,
      },
    },
    paperWidth: {
      type: Number,
      enum: [58, 80],
      default: 58,
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
    isOnline: {
      type: Boolean,
      default: false,
      index: true,
    },
    lastTestAt: {
      type: Date,
    },
    lastPrintAt: {
      type: Date,
    },
    lastOrderPrinted: {
      type: String,
      trim: true,
    },
    printCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    errorCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    lastError: {
      type: String,
      trim: true,
    },
    settings: {
      copies: {
        type: Number,
        default: 1,
        min: 1,
        max: 5,
      },
      printCustomerCopy: {
        type: Boolean,
        default: true,
      },
      printInternalCopy: {
        type: Boolean,
        default: true,
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
  },
  {
    timestamps: true,
  }
);

// Indexes for efficient querying
PrinterSchema.index({ department: 1, isActive: 1 });
PrinterSchema.index({ isOnline: 1, isActive: 1 });
PrinterSchema.index({ connectionType: 1 });

// Static methods
PrinterSchema.statics.getActivePrinters = async function() {
  return this.find({ isActive: true }).sort({ department: 1, name: 1 });
};

PrinterSchema.statics.getPrintersByDepartment = async function(department: string) {
  return this.find({ department, isActive: true }).sort({ name: 1 });
};

PrinterSchema.statics.getOnlinePrinters = async function() {
  return this.find({ isActive: true, isOnline: true }).sort({ department: 1, name: 1 });
};

// Instance methods
PrinterSchema.methods.testConnection = async function() {
  // This will be implemented in the service layer
  return { success: true, message: 'Connection test not implemented yet' };
};

PrinterSchema.methods.printTestTicket = async function() {
  // This will be implemented in the service layer
  return { success: true, message: 'Test print not implemented yet' };
};

PrinterSchema.methods.updateStatus = async function(isOnline: boolean, error?: string) {
  this.isOnline = isOnline;
  if (error) {
    this.lastError = error;
    this.errorCount += 1;
  }
  await this.save();
};

PrinterSchema.methods.recordPrint = async function(orderNumber: string) {
  this.lastPrintAt = new Date();
  this.lastOrderPrinted = orderNumber;
  this.printCount += 1;
  await this.save();
};

const Printer: Model<IPrinter> = mongoose.models.Printer || 
  mongoose.model<IPrinter>('Printer', PrinterSchema);

export default Printer;





