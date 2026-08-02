import { createHash, randomInt, timingSafeEqual } from 'crypto';
import { Router } from 'express';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import { env } from '../config/env';
import { requireAuth, validate } from '../middleware/api';
import { OtpModel } from '../models/otp.model';
import { UserModel, type User } from '../models/user.model';

export const authRouter = Router();
const phone = z.string().trim().min(7).max(20).regex(/^\+?[0-9]+$/, 'Phone must contain only digits and an optional leading +');
const signup = z.object({ phone, name: z.string().trim().min(1).max(100), email: z.string().email().optional() });
const login = z.object({ phone });
const adminLogin = z.object({ email: z.string().trim().toLowerCase().email(), password: z.string().min(1) });
const verify = z.object({ phone, otp: z.string().length(6).regex(/^\d+$/), purpose: z.enum(['signup', 'login']) });
const hashOtp = (value: string) => createHash('sha256').update(value).digest('hex');
type PersistedUser = User & { _id: { toString(): string } };
const publicUser = (user: PersistedUser) => ({ id: user._id.toString(), name: user.name, phone: user.phone, email: user.email, role: user.role });

function issueTokens(user: PersistedUser, response: import('express').Response): string {
  const claims = { sub: user._id.toString(), role: user.role };
  const accessToken = jwt.sign(claims, env.jwtAccessSecret, { expiresIn: '15m' });
  const refreshToken = jwt.sign(claims, env.jwtRefreshSecret, { expiresIn: '30d' });
  response.cookie('refreshToken', refreshToken, {
    httpOnly: true,
    // Vercel and Railway are different sites, so a production refresh cookie
    // must be allowed in credentialed cross-site requests.
    secure: env.nodeEnv === 'production',
    sameSite: env.nodeEnv === 'production' ? 'none' : 'lax',
    maxAge: 30 * 24 * 60 * 60 * 1000,
    path: '/api/auth',
  });
  return accessToken;
}

async function sendOtp(phoneNumber: string, purpose: 'signup' | 'login', extras: { name?: string; email?: string } = {}): Promise<string> {
  const code = randomInt(100000, 1_000_000).toString();
  await OtpModel.deleteMany({ phone: phoneNumber, purpose });
  await OtpModel.create({ phone: phoneNumber, purpose, codeHash: hashOtp(code), expiresAt: new Date(Date.now() + 10 * 60 * 1000), ...extras });
  console.info(`[OTP] ${purpose} code for ${phoneNumber}: ${code}`);
  return code;
}

authRouter.post('/signup', validate(signup), async (req, res, next) => {
  try {
    if (await UserModel.exists({ phone: req.body.phone })) return res.status(409).json({ error: { code: 'PHONE_IN_USE', message: 'An account already exists for this phone number' } });
    const code = await sendOtp(req.body.phone, 'signup', { name: req.body.name, email: req.body.email });
    return res.status(202).json({ data: { message: 'OTP generated. Check the server console during development.', expiresIn: 600, ...(env.nodeEnv !== 'production' ? { developmentOtp: code } : {}) } });
  } catch (error) { next(error); }
});

authRouter.post('/login', validate(login), async (req, res, next) => {
  try {
    if (!await UserModel.exists({ phone: req.body.phone })) return res.status(404).json({ error: { code: 'USER_NOT_FOUND', message: 'No account exists for this phone number' } });
    const code = await sendOtp(req.body.phone, 'login');
    return res.status(202).json({ data: { message: 'OTP generated. Check the server console during development.', expiresIn: 600, ...(env.nodeEnv !== 'production' ? { developmentOtp: code } : {}) } });
  } catch (error) { next(error); }
});

authRouter.post('/admin/login', validate(adminLogin), async (req, res, next) => {
  try {
    const validEmail = req.body.email === env.adminEmail.toLowerCase();
    const validPassword = timingSafeEqual(Buffer.from(hashOtp(req.body.password)), Buffer.from(hashOtp(env.adminPassword)));
    if (!validEmail || !validPassword) return res.status(401).json({ error: { code: 'INVALID_ADMIN_CREDENTIALS', message: 'Email or password is incorrect' } });
    const admin = await UserModel.findOneAndUpdate(
      { email: env.adminEmail.toLowerCase() },
      { $set: { name: 'Orange Admin', role: 'admin' }, $setOnInsert: { phone: '+920000000000', email: env.adminEmail.toLowerCase() } },
      { new: true, upsert: true },
    ) as PersistedUser;
    const accessToken = issueTokens(admin, res);
    return res.json({ data: { accessToken, user: publicUser(admin) } });
  } catch (error) { next(error); }
});

authRouter.post('/verify-otp', validate(verify), async (req, res, next) => {
  try {
    const record = await OtpModel.findOne({ phone: req.body.phone, purpose: req.body.purpose });
    if (!record || record.expiresAt <= new Date() || !timingSafeEqual(Buffer.from(record.codeHash), Buffer.from(hashOtp(req.body.otp)))) return res.status(400).json({ error: { code: 'INVALID_OTP', message: 'OTP is invalid or expired' } });
    let user = await UserModel.findOne({ phone: req.body.phone });
    if (record.purpose === 'signup') {
      if (user) return res.status(409).json({ error: { code: 'PHONE_IN_USE', message: 'An account already exists for this phone number' } });
      user = await UserModel.create({ phone: record.phone, name: record.name, email: record.email });
    }
    if (!user) return res.status(404).json({ error: { code: 'USER_NOT_FOUND', message: 'No account exists for this phone number' } });
    await OtpModel.deleteOne({ _id: record._id });
    const accessToken = issueTokens(user, res);
    return res.json({ data: { accessToken, user: publicUser(user) } });
  } catch (error) { next(error); }
});

authRouter.get('/me', requireAuth, async (req, res, next) => {
  try {
    const user = await UserModel.findById(req.user!.id);
    if (!user) return res.status(401).json({ error: { code: 'INVALID_TOKEN', message: 'User for this token no longer exists' } });
    return res.json({ data: publicUser(user) });
  } catch (error) { next(error); }
});
