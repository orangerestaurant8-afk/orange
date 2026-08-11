import dotenv from 'dotenv';
import { resolve } from 'node:path';

// Backend configuration lives beside this package. Load the local development
// file first while preserving any variables supplied by the process environment.
dotenv.config({ path: resolve(process.cwd(), '.env.local') });
dotenv.config({ path: resolve(process.cwd(), '.env') });

export const env = {
  port: Number(process.env.PORT ?? 5000),
  mongoUri: process.env.MONGODB_URI,
  // A comma-separated list lets production support a Vercel custom domain and
  // preview deployments without relaxing CORS for every origin.
  frontendOrigins: (process.env.FRONTEND_ORIGIN ?? 'http://localhost:3000')
    .split(',')
    .map((origin) => origin.trim().replace(/\/$/, ''))
    .filter(Boolean),
  jwtAccessSecret: process.env.JWT_ACCESS_SECRET ?? 'development-only-access-secret-change-me',
  jwtRefreshSecret: process.env.JWT_REFRESH_SECRET ?? 'development-only-refresh-secret-change-me',
  adminEmail: process.env.ADMIN_EMAIL ?? 'admin@orange.online',
  adminPassword: process.env.ADMIN_PASSWORD ?? 'orange@123',
  nodeEnv: process.env.NODE_ENV ?? 'development',
  // Temporary testing switch. Keep disabled for public launches.
  exposeOtpInResponse: process.env.EXPOSE_OTP_IN_RESPONSE === 'true',
  cloudinaryCloudName: process.env.CLOUDINARY_CLOUD_NAME,
  cloudinaryApiKey: process.env.CLOUDINARY_API_KEY,
  cloudinaryApiSecret: process.env.CLOUDINARY_API_SECRET,
  integrationEnabled: process.env.INTEGRATION_ENABLED === 'true',
  posApiUrl: process.env.POS_API_URL?.replace(/\/$/, ''),
  posSyncSecret: process.env.POS_SYNC_SECRET,
  posWebhookPath: process.env.POS_ORDER_WEBHOOK_PATH ?? '/api/integration/website/orders',
  integrationMaxAgeSeconds: Number(process.env.INTEGRATION_MAX_AGE_SECONDS ?? 300),
  integrationWorkerIntervalMs: Number(process.env.INTEGRATION_WORKER_INTERVAL_MS ?? 15000),
  integrationMaxAttempts: Number(process.env.INTEGRATION_MAX_ATTEMPTS ?? 8),
  deliveryFee: Number(process.env.DELIVERY_FEE ?? 99),
  taxRate: Number(process.env.TAX_RATE ?? 0.16),
};
