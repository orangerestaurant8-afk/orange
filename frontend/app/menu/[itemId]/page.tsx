'use client';

import { useParams, useRouter } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import { apiClient, apiError, type ApiMenuItem } from '@/lib/apiClient';
import { useCartStore } from '@/lib/store/cartStore';
import { CustomerFooter, CustomerNavBar } from '@/components/ui';

const icon = (name: string, className = '') => <span className={`material-symbols-outlined ${className}`}>{name}</span>;
type Flyer = { startX: number; startY: number; distanceX: number; distanceY: number; flying: boolean };

export default function ItemDetailPage() {
  const { itemId } = useParams<{ itemId: string }>();
  const router = useRouter();
  const add = useCartStore((state) => state.add);
  const [item, setItem] = useState<ApiMenuItem | null>(null);
  const [error, setError] = useState('');
  const [size, setSize] = useState<'regular' | 'large'>('regular');
  const [spice, setSpice] = useState('medium');
  const [extras, setExtras] = useState<string[]>([]);
  const [quantity, setQuantity] = useState(1);
  const [flyer, setFlyer] = useState<Flyer | null>(null);
  const [addedNotice, setAddedNotice] = useState(false);

  useEffect(() => {
    apiClient.get(`/menu/${itemId}`).then((response) => setItem(response.data.data)).catch((requestError) => setError(apiError(requestError)));
  }, [itemId]);

  const extrasList = useMemo(() => item?.addOns?.length ? item.addOns : [
    { name: 'Extra Cheese Slice', price: 60 }, { name: 'Fried Egg', price: 80 }, { name: 'Beef Bacon Strips', price: 120 },
  ], [item]);
  const total = useMemo(() => {
    if (!item) return 0;
    const extrasTotal = extrasList.filter((extra) => extras.includes(extra.name)).reduce((sum, extra) => sum + extra.price, 0);
    return (item.price + (size === 'large' ? 150 : 0) + extrasTotal) * quantity;
  }, [item, extras, extrasList, quantity, size]);

  const addToCart = (event: React.MouseEvent<HTMLButtonElement>) => {
    if (!item) return;
    Array.from({ length: quantity }).forEach(() => add(item));
    setAddedNotice(true);
    const source = event.currentTarget.getBoundingClientRect();
    const destination = document.querySelector('[aria-label="Cart"]')?.getBoundingClientRect();
    if (destination) {
      const startX = source.left + source.width / 2;
      const startY = source.top + source.height / 2;
      const endX = destination.left + destination.width / 2;
      const endY = destination.top + destination.height / 2;
      setFlyer({ startX, startY, distanceX: endX - startX, distanceY: endY - startY, flying: false });
      requestAnimationFrame(() => setFlyer((current) => current ? { ...current, flying: true } : null));
      window.setTimeout(() => setFlyer(null), 720);
    }
    window.setTimeout(() => setAddedNotice(false), 2200);
  };
  const toggleExtra = (name: string) => setExtras((selected) => selected.includes(name) ? selected.filter((entry) => entry !== name) : [...selected, name]);

  if (error) return <main className="grid min-h-screen place-items-center bg-neutral-canvas p-6 text-danger">{error}</main>;
  if (!item) return <main className="min-h-screen bg-neutral-canvas p-6"><div className="mx-auto h-[620px] max-w-7xl animate-pulse rounded-2xl bg-neutral-soft" /></main>;

  const price = (value: number, desktop = false) => `${desktop ? 'PKR' : 'Rs.'} ${value.toLocaleString('en-PK')}`;
  const mainImage = item.imageUrl;

  return <main className="min-h-screen bg-[#f9f9ff] text-neutral-ink">
    <CustomerNavBar fixed />

    <section className="relative mt-16 md:hidden">
      <img src={mainImage} alt={item.name} className="h-[353px] w-full object-cover" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/35 to-transparent" />
      <div className="absolute inset-x-0 top-0 flex items-center justify-between p-4">
        <button onClick={() => router.back()} aria-label="Go back" className="grid size-10 place-items-center rounded-full bg-white/85 shadow-sm">{icon('arrow_back')}</button>
        <div className="flex gap-2"><button aria-label="Favourite" className="grid size-10 place-items-center rounded-full bg-white/85 shadow-sm">{icon('favorite')}</button><button aria-label="Share" className="grid size-10 place-items-center rounded-full bg-white/85 shadow-sm">{icon('share')}</button></div>
      </div>
    </section>

    <div className="mx-auto max-w-[1280px] md:mt-20 md:grid md:grid-cols-12 md:gap-10 md:px-5 md:py-16">
      <section className="hidden md:col-span-8 md:block">
        <div className="group relative aspect-[4/3] overflow-hidden rounded-xl shadow-overlay"><img src={mainImage} alt={item.name} className="size-full object-cover transition-transform duration-700 ease-out group-hover:scale-110" /><span className="absolute left-4 top-4 inline-flex items-center gap-2 rounded-full bg-orange-800 px-6 py-3 text-[16px] font-semibold text-white">{icon('local_fire_department', 'text-[19px]')}Bestseller</span></div>
        <div className="mt-7 grid max-w-[670px] grid-cols-3 gap-4">
          {[0, 1].map((index) => <button key={index} className={`group aspect-square overflow-hidden rounded-lg border ${index === 0 ? 'border-2 border-orange-800' : 'border-[#e0c0b1]'}`}><img src={mainImage} alt="Product view" className="size-full object-cover transition-transform duration-500 ease-out group-hover:scale-110" /></button>)}
          <button className="flex aspect-square flex-col items-center justify-center rounded-lg border border-[#e0c0b1] bg-[#f0f3ff] text-neutral-copy">{icon('play_circle', 'text-[28px]')}<span className="text-[10px]">Video</span></button>
        </div>
      </section>

      <section className="relative -mt-8 z-10 min-h-[600px] rounded-t-[32px] border-t border-[#e0c0b1]/30 bg-[#f9f9ff] px-6 pb-36 pt-3 shadow-2xl md:col-span-4 md:mt-0 md:min-h-0 md:rounded-none md:border-0 md:bg-transparent md:p-0 md:shadow-none">
        <div className="mx-auto mb-6 h-1.5 w-12 rounded-full bg-[#e0c0b1]/50 md:hidden" />
        <div className="flex items-start justify-between gap-3">
          <div><h1 className="font-display text-[24px] font-semibold leading-8 md:text-[36px] md:font-bold md:leading-10">{item.name}</h1><p className="mt-2 hidden text-[14px] text-neutral-copy md:block">From Orange Classic Kitchens</p><div className="mt-2 flex items-center gap-2 md:hidden">{icon('star', 'text-orange-800')}<span className="text-[14px] font-semibold">4.8 (1.2k+ reviews)</span></div></div>
          <div className="text-right"><strong className="font-display text-[20px] text-orange-800"><span className="md:hidden">{price(item.price)}</span><span className="hidden md:inline">{price(item.price, true)}</span></strong><p className="text-[14px] text-neutral-copy md:hidden">Incl. taxes</p><div className="mt-2 hidden items-center justify-end gap-1 md:flex">{icon('star', 'text-[16px] text-orange-800')}<b className="text-sm">4.8</b><span className="text-sm text-neutral-warm">(250+)</span></div></div>
        </div>
        <p className="mt-5 text-[16px] leading-[27px] text-neutral-copy md:border-b md:border-[#e0c0b1]/40 md:pb-11">{item.description || 'The ultimate challenge for your hunger. Two oversized, hand-breaded spicy Zinger fillets, double melted cheese, spicy mayo, and fresh veggies in our signature brioche bun.'}</p>

        <div className="mt-10 space-y-10 md:mt-11 md:space-y-11">
          <section><div className="mb-4 flex items-center justify-between"><h2 className="font-display text-[21px] font-semibold md:text-[16px]">Select Size</h2><span className="rounded bg-[#e2e8f8] px-2 py-0.5 text-[14px] text-neutral-copy md:hidden">Required</span></div><div className="grid grid-cols-2 gap-4"><Option selected={size === 'regular'} onClick={() => setSize('regular')} mobileText="Regular" desktopText="Standard" detail="Standard Fit" /><Option selected={size === 'large'} onClick={() => setSize('large')} mobileText="Large" desktopText="Large" detail="+ Rs. 150" /></div></section>
          <section><h2 className="mb-4 font-display text-[21px] font-semibold md:text-[16px]">Spice Level</h2><div className="flex gap-2 md:grid md:grid-cols-3 md:gap-4">{['mild', 'medium', 'hot'].map((level) => <button key={level} onClick={() => setSpice(level)} className={`min-w-[82px] flex-1 rounded-full border border-[#e0c0b1] px-4 py-3 text-[15px] capitalize transition md:rounded-xl md:py-4 ${spice === level ? (level === 'medium' ? 'border-neutral-ink bg-neutral-ink text-white' : 'bg-[#ffdbca] text-orange-900') : ''}`}>{level}{level === 'hot' && ' 🔥'}</button>)}</div></section>
          <section><h2 className="mb-4 font-display text-[21px] font-semibold md:text-[16px]"><span className="md:hidden">Add Extras</span><span className="hidden md:inline">Add-ons</span></h2><div className="space-y-2">{extrasList.map((extra, index) => <label key={extra.name} className="flex cursor-pointer items-center justify-between rounded-xl border border-transparent bg-[#f0f3ff] p-4 md:border-[#e0c0b1] md:bg-transparent"><div className="flex items-center gap-4">{icon(index === 1 ? 'egg' : index === 2 ? 'layers' : 'drive_file_rename', 'text-neutral-copy')}<div><p className="font-semibold text-[14px] md:text-[16px]">{extra.name}</p><p className="text-[14px] text-neutral-copy md:hidden">Rs. {extra.price}</p></div></div><div className="flex items-center gap-5"><span className="hidden text-orange-800 md:block">+PKR {extra.price}</span><input type="checkbox" checked={extras.includes(extra.name)} onChange={() => toggleExtra(extra.name)} className="size-6 rounded border-[#e0c0b1] text-orange-800 focus:ring-orange-500" /></div></label>)}</div></section>
          <section><h2 className="mb-4 font-display text-[21px] font-semibold md:text-[16px]">Special Instructions</h2><textarea placeholder="E.g. No mayo, extra napkins please..." className="min-h-[100px] w-full rounded-xl border border-[#e0c0b1] bg-white p-6 text-[16px] text-neutral-copy outline-none focus:border-orange-800" /></section>
          <section className="hidden items-center gap-5 md:flex"><span className="font-semibold">Quantity</span><Stepper quantity={quantity} setQuantity={setQuantity} /></section>
        </div>
      </section>
    </div>

    <CustomerFooter />
    {flyer && <span aria-hidden className="pointer-events-none fixed z-[70] grid size-11 place-items-center rounded-full bg-orange-500 text-white shadow-lg" style={{ left: flyer.startX, top: flyer.startY, transform: flyer.flying ? `translate(calc(-50% + ${flyer.distanceX}px), calc(-50% + ${flyer.distanceY}px)) scale(.45)` : 'translate(-50%, -50%) scale(1)', opacity: flyer.flying ? 0.35 : 1, transition: 'transform 680ms cubic-bezier(.2,.8,.25,1), opacity 680ms ease-in' }}>{icon('shopping_bag', 'text-[22px]')}</span>}
    {addedNotice && <div role="status" className="fixed bottom-24 left-1/2 z-[60] -translate-x-1/2 rounded-full bg-neutral-ink px-5 py-3 text-sm font-semibold text-white shadow-menu">Added to cart</div>}
    <div className="fixed inset-x-0 bottom-0 z-50 border-t border-neutral-border/30 bg-white p-4 shadow-header"><div className="mx-auto flex max-w-[1280px] items-center justify-between gap-6"><div className="hidden md:block"><p className="text-xs font-semibold uppercase tracking-wider text-neutral-copy">Total Amount</p><strong className="font-display text-[23px] text-orange-800">{price(total, true)}</strong></div><div className="md:hidden"><Stepper quantity={quantity} setQuantity={setQuantity} /></div><button onClick={addToCart} className="flex min-h-[64px] flex-1 items-center justify-between rounded-xl bg-orange-500 px-7 font-display text-[17px] font-semibold text-white shadow-lg transition hover:brightness-105 active:scale-[.98] md:max-w-[345px] md:justify-center md:gap-6 md:bg-orange-800">{icon('shopping_bag', 'hidden md:inline')}<span>Add to Cart</span><span className="md:hidden">{price(total)}</span></button></div></div>
  </main>;
}

function Option({ selected, onClick, mobileText, desktopText, detail }: { selected: boolean; onClick: () => void; mobileText: string; desktopText: string; detail: string }) {
  return <button onClick={onClick} className={`min-h-[100px] rounded-xl border px-3 text-center transition ${selected ? 'border-orange-800 bg-orange-200/30' : 'border-[#e0c0b1]'}`}><span className="font-semibold md:hidden">{mobileText}</span><span className="hidden md:inline">{desktopText}</span><span className="mt-2 block text-[14px] text-neutral-copy">{detail}</span></button>;
}

function Stepper({ quantity, setQuantity }: { quantity: number; setQuantity: (value: number) => void }) {
  return <div className="flex items-center rounded-full bg-[#e2e8f8] px-1 py-1"><button aria-label="Decrease quantity" onClick={() => setQuantity(Math.max(1, quantity - 1))} className="grid size-10 place-items-center">−</button><span className="w-8 text-center font-semibold">{quantity}</span><button aria-label="Increase quantity" onClick={() => setQuantity(quantity + 1)} className="grid size-10 place-items-center text-[27px] font-light">+</button></div>;
}
