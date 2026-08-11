import { Schema, model, type InferSchemaType } from 'mongoose';

const schema = new Schema({
  eventId: { type: String, required: true, unique: true, index: true },
  type: { type: String, required: true },
  source: { type: String, required: true },
  processedAt: { type: Date, default: Date.now },
}, { timestamps: true });
export type ProcessedIntegrationEvent = InferSchemaType<typeof schema>;
export const ProcessedIntegrationEventModel = model('ProcessedIntegrationEvent', schema);
