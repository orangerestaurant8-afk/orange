import { Schema, model, type InferSchemaType } from 'mongoose';

const schema = new Schema({
  phone: { type: String, required: true, index: true },
  codeHash: { type: String, required: true },
  purpose: { type: String, enum: ['signup', 'login'], required: true },
  name: { type: String, trim: true },
  email: { type: String, lowercase: true, trim: true },
  expiresAt: { type: Date, required: true, expires: 0 },
}, { timestamps: true });

export type Otp = InferSchemaType<typeof schema>;
export const OtpModel = model('Otp', schema);
