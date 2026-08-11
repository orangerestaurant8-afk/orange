import { Schema, model, type InferSchemaType } from 'mongoose';
const schema = new Schema({
  name: { type: String, required: true, trim: true, unique: true },
  displayOrder: { type: Number, required: true, min: 0 },
  externalId: { type: String, trim: true, unique: true, sparse: true, index: true },
  isActive: { type: Boolean, default: true },
  archived: { type: Boolean, default: false },
  posLastUpdatedAt: Date,
}, { timestamps: true });
export type Category = InferSchemaType<typeof schema>; export const CategoryModel = model('Category', schema);
