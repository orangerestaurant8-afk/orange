import { Schema, model, type InferSchemaType } from 'mongoose';
const schema = new Schema(
  {
    defaultDeliveryCharge: { type: Number, min: 0, default: 0 },
    minimumOrder: { type: Number, min: 0, default: 0 },
    freeDeliveryThreshold: { type: Number, min: 0 },
    deliveryEnabled: { type: Boolean, default: true },
    pickupEnabled: { type: Boolean, default: false },
  },
  { timestamps: true },
);
export type DeliverySettings = InferSchemaType<typeof schema>;
export const DeliverySettingsModel = model('DeliverySettings', schema);
