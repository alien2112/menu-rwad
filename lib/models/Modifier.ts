import mongoose, { Schema, Model, Document } from 'mongoose';

export interface ModifierOption {
  id: string;
  name: string;
  nameEn?: string;
  price: number;
  isDefault?: boolean;
}

export interface ModifierDocument extends Document {
  name: string;
  nameEn?: string;
  description?: string;
  type: 'single' | 'multiple';
  options: ModifierOption[];
  required: boolean;
  minSelections?: number;
  maxSelections?: number;
  order: number;
  status: 'active' | 'inactive';
  createdAt: Date;
  updatedAt: Date;
}

const ModifierOptionSchema = new Schema({
  id: {
    type: String,
    required: true,
  },
  name: {
    type: String,
    required: true,
    trim: true,
  },
  nameEn: {
    type: String,
    trim: true,
  },
  price: {
    type: Number,
    required: true,
    default: 0,
    min: 0,
  },
  isDefault: {
    type: Boolean,
    default: false,
  },
}, { _id: false });

const ModifierSchema = new Schema<ModifierDocument>({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  nameEn: {
    type: String,
    trim: true,
  },
  description: {
    type: String,
    trim: true,
  },
  type: {
    type: String,
    enum: ['single', 'multiple'],
    required: true,
    default: 'single',
  },
  options: {
    type: [ModifierOptionSchema],
    required: true,
    validate: {
      validator: function(options: ModifierOption[]) {
        return options && options.length > 0;
      },
      message: 'Modifier must have at least one option',
    },
  },
  required: {
    type: Boolean,
    default: false,
  },
  minSelections: {
    type: Number,
    min: 0,
  },
  maxSelections: {
    type: Number,
    min: 1,
  },
  order: {
    type: Number,
    default: 0,
  },
  status: {
    type: String,
    enum: ['active', 'inactive'],
    default: 'active',
  },
  createdAt: {
    type: Date,
    default: () => new Date(),
  },
  updatedAt: {
    type: Date,
    default: () => new Date(),
  },
}, {
  timestamps: true,
  strict: true,
});

// Indexes for performance
ModifierSchema.index({ status: 1, order: 1 });
ModifierSchema.index({ name: 1 });

// Pre-save middleware to validate selections
ModifierSchema.pre('save', function(next) {
  // Validate minSelections and maxSelections
  if (this.type === 'single') {
    this.minSelections = undefined;
    this.maxSelections = 1;
  } else if (this.type === 'multiple') {
    if (this.maxSelections && this.minSelections) {
      if (this.minSelections > this.maxSelections) {
        return next(new Error('minSelections cannot be greater than maxSelections'));
      }
    }
  }

  // Ensure at least one default option for single type required modifiers
  if (this.required && this.type === 'single') {
    const hasDefault = this.options.some(opt => opt.isDefault);
    if (!hasDefault && this.options.length > 0) {
      this.options[0].isDefault = true;
    }
  }

  this.updatedAt = new Date();
  next();
});

const Modifier = (mongoose.models.Modifier as Model<ModifierDocument>) ||
  mongoose.model<ModifierDocument>('Modifier', ModifierSchema);

export default Modifier;
