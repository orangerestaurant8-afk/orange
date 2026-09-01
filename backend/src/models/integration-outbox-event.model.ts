import { Schema, model, type InferSchemaType } from 'mongoose';

const schema = new Schema(
  {
    eventId: { type: String, required: true, unique: true, index: true },
    type: { type: String, required: true },
    payload: { type: Schema.Types.Mixed, required: true },
    status: {
      type: String,
      enum: ['pending', 'processing', 'completed', 'failed'],
      default: 'pending',
      index: true,
    },
    attempts: { type: Number, default: 0 },
    nextAttemptAt: { type: Date, default: Date.now, index: true },
    lastError: String,
    processedAt: Date,
  },
  { timestamps: true },
);
export type IntegrationOutboxEvent = InferSchemaType<typeof schema>;
export const IntegrationOutboxEventModel = model('IntegrationOutboxEvent', schema);
