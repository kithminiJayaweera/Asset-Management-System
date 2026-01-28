import mongoose, { Schema, Model } from 'mongoose';
import { IAssetRequest } from '@/types';

const AssetRequestSchema = new Schema<IAssetRequest>(
  {
    requestedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Requested by is required'],
    },
    assetId: {
      type: Schema.Types.ObjectId,
      ref: 'Asset',
    },
    assetCategory: {
      type: String,
    },
    requestType: {
      type: String,
      required: [true, 'Request type is required'],
      enum: ['assignment', 'return', 'maintenance', 'new'],
    },
    reason: {
      type: String,
      required: [true, 'Reason is required'],
      trim: true,
    },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected', 'completed'],
      default: 'pending',
    },
    approvedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    approvalDate: {
      type: Date,
    },
    completionDate: {
      type: Date,
    },
    notes: {
      type: String,
    },
    organizationId: {
      type: Schema.Types.ObjectId,
      ref: 'Organization',
      required: [true, 'Organization ID is required'],
    },
    archived: {
      type: Boolean,
      default: false,
    },
    archivedDate: {
      type: Date,
    },
    starred: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for faster queries
AssetRequestSchema.index({ requestedBy: 1, status: 1 });
AssetRequestSchema.index({ organizationId: 1, status: 1 });
AssetRequestSchema.index({ archived: 1, createdAt: -1 });
AssetRequestSchema.index({ starred: 1 });
AssetRequestSchema.index({ createdAt: -1 });

const AssetRequest: Model<IAssetRequest> =
  mongoose.models.AssetRequest || mongoose.model<IAssetRequest>('AssetRequest', AssetRequestSchema);

export default AssetRequest;