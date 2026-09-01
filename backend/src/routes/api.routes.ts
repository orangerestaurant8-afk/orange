import { Router } from 'express';
import { z } from 'zod';
import { CategoryModel } from '../models/category.model';
import { MenuItemModel } from '../models/menu-item.model';
import { OrderModel } from '../models/order.model';
import { UserModel } from '../models/user.model';
import { HeroSlideModel } from '../models/hero-slide.model';
import { LocationModel } from '../models/location.model';
import { DeliverySettingsModel } from '../models/delivery-settings.model';
import { DealModel } from '../models/deal.model';
import { requireAdmin, requireAuth, validate } from '../middleware/api';
import {
  createOrderOutboxEvent,
  integrationHealth,
  retryOutboxEvent,
} from '../services/pos-integration.service';
import { IntegrationOutboxEventModel } from '../models/integration-outbox-event.model';
import { env } from '../config/env';
import { randomUUID } from 'node:crypto';

export const apiRouter = Router();
type CheckoutLine = { item: string; quantity: number; customizations: string[] };
type CheckoutBody = {
  items: CheckoutLine[];
  deliveryAddress: string;
  deliveryArea: string;
  locationId?: string;
  fulfillmentType?: 'delivery' | 'pickup';
  paymentMethod: 'Cash on Delivery' | 'Credit/Debit Card';
};
const cloudinaryUrl = z
  .string()
  .url()
  .refine(
    (value) => new URL(value).hostname.endsWith('cloudinary.com'),
    'imageUrl must be a Cloudinary URL',
  );
const menu = z.object({
  name: z.string().min(1),
  description: z.string().min(1),
  price: z.number().nonnegative(),
  discountedPrice: z.number().nonnegative().optional(),
  category: z.string(),
  imageUrl: cloudinaryUrl,
  addOns: z.array(z.object({ name: z.string(), price: z.number().nonnegative() })).default([]),
  isAvailable: z.boolean().default(true),
  spiceLevel: z.enum(['none', 'mild', 'medium', 'hot', 'extra-hot']).default('medium'),
  tags: z.array(z.string().max(50)).default([]),
  featured: z.boolean().default(false),
  displayOrder: z.number().int().nonnegative().default(0),
  locationIds: z.array(z.string()).default([]),
  stockStatus: z.enum(['in-stock', 'out-of-stock']).default('in-stock'),
  slug: z.string().max(120).optional(),
  preparationTime: z.number().nonnegative().optional(),
  isActive: z.boolean().default(true),
});
const category = z.object({
  name: z.string().min(1).max(120),
  displayOrder: z.number().int().nonnegative(),
  slug: z.string().max(120).optional(),
  description: z.string().max(400).default(''),
  imageUrl: z.string().url().or(z.literal('')).default(''),
  featured: z.boolean().default(false),
  isActive: z.boolean().default(true),
});
// Prices and totals are deliberately absent: the server recalculates them from synced menu data.
const deliveryAreas = [
  'Malir Saudabad',
  'Malir Khokrapar',
  'Malir Memon Goth',
  'Malir Model Colony',
  'Malir Cantt',
  'Shah Faisal Colony',
  'Jinnah Square',
  'Airport Side',
  'Kala Board',
  'Quaidabad',
  'Jaffar Tayyar',
  'Gulshan-e-Iqbal',
  'Gulistan-e-Johar',
  'Safoora Goth & Chowrangi',
  'Scheme 33',
  'University Road',
  'Askari IV',
  'Malir Halt',
  'Rafa-e-Aam Society',
  'Wireless Gate',
  'Shamsi Society',
] as const;
const order = z.object({
  items: z
    .array(
      z.object({
        item: z.string(),
        quantity: z.number().int().positive().max(100),
        customizations: z.array(z.string().max(120)).max(30).default([]),
      }),
    )
    .min(1)
    .max(100),
  deliveryAddress: z.string().min(1).max(1000),
  deliveryArea: z.string().min(1).max(120),
  locationId: z.string().optional(),
  fulfillmentType: z.enum(['delivery', 'pickup']).default('delivery'),
  paymentMethod: z.enum(['Cash on Delivery', 'Credit/Debit Card']),
});
const status = z.object({
  status: z.enum(['New', 'Preparing', 'Out for Delivery', 'Delivered', 'Cancelled']),
  note: z.string().optional(),
});
const heroSlide = z.object({
  title: z.string().min(1).max(90),
  highlightedText: z.string().max(90).default(''),
  subtitle: z.string().min(1).max(220),
  imageUrl: z.string().url(),
  mobileImageUrl: z.string().url().or(z.literal('')).default(''),
  ctaLabel: z.string().min(1).max(40).default('Explore the menu'),
  ctaTarget: z.string().max(500).default('#menu'),
  backgroundColor: z.string().max(30).default(''),
  startsAt: z.coerce.date().optional(),
  endsAt: z.coerce.date().optional(),
  isActive: z.boolean().default(true),
  displayOrder: z.number().int().nonnegative().default(0),
});
const location = z.object({
  name: z.string().min(1).max(120),
  address: z.string().max(500).default(''),
  contactNumber: z.string().max(40).default(''),
  openingTime: z.string().max(30).default(''),
  closingTime: z.string().max(30).default(''),
  deliveryAreas: z
    .array(
      z.object({
        name: z.string().min(1).max(120),
        deliveryCharge: z.number().nonnegative().optional(),
        isActive: z.boolean().default(true),
      }),
    )
    .default([]),
  minimumOrder: z.number().nonnegative().default(0),
  deliveryCharge: z.number().nonnegative().optional(),
  freeDeliveryThreshold: z.number().nonnegative().optional(),
  estimatedDeliveryTime: z.string().max(80).default(''),
  isActive: z.boolean().default(true),
  isAvailable: z.boolean().default(true),
  displayOrder: z.number().int().nonnegative().default(0),
});
const deliverySettings = z.object({
  defaultDeliveryCharge: z.number().nonnegative(),
  minimumOrder: z.number().nonnegative(),
  freeDeliveryThreshold: z.number().nonnegative().optional(),
  deliveryEnabled: z.boolean(),
  pickupEnabled: z.boolean(),
});
const deal = z.object({
  name: z.string().min(1).max(160),
  description: z.string().max(600).default(''),
  imageUrl: z.string().url().or(z.literal('')).default(''),
  price: z.number().nonnegative(),
  originalPrice: z.number().nonnegative().optional(),
  includedItems: z
    .array(z.object({ item: z.string(), quantity: z.number().int().positive() }))
    .default([]),
  choices: z
    .array(
      z.object({
        label: z.string().min(1),
        items: z.array(z.string()).default([]),
        minSelections: z.number().int().nonnegative().default(0),
        maxSelections: z.number().int().positive().default(1),
        required: z.boolean().default(false),
      }),
    )
    .default([]),
  locationIds: z.array(z.string()).default([]),
  availabilityDays: z.array(z.number().int().min(0).max(6)).default([]),
  startsAt: z.coerce.date().optional(),
  endsAt: z.coerce.date().optional(),
  startTime: z.string().max(10).optional(),
  endTime: z.string().max(10).optional(),
  featured: z.boolean().default(false),
  displayOrder: z.number().int().nonnegative().default(0),
  stock: z.number().int().nonnegative().optional(),
  isActive: z.boolean().default(true),
  slug: z.string().max(120).optional(),
});

apiRouter.get('/categories', async (req, res, next) => {
  try {
    const isAdmin = req.header('authorization') && req.query.admin === 'true';
    res.json({
      data: await CategoryModel.find(
        isAdmin ? {} : { isActive: { $ne: false }, archived: { $ne: true } },
      ).sort('displayOrder'),
    });
  } catch (error) {
    next(error);
  }
});
apiRouter.post('/categories', ...requireAdmin, validate(category), async (req, res, next) => {
  try {
    res.status(201).json({ data: await CategoryModel.create(req.body) });
  } catch (error) {
    next(error);
  }
});
apiRouter.put(
  '/categories/:id',
  ...requireAdmin,
  validate(category.partial()),
  async (req, res, next) => {
    try {
      const item = await CategoryModel.findByIdAndUpdate(req.params.id, req.body, { new: true });
      if (!item)
        return res
          .status(404)
          .json({ error: { code: 'NOT_FOUND', message: 'Category not found' } });
      res.json({ data: item });
    } catch (error) {
      next(error);
    }
  },
);
apiRouter.delete('/categories/:id', ...requireAdmin, async (req, res, next) => {
  try {
    const item = await CategoryModel.findById(req.params.id);
    if (!item)
      return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Category not found' } });
    const products = await MenuItemModel.countDocuments({
      category: item._id,
      archived: { $ne: true },
    });
    if (products)
      return res.status(409).json({
        error: {
          code: 'CATEGORY_IN_USE',
          message: `Reassign or archive ${products} menu item(s) before archiving this category.`,
        },
      });
    item.archived = true;
    item.isActive = false;
    await item.save();
    res.status(204).end();
  } catch (error) {
    next(error);
  }
});

apiRouter.get('/hero-slides', async (req, res, next) => {
  try {
    const now = new Date();
    const isAdmin = req.query.admin === 'true' && Boolean(req.header('authorization'));
    res.json({
      data: await HeroSlideModel.find(
        isAdmin
          ? {}
          : {
              isActive: true,
              archived: { $ne: true },
              $and: [
                { $or: [{ startsAt: null }, { startsAt: { $lte: now } }] },
                { $or: [{ endsAt: null }, { endsAt: { $gte: now } }] },
              ],
            },
      ).sort('displayOrder createdAt'),
    });
  } catch (error) {
    next(error);
  }
});
apiRouter.post('/hero-slides', ...requireAdmin, validate(heroSlide), async (req, res, next) => {
  try {
    res.status(201).json({ data: await HeroSlideModel.create(req.body) });
  } catch (error) {
    next(error);
  }
});
apiRouter.put(
  '/hero-slides/:id',
  ...requireAdmin,
  validate(heroSlide.partial()),
  async (req, res, next) => {
    try {
      const item = await HeroSlideModel.findByIdAndUpdate(req.params.id, req.body, { new: true });
      if (!item)
        return res
          .status(404)
          .json({ error: { code: 'NOT_FOUND', message: 'Hero slide not found' } });
      res.json({ data: item });
    } catch (error) {
      next(error);
    }
  },
);
apiRouter.delete('/hero-slides/:id', ...requireAdmin, async (req, res, next) => {
  try {
    const item = await HeroSlideModel.findByIdAndUpdate(
      req.params.id,
      { archived: true, isActive: false },
      { new: true },
    );
    if (!item)
      return res
        .status(404)
        .json({ error: { code: 'NOT_FOUND', message: 'Hero slide not found' } });
    res.status(204).end();
  } catch (error) {
    next(error);
  }
});

apiRouter.get('/locations', async (req, res, next) => {
  try {
    const admin = req.query.admin === 'true' && Boolean(req.header('authorization'));
    res.json({
      data: await LocationModel.find(
        admin ? {} : { isActive: true, isAvailable: true, archived: { $ne: true } },
      ).sort('displayOrder name'),
    });
  } catch (error) {
    next(error);
  }
});
apiRouter.post('/locations', ...requireAdmin, validate(location), async (req, res, next) => {
  try {
    res.status(201).json({ data: await LocationModel.create(req.body) });
  } catch (error) {
    next(error);
  }
});
apiRouter.put(
  '/locations/:id',
  ...requireAdmin,
  validate(location.partial()),
  async (req, res, next) => {
    try {
      const item = await LocationModel.findByIdAndUpdate(req.params.id, req.body, { new: true });
      if (!item)
        return res
          .status(404)
          .json({ error: { code: 'NOT_FOUND', message: 'Location not found' } });
      res.json({ data: item });
    } catch (error) {
      next(error);
    }
  },
);
apiRouter.delete('/locations/:id', ...requireAdmin, async (req, res, next) => {
  try {
    const item = await LocationModel.findByIdAndUpdate(
      req.params.id,
      { archived: true, isActive: false, isAvailable: false },
      { new: true },
    );
    if (!item)
      return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Location not found' } });
    res.status(204).end();
  } catch (error) {
    next(error);
  }
});

apiRouter.get('/delivery-settings', async (_req, res, next) => {
  try {
    const settings =
      (await DeliverySettingsModel.findOne()) ??
      (await DeliverySettingsModel.create({
        defaultDeliveryCharge: env.deliveryFee,
        minimumOrder: 0,
        deliveryEnabled: true,
        pickupEnabled: false,
      }));
    res.json({ data: settings });
  } catch (error) {
    next(error);
  }
});
apiRouter.put(
  '/delivery-settings',
  ...requireAdmin,
  validate(deliverySettings),
  async (req, res, next) => {
    try {
      const settings = await DeliverySettingsModel.findOneAndUpdate({}, req.body, {
        upsert: true,
        new: true,
        setDefaultsOnInsert: true,
      });
      res.json({ data: settings });
    } catch (error) {
      next(error);
    }
  },
);

const activeDealFilter = (locationId?: string) => {
  const now = new Date();
  return {
    isActive: true,
    archived: { $ne: true },
    ...(locationId ? { $or: [{ locationIds: { $size: 0 } }, { locationIds: locationId }] } : {}),
    $and: [
      { $or: [{ startsAt: null }, { startsAt: { $lte: now } }] },
      { $or: [{ endsAt: null }, { endsAt: { $gte: now } }] },
    ],
  };
};
apiRouter.get('/deals', async (req, res, next) => {
  try {
    const admin = req.query.admin === 'true' && Boolean(req.header('authorization'));
    res.json({
      data: await DealModel.find(
        admin
          ? {}
          : activeDealFilter(
              typeof req.query.location === 'string' ? req.query.location : undefined,
            ),
      )
        .populate('includedItems.item')
        .sort('displayOrder name'),
    });
  } catch (error) {
    next(error);
  }
});
apiRouter.post('/deals', ...requireAdmin, validate(deal), async (req, res, next) => {
  try {
    res.status(201).json({ data: await DealModel.create(req.body) });
  } catch (error) {
    next(error);
  }
});
apiRouter.put('/deals/:id', ...requireAdmin, validate(deal.partial()), async (req, res, next) => {
  try {
    const item = await DealModel.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!item)
      return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Deal not found' } });
    res.json({ data: item });
  } catch (error) {
    next(error);
  }
});
apiRouter.delete('/deals/:id', ...requireAdmin, async (req, res, next) => {
  try {
    const item = await DealModel.findByIdAndUpdate(
      req.params.id,
      { archived: true, isActive: false },
      { new: true },
    );
    if (!item)
      return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Deal not found' } });
    res.status(204).end();
  } catch (error) {
    next(error);
  }
});

apiRouter.get('/menu/search', async (req, res, next) => {
  try {
    const query = String(req.query.q ?? '').trim();
    if (!query) return res.json({ data: { products: [], deals: [] } });
    const regex = new RegExp(query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
    const location = typeof req.query.location === 'string' ? req.query.location : undefined;
    const products = await MenuItemModel.find({
      isActive: { $ne: false },
      archived: { $ne: true },
      isAvailable: true,
      stockStatus: { $ne: 'out-of-stock' },
      ...(location ? { $or: [{ locationIds: { $size: 0 } }, { locationIds: location }] } : {}),
      $or: [{ name: regex }, { description: regex }, { tags: regex }],
    })
      .populate('category')
      .limit(24);
    const deals = await DealModel.find({
      ...activeDealFilter(location),
      $or: [{ name: regex }, { description: regex }],
    }).limit(12);
    res.json({ data: { products, deals } });
  } catch (error) {
    next(error);
  }
});
apiRouter.get('/menu', async (req, res, next) => {
  try {
    const location = typeof req.query.location === 'string' ? req.query.location : undefined;
    const filter = {
      isActive: { $ne: false },
      archived: { $ne: true },
      isAvailable: true,
      stockStatus: { $ne: 'out-of-stock' },
      ...(req.query.category ? { category: req.query.category } : {}),
      ...(location ? { $or: [{ locationIds: { $size: 0 } }, { locationIds: location }] } : {}),
    };
    res.json({
      data: await MenuItemModel.find(filter).populate('category').sort('displayOrder name'),
    });
  } catch (error) {
    next(error);
  }
});
apiRouter.get('/menu/:id', async (req, res, next) => {
  try {
    const item = await MenuItemModel.findOne({
      _id: req.params.id,
      isActive: { $ne: false },
      archived: { $ne: true },
    }).populate('category');
    if (!item)
      return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Menu item not found' } });
    res.json({ data: item });
  } catch (error) {
    next(error);
  }
});
apiRouter.post('/menu', ...requireAdmin, validate(menu), async (req, res, next) => {
  try {
    const categoryRecord = await CategoryModel.findOne({
      _id: req.body.category,
      isActive: { $ne: false },
      archived: { $ne: true },
    });
    if (!categoryRecord)
      return res.status(422).json({
        error: {
          code: 'INVALID_CATEGORY',
          message: 'Select an active category before saving this product.',
        },
      });
    res.status(201).json({ data: await MenuItemModel.create(req.body) });
  } catch (error) {
    next(error);
  }
});
apiRouter.put('/menu/:id', ...requireAdmin, validate(menu.partial()), async (req, res, next) => {
  try {
    if (req.body.category) {
      const categoryRecord = await CategoryModel.findOne({
        _id: req.body.category,
        isActive: { $ne: false },
        archived: { $ne: true },
      });
      if (!categoryRecord)
        return res.status(422).json({
          error: {
            code: 'INVALID_CATEGORY',
            message: 'Select an active category before saving this product.',
          },
        });
    }
    const item = await MenuItemModel.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!item)
      return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Menu item not found' } });
    res.json({ data: item });
  } catch (error) {
    next(error);
  }
});
apiRouter.delete('/menu/:id', ...requireAdmin, async (req, res, next) => {
  try {
    const item = await MenuItemModel.findByIdAndUpdate(
      req.params.id,
      { archived: true, isActive: false, isAvailable: false },
      { new: true },
    );
    if (!item)
      return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Menu item not found' } });
    res.status(204).end();
  } catch (error) {
    next(error);
  }
});

apiRouter.post('/orders', requireAuth, validate(order), async (req, res, next) => {
  try {
    const checkoutId = req.header('idempotency-key');
    if (checkoutId && !/^[a-zA-Z0-9-]{16,128}$/.test(checkoutId))
      return res.status(400).json({
        error: { code: 'INVALID_IDEMPOTENCY_KEY', message: 'Invalid checkout request key' },
      });
    if (checkoutId) {
      const existing = await OrderModel.findOne({ checkoutId, user: req.user!.id });
      if (existing) return res.json({ data: existing });
    }
    const checkout = req.body as CheckoutBody;
    const requestedIds = checkout.items.map((line: CheckoutLine) => line.item);
    const menuItems = await MenuItemModel.find({
      _id: { $in: requestedIds },
      isAvailable: true,
      isActive: { $ne: false },
      archived: { $ne: true },
      ...(env.integrationEnabled ? { externalId: { $exists: true, $ne: '' } } : {}),
    });
    if (menuItems.length !== new Set(requestedIds).size)
      return res.status(400).json({
        error: {
          code: 'UNAVAILABLE_ITEM',
          message: 'One or more menu items are unavailable or no longer exist',
        },
      });
    const byId = new Map(menuItems.map((item) => [item._id.toString(), item]));
    const lines = checkout.items.map((line: CheckoutLine) => ({
      item: byId.get(line.item)!._id,
      quantity: line.quantity,
      customizations: line.customizations,
      unitPrice: byId.get(line.item)!.price,
    }));
    const subtotal = lines.reduce((sum: number, line) => sum + line.unitPrice * line.quantity, 0);
    const settings = (await DeliverySettingsModel.findOne()) ?? {
      defaultDeliveryCharge: env.deliveryFee,
      minimumOrder: 0,
      freeDeliveryThreshold: undefined as number | undefined,
      deliveryEnabled: true,
      pickupEnabled: false,
    };
    const location = checkout.locationId
      ? await LocationModel.findOne({
          _id: checkout.locationId,
          isActive: true,
          isAvailable: true,
          archived: { $ne: true },
        })
      : null;
    if (checkout.locationId && !location)
      return res.status(400).json({
        error: {
          code: 'INVALID_LOCATION',
          message: 'Select an active location before placing your order.',
        },
      });
    if (checkout.fulfillmentType === 'delivery' && !settings.deliveryEnabled)
      return res.status(400).json({
        error: { code: 'DELIVERY_DISABLED', message: 'Delivery is not currently available.' },
      });
    if (checkout.fulfillmentType === 'pickup' && !settings.pickupEnabled)
      return res.status(400).json({
        error: { code: 'PICKUP_DISABLED', message: 'Pickup is not currently available.' },
      });
    const minimumOrder = location?.minimumOrder ?? settings.minimumOrder;
    if (checkout.fulfillmentType === 'delivery' && subtotal < minimumOrder)
      return res.status(400).json({
        error: { code: 'MINIMUM_ORDER', message: `Minimum order is Rs. ${minimumOrder}.` },
      });
    const areaCharge = location?.deliveryAreas.find(
      (area) => area.isActive && area.name.toLowerCase() === checkout.deliveryArea.toLowerCase(),
    )?.deliveryCharge;
    let deliveryFee =
      checkout.fulfillmentType === 'pickup'
        ? 0
        : (areaCharge ?? location?.deliveryCharge ?? settings.defaultDeliveryCharge);
    const freeAt = location?.freeDeliveryThreshold ?? settings.freeDeliveryThreshold;
    if (freeAt != null && subtotal >= freeAt) deliveryFee = 0;
    const total = subtotal + deliveryFee + Math.round(subtotal * env.taxRate);
    const created = await OrderModel.create({
      user: req.user!.id,
      items: lines,
      subtotal,
      deliveryFee,
      total,
      deliveryAddress: checkout.deliveryAddress,
      deliveryArea: checkout.deliveryArea,
      paymentMethod: checkout.paymentMethod,
      externalOrderId: randomUUID(),
      ...(checkoutId ? { checkoutId } : {}),
      integrationOrigin: 'website',
      statusHistory: [{ status: 'New' }],
    });
    // This application has no online-payment confirmation integration. Only COD is fulfilment-confirmed and therefore delivered to POS.
    if (env.integrationEnabled && checkout.paymentMethod === 'Cash on Delivery')
      await createOrderOutboxEvent(created._id.toString());
    return res.status(201).json({ data: created });
  } catch (error) {
    next(error);
  }
});
apiRouter.get('/orders', requireAuth, async (req, res, next) => {
  try {
    const filter =
      req.user!.role === 'admin'
        ? req.query.status
          ? { status: req.query.status }
          : {}
        : { user: req.user!.id };
    res.json({
      data: await OrderModel.find(filter)
        .sort('-createdAt')
        .populate('user')
        .populate('items.item'),
    });
  } catch (error) {
    next(error);
  }
});
apiRouter.get('/orders/:id', requireAuth, async (req, res, next) => {
  try {
    const item = await OrderModel.findById(req.params.id).populate('items.item user');
    if (!item)
      return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Order not found' } });
    if (req.user!.role !== 'admin' && item.user._id.toString() !== req.user!.id)
      return res.status(403).json({
        error: { code: 'FORBIDDEN', message: 'You do not have permission to access this order' },
      });
    res.json({ data: item });
  } catch (error) {
    next(error);
  }
});
apiRouter.patch('/orders/:id/status', ...requireAdmin, validate(status), async (req, res, next) => {
  try {
    const item = await OrderModel.findByIdAndUpdate(
      req.params.id,
      {
        $set: { status: req.body.status },
        $push: { statusHistory: { status: req.body.status, note: req.body.note } },
      },
      { new: true },
    );
    if (!item)
      return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Order not found' } });
    res.json({ data: item });
  } catch (error) {
    next(error);
  }
});

apiRouter.get('/integration/health', ...requireAdmin, async (_req, res, next) => {
  try {
    res.json({ data: await integrationHealth() });
  } catch (error) {
    next(error);
  }
});
apiRouter.get('/integration/outbox/:eventId', ...requireAdmin, async (req, res, next) => {
  try {
    const event = await IntegrationOutboxEventModel.findOne({
      eventId: String(req.params.eventId),
    });
    if (!event)
      return res
        .status(404)
        .json({ error: { code: 'NOT_FOUND', message: 'Integration event not found' } });
    res.json({ data: event });
  } catch (error) {
    next(error);
  }
});
apiRouter.post('/integration/outbox/retry', ...requireAdmin, async (_req, res, next) => {
  try {
    res.json({ data: { retried: await retryOutboxEvent() } });
  } catch (error) {
    next(error);
  }
});
apiRouter.post('/integration/outbox/:eventId/retry', ...requireAdmin, async (req, res, next) => {
  try {
    res.json({ data: { retried: await retryOutboxEvent(String(req.params.eventId)) } });
  } catch (error) {
    next(error);
  }
});

apiRouter.get('/users', ...requireAdmin, async (_req, res, next) => {
  try {
    res.json({
      data: await UserModel.find().select('name phone email role createdAt').sort('-createdAt'),
    });
  } catch (error) {
    next(error);
  }
});
