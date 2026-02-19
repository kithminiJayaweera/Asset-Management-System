import mongoose, { Schema, Model } from 'mongoose';
import { IDesk } from '@/types';

const DeskSchema = new Schema<IDesk>(
  {
    deskNumber: {
      type: String,
      required: [true, 'Desk number is required'],
      trim: true,
      uppercase: true,
    },
    name: {
      type: String,
      trim: true,
    },
    locationId: {
      type: Schema.Types.ObjectId,
      ref: 'Location',
      required: [true, 'Location ID is required'],
      index: true,
    },
    floorPlanId: {
      type: Schema.Types.ObjectId,
      ref: 'FloorPlan',
      required: [true, 'Floor plan ID is required'],
      index: true,
    },
    organizationId: {
      type: Schema.Types.ObjectId,
      ref: 'Organization',
      required: [true, 'Organization ID is required'],
      index: true,
    },
    coordinates: {
      x: {
        type: Number,
        required: [true, 'X coordinate is required'],
      },
      y: {
        type: Number,
        required: [true, 'Y coordinate is required'],
      },
    },
    width: {
      type: Number,
      default: 100,
      min: [10, 'Width must be at least 10 pixels'],
    },
    height: {
      type: Number,
      default: 80,
      min: [10, 'Height must be at least 10 pixels'],
    },
    rotation: {
      type: Number,
      default: 0,
      min: [0, 'Rotation must be between 0 and 360'],
      max: [360, 'Rotation must be between 0 and 360'],
    },
    status: {
      type: String,
      enum: ['available', 'occupied', 'reserved', 'maintenance', 'unavailable'],
      default: 'available',
      required: true,
    },
    assignedTo: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    assignedAssets: [{
      type: Schema.Types.ObjectId,
      ref: 'Asset',
    }],
    capacity: {
      type: Number,
      default: 5,
      min: [1, 'Capacity must be at least 1'],
    },
    deskType: {
      type: String,
      enum: ['standard', 'standing', 'collaborative', 'hot-desk', 'meeting-room'],
      default: 'standard',
    },
    amenities: [{
      type: String,
      trim: true,
    }],
    notes: {
      type: String,
      trim: true,
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

// Compound index for unique desk numbers per floor plan
DeskSchema.index({ floorPlanId: 1, deskNumber: 1 }, { unique: true });
DeskSchema.index({ organizationId: 1, status: 1 });
DeskSchema.index({ assignedTo: 1 });

// Pre-save hook to auto-update status based on assignment
DeskSchema.pre('save', function (next) {
  if (this.assignedTo && this.status === 'available') {
    this.status = 'occupied';
  } else if (!this.assignedTo && this.status === 'occupied') {
    this.status = 'available';
  }
  next();
});

// Virtual to check if desk is at capacity
DeskSchema.virtual('isAtCapacity').get(function () {
  return this.assignedAssets && this.assignedAssets.length >= (this.capacity || 0);
});

const Desk: Model<IDesk> =
  mongoose.models.Desk || mongoose.model<IDesk>('Desk', DeskSchema);

export default Desk;
