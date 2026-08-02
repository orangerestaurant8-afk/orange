'use client';
import { create } from 'zustand';
import type { ApiUser } from '@/lib/apiClient';
type AuthState = { user: ApiUser | null; accessToken: string | null; setSession: (accessToken: string, user: ApiUser) => void; logout: () => void };
export const useAuthStore = create<AuthState>((set) => ({ user: null, accessToken: null, setSession: (accessToken, user) => set({ accessToken, user }), logout: () => set({ accessToken: null, user: null }) }));
