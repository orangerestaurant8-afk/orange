import { Schema, model, type InferSchemaType } from 'mongoose';
const addon = new Schema({ name: { type: String, required: true }, price: { type: Number, required: true, min: 0 } }, { _id: false });
const schema = new Schema({
  name: { type: String, required: true, trim: true }, description: { type: String, required: true }, price: { type: Number, required: true, min: 0 },
  category: { type: Schema.Types.ObjectId, ref: 'Category', required: true }, imageUrl: { type: String, required: true }, addOns: { type: [addon], default: [] },
  isAvailable: { type: Boolean, default: true }, spiceLevel: { type: String, enum: ['none', 'mild', 'medium', 'hot', 'extra-hot'], default: 'medium' },
  // POS-owned operational fields. Website presentation fields can be added independently without being overwritten by sync.
  externalId: { type: String, trim: true, unique: true, sparse: true, index: true }, isActive: { type: Boolean, default: true }, archived: { type: Boolean, default: false }, posLastUpdatedAt: Date,
}, { timestamps: true });
export type MenuItem = InferSchemaType<typeof schema>; export const MenuItemModel = model('MenuItem', schema);
