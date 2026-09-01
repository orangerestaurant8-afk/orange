import { Schema, model, type InferSchemaType } from 'mongoose';
const addon = new Schema(
  { name: { type: String, required: true }, price: { type: Number, required: true, min: 0 } },
  { _id: false },
);
const schema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    price: { type: Number, required: true, min: 0 },
    category: { type: Schema.Types.ObjectId, ref: 'Category', required: true },
    imageUrl: { type: String, required: true },
    addOns: { type: [addon], default: [] },
    isAvailable: { type: Boolean, default: true },
    spiceLevel: {
      type: String,
      enum: ['none', 'mild', 'medium', 'hot', 'extra-hot'],
      default: 'medium',
    },
    discountedPrice: { type: Number, min: 0 },
    tags: { type: [String], default: [] },
    featured: { type: Boolean, default: false },
    displayOrder: { type: Number, default: 0, min: 0 },
    locationIds: { type: [Schema.Types.ObjectId], ref: 'Location', default: [] },
    stockStatus: { type: String, enum: ['in-stock', 'out-of-stock'], default: 'in-stock' },
    slug: { type: String, trim: true, lowercase: true, unique: true, sparse: true, index: true },
    preparationTime: { type: Number, min: 0 },
    // POS-owned operational fields. Website presentation fields can be added independently without being overwritten by sync.
    externalId: { type: String, trim: true, unique: true, sparse: true, index: true },
    isActive: { type: Boolean, default: true },
    archived: { type: Boolean, default: false },
    posLastUpdatedAt: Date,
  },
  { timestamps: true },
);
export type MenuItem = InferSchemaType<typeof schema>;
export const MenuItemModel = model('MenuItem', schema);
