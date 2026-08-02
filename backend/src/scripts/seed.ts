import mongoose from 'mongoose';
import { connectDatabase } from '../config/database';
import { env } from '../config/env';
import { CategoryModel } from '../models/category.model';
import { MenuItemModel } from '../models/menu-item.model';
import { OrderModel } from '../models/order.model';
import { UserModel } from '../models/user.model';

const images = [
  'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=1200&q=85',
  'https://images.unsplash.com/photo-1512058564366-18510be2db19?auto=format&fit=crop&w=1200&q=85',
  'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=1200&q=85',
  'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?auto=format&fit=crop&w=1200&q=85',
  'https://images.unsplash.com/photo-1585032226651-759b368d7246?auto=format&fit=crop&w=1200&q=85',
  'https://images.unsplash.com/photo-1532550907401-a500c9a57435?auto=format&fit=crop&w=1200&q=85',
];

async function seed(): Promise<void> {
  if (!env.mongoUri) throw new Error('MONGODB_URI is required to seed Orange data.');
  await connectDatabase();
  const categories = await Promise.all(['Fast Food', 'Chinese Food', 'BBQ'].map((name, displayOrder) => CategoryModel.findOneAndUpdate({ name }, { name, displayOrder }, { upsert: true, new: true, setDefaultsOnInsert: true })));
  const byName = Object.fromEntries(categories.map((category) => [category.name, category._id]));
  const items = [
    ['Mighty Zinger', 'Classic crispy burger with cheese and signature sauce.', 650, 'Fast Food', images[0]],
    ['Masala Fries', 'Thick-cut fries tossed in Orange Karachi street masala.', 320, 'Fast Food', images[3]],
    ['Spicy Wings (6pc)', 'Crispy chicken wings with a hot and tangy glaze.', 550, 'Fast Food', images[0]],
    ['Chicken Chow Mein', 'Wok-tossed noodles with chicken and crunchy vegetables.', 790, 'Chinese Food', images[1]],
    ['Chicken Manchurian', 'Crispy chicken in a sweet, spicy Indo-Chinese sauce.', 950, 'Chinese Food', images[4]],
    ['Egg Fried Rice', 'Fragrant rice, egg, spring vegetables and soy.', 550, 'Chinese Food', images[1]],
    ['Orange Special Platter', 'Mixed grill with signature spices, naan and chutney.', 2450, 'BBQ', images[2]],
    ['Beef Seekh Kabab', 'Four tender, spiced beef skewers with mint chutney.', 890, 'BBQ', images[5]],
    ['Chicken Malai Boti', 'Creamy charcoal-grilled boneless chicken skewers.', 980, 'BBQ', images[2]],
  ] as const;
  const menuItems = await Promise.all(items.map(([name, description, price, category, imageUrl], index) => MenuItemModel.findOneAndUpdate({ name }, { name, description, price, category: byName[category], imageUrl, addOns: index === 0 ? [{ name: 'Extra cheese', price: 120 }, { name: 'Loaded fries', price: 180 }] : [], isAvailable: true, spiceLevel: category === 'BBQ' ? 'medium' : 'hot' }, { upsert: true, new: true, setDefaultsOnInsert: true })));
  const admin = await UserModel.findOneAndUpdate({ phone: '+923001234567' }, { name: 'Orange Admin', phone: '+923001234567', email: 'admin@orange.pk', role: 'admin', addresses: [] }, { upsert: true, new: true, setDefaultsOnInsert: true });
  const customer = await UserModel.findOneAndUpdate({ phone: '+923111234567' }, { name: 'Ahmed Khan', phone: '+923111234567', email: 'ahmed@example.com', role: 'customer', addresses: [{ label: 'Home', line1: '12C Sunset Boulevard', area: 'DHA Phase 2', city: 'Karachi', instructions: 'Ring the bell' }] }, { upsert: true, new: true, setDefaultsOnInsert: true });
  const existingOrder = await OrderModel.exists({ user: customer._id });
  if (!existingOrder) await OrderModel.create({ user: customer._id, items: [{ item: menuItems[0]._id, quantity: 2, unitPrice: menuItems[0].price, customizations: ['Extra cheese'] }, { item: menuItems[6]._id, quantity: 1, unitPrice: menuItems[6].price, customizations: [] }], subtotal: 3750, deliveryFee: 99, total: 3849, deliveryAddress: '12C Sunset Boulevard, DHA Phase 2, Karachi', paymentMethod: 'Cash on Delivery', status: 'Preparing', statusHistory: [{ status: 'New', at: new Date(Date.now() - 20 * 60 * 1000) }, { status: 'Preparing', at: new Date(Date.now() - 8 * 60 * 1000) }] });
  console.info(`Seed complete: ${categories.length} categories, ${menuItems.length} menu items, admin ${admin.phone}, customer ${customer.phone}.`);
}

seed().catch((error: unknown) => { console.error(error); process.exitCode = 1; }).finally(async () => { await mongoose.disconnect(); });
