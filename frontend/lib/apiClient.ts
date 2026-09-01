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
      if (
        !window.location.pathname.startsWith('/login') &&
        !window.location.pathname.startsWith('/signup')
      )
        window.location.assign('/login');
    }
    return Promise.reject(error);
  },
);

export type ApiCategory = {
  _id: string;
  name: string;
  displayOrder: number;
  slug?: string;
  description?: string;
  imageUrl?: string;
  featured?: boolean;
  isActive?: boolean;
  archived?: boolean;
};
export type ApiHeroSlide = {
  _id: string;
  title: string;
  highlightedText: string;
  subtitle: string;
  imageUrl: string;
  mobileImageUrl?: string;
  ctaLabel: string;
  ctaTarget?: string;
  isActive: boolean;
  displayOrder: number;
};
export type ApiMenuItem = {
  _id: string;
  name: string;
  description: string;
  price: number;
  discountedPrice?: number;
  imageUrl: string;
  isAvailable: boolean;
  spiceLevel: string;
  category: ApiCategory | string | null;
  addOns: { name: string; price: number }[];
  tags?: string[];
  featured?: boolean;
  locationIds?: string[];
  stockStatus?: string;
};
export type ApiLocation = {
  _id: string;
  name: string;
  address: string;
  contactNumber: string;
  openingTime: string;
  closingTime: string;
  deliveryAreas: { name: string; deliveryCharge?: number; isActive: boolean }[];
  minimumOrder: number;
  deliveryCharge?: number;
  freeDeliveryThreshold?: number;
  estimatedDeliveryTime: string;
  isActive: boolean;
  isAvailable: boolean;
  displayOrder: number;
};
export type ApiDeal = {
  _id: string;
  name: string;
  description: string;
  imageUrl: string;
  price: number;
  originalPrice?: number;
  featured: boolean;
  isActive: boolean;
  displayOrder: number;
  includedItems: { item: ApiMenuItem | string; quantity: number }[];
};
export type ApiUser = {
  id?: string;
  _id?: string;
  name: string;
  phone: string;
  email?: string;
  role: 'customer' | 'admin';
};
export type ApiOrder = {
  _id: string;
  status: 'New' | 'Preparing' | 'Out for Delivery' | 'Delivered' | 'Cancelled';
  subtotal: number;
  deliveryFee: number;
  total: number;
  deliveryAddress: string;
  deliveryArea: string;
  paymentMethod: string;
  createdAt: string;
  user: ApiUser | string;
  items: {
    item: ApiMenuItem | string;
    quantity: number;
    unitPrice: number;
    customizations: string[];
  }[];
  statusHistory: { status: string; at: string; note?: string }[];
};
export const apiError = (error: unknown) =>
  axios.isAxiosError(error)
    ? (error.response?.data?.error?.message ?? 'Something went wrong. Please try again.')
    : 'Something went wrong. Please try again.';
