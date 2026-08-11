'use client';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { ApiMenuItem } from '@/lib/apiClient';
export type CartItem = ApiMenuItem & { quantity: number };
type CartState = { items: CartItem[]; add: (dish: ApiMenuItem) => void; update: (id: string, quantity: number) => void; remove: (id: string) => void; clear: () => void };
export const useCartStore = create<CartState>()(persist((set) => ({ items: [], add: (dish) => { if (!dish.isAvailable) return; set((s) => { const found=s.items.find(i=>i._id===dish._id); return { items: found ? s.items.map(i=>i._id===dish._id?{...i,quantity:i.quantity+1}:i) : [...s.items,{...dish,quantity:1}]}; }); }, update:(id,quantity)=>set(s=>({items:quantity<1?s.items.filter(i=>i._id!==id):s.items.map(i=>i._id===id?{...i,quantity}:i)})), remove:(id)=>set(s=>({items:s.items.filter(i=>i._id!==id)})), clear:()=>set({items:[]}) }), { name: 'orange-cart' }));
