'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { apiClient, apiError, type ApiOrder } from '@/lib/apiClient';

const money = (value: number) => `PKR ${Math.round(value).toLocaleString('en-PK')}`;
const icon = (name: string) => <span className="material-symbols-outlined">{name}</span>;

export default function AdminDashboard() {
  const [orders, setOrders] = useState<ApiOrder[]>([]);
  const [error, setError] = useState('');
  useEffect(() => {
    apiClient
      .get('/orders')
      .then((response) => setOrders(response.data.data))
      .catch((requestError) => setError(apiError(requestError)));
  }, []);
  const stats = useMemo(() => {
    const revenue = orders.reduce((sum, order) => sum + order.total, 0);
    return [
      { label: "Today's Revenue", value: money(revenue), trend: '+12%', icon: 'payments' },
      { label: 'Orders', value: String(orders.length), trend: '+8%', icon: 'shopping_bag' },
      {
        label: 'Avg. Order Value',
        value: money(orders.length ? revenue / orders.length : 0),
        trend: '-2%',
        icon: 'analytics',
      },
      {
        label: 'New Customers',
        value: String(
          new Set(
            orders.map((order) =>
              typeof order.user === 'string' ? order.user : (order.user.id ?? order.user._id),
            ),
          ).size,
        ),
        trend: '+24%',
        icon: 'person_add',
      },
    ];
  }, [orders]);
  const categories = useMemo(() => {
    const totals = new Map<string, number>();
    orders
      .flatMap((order) => order.items)
      .forEach((line) => {
        const name =
          typeof line.item === 'string'
            ? 'Other'
            : typeof line.item.category === 'string'
              ? 'Other'
              : (line.item.category?.name ?? 'Uncategorized');
        totals.set(name, (totals.get(name) ?? 0) + line.quantity);
      });
    const entries = Array.from(totals.entries());
    const total = entries.reduce((sum, [, value]) => sum + value, 0) || 1;
    return entries
      .slice(0, 3)
      .map(([name, value]) => ({ name, percent: Math.round((value / total) * 100) }));
  }, [orders]);
  return (
    <div>
      {error ? (
        <p className="rounded-lg bg-danger/10 p-4 text-danger">{error}</p>
      ) : !orders.length ? (
        <div className="h-56 animate-pulse rounded-2xl bg-admin-surface" />
      ) : (
        <>
          <div className="mb-7 flex items-center justify-between">
            <div>
              <h1 className="font-display text-[29px] font-semibold text-admin-text md:hidden">
                Today&apos;s Overview
              </h1>
              <p className="text-admin-muted md:hidden">Performance across all categories</p>
            </div>
            <span className="hidden rounded-xl border border-admin-border bg-admin-surface px-5 py-3 text-admin-text md:block">
              {icon('calendar_month')} <span className="ml-2">This week</span>
            </span>
          </div>
          <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {stats.map((stat) => (
              <article
                key={stat.label}
                className="rounded-2xl border border-admin-border bg-admin-raised p-5"
              >
                <div className="flex justify-between">
                  <span className="grid size-12 place-items-center rounded-xl bg-orange-500/15 text-orange-500">
                    {icon(stat.icon)}
                  </span>
                  <b className={stat.trend.startsWith('-') ? 'text-danger' : 'text-success'}>
                    {stat.trend}
                  </b>
                </div>
                <p className="mt-5 text-sm font-semibold uppercase tracking-wide text-admin-muted">
                  {stat.label}
                </p>
                <p className="mt-2 font-display text-[27px] text-admin-text">{stat.value}</p>
              </article>
            ))}
          </section>
          <section className="mt-7 grid gap-7 xl:grid-cols-[minmax(0,2fr)_minmax(300px,1fr)]">
            <article className="rounded-2xl border border-admin-border bg-admin-raised p-6">
              <div className="flex items-center justify-between">
                <h2 className="font-display text-[24px] text-admin-text">Revenue over time</h2>
                <span className="text-sm text-orange-500">Last 7 days</span>
              </div>
              <div className="relative mt-10 h-52 overflow-hidden">
                <div className="absolute inset-x-0 bottom-8 h-px bg-admin-border" />
                <svg
                  className="size-full"
                  viewBox="0 0 700 220"
                  preserveAspectRatio="none"
                  aria-label="Revenue trend"
                >
                  <defs>
                    <linearGradient id="revenue" x1="0" x2="0" y1="0" y2="1">
                      <stop offset="0" stopColor="#f97316" stopOpacity=".35" />
                      <stop offset="1" stopColor="#f97316" stopOpacity="0" />
                    </linearGradient>
                  </defs>
                  <path
                    d="M0 190 C80 185 100 170 150 120 S240 105 300 80 S420 130 500 75 S620 110 700 30 L700 220 L0 220Z"
                    fill="url(#revenue)"
                  />
                  <path
                    d="M0 190 C80 185 100 170 150 120 S240 105 300 80 S420 130 500 75 S620 110 700 30"
                    fill="none"
                    stroke="#f97316"
                    strokeWidth="4"
                  />
                </svg>
              </div>
            </article>
            <article className="rounded-2xl border border-admin-border bg-admin-raised p-6">
              <h2 className="font-display text-[24px] text-admin-text">Orders by category</h2>
              <div className="mt-10 space-y-7">
                {categories.map((category, index) => (
                  <div key={category.name}>
                    <div className="flex justify-between font-semibold text-admin-text">
                      <span>{category.name}</span>
                      <span className="text-orange-500">{category.percent}%</span>
                    </div>
                    <div className="mt-3 h-3 overflow-hidden rounded-full bg-admin-border">
                      <div
                        className={`h-full rounded-full ${index === 0 ? 'bg-orange-500' : index === 1 ? 'bg-[#bdc7d9]' : 'bg-[#e9e1d8]'}`}
                        style={{ width: `${category.percent}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </article>
          </section>
          <section className="mt-7 overflow-hidden rounded-2xl border border-admin-border bg-admin-raised">
            <div className="flex items-center justify-between border-b border-admin-border p-6">
              <h2 className="font-display text-[24px] text-admin-text">Recent Orders</h2>
              <Link href="/admin/orders" className="font-semibold text-orange-500">
                View All Orders →
              </Link>
            </div>
            {orders.slice(0, 5).map((order) => (
              <div
                key={order._id}
                className="flex items-center justify-between gap-4 border-b border-admin-border px-6 py-5 last:border-0"
              >
                <span>
                  <b className="block text-admin-text">#ORD-{order._id.slice(-4).toUpperCase()}</b>
                  <small className="text-admin-muted">
                    {typeof order.user === 'string' ? 'Customer' : order.user.name}
                  </small>
                </span>
                <b className="text-admin-text">{money(order.total)}</b>
                <span className="rounded-full bg-orange-500/15 px-3 py-1 text-sm font-semibold text-orange-500">
                  {order.status}
                </span>
              </div>
            ))}
          </section>
        </>
      )}
    </div>
  );
}
