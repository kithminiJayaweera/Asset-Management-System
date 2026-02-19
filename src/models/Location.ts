import mongoose, { Schema, Document } from 'mongoose';

export type LocationType = 
  | 'organization' 
  | 'company' 
  | 'office' 
  | 'building' 
  | 'floor' 
  | 'room' 
  | 'desk' 
  | 'rack';

export interface ILocation extends Document {
  name: string;
  type: LocationType;
  code: string;
  parentId?: mongoose.Types.ObjectId;
  organizationId: mongoose.Types.ObjectId;
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  gridData?: any;
  metadata?: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}

const LocationSchema = new Schema<ILocation>(
  {
    name: { type: String, required: true },
    type: { 
      type: String, 
      required: true,
      enum: ['organization', 'company', 'office', 'building', 'floor', 'room', 'desk', 'rack']
    },
    code: { type: String, required: true },
    parentId: { type: Schema.Types.ObjectId, ref: 'Location', default: null },
    organizationId: { type: Schema.Types.ObjectId, ref: 'Organization', required: true },
    x: { type: Number, default: null },
    y: { type: Number, default: null },
    width: { type: Number, default: null },
    height: { type: Number, default: null },
    gridData: { type: Schema.Types.Mixed, default: null },
    metadata: { type: Schema.Types.Mixed, default: {} }
  },
  { timestamps: true }
);

LocationSchema.index({ parentId: 1 });
LocationSchema.index({ organizationId: 1 });
LocationSchema.index({ code: 1 });

export default mongoose.models.Location || mongoose.model<ILocation>('Location', LocationSchema);
