import mongoose, { Schema, Model } from 'mongoose';
import { IAsset } from '@/types';
import { calculateCurrentValue } from '@/utils/depreciation';

const AssetSchema = new Schema<IAsset>(
  {
    assetTag: {
      type: String,
      required: [true, 'Asset tag is required'],
      unique: true,
      trim: true,
      uppercase: true,
    },

    name: {
      type: String,
      required: [true, 'Asset name is required'],
      trim: true,
    },

    category: {
      type: String,
      required: [true, 'Category is required'],
      trim: true,
    },

    description: {
      type: String,
      trim: true,
    },

    serialNumber: {
      type: String,
      trim: true,
    },

    model: {
      type: String,
      trim: true,
    },

    manufacturer: {
      type: String,
      trim: true,
    },

    purchaseDate: {
      type: Date,
      required: [true, 'Purchase date is required'],
    },

    purchasePrice: {
      type: Number,
      required: [true, 'Purchase price is required'],
      min: [0, 'Purchase price must be positive'],
    },

    /** 🔑 Calculated by backend only */
    currentValue: {
      type: Number,
      min: [0, 'Current value must be positive'],
    },

    depreciationMethod: {
      type: String,
      enum: ['straight-line', 'declining-balance', 'none'],
      default: 'straight-line',
    },

    usefulLife: {
      type: Number,
      min: [1, 'Useful life must be at least 1 year'],
    },

    depreciationRate: {
      type: Number,
      min: [0, 'Depreciation rate must be positive'],
      max: [100, 'Depreciation rate cannot exceed 100%'],
    },

    salvageValue: {
      type: Number,
      min: [0, 'Salvage value must be positive'],
      default: 0,
    },

    lastValuationDate: {
      type: Date,
    },

    status: {
      type: String,
      enum: ['available', 'assigned', 'maintenance', 'retired'],
      default: 'available',
    },

    condition: {
      type: String,
      enum: ['excellent', 'good', 'fair', 'poor'],
      default: 'good',
    },

    location: {
      type: String,
      trim: true,
    },

    assignedTo: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },

    organizationId: {
      type: Schema.Types.ObjectId,
      ref: 'Organization',
      required: [true, 'Organization ID is required'],
    },

    warrantyExpiry: {
      type: Date,
    },

    notes: {
      type: String,
      trim: true,
    },

    imageUrl: {
      type: String,
      trim: true,
    },

    /** Flexible category-specific fields */
    details: {
      type: Map,
      of: String,
      default: {},
    },

    /** Maintenance info */
    maintenance: {
      condition: {
        type: String,
        enum: ['excellent', 'good', 'fair', 'poor'],
        default: 'good',
      },
      lastMaintenanceDate: Date,
    },
  },
  {
    timestamps: true,
    minimize: false,
  }
);

/* =========================
   INDEXES
========================= */
AssetSchema.index({ assetTag: 1 });
AssetSchema.index({ organizationId: 1 });
AssetSchema.index({ status: 1 });
AssetSchema.index({ assignedTo: 1 });
AssetSchema.index({ category: 1 });

/* =========================
   PRE-SAVE DEPRECIATION
========================= */
AssetSchema.pre('save', function (next) {
  const shouldRecalculate =
    this.isNew ||
    this.isModified('purchasePrice') ||
    this.isModified('purchaseDate') ||
    this.isModified('depreciationMethod') ||
    this.isModified('usefulLife') ||
    this.isModified('salvageValue') ||
    this.isModified('depreciationRate');

  if (shouldRecalculate) {
    const calculatedValue = calculateCurrentValue({
      purchasePrice: this.purchasePrice,
      purchaseDate: this.purchaseDate,
      depreciationMethod: this.depreciationMethod,
      usefulLife: this.usefulLife,
      salvageValue: this.salvageValue,
      depreciationRate: this.depreciationRate,
    });

    this.currentValue = calculatedValue;
    this.lastValuationDate = new Date();
  }

  next();
});

const Asset: Model<IAsset> =
  mongoose.models.Asset || mongoose.model<IAsset>('Asset', AssetSchema);

export default Asset;
