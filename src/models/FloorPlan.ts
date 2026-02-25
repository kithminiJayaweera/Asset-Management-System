import mongoose, { Schema, Document } from 'mongoose';

export interface IFloorPlan extends Document {
  locationId: mongoose.Types.ObjectId;
  imageUrl: string;
  width: number;
  height: number;
  metadata?: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}

const FloorPlanSchema = new Schema<IFloorPlan>(
  {
    locationId: { type: Schema.Types.ObjectId, ref: 'Location', required: true },
    imageUrl: { type: String, required: true },
    width: { type: Number, required: true },
    height: { type: Number, required: true },
    metadata: { type: Schema.Types.Mixed, default: {} }
  },
  { timestamps: true }
);

FloorPlanSchema.index({ locationId: 1 });

export default mongoose.models.FloorPlan || mongoose.model<IFloorPlan>('FloorPlan', FloorPlanSchema);
