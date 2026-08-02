'use client';

import { useEffect, useMemo, useState } from 'react';
import { useParams } from 'next/navigation';
import { CustomerNavBar } from '@/components/ui';
import { apiClient, apiError, type ApiOrder } from '@/lib/apiClient';

const statusCopy = {
  New: { title: 'Order received', detail: 'The restaurant has received your order.', icon: 'receipt_long', minutes: 40 },
  Preparing: { title: 'Preparing your meal', detail: 'Your food is being prepared now.', icon: 'restaurant', minutes: 25 },
  'Out for Delivery': { title: 'On the way', detail: 'Your rider is heading to your location.', icon: 'two_wheeler', minutes: 10 },
  Delivered: { title: 'Delivered', detail: 'Your order has been delivered. Enjoy your meal!', icon: 'check_circle', minutes: 0 },
  Cancelled: { title: 'Order cancelled', detail: 'This order was cancelled.', icon: 'cancel', minutes: 0 },
} as const;

const icon = (name: string, classes = '') => <span className={`material-symbols-outlined ${classes}`}>{name}</span>;

export default function TrackOrder() {
  const { orderId } = useParams<{ orderId: string }>();
  const [order, setOrder] = useState<ApiOrder | null>(null);
  const [error, setError] = useState('');
  const [now, setNow] = useState(Date.now());

  useEffect(() => { apiClient.get(`/orders/${orderId}`).then((response) => setOrder(response.data.data)).catch((requestError) => setError(apiError(requestError))); }, [orderId]);
  useEffect(() => { const timer = window.setInterval(() => setNow(Date.now()), 1000); return () => window.clearInterval(timer); }, []);

  const countdown = useMemo(() => {
    if (!order) return 0;
    const current = statusCopy[order.status];
    if (!current.minutes) return 0;
    const started = new Date(order.statusHistory.at(-1)?.at ?? order.createdAt).getTime();
    return Math.max(0, Math.ceil((started + current.minutes * 60_000 - now) / 1000));
  }, [now, order]);

  if (error) return <main className="min-h-screen bg-neutral-canvas"><CustomerNavBar /><p className="mx-auto mt-16 max-w-md rounded-xl bg-danger/10 p-4 text-danger">{error}</p></main>;

  const current = order ? statusCopy[order.status] : null;
  const time = `${String(Math.floor(countdown / 60)).padStart(2, '0')}:${String(countdown % 60).padStart(2, '0')}`;

  return <main className="min-h-screen bg-neutral-canvas text-neutral-ink"><CustomerNavBar /><section className="mx-auto flex min-h-[calc(100vh-80px)] max-w-md items-center px-5 py-12"><div className="w-full rounded-2xl border border-neutral-border/70 bg-white p-8 text-center shadow-float sm:p-10">{!order || !current ? <div className="mx-auto h-64 animate-pulse rounded-xl bg-neutral-soft" /> : <><span className="mx-auto grid size-16 place-items-center rounded-full bg-orange-100/40 text-orange-800">{icon(current.icon, 'text-[32px]')}</span><p className="mt-6 text-sm font-semibold uppercase tracking-[0.16em] text-orange-800">Current status</p><h1 className="mt-2 font-display text-[28px] font-semibold">{current.title}</h1><p className="mx-auto mt-3 max-w-xs text-neutral-copy">{current.detail}</p>{current.minutes > 0 ? <div className="mt-10 rounded-xl bg-[#f0f3ff] px-6 py-7"><p className="text-sm font-semibold uppercase tracking-wide text-neutral-copy">Estimated arrival</p><p className="mt-2 font-display text-[48px] font-semibold tracking-tight text-orange-800" aria-label={`${Math.floor(countdown / 60)} minutes and ${countdown % 60} seconds remaining`}>{time}</p><p className="mt-2 text-sm text-neutral-copy">minutes remaining</p></div> : <div className="mt-10 rounded-xl bg-[#f0f3ff] px-6 py-7"><p className="font-display text-[22px] font-semibold text-orange-800">{order.status === 'Delivered' ? 'Complete' : 'No active countdown'}</p></div>}</>}</div></section></main>;
}
