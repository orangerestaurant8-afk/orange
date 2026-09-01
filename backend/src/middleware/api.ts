import type { NextFunction, Request, Response } from 'express';
import jwt, { type JwtPayload } from 'jsonwebtoken';
import multer from 'multer';
import { ZodError, type ZodType } from 'zod';
import { env } from '../config/env';

export type AuthUser = { id: string; role: 'customer' | 'admin' };

declare global {
  namespace Express {
    interface Request {
      user?: AuthUser;
    }
  }
}

export const validate = (schema: ZodType) => (req: Request, _res: Response, next: NextFunction) => {
  try {
    req.body = schema.parse(req.body);
    next();
  } catch (error) {
    next(error);
  }
};

export const requireAuth = (req: Request, res: Response, next: NextFunction): void => {
  const authorization = req.header('authorization');
  const token = authorization?.startsWith('Bearer ') ? authorization.slice(7) : undefined;
  if (!token) {
    res
      .status(401)
      .json({ error: { code: 'UNAUTHENTICATED', message: 'A bearer access token is required' } });
    return;
  }

  try {
    const payload = jwt.verify(token, env.jwtAccessSecret) as JwtPayload;
    if (
      typeof payload.sub !== 'string' ||
      (payload.role !== 'customer' && payload.role !== 'admin')
    )
      throw new Error('Invalid token claims');
    req.user = { id: payload.sub, role: payload.role };
    next();
  } catch {
    res
      .status(401)
      .json({ error: { code: 'INVALID_TOKEN', message: 'Access token is invalid or expired' } });
  }
};

export const requireRole = (...roles: AuthUser['role'][]) => [
  requireAuth,
  (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user || !roles.includes(req.user.role)) {
      res
        .status(403)
        .json({
          error: {
            code: 'FORBIDDEN',
            message: 'You do not have permission to access this resource',
          },
        });
      return;
    }
    next();
  },
];

export const requireAdmin = requireRole('admin');
export const requireCustomer = requireRole('customer');

export const notFound = (req: Request, res: Response) =>
  res
    .status(404)
    .json({
      error: { code: 'NOT_FOUND', message: `Route ${req.method} ${req.path} was not found` },
    });
export const errors = (error: unknown, _req: Request, res: Response, _next: NextFunction) => {
  if (error instanceof multer.MulterError)
    return res
      .status(400)
      .json({
        error: {
          code: 'INVALID_FILE',
          message:
            error.code === 'LIMIT_FILE_SIZE' ? 'Image must be 5MB or smaller' : error.message,
        },
      });
  if (error instanceof ZodError)
    return res
      .status(400)
      .json({
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid request body',
          details: error.flatten(),
        },
      });
  if ((error as { code?: number }).code === 11000)
    return res
      .status(409)
      .json({
        error: {
          code: 'DUPLICATE_VALUE',
          message: 'A category or item with that unique value already exists.',
        },
      });
  if ((error as { name?: string }).name === 'CastError')
    return res.status(400).json({ error: { code: 'INVALID_ID', message: 'Invalid resource ID' } });
  console.error(error);
  return res
    .status(500)
    .json({ error: { code: 'INTERNAL_ERROR', message: 'Unexpected server error' } });
};
