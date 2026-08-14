'use client';

import axios from 'axios';
import { useAuthStore } from '@/lib/store/authStore';

export const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:5000/api',
  withCredentials: true,
});

apiClient.interceptors.request.use((config) => {
  const token = useAuthStore.getState().accessToken;
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && typeof window !== 'undefined') {
      useAuthStore.getState().logout();
      if (!window.location.pathname.startsWith('/login') && !window.location.pathname.startsWith('/signup')) window.location.assign('/login');
    }
    return Promise.reject(error);
  },
);

export type ApiCategory = { _id: string; name: string; displayOrder: number };
export type ApiHeroSlide = { _id: string; title: string; highlightedText: string; subtitle: string; imageUrl: string; ctaLabel: string; isActive: boolean; displayOrder: number };
export type ApiMenuItem = { _id: string; name: string; description: string; price: number; imageUrl: string; isAvailable: boolean; spiceLevel: string; category: ApiCategory | string; addOns: { name: string; price: number }[] };
export type ApiUser = { id?: string; _id?: string; name: string; phone: string; email?: string; role: 'customer' | 'admin' };
export type ApiOrder = { _id: string; status: 'New' | 'Preparing' | 'Out for Delivery' | 'Delivered' | 'Cancelled'; subtotal: number; deliveryFee: number; total: number; deliveryAddress: string; deliveryArea: string; paymentMethod: string; createdAt: string; user: ApiUser | string; items: { item: ApiMenuItem | string; quantity: number; unitPrice: number; customizations: string[] }[]; statusHistory: { status: string; at: string; note?: string }[] };
export const apiError = (error: unknown) => axios.isAxiosError(error) ? error.response?.data?.error?.message ?? 'Something went wrong. Please try again.' : 'Something went wrong. Please try again.';
