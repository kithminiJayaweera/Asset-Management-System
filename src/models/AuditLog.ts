import mongoose, { Schema, Model } from 'mongoose';
import { IAuditLog } from '@/types';

const AuditLogSchema = new Schema<IAuditLog>(
  {
    action: {
      type: String,
      required: [true, 'Action is required'],
      trim: true,
    },
    entityType: {
      type: String,
      enum: ['asset', 'user', 'organization', 'request'],
      required: [true, 'Entity type is required'],
    },
    entityId: {
      type: Schema.Types.ObjectId,
      required: [true, 'Entity ID is required'],
    },
    performedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Performer ID is required'],
    },
    changes: {
      type: Schema.Types.Mixed,
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
AuditLogSchema.index({ organizationId: 1, createdAt: -1 });
AuditLogSchema.index({ entityType: 1, entityId: 1 });
AuditLogSchema.index({ performedBy: 1 });

const AuditLog: Model<IAuditLog> =
  mongoose.models.AuditLog || mongoose.model<IAuditLog>('AuditLog', AuditLogSchema);

export default AuditLog;
