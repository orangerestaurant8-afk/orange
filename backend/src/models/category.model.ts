import { Schema, model, type InferSchemaType } from 'mongoose';
const schema = new Schema(
  {
    name: { type: String, required: true, trim: true, unique: true },
    displayOrder: { type: Number, required: true, min: 0 },
    slug: { type: String, trim: true, lowercase: true, unique: true, sparse: true, index: true },
    description: { type: String, trim: true, maxlength: 400, default: '' },
    imageUrl: { type: String, trim: true, default: '' },
    featured: { type: Boolean, default: false },
    externalId: { type: String, trim: true, unique: true, sparse: true, index: true },
    isActive: { type: Boolean, default: true },
    archived: { type: Boolean, default: false },
    posLastUpdatedAt: Date,
  },
  { timestamps: true },
);
export type Category = InferSchemaType<typeof schema>;
export const CategoryModel = model('Category', schema);
