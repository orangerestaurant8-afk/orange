import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import { rateLimit } from 'express-rate-limit';
import { env } from './config/env';
import { healthRouter } from './routes/health.routes';
import { apiRouter } from './routes/api.routes';
import { authRouter } from './routes/auth.routes';
import { uploadRouter } from './routes/upload.routes';
import { posIntegrationRouter } from './routes/integration.routes';
import { errors, notFound } from './middleware/api';

export const app = express();

app.set('trust proxy', 1);
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      styleSrc: ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
      fontSrc: ["'self'", 'data:', 'https://fonts.gstatic.com'],
      imgSrc: ["'self'", 'data:', 'https://images.unsplash.com', 'https://res.cloudinary.com'],
      connectSrc: ["'self'"],
    },
  },
}));
app.use(cors({
  origin(origin, callback) {
    // Requests made outside a browser do not include an Origin header.
    if (!origin || env.frontendOrigins.includes(origin.replace(/\/$/, ''))) return callback(null, true);
    return callback(new Error('Origin is not allowed by CORS'));
  },
  credentials: true,
}));
// This router must run before JSON parsing: its HMAC covers the original bytes.
app.use('/api/integration', express.raw({ type: 'application/json', limit: '1mb' }), posIntegrationRouter);
app.use(express.json());
app.use(rateLimit({ windowMs: 15 * 60 * 1000, limit: 300, standardHeaders: 'draft-8', legacyHeaders: false, message: { error: { code: 'RATE_LIMITED', message: 'Too many requests. Please try again later.' } } }));
const authRateLimit = rateLimit({ windowMs: 15 * 60 * 1000, limit: 10, standardHeaders: 'draft-8', legacyHeaders: false, message: { error: { code: 'RATE_LIMITED', message: 'Too many authentication attempts. Please try again later.' } } });
app.use('/api', healthRouter);
app.use('/api/auth', authRateLimit, authRouter);
app.use('/api/upload', uploadRouter);
app.use('/api', apiRouter);
app.use(notFound);
app.use(errors);
