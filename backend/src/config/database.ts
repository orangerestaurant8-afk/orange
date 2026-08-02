import mongoose from 'mongoose';
import { env } from './env';

export async function connectDatabase(): Promise<void> {
  if (!env.mongoUri) {
    console.warn('MONGODB_URI is not set; starting without a database connection.');
    return;
  }

  await mongoose.connect(env.mongoUri);
  console.info('Connected to MongoDB.');
}
