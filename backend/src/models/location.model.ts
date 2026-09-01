import { Schema, model, type InferSchemaType } from 'mongoose';

const area = new Schema(
  {
    name: { type: String, required: true, trim: true },
    deliveryCharge: { type: Number, min: 0 },
    isActive: { type: Boolean, default: true },
  },
  { _id: false },
);
const schema = new Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 120 },
    address: { type: String, trim: true, maxlength: 500, default: '' },
    contactNumber: { type: String, trim: true, default: '' },
    openingTime: { type: String, trim: true, default: '' },
    closingTime: { type: String, trim: true, default: '' },
    deliveryAreas: { type: [area], default: [] },
    minimumOrder: { type: Number, min: 0, default: 0 },
    deliveryCharge: { type: Number, min: 0 },
    freeDeliveryThreshold: { type: Number, min: 0 },
    estimatedDeliveryTime: { type: String, trim: true, default: '' },
    isActive: { type: Boolean, default: true },
    isAvailable: { type: Boolean, default: true },
    displayOrder: { type: Number, min: 0, default: 0 },
    archived: { type: Boolean, default: false },
  },
  { timestamps: true },
);
export type Location = InferSchemaType<typeof schema>;
export const LocationModel = model('Location', schema);
