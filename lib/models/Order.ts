import mongoose, { Schema, Model } from 'mongoose';

export interface IOrderItem {
  menuItemId: string;
  menuItemName: string;
  menuItemNameEn?: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  customizations?: string[];
  department: 'kitchen' | 'barista' | 'shisha';
  departmentStatus: 'pending' | 'in_progress' | 'ready' | 'served';
  estimatedPrepTime?: number; // in minutes
}

export interface ICustomerInfo {
  name?: string;
  phone?: string;
  address?: string;
}

export interface IOrder {
  _id?: string;
  orderNumber: string;
  items: IOrderItem[];
  totalAmount: number;
  discountAmount?: number;
  taxInfo?: {
    subtotal: number;
    taxRate: number;
    taxAmount: number;
    includeTaxInPrice: boolean;
  };
  customerInfo: ICustomerInfo;
  status: 'pending' | 'confirmed' | 'preparing' | 'ready' | 'delivered' | 'cancelled';
  departmentStatuses: {
    kitchen: 'pending' | 'in_progress' | 'ready' | 'served';
    barista: 'pending' | 'in_progress' | 'ready' | 'served';
    shisha: 'pending' | 'in_progress' | 'ready' | 'served';
  };
  orderDate: Date;
  deliveryDate?: Date;
  source: 'website_whatsapp' | 'manual' | 'website';
  notes?: string;
  whatsappMessageId?: string;
  assignedTo?: {
    kitchen?: string;
    barista?: string;
    shisha?: string;
  };
  createdAt?: Date;
  updatedAt?: Date;
}

const OrderItemSchema = new Schema<IOrderItem>({
  menuItemId: {
    type: String,
    required: true,
  },
  menuItemName: {
    type: String,
    required: true,
  },
  menuItemNameEn: {
    type: String,
  },
  quantity: {
    type: Number,
    required: true,
    min: 1,
  },
  unitPrice: {
    type: Number,
    required: true,
    min: 0,
  },
  totalPrice: {
    type: Number,
    required: true,
    min: 0,
  },
  customizations: [{
    type: String,
  }],
  department: {
    type: String,
    enum: ['kitchen', 'barista', 'shisha'],
    required: true,
    index: true,
  },
  departmentStatus: {
    type: String,
    enum: ['pending', 'in_progress', 'ready', 'served'],
    default: 'pending',
    index: true,
  },
  estimatedPrepTime: {
    type: Number,
    min: 0,
  },
});

const CustomerInfoSchema = new Schema<ICustomerInfo>({
  name: {
    type: String,
    trim: true,
  },
  phone: {
    type: String,
    trim: true,
  },
  address: {
    type: String,
    trim: true,
  },
});

const OrderSchema = new Schema<IOrder>(
  {
    orderNumber: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    items: [OrderItemSchema],
    totalAmount: {
      type: Number,
      required: true,
      min: 0,
    },
    discountAmount: {
      type: Number,
      min: 0,
    },
    taxInfo: {
      subtotal: {
        type: Number,
        min: 0,
      },
      taxRate: {
        type: Number,
        min: 0,
        max: 100,
      },
      taxAmount: {
        type: Number,
        min: 0,
      },
      includeTaxInPrice: {
        type: Boolean,
        default: true,
      },
    },
    customerInfo: {
      type: CustomerInfoSchema,
      required: true,
    },
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'preparing', 'ready', 'delivered', 'cancelled'],
      default: 'pending',
    },
    orderDate: {
      type: Date,
      required: true,
    },
    deliveryDate: {
      type: Date,
    },
    source: {
      type: String,
      enum: ['website_whatsapp', 'manual', 'website'],
      default: 'website_whatsapp',
    },
    notes: {
      type: String,
      trim: true,
    },
    whatsappMessageId: {
      type: String,
      trim: true,
    },
    departmentStatuses: {
      kitchen: {
        type: String,
        enum: ['pending', 'in_progress', 'ready', 'served'],
        default: 'pending',
      },
      barista: {
        type: String,
        enum: ['pending', 'in_progress', 'ready', 'served'],
        default: 'pending',
      },
      shisha: {
        type: String,
        enum: ['pending', 'in_progress', 'ready', 'served'],
        default: 'pending',
      },
    },
    assignedTo: {
      kitchen: {
        type: String,
        trim: true,
      },
      barista: {
        type: String,
        trim: true,
      },
      shisha: {
        type: String,
        trim: true,
      },
    },
  },
  {
    timestamps: true,
  }
);

// Add indexes for better performance (orderNumber already has unique index)
OrderSchema.index({ status: 1 });
OrderSchema.index({ orderDate: -1 });
OrderSchema.index({ 'customerInfo.phone': 1 });

const Order: Model<IOrder> =
  mongoose.models.Order || mongoose.model<IOrder>('Order', OrderSchema);

export default Order;


