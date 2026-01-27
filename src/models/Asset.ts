import mongoose, { Schema, Model } from 'mongoose';
import { IAsset } from '@/types';

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
    currentValue: {
      type: Number,
      required: [true, 'Current value is required'],
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
  },
  {
    timestamps: true,
  }
);

// Indexes for faster queries
AssetSchema.index({ assetTag: 1 });
AssetSchema.index({ organizationId: 1 });
AssetSchema.index({ status: 1 });
AssetSchema.index({ assignedTo: 1 });
AssetSchema.index({ category: 1 });

const Asset: Model<IAsset> =
  mongoose.models.Asset || mongoose.model<IAsset>('Asset', AssetSchema);

export default Asset;
