import { Schema, model, type InferSchemaType } from 'mongoose';
const item = new Schema({ item: { type: Schema.Types.ObjectId, ref: 'MenuItem', required: true }, quantity: { type: Number, required: true, min: 1 }, customizations: { type: [String], default: [] }, unitPrice: { type: Number, required: true, min: 0 } }, { _id: false });
const history = new Schema({ status: { type: String, required: true }, at: { type: Date, default: Date.now }, note: String }, { _id: false });
const schema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true }, items: { type: [item], required: true }, subtotal: { type: Number, required: true }, deliveryFee: { type: Number, required: true }, total: { type: Number, required: true },
  status: { type: String, enum: ['New', 'Preparing', 'Out for Delivery', 'Delivered', 'Cancelled'], default: 'New' }, deliveryAddress: { type: String, required: true }, paymentMethod: { type: String, enum: ['Cash on Delivery', 'JazzCash', 'Easypaisa'], required: true }, statusHistory: { type: [history], default: [] },
  externalOrderId: { type: String, required: true, unique: true, index: true }, checkoutId: { type: String, unique: true, sparse: true, index: true }, posOrderId: { type: String, index: true, sparse: true }, integrationOrigin: { type: String, default: 'website' },
}, { timestamps: true });
export type Order = InferSchemaType<typeof schema>; export const OrderModel = model('Order', schema);
