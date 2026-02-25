import mongoose, { Schema, Document } from 'mongoose';

export interface IBuilding extends Document {
  organizationId: mongoose.Types.ObjectId;
  name: string;
  code: string;
  address: string;
  floors: number;
  metadata: {
    totalArea?: number;
    yearBuilt?: number;
    facilities?: string[];
  };
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const BuildingSchema = new Schema<IBuilding>(
  {
    organizationId: { type: Schema.Types.ObjectId, ref: 'Organization', required: true },
    name: { type: String, required: true },
    code: { type: String, required: true, unique: true },
    address: { type: String, required: true },
    floors: { type: Number, default: 1 },
    metadata: {
      totalArea: { type: Number },
      yearBuilt: { type: Number },
      facilities: [{ type: String }]
    },
    isActive: { type: Boolean, default: true }
  },
  { timestamps: true }
);

BuildingSchema.index({ organizationId: 1 });
BuildingSchema.index({ code: 1 });
BuildingSchema.index({ isActive: 1 });

export default mongoose.models.Building || mongoose.model<IBuilding>('Building', BuildingSchema);
