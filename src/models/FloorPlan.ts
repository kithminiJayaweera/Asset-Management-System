import mongoose, { Schema, Model } from 'mongoose';
import { IFloorPlan } from '@/types';

const FloorPlanSchema = new Schema<IFloorPlan>(
  {
    name: {
      type: String,
      required: [true, 'Floor plan name is required'],
      trim: true,
    },
    locationId: {
      type: Schema.Types.ObjectId,
      ref: 'Location',
      required: [true, 'Location ID is required'],
      index: true,
    },
    organizationId: {
      type: Schema.Types.ObjectId,
      ref: 'Organization',
      required: [true, 'Organization ID is required'],
      index: true,
    },
    imageUrl: {
      type: String,
      required: [true, 'Floor plan image URL is required'],
      trim: true,
    },
    imageWidth: {
      type: Number,
      required: [true, 'Image width is required'],
      min: [1, 'Image width must be positive'],
    },
    imageHeight: {
      type: Number,
      required: [true, 'Image height is required'],
      min: [1, 'Image height must be positive'],
    },
    scale: {
      type: Number,
      min: [0, 'Scale must be non-negative'],
      default: 1,
    },
    metadata: {
      uploadedBy: {
        type: Schema.Types.ObjectId,
        ref: 'User',
      },
      fileType: {
        type: String,
        trim: true,
      },
      fileSize: {
        type: Number,
      },
      originalFileName: {
        type: String,
        trim: true,
      },
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for efficient queries
FloorPlanSchema.index({ organizationId: 1, locationId: 1 });
FloorPlanSchema.index({ organizationId: 1, isActive: 1 });

// Virtual for related desks
FloorPlanSchema.virtual('desks', {
  ref: 'Desk',
  localField: '_id',
  foreignField: 'floorPlanId',
});

const FloorPlan: Model<IFloorPlan> =
  mongoose.models.FloorPlan || mongoose.model<IFloorPlan>('FloorPlan', FloorPlanSchema);

export default FloorPlan;
