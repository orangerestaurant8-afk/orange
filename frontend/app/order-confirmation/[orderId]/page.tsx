'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { apiClient, type ApiOrder } from '@/lib/apiClient';
import { CustomerFooter, CustomerNavBar } from '@/components/ui';

const money = (value: number) => `Rs. ${value.toLocaleString('en-PK')}`;
const icon = (name: string, classes = '') => <span className={`material-symbols-outlined ${classes}`}>{name}</span>;
const confetti = [
  { left: '7%', top: '18%', delay: '0s', color: '#f97316', size: 10 }, { left: '15%', top: '30%', delay: '.7s', color: '#9d4300', size: 7 },
  { left: '25%', top: '70%', delay: '1.3s', color: '#ffb690', size: 9 }, { left: '72%', top: '17%', delay: '.3s', color: '#f97316', size: 8 },
  { left: '86%', top: '37%', delay: '1.7s', color: '#9d4300', size: 10 }, { left: '91%', top: '73%', delay: '1s', color: '#ffdbca', size: 7 },
  { left: '35%', top: '89%', delay: '2s', color: '#f97316', size: 8 }, { left: '61%', top: '91%', delay: '1.1s', color: '#ffb690', size: 9 },
];

export default function Confirmation({ params }: { params: { orderId: string } }) {
  const [order, setOrder] = useState<ApiOrder | null>(null);

  useEffect(() => { apiClient.get(`/orders/${params.orderId}`).then((response) => setOrder(response.data.data)).catch(() => undefined); }, [params.orderId]);

  const displayOrder = useMemo(() => `#OR-${params.orderId.slice(-6).toUpperCase()}`, [params.orderId]);
  const items = order?.items ?? [];
  const estimatedArrival = '35–45 mins';

  return <main className="min-h-screen overflow-hidden bg-[#f9f9ff] text-neutral-ink">
    <div className="hidden md:block"><CustomerNavBar /></div>
    <header className="fixed inset-x-0 top-0 z-30 flex h-16 items-center border-b border-neutral-border/40 bg-[#f9f9ff] px-5 md:hidden"><Link href="/" aria-label="Back to home" className="grid size-10 place-items-center">{icon('close', 'text-[27px]')}</Link><h1 className="ml-3 font-display text-[25px] font-semibold">Order Confirmed</h1></header>

    <div aria-hidden className="success-confetti">{confetti.map((piece, index) => <span key={index} className="success-confetti-piece" style={{ left: piece.left, top: piece.top, animationDelay: piece.delay, backgroundColor: piece.color, width: piece.size, height: piece.size }} />)}</div>

    <section className="relative mx-auto flex min-h-[calc(100vh-80px)] max-w-[1280px] items-center justify-center px-5 py-24 md:min-h-[calc(100vh-80px)] md:py-16">
      <div className="success-desktop-card hidden w-full max-w-[640px] overflow-hidden rounded-2xl bg-white shadow-menu md:block">
        <div className="bg-gradient-to-b from-orange-100/30 to-white px-12 pb-8 pt-12 text-center">
          <SuccessMark desktop />
          <h2 className="mt-7 font-display text-[29px] font-semibold">Order Placed Successfully!</h2>
          <p className="mx-auto mt-3 max-w-[500px] text-[17px] leading-7 text-neutral-copy">Thank you for choosing Orange. We&apos;ve received your order and the restaurant is preparing it.</p>
        </div>
        <div className="border-b border-[#e0c0b1]/35 px-12 pb-8"><div className="grid grid-cols-2 rounded-xl bg-[#f0f3ff] px-5 py-5"><div><p className="text-sm font-semibold text-neutral-warm">Order Number</p><p className="mt-1 font-display text-[18px] font-semibold">{displayOrder}</p></div><div className="text-right"><p className="text-sm font-semibold text-neutral-warm">Estimated Arrival</p><p className="mt-1 font-display text-[18px] font-semibold text-orange-800">{estimatedArrival}</p></div></div></div>
        <DesktopSummary items={items} subtotal={order?.subtotal ?? 0} delivery={order?.deliveryFee ?? 0} total={order?.total ?? 0} />
        <div className="px-12 pb-10"><Link href={`/orders/${params.orderId}/track`} className="flex h-14 items-center justify-center gap-3 rounded-xl bg-orange-500 font-semibold text-white shadow-float transition hover:bg-orange-800">{icon('local_shipping', 'text-[21px]')}Track Order</Link><Link href="/" className="mt-6 block text-center font-semibold text-neutral-copy transition hover:text-orange-800">Back to Home</Link></div>
      </div>

      <div className="w-full max-w-md pt-10 md:hidden">
        <div className="text-center"><SuccessMark /><h2 className="mt-12 font-display text-[38px] font-bold leading-[1.15] text-orange-800">Thank you for your<br />order!</h2><p className="mt-6 text-[18px] text-neutral-copy">Order {displayOrder}</p></div>
        <div className="mt-14 rounded-2xl border border-[#e0c0b1]/50 bg-white p-5 shadow-card"><div className="flex items-center gap-4"><span className="grid size-[76px] shrink-0 place-items-center rounded-xl bg-orange-100/40 text-orange-800">{icon('restaurant', 'text-[31px]')}</span><div><h3 className="font-display text-[18px] font-semibold">Preparing your meal</h3><p className="mt-1 text-[16px] leading-6 text-neutral-copy">Your food is being prepared and will arrive in <b className="text-orange-800">{estimatedArrival}</b>.</p></div></div></div>
        <div className="mt-14 rounded-2xl border border-dashed border-[#e0c0b1] bg-[#f0f3ff] p-6"><h3 className="text-[16px] font-semibold uppercase tracking-wide text-neutral-copy">Order Summary</h3><MobileSummary items={items} total={order?.total ?? 0} /></div>
      </div>
    </section>

    <footer className="hidden md:block"><CustomerFooter /></footer>
    <div className="fixed inset-x-0 bottom-0 z-30 border-t border-neutral-border/40 bg-white/95 px-8 pb-8 pt-5 shadow-header backdrop-blur md:hidden"><div className="mx-auto max-w-md"><Link href={`/orders/${params.orderId}/track`} className="flex h-[58px] items-center justify-center rounded-xl bg-orange-500 font-display text-[18px] font-semibold text-white shadow-float">Track Order</Link><Link href="/" className="mt-6 block text-center font-semibold text-orange-800">Back to Home</Link></div></div>
    <style jsx global>{`
      .success-desktop-card { animation: success-card-enter .55s cubic-bezier(.2,.8,.2,1) both; }
      .success-mark { animation: success-mark-pop .6s .14s cubic-bezier(.18,.89,.32,1.28) both; }
      .success-ring { animation: success-ring-pulse 2.8s .6s ease-in-out infinite; }
      .success-confetti { pointer-events:none; position:fixed; inset:0; z-index:10; overflow:hidden; }
      .success-confetti-piece { position:absolute; display:block; border-radius:2px; opacity:.9; animation: success-confetti-fall 7s linear infinite; }
      @keyframes success-card-enter { from { opacity:0; transform:translateY(24px) scale(.98); } to { opacity:1; transform:translateY(0) scale(1); } }
      @keyframes success-mark-pop { from { opacity:0; transform:scale(.35) rotate(-12deg); } to { opacity:1; transform:scale(1) rotate(0); } }
      @keyframes success-ring-pulse { 0%,100% { transform:scale(.92); opacity:.65; } 50% { transform:scale(1.04); opacity:.32; } }
      @keyframes success-confetti-fall { 0% { transform:translateY(-12vh) rotate(0); opacity:0; } 10% { opacity:.9; } 90% { opacity:.9; } 100% { transform:translateY(108vh) rotate(520deg); opacity:0; } }
      @media (prefers-reduced-motion: reduce) { .success-desktop-card,.success-mark,.success-ring,.success-confetti-piece { animation:none; } }
    `}</style>
  </main>;
}

function SuccessMark({ desktop = false }: { desktop?: boolean }) { return <div className={`relative mx-auto grid place-items-center ${desktop ? 'size-20' : 'size-[250px]'}`}><div className={`${desktop ? 'hidden' : 'success-ring absolute inset-0 rounded-full bg-[#eaded9]'}`} /><div className={`${desktop ? 'size-20' : 'success-mark relative size-[170px]'} grid place-items-center rounded-full bg-orange-500 text-white shadow-float`}><span className="material-symbols-outlined" style={{ fontSize: desktop ? 48 : 78, fontVariationSettings: "'FILL' 1" }}>{desktop ? 'check_circle' : 'check'}</span></div></div>; }

function itemName(item: ApiOrder['items'][number]) { return typeof item.item === 'string' ? 'Menu item' : item.item.name; }

function DesktopSummary({ items, subtotal, delivery, total }: { items: ApiOrder['items']; subtotal: number; delivery: number; total: number }) { return <div className="px-12 py-8"><h3 className="text-[16px] font-semibold uppercase tracking-wide text-neutral-copy">Order Summary</h3><div className="mt-5 space-y-4">{items.map((item, index) => <div key={index} className="flex items-center justify-between gap-4"><div className="flex min-w-0 items-center gap-3"><span className="rounded-md bg-orange-100/35 px-2 py-1 text-sm font-semibold text-orange-800">{item.quantity}x</span><span className="truncate text-[17px]">{itemName(item)}</span></div><b className="font-display text-[19px]">{money(item.unitPrice * item.quantity)}</b></div>)}</div><div className="mt-5 space-y-3 border-t border-[#e0c0b1]/45 pt-5 text-[16px]"><SummaryLine label="Subtotal" value={money(subtotal)} /><SummaryLine label="Delivery Fee" value={money(delivery)} /><SummaryLine label="Total" value={money(total)} total /></div></div>; }

function MobileSummary({ items, total }: { items: ApiOrder['items']; total: number }) { return <><div className="mt-6 space-y-4">{items.map((item, index) => <div key={index} className="flex justify-between gap-4 text-[17px]"><span>{item.quantity}x {itemName(item)}</span><span>{money(item.unitPrice * item.quantity)}</span></div>)}</div><div className="mt-6 border-t border-[#e0c0b1]/50 pt-5"><SummaryLine label="Total" value={money(total)} total /></div></>; }

function SummaryLine({ label, value, total = false }: { label: string; value: string; total?: boolean }) { return <div className={`flex items-center justify-between ${total ? 'font-display text-[24px] font-semibold text-neutral-ink' : 'text-neutral-copy'}`}><span>{label}</span><span className={total ? 'text-orange-800' : ''}>{value}</span></div>; }
