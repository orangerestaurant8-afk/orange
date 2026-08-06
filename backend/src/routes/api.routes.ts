import { Router } from 'express';
import { z } from 'zod';
import { CategoryModel } from '../models/category.model';
import { MenuItemModel } from '../models/menu-item.model';
import { OrderModel } from '../models/order.model';
import { UserModel } from '../models/user.model';
import { HeroSlideModel } from '../models/hero-slide.model';
import { requireAdmin, requireAuth, validate } from '../middleware/api';

export const apiRouter = Router();
const cloudinaryUrl = z.string().url().refine((value) => new URL(value).hostname.endsWith('cloudinary.com'), 'imageUrl must be a Cloudinary URL');
const menu = z.object({ name: z.string().min(1), description: z.string().min(1), price: z.number().nonnegative(), category: z.string(), imageUrl: cloudinaryUrl, addOns: z.array(z.object({ name: z.string(), price: z.number().nonnegative() })).default([]), isAvailable: z.boolean().default(true), spiceLevel: z.enum(['none', 'mild', 'medium', 'hot', 'extra-hot']).default('medium') });
const category = z.object({ name: z.enum(['Fast Food', 'Chinese Food', 'BBQ']), displayOrder: z.number().int().nonnegative() });
const order = z.object({ items: z.array(z.object({ item: z.string(), quantity: z.number().int().positive(), customizations: z.array(z.string()).default([]), unitPrice: z.number().nonnegative() })).min(1), subtotal: z.number().nonnegative(), deliveryFee: z.number().nonnegative(), total: z.number().nonnegative(), deliveryAddress: z.string().min(1), paymentMethod: z.enum(['Cash on Delivery', 'JazzCash', 'Easypaisa']) });
const status = z.object({ status: z.enum(['New', 'Preparing', 'Out for Delivery', 'Delivered', 'Cancelled']), note: z.string().optional() });
const heroSlide = z.object({ title: z.string().min(1).max(90), highlightedText: z.string().max(90).default(''), subtitle: z.string().min(1).max(220), imageUrl: z.string().url(), ctaLabel: z.string().min(1).max(40).default('Explore the menu'), isActive: z.boolean().default(true), displayOrder: z.number().int().nonnegative().default(0) });

apiRouter.get('/categories', async (_req, res, next) => { try { res.json({ data: await CategoryModel.find().sort('displayOrder') }); } catch (error) { next(error); } });
apiRouter.post('/categories', ...requireAdmin, validate(category), async (req, res, next) => { try { res.status(201).json({ data: await CategoryModel.create(req.body) }); } catch (error) { next(error); } });
apiRouter.put('/categories/:id', ...requireAdmin, validate(category.partial()), async (req, res, next) => { try { const item = await CategoryModel.findByIdAndUpdate(req.params.id, req.body, { new: true }); if (!item) return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Category not found' } }); res.json({ data: item }); } catch (error) { next(error); } });
apiRouter.delete('/categories/:id', ...requireAdmin, async (req, res, next) => { try { const item = await CategoryModel.findByIdAndDelete(req.params.id); if (!item) return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Category not found' } }); res.status(204).end(); } catch (error) { next(error); } });

apiRouter.get('/hero-slides', async (_req, res, next) => { try { res.json({ data: await HeroSlideModel.find().sort('displayOrder createdAt') }); } catch (error) { next(error); } });
apiRouter.post('/hero-slides', ...requireAdmin, validate(heroSlide), async (req, res, next) => { try { res.status(201).json({ data: await HeroSlideModel.create(req.body) }); } catch (error) { next(error); } });
apiRouter.put('/hero-slides/:id', ...requireAdmin, validate(heroSlide.partial()), async (req, res, next) => { try { const item = await HeroSlideModel.findByIdAndUpdate(req.params.id, req.body, { new: true }); if (!item) return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Hero slide not found' } }); res.json({ data: item }); } catch (error) { next(error); } });
apiRouter.delete('/hero-slides/:id', ...requireAdmin, async (req, res, next) => { try { const item = await HeroSlideModel.findByIdAndDelete(req.params.id); if (!item) return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Hero slide not found' } }); res.status(204).end(); } catch (error) { next(error); } });

apiRouter.get('/menu', async (req, res, next) => { try { const filter = req.query.category ? { category: req.query.category } : {}; res.json({ data: await MenuItemModel.find(filter).populate('category') }); } catch (error) { next(error); } });
apiRouter.get('/menu/:id', async (req, res, next) => { try { const item = await MenuItemModel.findById(req.params.id).populate('category'); if (!item) return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Menu item not found' } }); res.json({ data: item }); } catch (error) { next(error); } });
apiRouter.post('/menu', ...requireAdmin, validate(menu), async (req, res, next) => { try { res.status(201).json({ data: await MenuItemModel.create(req.body) }); } catch (error) { next(error); } });
apiRouter.put('/menu/:id', ...requireAdmin, validate(menu.partial()), async (req, res, next) => { try { const item = await MenuItemModel.findByIdAndUpdate(req.params.id, req.body, { new: true }); if (!item) return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Menu item not found' } }); res.json({ data: item }); } catch (error) { next(error); } });
apiRouter.delete('/menu/:id', ...requireAdmin, async (req, res, next) => { try { const item = await MenuItemModel.findByIdAndDelete(req.params.id); if (!item) return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Menu item not found' } }); res.status(204).end(); } catch (error) { next(error); } });

apiRouter.post('/orders', requireAuth, validate(order), async (req, res, next) => { try { res.status(201).json({ data: await OrderModel.create({ ...req.body, user: req.user!.id, statusHistory: [{ status: 'New' }] }) }); } catch (error) { next(error); } });
apiRouter.get('/orders', requireAuth, async (req, res, next) => { try { const filter = req.user!.role === 'admin' ? (req.query.status ? { status: req.query.status } : {}) : { user: req.user!.id }; res.json({ data: await OrderModel.find(filter).sort('-createdAt').populate('user').populate('items.item') }); } catch (error) { next(error); } });
apiRouter.get('/orders/:id', requireAuth, async (req, res, next) => { try { const item = await OrderModel.findById(req.params.id).populate('items.item user'); if (!item) return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Order not found' } }); if (req.user!.role !== 'admin' && item.user._id.toString() !== req.user!.id) return res.status(403).json({ error: { code: 'FORBIDDEN', message: 'You do not have permission to access this order' } }); res.json({ data: item }); } catch (error) { next(error); } });
apiRouter.patch('/orders/:id/status', ...requireAdmin, validate(status), async (req, res, next) => { try { const item = await OrderModel.findByIdAndUpdate(req.params.id, { $set: { status: req.body.status }, $push: { statusHistory: { status: req.body.status, note: req.body.note } } }, { new: true }); if (!item) return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Order not found' } }); res.json({ data: item }); } catch (error) { next(error); } });

apiRouter.get('/users', ...requireAdmin, async (_req, res, next) => { try { res.json({ data: await UserModel.find().select('name phone email role createdAt').sort('-createdAt') }); } catch (error) { next(error); } });
