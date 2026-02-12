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
      index: true,
    },
    name: {
      type: String,
      required: [true, 'Asset name is required'],
      trim: true,
    },
    // DEPRECATED: Keep for backward compatibility, will be removed in v2.0
    category: {
      type: String,
      trim: true,
    },
    // NEW: Reference to Category collection
    categoryId: {
      type: Schema.Types.ObjectId,
      ref: 'Category',
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
    // DEPRECATED: Keep for backward compatibility
    details: {
      type: Map,
      of: String,
      default: {},
    },
    // NEW: Dynamic custom fields based on category definition
    customFields: {
      type: Schema.Types.Mixed,
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
AssetSchema.index({ organizationId: 1 });
AssetSchema.index({ status: 1 });
AssetSchema.index({ assignedTo: 1 });
AssetSchema.index({ category: 1 }); // Keep for backward compatibility
AssetSchema.index({ categoryId: 1 }); // NEW index
AssetSchema.index({ serialNumber: 1 });
AssetSchema.index({ model: 1, manufacturer: 1 });

// Virtual to get category name (backward compatible)
AssetSchema.virtual('categoryName').get(function() {
  return this.category || (this.populated('categoryId') ? (this.categoryId as any)?.name : null);
});

// Pre-save hook - UPDATED to handle both old and new category fields
AssetSchema.pre('save', async function(next) {
  // Sync category and categoryId for backward compatibility
  if (this.isModified('categoryId') && this.categoryId) {
    try {
      const Category = mongoose.model('Category');
      const cat = await Category.findById(this.categoryId).select('name').lean();
      if (cat) {
        this.category = (cat as any).name;
      }
    } catch (err) {
      // Category model might not exist yet, skip
    }
  }

  // Depreciation calculation
  if (this.purchasePrice && this.purchaseDate && this.depreciationMethod !== 'none') {
    try {
      const { calculateCurrentValue, getDefaultUsefulLife } = await import('@/utils/depreciation');
      
      if (!this.usefulLife) {
        this.usefulLife = getDefaultUsefulLife(this.category || 'General');
      }
      
      this.currentValue = calculateCurrentValue(
        this.purchasePrice,
        this.purchaseDate,
        this.category || 'General',
        this.usefulLife
      );
      
      next();
    } catch (err) {
      next(err as Error);
    }
  } else {
    if (!this.currentValue && this.purchasePrice) {
      this.currentValue = this.purchasePrice;
    }
    next();
  }
});

const Asset: Model<IAsset> =
  mongoose.models.Asset || mongoose.model<IAsset>('Asset', AssetSchema);

export default Asset;
