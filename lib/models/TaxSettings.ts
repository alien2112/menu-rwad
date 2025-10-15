import mongoose, { Schema, Model, Document } from 'mongoose';

export interface ITaxSettings extends Document {
  enableTaxHandling: boolean;
  taxType: 'VAT' | 'GST' | 'SALES_TAX' | 'CUSTOM';
  vatRate: number;
  includeTaxInPrice: boolean;
  displayTaxBreakdown: boolean;
  generateTaxReports: boolean;
  taxNumber: string | null;
  complianceMode: 'Saudi ZATCA' | 'UAE FTA' | 'GCC' | 'CUSTOM';
  createdAt: Date;
  updatedAt: Date;
}

const TaxSettingsSchema = new Schema<ITaxSettings>(
  {
    enableTaxHandling: {
      type: Boolean,
      default: true,
      required: true,
    },
    taxType: {
      type: String,
      enum: ['VAT', 'GST', 'SALES_TAX', 'CUSTOM'],
      default: 'VAT',
      required: true,
    },
    vatRate: {
      type: Number,
      default: 15,
      min: 0,
      max: 100,
      required: true,
    },
    includeTaxInPrice: {
      type: Boolean,
      default: true,
      required: true,
    },
    displayTaxBreakdown: {
      type: Boolean,
      default: true,
      required: true,
    },
    generateTaxReports: {
      type: Boolean,
      default: true,
      required: true,
    },
    taxNumber: {
      type: String,
      trim: true,
      default: null,
    },
    complianceMode: {
      type: String,
      enum: ['Saudi ZATCA', 'UAE FTA', 'GCC', 'CUSTOM'],
      default: 'Saudi ZATCA',
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Ensure only one tax settings document exists
TaxSettingsSchema.index({}, { unique: true });

// Create a static method to get or create tax settings
TaxSettingsSchema.statics.getTaxSettings = async function() {
  let settings = await this.findOne();
  if (!settings) {
    settings = await this.create({});
  }
  return settings;
};

// Create a static method to update tax settings
TaxSettingsSchema.statics.updateTaxSettings = async function(updates: Partial<ITaxSettings>) {
  let settings = await this.findOne();
  if (!settings) {
    settings = await this.create(updates);
  } else {
    Object.assign(settings, updates);
    await settings.save();
  }
  return settings;
};

const TaxSettings: Model<ITaxSettings> = mongoose.models.TaxSettings || mongoose.model<ITaxSettings>('TaxSettings', TaxSettingsSchema);

export default TaxSettings;





