import mongoose, { Schema, Document } from 'mongoose';

export interface IAssetLocationHistory extends Document {
  assetId: mongoose.Types.ObjectId;
  fromLocationId?: mongoose.Types.ObjectId;
  toLocationId: mongoose.Types.ObjectId;
  movedBy: mongoose.Types.ObjectId;
  movedAt: Date;
  notes?: string;
}

const AssetLocationHistorySchema = new Schema<IAssetLocationHistory>(
  {
    assetId: { type: Schema.Types.ObjectId, ref: 'Asset', required: true },
    fromLocationId: { type: Schema.Types.ObjectId, ref: 'Location', default: null },
    toLocationId: { type: Schema.Types.ObjectId, ref: 'Location', required: true },
    movedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    movedAt: { type: Date, default: Date.now },
    notes: { type: String, default: '' }
  },
  { timestamps: true }
);

AssetLocationHistorySchema.index({ assetId: 1 });
AssetLocationHistorySchema.index({ movedAt: -1 });

export default mongoose.models.AssetLocationHistory || mongoose.model<IAssetLocationHistory>('AssetLocationHistory', AssetLocationHistorySchema);
