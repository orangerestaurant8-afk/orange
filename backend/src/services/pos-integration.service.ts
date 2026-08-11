import { createHmac, randomUUID, timingSafeEqual } from 'node:crypto';
import type { Request } from 'express';
import { z } from 'zod';
import { env } from '../config/env';
import { CategoryModel } from '../models/category.model';
import { IntegrationOutboxEventModel } from '../models/integration-outbox-event.model';
import { MenuItemModel } from '../models/menu-item.model';
import { OrderModel } from '../models/order.model';
import { ProcessedIntegrationEventModel } from '../models/processed-integration-event.model';
import { UserModel } from '../models/user.model';

const eventEnvelope = z.object({
  eventId: z.string().uuid(), type: z.enum(['MENU_ITEM_CREATED', 'MENU_ITEM_UPDATED', 'MENU_ITEM_DELETED', 'CATEGORY_CREATED', 'CATEGORY_UPDATED', 'CATEGORY_DELETED', 'MENU_AVAILABILITY_UPDATED', 'ORDER_STATUS_UPDATED', 'MENU_FULL_SYNC']),
  occurredAt: z.string().datetime(), source: z.literal('pos'), version: z.number().int().positive(), data: z.record(z.unknown()),
});
const categoryData = z.object({ externalId: z.string().min(1), name: z.string().min(1).max(120), displayOrder: z.number().int().nonnegative().optional(), isActive: z.boolean().optional(), updatedAt: z.string().datetime().optional() });
const menuData = z.object({
  externalId: z.string().min(1), name: z.string().min(1).max(200), description: z.string().max(5000).default(''), price: z.number().nonnegative(), categoryExternalId: z.string().min(1), imageUrl: z.string().url(),
  available: z.boolean().optional(), isActive: z.boolean().optional(), addOns: z.array(z.object({ name: z.string().min(1), price: z.number().nonnegative() })).optional(), spiceLevel: z.enum(['none', 'mild', 'medium', 'hot', 'extra-hot']).optional(), updatedAt: z.string().datetime().optional(),
});
const menuPatch = menuData.partial().extend({ externalId: z.string().min(1) });
const externalReference = z.object({ externalId: z.string().min(1) });
const availabilityData = z.object({ externalId: z.string().min(1), available: z.boolean() });
const orderStatusData = z.object({ externalOrderId: z.string().min(1), status: z.string().min(1), note: z.string().max(500).optional(), posOrderId: z.string().min(1).optional() });

export type PosEvent = z.infer<typeof eventEnvelope>;
export function parsePosEvent(value: unknown): PosEvent { return eventEnvelope.parse(value); }

export function verifyPosRequest(req: Request): boolean {
  if (!env.posSyncSecret || !Buffer.isBuffer(req.body)) return false;
  const timestamp = req.header('x-integration-timestamp');
  const signature = req.header('x-integration-signature');
  const eventId = req.header('x-integration-event-id');
  const eventType = req.header('x-integration-event-type');
  if (!timestamp || !signature || !eventId || !eventType || !/^\d+$/.test(timestamp)) return false;
  const age = Math.abs(Date.now() - Number(timestamp) * 1000);
  if (!Number.isFinite(age) || age > env.integrationMaxAgeSeconds * 1000) return false;
  const expected = createHmac('sha256', env.posSyncSecret).update(`${timestamp}.${req.body.toString('utf8')}`).digest('hex');
  const received = Buffer.from(signature, 'hex'); const computed = Buffer.from(expected, 'hex');
  return received.length === computed.length && timingSafeEqual(received, computed);
}

function posDate(value?: string): Date | undefined { return value ? new Date(value) : undefined; }
async function applyCategory(data: unknown, inactive = false): Promise<void> {
  if (inactive) { const value = externalReference.parse(data); await CategoryModel.findOneAndUpdate({ externalId: value.externalId }, { $set: { isActive: false, archived: true } }); return; }
  const value = categoryData.parse(data);
  await CategoryModel.findOneAndUpdate({ externalId: value.externalId }, {
    $set: { name: value.name, displayOrder: value.displayOrder ?? 0, isActive: inactive ? false : value.isActive ?? true, archived: inactive, posLastUpdatedAt: posDate(value.updatedAt) },
    $setOnInsert: { externalId: value.externalId },
  }, { upsert: true, new: true, setDefaultsOnInsert: true });
}
async function applyMenu(data: unknown, inactive = false, requireFull = false): Promise<void> {
  if (inactive) { const value = externalReference.parse(data); await MenuItemModel.findOneAndUpdate({ externalId: value.externalId }, { $set: { isAvailable: false, isActive: false, archived: true } }); return; }
  const value = requireFull ? menuData.parse(data) : menuPatch.parse(data);
  const category = value.categoryExternalId ? await CategoryModel.findOne({ externalId: value.categoryExternalId }) : undefined;
  if (value.categoryExternalId && !category) throw new Error(`POS menu item references unknown category externalId ${value.categoryExternalId}`);
  // Only POS-owned operational fields are selected here; future website SEO/marketing fields survive every POS update.
  const set: Record<string, unknown> = {};
  if (value.name !== undefined) set.name = value.name; if (value.description !== undefined) set.description = value.description; if (value.price !== undefined) set.price = value.price;
  if (category) set.category = category._id; if (value.available !== undefined) set.isAvailable = value.available; if (value.isActive !== undefined) set.isActive = value.isActive;
  if (value.updatedAt) set.posLastUpdatedAt = posDate(value.updatedAt);
  if (value.imageUrl) set.imageUrl = value.imageUrl;
  if (value.addOns) set.addOns = value.addOns;
  if (value.spiceLevel) set.spiceLevel = value.spiceLevel;
  await MenuItemModel.findOneAndUpdate({ externalId: value.externalId }, { $set: set, $setOnInsert: { externalId: value.externalId } }, { upsert: true, new: true, setDefaultsOnInsert: true, runValidators: true });
}
function websiteStatus(posStatus: string): 'New' | 'Preparing' | 'Out for Delivery' | 'Delivered' | 'Cancelled' {
  const normalized = posStatus.trim().toLowerCase().replace(/[ -]+/g, '_');
  if (['accepted', 'preparing', 'ready'].includes(normalized)) return 'Preparing';
  if (['out_for_delivery', 'dispatched'].includes(normalized)) return 'Out for Delivery';
  if (['completed', 'delivered'].includes(normalized)) return 'Delivered';
  if (['cancelled', 'canceled', 'rejected'].includes(normalized)) return 'Cancelled';
  return 'New';
}
async function applyOrderStatus(data: unknown): Promise<void> {
  const value = orderStatusData.parse(data); const status = websiteStatus(value.status);
  const order = await OrderModel.findOne({ externalOrderId: value.externalOrderId });
  if (!order) throw new Error(`POS status references unknown externalOrderId ${value.externalOrderId}`);
  if (order.status !== status) { order.status = status; order.statusHistory.push({ status, note: value.note }); }
  if (value.posOrderId) order.posOrderId = value.posOrderId;
  await order.save();
}

export async function applyPosEvent(event: PosEvent): Promise<void> {
  switch (event.type) {
    case 'CATEGORY_CREATED': case 'CATEGORY_UPDATED': await applyCategory(event.data); return;
    case 'CATEGORY_DELETED': await applyCategory(event.data, true); return;
    case 'MENU_ITEM_CREATED': await applyMenu(event.data, false, true); return;
    case 'MENU_ITEM_UPDATED': await applyMenu(event.data); return;
    case 'MENU_ITEM_DELETED': await applyMenu(event.data, true); return;
    case 'MENU_AVAILABILITY_UPDATED': { const value = availabilityData.parse(event.data); await MenuItemModel.findOneAndUpdate({ externalId: value.externalId }, { $set: { isAvailable: value.available } }); return; }
    case 'ORDER_STATUS_UPDATED': await applyOrderStatus(event.data); return;
    case 'MENU_FULL_SYNC': {
      const full = z.object({ categories: z.array(categoryData), menuItems: z.array(menuData) }).parse(event.data);
      for (const category of full.categories) await applyCategory(category);
      for (const item of full.menuItems) await applyMenu(item, false, true);
    }
  }
}

export async function processIncomingPosEvent(event: PosEvent): Promise<'processed' | 'duplicate'> {
  if (await ProcessedIntegrationEventModel.exists({ eventId: event.eventId })) return 'duplicate';
  await applyPosEvent(event);
  try { await ProcessedIntegrationEventModel.create({ eventId: event.eventId, type: event.type, source: event.source }); return 'processed'; }
  catch (error: unknown) { if ((error as { code?: number }).code === 11000) return 'duplicate'; throw error; }
}

export async function createOrderOutboxEvent(orderId: string): Promise<string> {
  const order = await OrderModel.findById(orderId).populate('user').populate('items.item');
  if (!order) throw new Error('Order not found while creating POS outbox event');
  const user = order.user as unknown as { name: string; phone: string; email?: string };
  const payload = {
    externalOrderId: order.externalOrderId, createdAt: order.createdAt.toISOString(), orderType: 'delivery',
    customer: { name: user.name, phone: user.phone, ...(user.email ? { email: user.email } : {}) }, delivery: { address: order.deliveryAddress },
    items: order.items.map((line) => { const menu = line.item as unknown as { externalId?: string }; if (!menu.externalId) throw new Error('A synced menu item is missing externalId'); return { productExternalId: menu.externalId, quantity: line.quantity, selectedOptions: line.customizations }; }),
    payment: { method: order.paymentMethod, status: order.paymentMethod === 'Cash on Delivery' ? 'pending' : 'confirmed' },
  };
  const eventId = randomUUID(); await IntegrationOutboxEventModel.create({ eventId, type: 'ONLINE_ORDER_CREATED', payload }); return eventId;
}
function backoff(attempt: number): Date { return new Date(Date.now() + Math.min(60 * 60 * 1000, 30_000 * 2 ** Math.max(0, attempt - 1))); }
export async function deliverNextOutboxEvent(): Promise<boolean> {
  if (!env.integrationEnabled || !env.posApiUrl || !env.posSyncSecret) return false;
  const event = await IntegrationOutboxEventModel.findOneAndUpdate({ status: { $in: ['pending', 'failed'] }, nextAttemptAt: { $lte: new Date() }, attempts: { $lt: env.integrationMaxAttempts } }, { $set: { status: 'processing' }, $inc: { attempts: 1 } }, { sort: { nextAttemptAt: 1 }, new: true });
  if (!event) return false;
  try {
    const body = JSON.stringify(event.payload); const timestamp = Math.floor(Date.now() / 1000).toString(); const signature = createHmac('sha256', env.posSyncSecret).update(`${timestamp}.${body}`).digest('hex');
    const response = await fetch(`${env.posApiUrl}${env.posWebhookPath}`, { method: 'POST', headers: { 'content-type': 'application/json', 'x-integration-timestamp': timestamp, 'x-integration-signature': signature, 'x-integration-event-id': event.eventId, 'x-integration-event-type': event.type }, body, signal: AbortSignal.timeout(10_000) });
    if (!response.ok) throw new Error(`POS responded with HTTP ${response.status}`);
    const result = await response.json().catch(() => ({})) as { data?: { posOrderId?: string }; posOrderId?: string };
    const posOrderId = result.data?.posOrderId ?? result.posOrderId;
    const externalOrderId = (event.payload as { externalOrderId: string }).externalOrderId;
    if (posOrderId) await OrderModel.findOneAndUpdate({ externalOrderId }, { $set: { posOrderId } });
    event.status = 'completed'; event.processedAt = new Date(); event.lastError = undefined; await event.save(); return true;
  } catch (error) {
    event.status = event.attempts >= env.integrationMaxAttempts ? 'failed' : 'pending'; event.lastError = error instanceof Error ? error.message.slice(0, 1000) : 'POS delivery failed'; event.nextAttemptAt = backoff(event.attempts); await event.save(); return false;
  }
}
export async function integrationHealth() { return { lastIncomingSync: await ProcessedIntegrationEventModel.findOne().sort('-processedAt'), pendingOutgoing: await IntegrationOutboxEventModel.countDocuments({ status: { $in: ['pending', 'processing'] } }), failedOutgoing: await IntegrationOutboxEventModel.countDocuments({ status: 'failed' }), latestOutgoingFailure: await IntegrationOutboxEventModel.findOne({ status: 'failed' }).sort('-updatedAt').select('eventId attempts lastError updatedAt') }; }
export async function retryOutboxEvent(eventId?: string): Promise<number> { const filter = eventId ? { eventId, status: 'failed' } : { status: 'failed' }; const result = await IntegrationOutboxEventModel.updateMany(filter, { $set: { status: 'pending', nextAttemptAt: new Date(), lastError: undefined } }); return result.modifiedCount; }
