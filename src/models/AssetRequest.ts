import mongoose, { Schema, Model } from 'mongoose';
import { IAssetRequest } from '@/types';

const AssetRequestSchema = new Schema<IAssetRequest>(
  {
    requestedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Requester ID is required'],
    },
    assetId: {
      type: Schema.Types.ObjectId,
      ref: 'Asset',
    },
    assetCategory: {
      type: String,
      trim: true,
    },
    requestType: {
      type: String,
      enum: ['assignment', 'return', 'maintenance', 'new'],
      required: [true, 'Request type is required'],
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
      trim: true,
    },
    organizationId: {
      type: Schema.Types.ObjectId,
      ref: 'Organization',
      required: [true, 'Organization ID is required'],
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
AssetRequestSchema.index({ requestedBy: 1 });
AssetRequestSchema.index({ status: 1 });
AssetRequestSchema.index({ organizationId: 1 });
AssetRequestSchema.index({ createdAt: -1 });

const AssetRequest: Model<IAssetRequest> =
  mongoose.models.AssetRequest || mongoose.model<IAssetRequest>('AssetRequest', AssetRequestSchema);

export default AssetRequest;
