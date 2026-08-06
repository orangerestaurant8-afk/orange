import { v2 as cloudinary } from 'cloudinary';
import { Router } from 'express';
import multer from 'multer';
import { env } from '../config/env';
import { requireAdmin } from '../middleware/api';

export const uploadRouter = Router();

cloudinary.config({ cloud_name: env.cloudinaryCloudName, api_key: env.cloudinaryApiKey, api_secret: env.cloudinaryApiSecret });

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, callback) => callback(null, file.mimetype.startsWith('image/')),
});

function uploadBuffer(buffer: Buffer, folder = 'orange/menu'): Promise<string> {
  return new Promise((resolve, reject) => {
    cloudinary.uploader.upload_stream({ folder, resource_type: 'image' }, (error, result) => {
      if (error || !result) reject(error ?? new Error('Cloudinary did not return an upload result'));
      else resolve(result.secure_url);
    }).end(buffer);
  });
}

uploadRouter.post('/', ...requireAdmin, upload.single('image'), async (req, res, next) => {
  try {
    if (!env.cloudinaryCloudName || !env.cloudinaryApiKey || !env.cloudinaryApiSecret) return res.status(503).json({ error: { code: 'UPLOAD_NOT_CONFIGURED', message: 'Cloudinary is not configured' } });
    if (!req.file) return res.status(400).json({ error: { code: 'INVALID_FILE', message: 'Upload a supported image file in the image field' } });
    const secure_url = await uploadBuffer(req.file.buffer, req.query.folder === 'hero' ? 'orange/hero' : 'orange/menu');
    return res.status(201).json({ data: { secure_url } });
  } catch (error) { next(error); }
});
