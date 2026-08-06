import { Schema, model, type InferSchemaType } from 'mongoose';

const schema = new Schema({
  title: { type: String, required: true, trim: true, maxlength: 90 },
  highlightedText: { type: String, default: '', trim: true, maxlength: 90 },
  subtitle: { type: String, required: true, trim: true, maxlength: 220 },
  imageUrl: { type: String, required: true, trim: true },
  ctaLabel: { type: String, default: 'Explore the menu', trim: true, maxlength: 40 },
  isActive: { type: Boolean, default: true },
  displayOrder: { type: Number, default: 0, min: 0 },
}, { timestamps: true });

export type HeroSlide = InferSchemaType<typeof schema>;
export const HeroSlideModel = model('HeroSlide', schema);
