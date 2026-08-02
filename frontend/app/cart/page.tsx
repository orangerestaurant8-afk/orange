'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useCartStore } from '@/lib/store/cartStore';
import { CustomerFooter, CustomerNavBar } from '@/components/ui';

const icon = (name: string, classes = '') => <span className={`material-symbols-outlined ${classes}`}>{name}</span>;
const money = (amount: number) => `Rs. ${amount.toLocaleString('en-PK')}`;

export default function CartPage() {
  const router = useRouter();
  const { items, update, remove } = useCartStore();
  const [summaryOpen, setSummaryOpen] = useState(true);
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const delivery = items.length ? 99 : 0;
  const platform = items.length ? 20 : 0;
  const tax = Math.round(subtotal * 0.16);
  const mobileTotal = subtotal + delivery + platform + tax;
  const desktopTotal = subtotal + delivery + tax;

  return <main className="min-h-screen bg-[#f9f9ff] pb-40 text-neutral-ink md:pb-0">
    <CustomerNavBar />
    <div className="mx-auto max-w-[1240px] px-5 py-6 md:px-6 md:py-8">
      <section className="mb-6 flex items-center justify-between"><h1 className="font-display text-[26px] font-semibold md:text-[28px]">Your Cart</h1><span className="rounded-full bg-[#e7eefe] px-4 py-1.5 text-[14px] text-neutral-copy">{itemCount} Items</span></section>
      <MobileAddress />
      {items.length ? <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
        <section className="space-y-4">{items.map((item) => <CartItem key={item._id} item={item} onUpdate={(next) => update(item._id, next)} onRemove={() => remove(item._id)} />)}</section>
        <DesktopSummary subtotal={subtotal} delivery={delivery} tax={tax} total={desktopTotal} disabled={!items.length} />
      </div> : <EmptyCart />}
      {items.length && <MobileSummary open={summaryOpen} onToggle={() => setSummaryOpen((open) => !open)} subtotal={subtotal} delivery={delivery} platform={platform} tax={tax} total={mobileTotal} />}
    </div>
    <CustomerFooter />
    {items.length && <MobileCheckout total={mobileTotal} />}
  </main>;
}

function DesktopHeader({ itemCount }: { itemCount: number }) {
  return <header className="fixed inset-x-0 top-0 z-40 hidden h-[72px] border-b border-neutral-border/30 bg-[#f9f9ff] shadow-card md:block"><div className="mx-auto flex h-full max-w-[1540px] items-center justify-between px-7"><div className="flex items-center gap-7"><Link href="/" className="font-display text-[29px] font-bold text-orange-800">Orange</Link><nav className="flex gap-5 text-[19px] text-neutral-copy"><a className="border-b-2 border-orange-800 px-2 py-2 font-semibold text-orange-800">Karachi</a><a className="px-2 py-2">Lahore</a><a className="px-2 py-2">Islamabad</a></nav></div><div className="flex items-center gap-5 text-neutral-copy">{icon('search', 'text-[27px]')}<Link href="/cart" aria-label="Cart" className="relative grid size-11 place-items-center rounded-full bg-orange-200/50 text-orange-800">{icon('shopping_cart', 'text-[27px]')}<span className="absolute -right-1 -top-1 grid size-4 place-items-center rounded-full bg-orange-800 text-[9px] text-white">{itemCount}</span></Link>{icon('notifications', 'text-[26px]')}<Link href="/profile" className="grid size-11 place-items-center rounded-full border-2 border-orange-200 bg-orange-100 font-semibold text-orange-900">U</Link></div></div></header>;
}

function MobileHeader({ onBack }: { onBack: () => void }) {
  return <header className="fixed inset-x-0 top-0 z-40 flex h-20 items-center justify-between bg-[#f9f9ff] px-7 shadow-card md:hidden"><div className="flex items-center gap-6"><button onClick={onBack} aria-label="Go back">{icon('arrow_back', 'text-[28px] text-neutral-copy')}</button><h1 className="font-display text-[29px] font-bold text-orange-800">Cart</h1></div><div className="flex items-center gap-5 text-orange-800">{icon('notifications', 'text-[26px]')}<Link href="/profile" className="grid size-10 place-items-center rounded-full border-2 border-orange-500 bg-orange-100 font-semibold">U</Link></div></header>;
}

function MobileAddress() { return <section className="mb-5 flex items-center justify-between rounded-xl border border-[#e0c0b1]/45 bg-white px-4 py-3.5 md:hidden"><div className="flex items-center gap-3">{icon('location_on', 'text-[23px] text-orange-800')}<div><p className="font-semibold">Delivery to Home</p><p className="mt-0.5 text-[14px] text-neutral-copy">DHA Phase 6, Karachi</p></div></div><button className="text-sm font-semibold text-orange-800">Change</button></section>; }

function CartItem({ item, onUpdate, onRemove }: { item: { _id: string; name: string; description: string; price: number; imageUrl: string; quantity: number }; onUpdate: (quantity: number) => void; onRemove: () => void }) {
  return <article className="flex gap-4 rounded-xl border border-[#e0c0b1]/20 bg-white p-4 shadow-card md:items-center"><img src={item.imageUrl} alt={item.name} className="size-24 shrink-0 rounded-lg object-cover md:size-[104px]" /><div className="flex min-w-0 flex-1 flex-col justify-between self-stretch"><div className="flex justify-between gap-3"><div><h2 className="font-display text-[20px] font-semibold leading-6 md:text-[21px]">{item.name}</h2><p className="mt-1 line-clamp-2 text-[14px] leading-5 text-neutral-copy">{item.description || 'Freshly prepared for you'}</p></div><button onClick={onRemove} aria-label={`Remove ${item.name}`} className="text-neutral-copy hover:text-danger md:pr-1">{icon('close', 'text-[18px] md:hidden')}{icon('delete', 'hidden text-[22px] md:inline')}</button></div><div className="mt-2 flex items-center justify-between"><strong className="font-display text-[20px] text-orange-800 md:text-[21px]">{money(item.price * item.quantity)}</strong><Stepper quantity={item.quantity} onChange={onUpdate} /></div></div></article>;
}

function Stepper({ quantity, onChange }: { quantity: number; onChange: (next: number) => void }) { return <div className="flex items-center rounded-lg border border-[#e0c0b1] bg-[#f0f3ff] px-0.5 py-0.5"><button aria-label="Decrease quantity" onClick={() => onChange(Math.max(1, quantity - 1))} className="grid size-8 place-items-center text-[22px] font-light">−</button><span className="w-7 text-center text-[14px]">{quantity}</span><button aria-label="Increase quantity" onClick={() => onChange(quantity + 1)} className="grid size-8 place-items-center text-[22px] font-light">+</button></div>; }

function DesktopSummary({ subtotal, delivery, tax, total, disabled }: { subtotal: number; delivery: number; tax: number; total: number; disabled: boolean }) { return <aside className="hidden h-fit rounded-xl border border-[#d6e0f3] bg-white p-6 shadow-float lg:block"><h2 className="font-display text-[27px] font-semibold">Order Summary</h2><div className="mt-6 space-y-4 text-[17px] text-neutral-copy"><SummaryRow label="Subtotal" value={money(subtotal)} /><SummaryRow label="Delivery Fee" value={money(delivery)} /><SummaryRow label="GST (Tax)" value={money(tax)} /><div className="border-t border-[#dce2f3] pt-4"><SummaryRow label="Total Amount" value={money(total)} strong /></div></div><div className="mt-8"><label className="mb-2 block font-semibold">Promo Code</label><div className="flex gap-2"><input placeholder="Enter code" className="min-w-0 flex-1 rounded-lg border border-[#e0c0b1] px-4 py-3 text-[16px] outline-none focus:border-orange-800" /><button className="rounded-lg bg-[#d6e0f3] px-5 text-[16px] text-neutral-copy">Apply</button></div></div><Link href={disabled ? '#' : '/checkout'} className={`mt-8 flex h-[72px] items-center justify-center rounded-xl bg-orange-500 text-[18px] text-white shadow-lg ${disabled ? 'pointer-events-none opacity-50' : 'hover:brightness-105'}`}>Proceed to Checkout</Link><p className="mt-4 flex justify-center gap-2 text-[14px] text-neutral-copy">{icon('verified_user', 'text-[18px]')}Secure Payment Gateway</p><div className="mt-8 flex gap-3 rounded-lg border border-[#a09a91]/30 bg-[#e9e1d8] p-4 text-[14px] text-neutral-copy">{icon('info', 'text-[24px] text-neutral-ink')}<p>Add Rs. 200 more to unlock <b>Free Delivery</b> for this order!</p></div></aside>; }

function MobileSummary({ open, onToggle, subtotal, delivery, platform, tax, total }: { open: boolean; onToggle: () => void; subtotal: number; delivery: number; platform: number; tax: number; total: number }) { return <section className="mt-20 border-t border-[#e0c0b1]/50 pt-4 md:hidden"><button onClick={onToggle} className="flex w-full items-center justify-between py-2"><h2 className="font-display text-[25px] font-semibold">Order Summary</h2>{icon(open ? 'expand_less' : 'expand_more', 'text-[28px]')}</button>{open && <div className="mt-5 space-y-4 text-[19px] text-neutral-copy"><SummaryRow label="Subtotal" value={money(subtotal)} /><SummaryRow label="Delivery Fee" value={money(delivery)} /><SummaryRow label="Platform Fee" value={money(platform)} /><SummaryRow label="Taxes (GST)" value={money(tax)} /><div className="border-t border-dashed border-[#e0c0b1] pt-5"><SummaryRow label="Total" value={money(total)} strong /></div></div>}</section>; }

function SummaryRow({ label, value, strong = false }: { label: string; value: string; strong?: boolean }) { return <div className={`flex items-center justify-between ${strong ? 'font-display text-[21px] font-semibold text-neutral-ink' : ''}`}><span>{label}</span><span className={strong ? 'text-orange-800' : ''}>{value}</span></div>; }

function MobileCheckout({ total }: { total: number }) { return <Link href="/checkout" className="fixed inset-x-5 bottom-4 z-40 flex h-20 items-center justify-between rounded-xl bg-orange-500 px-5 text-white shadow-menu md:hidden"><div><span className="text-[13px]">Total Price</span><strong className="block font-display text-[21px]">{money(total)}</strong></div><div className="flex items-center gap-2 font-display text-[19px] font-semibold">Checkout {icon('chevron_right', 'text-[24px]')}</div></Link>; }

function MobileBottomNav() { return <nav className="fixed inset-x-0 bottom-0 z-40 flex h-16 items-center justify-around rounded-t-xl bg-white shadow-header md:hidden"><Link href="/" className="flex flex-col items-center text-neutral-copy">{icon('home')}<span>Home</span></Link><Link href="/menu" className="flex flex-col items-center text-neutral-copy">{icon('search')}<span>Search</span></Link><Link href="/profile/orders" className="flex flex-col items-center rounded-xl bg-orange-500 px-4 py-1 text-orange-900">{icon('receipt_long')}<span>Orders</span></Link><Link href="/profile" className="flex flex-col items-center text-neutral-copy">{icon('person')}<span>Profile</span></Link></nav>; }

function EmptyCart() { return <section className="rounded-2xl bg-white p-12 text-center shadow-card"><p className="text-lg text-neutral-copy">Your cart is empty.</p><Link href="/menu" className="mt-5 inline-flex rounded-xl bg-orange-500 px-6 py-3 font-semibold text-white">Browse menu</Link></section>; }

function DesktopFooter() { return <footer className="mt-32 hidden bg-[#f0f3ff] py-14 text-center text-neutral-copy md:block"><h2 className="font-display text-[26px] text-orange-800">Orange Food Pakistan</h2><div className="mt-8 flex justify-center gap-8 underline"><a>About Us</a><a>Terms of Service</a><a>Privacy Policy</a><a>Contact Support</a></div><p className="mt-9">© 2024 Orange Food Pakistan. All rights reserved.</p></footer>; }
