import { Schema, model, type InferSchemaType } from 'mongoose';
const includedItem = new Schema(
  {
    item: { type: Schema.Types.ObjectId, ref: 'MenuItem', required: true },
    quantity: { type: Number, required: true, min: 1 },
  },
  { _id: false },
);
const choice = new Schema(
  {
    label: { type: String, required: true, trim: true },
    items: { type: [Schema.Types.ObjectId], ref: 'MenuItem', default: [] },
    minSelections: { type: Number, min: 0, default: 0 },
    maxSelections: { type: Number, min: 1, default: 1 },
    required: { type: Boolean, default: false },
  },
  { _id: false },
);
const schema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    description: { type: String, trim: true, default: '' },
    imageUrl: { type: String, trim: true, default: '' },
    price: { type: Number, required: true, min: 0 },
    originalPrice: { type: Number, min: 0 },
    includedItems: { type: [includedItem], default: [] },
    choices: { type: [choice], default: [] },
    locationIds: { type: [Schema.Types.ObjectId], ref: 'Location', default: [] },
    availabilityDays: { type: [Number], default: [] },
    startsAt: Date,
    endsAt: Date,
    startTime: String,
    endTime: String,
    featured: { type: Boolean, default: false },
    displayOrder: { type: Number, min: 0, default: 0 },
    stock: { type: Number, min: 0 },
    isActive: { type: Boolean, default: true },
    archived: { type: Boolean, default: false },
    slug: { type: String, trim: true, lowercase: true, unique: true, sparse: true },
  },
  { timestamps: true },
);
export type Deal = InferSchemaType<typeof schema>;
export const DealModel = model('Deal', schema);
