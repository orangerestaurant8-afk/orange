import { Router } from 'express';
import { z } from 'zod';
import { CategoryModel } from '../models/category.model';
import { MenuItemModel } from '../models/menu-item.model';
import { OrderModel } from '../models/order.model';
import { UserModel } from '../models/user.model';
import { HeroSlideModel } from '../models/hero-slide.model';
import { requireAdmin, requireAuth, validate } from '../middleware/api';
import { createOrderOutboxEvent, integrationHealth, retryOutboxEvent } from '../services/pos-integration.service';
import { IntegrationOutboxEventModel } from '../models/integration-outbox-event.model';
import { env } from '../config/env';
import { randomUUID } from 'node:crypto';

export const apiRouter = Router();
type CheckoutLine = { item: string; quantity: number; customizations: string[] };
type CheckoutBody = { items: CheckoutLine[]; deliveryAddress: string; paymentMethod: 'Cash on Delivery' | 'JazzCash' | 'Easypaisa' };
const cloudinaryUrl = z.string().url().refine((value) => new URL(value).hostname.endsWith('cloudinary.com'), 'imageUrl must be a Cloudinary URL');
const menu = z.object({ name: z.string().min(1), description: z.string().min(1), price: z.number().nonnegative(), category: z.string(), imageUrl: cloudinaryUrl, addOns: z.array(z.object({ name: z.string(), price: z.number().nonnegative() })).default([]), isAvailable: z.boolean().default(true), spiceLevel: z.enum(['none', 'mild', 'medium', 'hot', 'extra-hot']).default('medium') });
const category = z.object({ name: z.string().min(1).max(120), displayOrder: z.number().int().nonnegative() });
// Prices and totals are deliberately absent: the server recalculates them from synced menu data.
const order = z.object({ items: z.array(z.object({ item: z.string(), quantity: z.number().int().positive().max(100), customizations: z.array(z.string().max(120)).max(30).default([]) })).min(1).max(100), deliveryAddress: z.string().min(1).max(1000), paymentMethod: z.enum(['Cash on Delivery', 'JazzCash', 'Easypaisa']) });
const status = z.object({ status: z.enum(['New', 'Preparing', 'Out for Delivery', 'Delivered', 'Cancelled']), note: z.string().optional() });
const heroSlide = z.object({ title: z.string().min(1).max(90), highlightedText: z.string().max(90).default(''), subtitle: z.string().min(1).max(220), imageUrl: z.string().url(), ctaLabel: z.string().min(1).max(40).default('Explore the menu'), isActive: z.boolean().default(true), displayOrder: z.number().int().nonnegative().default(0) });

apiRouter.get('/categories', async (_req, res, next) => { try { res.json({ data: await CategoryModel.find({ isActive: { $ne: false }, archived: { $ne: true } }).sort('displayOrder') }); } catch (error) { next(error); } });
apiRouter.post('/categories', ...requireAdmin, validate(category), async (req, res, next) => { try { res.status(201).json({ data: await CategoryModel.create(req.body) }); } catch (error) { next(error); } });
apiRouter.put('/categories/:id', ...requireAdmin, validate(category.partial()), async (req, res, next) => { try { const item = await CategoryModel.findByIdAndUpdate(req.params.id, req.body, { new: true }); if (!item) return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Category not found' } }); res.json({ data: item }); } catch (error) { next(error); } });
apiRouter.delete('/categories/:id', ...requireAdmin, async (req, res, next) => { try { const item = await CategoryModel.findByIdAndDelete(req.params.id); if (!item) return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Category not found' } }); res.status(204).end(); } catch (error) { next(error); } });

apiRouter.get('/hero-slides', async (_req, res, next) => { try { res.json({ data: await HeroSlideModel.find().sort('displayOrder createdAt') }); } catch (error) { next(error); } });
apiRouter.post('/hero-slides', ...requireAdmin, validate(heroSlide), async (req, res, next) => { try { res.status(201).json({ data: await HeroSlideModel.create(req.body) }); } catch (error) { next(error); } });
apiRouter.put('/hero-slides/:id', ...requireAdmin, validate(heroSlide.partial()), async (req, res, next) => { try { const item = await HeroSlideModel.findByIdAndUpdate(req.params.id, req.body, { new: true }); if (!item) return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Hero slide not found' } }); res.json({ data: item }); } catch (error) { next(error); } });
apiRouter.delete('/hero-slides/:id', ...requireAdmin, async (req, res, next) => { try { const item = await HeroSlideModel.findByIdAndDelete(req.params.id); if (!item) return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Hero slide not found' } }); res.status(204).end(); } catch (error) { next(error); } });

apiRouter.get('/menu', async (req, res, next) => { try { const filter = { isActive: { $ne: false }, archived: { $ne: true }, ...(req.query.category ? { category: req.query.category } : {}) }; res.json({ data: await MenuItemModel.find(filter).populate('category') }); } catch (error) { next(error); } });
apiRouter.get('/menu/:id', async (req, res, next) => { try { const item = await MenuItemModel.findOne({ _id: req.params.id, isActive: { $ne: false }, archived: { $ne: true } }).populate('category'); if (!item) return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Menu item not found' } }); res.json({ data: item }); } catch (error) { next(error); } });
apiRouter.post('/menu', ...requireAdmin, validate(menu), async (req, res, next) => { try { res.status(201).json({ data: await MenuItemModel.create(req.body) }); } catch (error) { next(error); } });
apiRouter.put('/menu/:id', ...requireAdmin, validate(menu.partial()), async (req, res, next) => { try { const item = await MenuItemModel.findByIdAndUpdate(req.params.id, req.body, { new: true }); if (!item) return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Menu item not found' } }); res.json({ data: item }); } catch (error) { next(error); } });
apiRouter.delete('/menu/:id', ...requireAdmin, async (req, res, next) => { try { const item = await MenuItemModel.findByIdAndDelete(req.params.id); if (!item) return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Menu item not found' } }); res.status(204).end(); } catch (error) { next(error); } });

apiRouter.post('/orders', requireAuth, validate(order), async (req, res, next) => { try {
  const checkoutId = req.header('idempotency-key');
  if (checkoutId && !/^[a-zA-Z0-9-]{16,128}$/.test(checkoutId)) return res.status(400).json({ error: { code: 'INVALID_IDEMPOTENCY_KEY', message: 'Invalid checkout request key' } });
  if (checkoutId) { const existing = await OrderModel.findOne({ checkoutId, user: req.user!.id }); if (existing) return res.json({ data: existing }); }
  const checkout = req.body as CheckoutBody;
  const requestedIds = checkout.items.map((line: CheckoutLine) => line.item);
  const menuItems = await MenuItemModel.find({ _id: { $in: requestedIds }, isAvailable: true, isActive: { $ne: false }, archived: { $ne: true }, ...(env.integrationEnabled ? { externalId: { $exists: true, $ne: '' } } : {}) });
  if (menuItems.length !== new Set(requestedIds).size) return res.status(400).json({ error: { code: 'UNAVAILABLE_ITEM', message: 'One or more menu items are unavailable or no longer exist' } });
  const byId = new Map(menuItems.map((item) => [item._id.toString(), item]));
  const lines = checkout.items.map((line: CheckoutLine) => ({ item: byId.get(line.item)!._id, quantity: line.quantity, customizations: line.customizations, unitPrice: byId.get(line.item)!.price }));
  const subtotal = lines.reduce((sum: number, line) => sum + line.unitPrice * line.quantity, 0); const deliveryFee = env.deliveryFee; const total = subtotal + deliveryFee + Math.round(subtotal * env.taxRate);
  const created = await OrderModel.create({ user: req.user!.id, items: lines, subtotal, deliveryFee, total, deliveryAddress: checkout.deliveryAddress, paymentMethod: checkout.paymentMethod, externalOrderId: randomUUID(), ...(checkoutId ? { checkoutId } : {}), integrationOrigin: 'website', statusHistory: [{ status: 'New' }] });
  // This application has no online-payment confirmation integration. Only COD is fulfilment-confirmed and therefore delivered to POS.
  if (env.integrationEnabled && checkout.paymentMethod === 'Cash on Delivery') await createOrderOutboxEvent(created._id.toString());
  return res.status(201).json({ data: created });
} catch (error) { next(error); } });
apiRouter.get('/orders', requireAuth, async (req, res, next) => { try { const filter = req.user!.role === 'admin' ? (req.query.status ? { status: req.query.status } : {}) : { user: req.user!.id }; res.json({ data: await OrderModel.find(filter).sort('-createdAt').populate('user').populate('items.item') }); } catch (error) { next(error); } });
apiRouter.get('/orders/:id', requireAuth, async (req, res, next) => { try { const item = await OrderModel.findById(req.params.id).populate('items.item user'); if (!item) return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Order not found' } }); if (req.user!.role !== 'admin' && item.user._id.toString() !== req.user!.id) return res.status(403).json({ error: { code: 'FORBIDDEN', message: 'You do not have permission to access this order' } }); res.json({ data: item }); } catch (error) { next(error); } });
apiRouter.patch('/orders/:id/status', ...requireAdmin, validate(status), async (req, res, next) => { try { const item = await OrderModel.findByIdAndUpdate(req.params.id, { $set: { status: req.body.status }, $push: { statusHistory: { status: req.body.status, note: req.body.note } } }, { new: true }); if (!item) return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Order not found' } }); res.json({ data: item }); } catch (error) { next(error); } });

apiRouter.get('/integration/health', ...requireAdmin, async (_req, res, next) => { try { res.json({ data: await integrationHealth() }); } catch (error) { next(error); } });
apiRouter.get('/integration/outbox/:eventId', ...requireAdmin, async (req, res, next) => { try { const event = await IntegrationOutboxEventModel.findOne({ eventId: String(req.params.eventId) }); if (!event) return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Integration event not found' } }); res.json({ data: event }); } catch (error) { next(error); } });
apiRouter.post('/integration/outbox/retry', ...requireAdmin, async (_req, res, next) => { try { res.json({ data: { retried: await retryOutboxEvent() } }); } catch (error) { next(error); } });
apiRouter.post('/integration/outbox/:eventId/retry', ...requireAdmin, async (req, res, next) => { try { res.json({ data: { retried: await retryOutboxEvent(String(req.params.eventId)) } }); } catch (error) { next(error); } });

apiRouter.get('/users', ...requireAdmin, async (_req, res, next) => { try { res.json({ data: await UserModel.find().select('name phone email role createdAt').sort('-createdAt') }); } catch (error) { next(error); } });
