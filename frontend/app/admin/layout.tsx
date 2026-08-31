'use client';

import { useEffect, useRef, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { AdminMobileNav, AdminSidebar, Toast } from '@/components/ui';
import { apiClient, type ApiOrder } from '@/lib/apiClient';
import { useAuthStore } from '@/lib/store/authStore';

function OrderAlerts() {
  const seenOrderIds = useRef<Set<string> | null>(null);
  const [notice, setNotice] = useState('');
  useEffect(() => {
    let active = true;
    const checkForNewOrders = async () => {
      try {
        const response = await apiClient.get('/orders?status=New');
        const newOrders = response.data.data as ApiOrder[];
        const currentIds = new Set(newOrders.map((order) => order._id));
        if (seenOrderIds.current) {
          const arriving = newOrders.filter((order) => !seenOrderIds.current?.has(order._id));
          if (arriving.length && active) {
            const latest = arriving[0];
            setNotice(`${arriving.length === 1 ? 'New order received' : `${arriving.length} new orders received`} · ${latest.items.length} item${latest.items.length === 1 ? '' : 's'} · Rs. ${latest.total.toLocaleString('en-PK')}`);
            if ('Notification' in window && Notification.permission === 'granted') new Notification('New Orange order', { body: `Order #${latest._id.slice(-6).toUpperCase()} · Rs. ${latest.total.toLocaleString('en-PK')}` });
          }
        }
        seenOrderIds.current = currentIds;
      } catch { /* The orders page presents API errors to the admin. */ }
    };
    void checkForNewOrders();
    const timer = window.setInterval(checkForNewOrders, 15000);
    return () => { active = false; window.clearInterval(timer); };
  }, []);
  return notice ? <div className="fixed right-4 top-4 z-[100] w-[min(24rem,calc(100vw-2rem))]"><Toast message={notice} tone="info" duration={8000} onClose={() => setNotice('')} /></div> : null;
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = useAuthStore((state) => state.user); const router = useRouter(); const pathname = usePathname(); const [menuOpen, setMenuOpen] = useState(false); const isLogin = pathname === '/admin/login';
  useEffect(() => { if (isLogin) return; if (!user) router.replace('/admin/login'); else if (user.role !== 'admin') router.replace('/'); }, [isLogin, user, router]);
  if (isLogin) return <>{children}</>;
  if (!user || user.role !== 'admin') return <main className="min-h-screen bg-admin-base p-6"><div className="h-40 animate-pulse rounded-xl bg-admin-surface" /></main>;
  return <main className="min-h-screen bg-admin-base"><OrderAlerts /><div className="hidden md:fixed md:inset-y-0 md:block"><AdminSidebar /></div><div className="md:hidden"><AdminMobileNav onOpen={() => setMenuOpen(true)} /><AdminSidebar mobile open={menuOpen} onClose={() => setMenuOpen(false)} /></div><div className="md:pl-72"><header className="hidden h-20 items-center justify-between border-b border-admin-border bg-admin-surface px-8 md:flex"><span className="text-body-sm text-admin-muted">Orange management portal</span><span className="text-orange-500">Admin</span></header><div className="p-5 md:p-8">{children}</div></div></main>;
}
