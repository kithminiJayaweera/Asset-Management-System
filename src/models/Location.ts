import mongoose, { Schema, Model } from 'mongoose';
import { ILocation } from '@/types';

const LocationSchema = new Schema<ILocation>(
  {
    name: {
      type: String,
      required: [true, 'Location name is required'],
      trim: true,
    },
    type: {
      type: String,
      enum: ['building', 'floor', 'room', 'rack', 'desk', 'zone', 'shelf', 'other'],
      required: [true, 'Location type is required'],
    },
    parentId: {
      type: Schema.Types.ObjectId,
      ref: 'Location',
      default: null,
    },
    organizationId: {
      type: Schema.Types.ObjectId,
      ref: 'Organization',
      required: [true, 'Organization ID is required'],
    },
    description: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

LocationSchema.index({ organizationId: 1, parentId: 1 });
LocationSchema.index({ organizationId: 1, type: 1 });

const Location: Model<ILocation> =
  mongoose.models.Location || mongoose.model<ILocation>('Location', LocationSchema);

export default Location;
