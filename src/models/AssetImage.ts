import mongoose, { Schema, Document } from 'mongoose';

export interface IAssetImage extends Document {
  assetId: string;
  url: string;
  publicId: string;
  fileName: string;
  fileType: string;
  fileSize: number;
  isPrimary: boolean;
  uploadedAt: Date;
  uploadedBy?: string;
}

const AssetImageSchema = new Schema<IAssetImage>({
  assetId: { type: String, required: true, index: true },
  url: { type: String, required: true },
  publicId: { type: String, required: true },
  fileName: { type: String, required: true },
  fileType: { type: String, required: true },
  fileSize: { type: Number, required: true },
  isPrimary: { type: Boolean, default: false },
  uploadedAt: { type: Date, default: Date.now },
  uploadedBy: { type: String },
});

export default mongoose.models.AssetImage || mongoose.model<IAssetImage>('AssetImage', AssetImageSchema);
