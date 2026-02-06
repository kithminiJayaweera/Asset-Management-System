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
    // Category-specific fields stored as flexible object
    details: {
      type: Map,
      of: String,
      default: {},
    },
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
    minimize: false, // Don't remove empty objects
  }
);

// Indexes for faster queries
AssetSchema.index({ assetTag: 1 });
AssetSchema.index({ organizationId: 1 });
AssetSchema.index({ status: 1 });
AssetSchema.index({ assignedTo: 1 });
AssetSchema.index({ category: 1 });
AssetSchema.index({ serialNumber: 1 });
AssetSchema.index({ model: 1, manufacturer: 1 });

// Pre-save hook to automatically calculate currentValue based on depreciation
AssetSchema.pre('save', function(next) {
  // Only calculate if purchasePrice and purchaseDate are present
  if (this.purchasePrice && this.purchaseDate && this.depreciationMethod !== 'none') {
    // Dynamically import to avoid circular dependencies
    import('@/utils/depreciation').then(({ calculateCurrentValue, getDefaultUsefulLife }) => {
      // Set default usefulLife if not provided
      if (!this.usefulLife) {
        this.usefulLife = getDefaultUsefulLife(this.category);
      }
      
      // Calculate and set currentValue
      this.currentValue = calculateCurrentValue(
        this.purchasePrice,
        this.purchaseDate,
        this.category,
        this.usefulLife
      );
      
      next();
    }).catch(next);
  } else {
    // If depreciation is 'none' or no purchase data, set currentValue to purchasePrice
    if (!this.currentValue && this.purchasePrice) {
      this.currentValue = this.purchasePrice;
    }
    next();
  }
});

const Asset: Model<IAsset> =
  mongoose.models.Asset || mongoose.model<IAsset>('Asset', AssetSchema);

export default Asset;
