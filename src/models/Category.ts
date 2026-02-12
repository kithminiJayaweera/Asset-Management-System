import mongoose, { Schema, Model } from 'mongoose';

export interface ICategoryField {
  name: string;
  key: string;
  type: 'text' | 'number' | 'date' | 'select' | 'textarea' | 'email' | 'url';
  required: boolean;
  options?: string[];
  defaultValue?: string;
}

export interface ICategory {
  _id: string;
  name: string;
  organizationId: Schema.Types.ObjectId;
  fields: ICategoryField[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const CategoryFieldSchema = new Schema<ICategoryField>({
  name: { type: String, required: true, trim: true },
  key: { type: String, required: true, trim: true },
  type: { 
    type: String, 
    required: true,
    enum: ['text', 'number', 'date', 'select', 'textarea', 'email', 'url']
  },
  required: { type: Boolean, default: false },
  options: [{ type: String }],
  defaultValue: { type: String }
}, { _id: false });

const CategorySchema = new Schema<ICategory>(
  {
    name: {
      type: String,
      required: [true, 'Category name is required'],
      trim: true,
    },
    organizationId: {
      type: Schema.Types.ObjectId,
      ref: 'Organization',
      required: [true, 'Organization ID is required'],
      index: true,
    },
    fields: {
      type: [CategoryFieldSchema],
      default: [],
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

CategorySchema.index({ organizationId: 1, name: 1 }, { unique: true });

const Category: Model<ICategory> =
  mongoose.models.Category || mongoose.model<ICategory>('Category', CategorySchema);

export default Category;
