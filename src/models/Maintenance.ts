import mongoose, { Schema, Model } from 'mongoose';
import { IMaintenance } from '@/types';

const MaintenanceSchema = new Schema<IMaintenance>(
  {
    assetId: {
      type: Schema.Types.ObjectId,
      ref: 'Asset',
      required: [true, 'Asset ID is required'],
    },
    issueTitle: {
      type: String,
      required: [true, 'Issue title is required'],
      trim: true,
    },
    issueDescription: {
      type: String,
      required: [true, 'Issue description is required'],
      trim: true,
    },
    maintenanceType: {
      type: String,
      enum: ['preventive', 'corrective', 'warranty'],
      required: [true, 'Maintenance type is required'],
    },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high', 'critical'],
      required: [true, 'Priority is required'],
      default: 'medium',
    },
    status: {
      type: String,
      enum: ['pending', 'in-progress', 'completed', 'closed', 'cancelled'],
      default: 'pending',
    },
    expectedReturnDate: {
      type: Date,
    },
    assignedVendor: {
      type: String,
      trim: true,
    },
    estimatedCost: {
      type: Number,
      min: [0, 'Cost must be positive'],
    },
    actualCost: {
      type: Number,
      min: [0, 'Cost must be positive'],
    },
    attachments: [{
      type: String,
    }],
    performedBy: {
      type: String,
      trim: true,
    },
    performedDate: {
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
MaintenanceSchema.index({ assetId: 1 });
MaintenanceSchema.index({ status: 1 });
MaintenanceSchema.index({ organizationId: 1 });
MaintenanceSchema.index({ performedDate: -1 });

const Maintenance: Model<IMaintenance> =
  mongoose.models.Maintenance || mongoose.model<IMaintenance>('Maintenance', MaintenanceSchema);

export default Maintenance;
