import dotenv from 'dotenv';
import { resolve } from 'node:path';

// Backend configuration lives beside this package. Load the local development
// file first while preserving any variables supplied by the process environment.
dotenv.config({ path: resolve(process.cwd(), '.env.local') });
dotenv.config({ path: resolve(process.cwd(), '.env') });

export const env = {
  port: Number(process.env.PORT ?? 5000),
  mongoUri: process.env.MONGODB_URI,
  frontendOrigin: process.env.FRONTEND_ORIGIN ?? 'http://localhost:3000',
  jwtAccessSecret: process.env.JWT_ACCESS_SECRET ?? 'development-only-access-secret-change-me',
  jwtRefreshSecret: process.env.JWT_REFRESH_SECRET ?? 'development-only-refresh-secret-change-me',
  adminEmail: process.env.ADMIN_EMAIL ?? 'admin@orange.online',
  adminPassword: process.env.ADMIN_PASSWORD ?? 'orange@123',
  nodeEnv: process.env.NODE_ENV ?? 'development',
  cloudinaryCloudName: process.env.CLOUDINARY_CLOUD_NAME,
  cloudinaryApiKey: process.env.CLOUDINARY_API_KEY,
  cloudinaryApiSecret: process.env.CLOUDINARY_API_SECRET,
};
