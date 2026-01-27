import mongoose, { Schema, Model } from 'mongoose';
import { IMaintenance } from '@/types';

const MaintenanceSchema = new Schema<IMaintenance>(
  {
    assetId: {
      type: Schema.Types.ObjectId,
      ref: 'Asset',
      required: [true, 'Asset ID is required'],
    },
    maintenanceType: {
      type: String,
      enum: ['preventive', 'corrective', 'inspection'],
      required: [true, 'Maintenance type is required'],
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      trim: true,
    },
    cost: {
      type: Number,
      required: [true, 'Cost is required'],
      min: [0, 'Cost must be positive'],
    },
    performedBy: {
      type: String,
      required: [true, 'Performer information is required'],
      trim: true,
    },
    performedDate: {
      type: Date,
      required: [true, 'Performed date is required'],
    },
    nextMaintenanceDate: {
      type: Date,
    },
    notes: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
MaintenanceSchema.index({ assetId: 1 });
MaintenanceSchema.index({ performedDate: -1 });

const Maintenance: Model<IMaintenance> =
  mongoose.models.Maintenance || mongoose.model<IMaintenance>('Maintenance', MaintenanceSchema);

export default Maintenance;
