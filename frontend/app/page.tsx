'use client';

import Link from 'next/link';
import { type MouseEvent as ReactMouseEvent, useEffect, useRef, useState } from 'react';
import { CustomerFooter, CustomerNavBar } from '@/components/ui';
import { apiClient, type ApiCategory, type ApiMenuItem } from '@/lib/apiClient';
import { useCartStore } from '@/lib/store/cartStore';

const images = {
  biryani: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCngU3-Qg4bRCtgKT3eEloNGSMTY1ASiWFRP2DrTH5kenIhhG0GQAb6gxq8fBXRjTHP9Eteiu8xLE1zrZjhYIaJMEmF4a0P1KsOMJP9UoUHe0_e1y6WjWPGzMsJLyW61kdfnKrFbPkIrWgEG82nbfWTxTBGkCowq6pB9fhlWUuv3_IyranBWV9UPUtgQLke2k2t6POxvDCMNMVylbi_42fSilMwOtJqWg3_iYpdjqLrxaKcD_SF3pIGug',
  burger: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBjfj_P3cKjFDFVFvVOypnWu2WVOMCh0d4DILg60FpvMNQ6Ejs2ck3Onmv6-f3gWrTZY18fBl4NmfLz3y6NRypY5tV0yXknoIR2-PkjhLNzoUq2YWihFWckRxO5VlC7TpWdHvruvkg5e3y7Nb2skPtp_TGwPuAQkwcEndecbE_0HwI1f8wPWBdA_udXIOPuwU_Czm2_Sr_EiD48MMDR-hZBAehWAUf6tMS_p6AhSkxqf9p4c9x1jrXFYg',
  rice: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAMH5THv1wxLwUWekyQhM_H3e6JHSOLfpj9mzlDBrW0BgI9Bvy7kZwvXPWgfC4JtA4juIAvtrtBp2WlDluf_N8CgNPI47HadCC6aaQnR5Lt0YTuTOmoR83jev2ZAeuJ6TphKOWR1zGl2sjJbH3yzWfq-CqgzX5t2y3Xn0SfdpD5j16Zw4CiUjb-sESlOrkjcDTxna2dBNm_LSOgXWVnRl5ixwtIz47otWn-EcmOM3aYGrc_vgCsa_uGIw',
  bbq: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDEPnUtRUb1q8XA-LtZTfXgnuCME9LGHYMCi7ymTXWsnJomm7BBgkCefp2I8VJB0wLGU6vB1ljfkEEqLAd_CVy_MKkf2eCXWbd2NBCO4SxwmRU1Sv0Q_jvs5yBELBDbcNL1m4Wc1rwzFm1j_naFayaX4vbBPeTpI314OnJhEXs_f9ibjh8OKATF44COWr1txd8NnM_6jj-NkyJpOH73-TAT5bJdhsnNWafZm29MJpSlsTCb_fjG8LKj0w',
  kebab: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCzI0dvLdK-4L4FlkCGG0SIXOzm8bOESXncIF4Rte7elfD8MoZ5M9_XAcLXSAuq79qOjNL32h282CzLr_o0N4X6Iyp0ZKr_Xwc6WaZkqjt8OheqTEc7e8iRDJmhuN32-1BO1y7kPA6oXCRYxhnbQmexH66Vh-wJReHFcV1S3-gayQVmBufwzqwAQC2jz2aNiroz07IxnuZEbbKiVIwA8gKNFgiQzo57jCyvealAXgdP-TLIM91CH_p9qw',
  noodles: 'https://lh3.googleusercontent.com/aida-public/AB6AXuA_voPgFU1ZbmIivAtI7q_ZpNnSWZE6tj5walDb35sUZSkmF_zvBZ93iT3JPNYIrONFoApKbwszjJesfW0jJmnvisThf07umxVNFxdxrkqAPvYQdYmdYYHvzgETqWj7Tt2t3d5FS_Blksq-8ap2poFRwB8LWqrTMvsknJd6nngoCksQaotW_Vy8DmzKLYWlvfucQw2wG8dactt_E2DayuVYy78i-KeQM5jnga1VqO3K0HvQBDae0vBoNw',
};

const fallbackMenu = [
  ['Mighty Zinger', 'Classic crispy burger with cheese & mayo', 650, images.burger, 'Fast Food'],
  ['Beef Seekh Kabab', '4 pieces of tender, spiced beef skewers', 890, images.kebab, 'BBQ'],
  ['Egg Fried Rice', 'Wok-tossed rice with spring vegetables', 550, images.rice, 'Chinese Food'],
  ['Chicken Chow Mein', 'Traditional stir-fry with spicy sauce', 720, images.noodles, 'Chinese Food'],
].map(([name, description, price, imageUrl, category], index) => ({ _id: `featured-${index}`, name, description, price, imageUrl, category } as unknown as ApiMenuItem));

const categoryMeta: Record<string, { image: string; tagline: string }> = {
  'Fast Food': { image: images.burger, tagline: 'Order Burgers & More' },
  'Chinese Food': { image: images.rice, tagline: 'Pan-Asian Favorites' },
  BBQ: { image: images.bbq, tagline: 'Smoky & Grilled' },
};
const pkr = (amount: number) => `Rs ${amount.toLocaleString('en-PK')}`;
type Flyer = { startX: number; startY: number; distanceX: number; distanceY: number; flying: boolean };

declare global { interface Window { google?: any; orangeMapsPromise?: Promise<void>; } }
const isKarachi = (latitude: number, longitude: number) => latitude > 24.65 && latitude < 25.15 && longitude > 66.75 && longitude < 67.55;
function loadGoogleMaps() {
  if (window.google?.maps?.places) return Promise.resolve();
  if (window.orangeMapsPromise) return window.orangeMapsPromise;
  const key = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
  if (!key) return Promise.reject(new Error('Google Maps API key is missing.'));
  window.orangeMapsPromise = new Promise((resolve, reject) => {
    const script = document.createElement('script'); script.async = true; script.defer = true;
    script.src = `https://maps.googleapis.com/maps/api/js?key=${key}&libraries=places`;
    script.onload = () => resolve(); script.onerror = () => reject(new Error('Google Maps could not be loaded.'));
    document.head.appendChild(script);
  });
  return window.orangeMapsPromise;
}

export default function HomePage() {
  const [menu, setMenu] = useState<ApiMenuItem[]>(fallbackMenu);
  const [categories, setCategories] = useState<ApiCategory[]>([]);
  const [tab, setTab] = useState('All');
  const [notice, setNotice] = useState('');
  const [flyer, setFlyer] = useState<Flyer | null>(null);
  const [search, setSearch] = useState('');
  const [addressModalOpen, setAddressModalOpen] = useState(false);
  const [address, setAddress] = useState('Karachi, Pakistan');
  const add = useCartStore((state) => state.add);
  useEffect(() => {
    Promise.all([apiClient.get('/menu'), apiClient.get('/categories')]).then(([menuResponse, categoryResponse]) => {
      if (menuResponse.data.data?.length) setMenu(menuResponse.data.data);
      setCategories(categoryResponse.data.data ?? []);
    }).catch(() => undefined);
  }, []);
  useEffect(() => {
    const savedAddress = window.localStorage.getItem('orange-delivery-address');
    if (savedAddress) setAddress(savedAddress);
    else setAddressModalOpen(true);
  }, []);
  const flash = (item: ApiMenuItem, event: ReactMouseEvent<HTMLButtonElement>) => {
    add(item); setNotice(`${item.name} added to your cart`); window.setTimeout(() => setNotice(''), 2200);
    const source = event.currentTarget.getBoundingClientRect(); const destination = document.querySelector('[aria-label="Cart"]')?.getBoundingClientRect();
    if (!destination) return;
    const startX = source.left + source.width / 2; const startY = source.top + source.height / 2;
    const endX = destination.left + destination.width / 2; const endY = destination.top + destination.height / 2;
    setFlyer({ startX, startY, distanceX: endX - startX, distanceY: endY - startY, flying: false });
    requestAnimationFrame(() => setFlyer((current) => current ? { ...current, flying: true } : null));
    window.setTimeout(() => setFlyer(null), 720);
  };
  const visiblePicks = tab === 'All' ? menu.slice(0, 4) : menu.filter((item) => tab === 'Vegetarian' ? /rice|naan|vegetable/i.test(item.name) : item.name.length % 2 === (tab === 'Best Sellers' ? 0 : 1)).slice(0, 4);
  const searchMatches = (item: ApiMenuItem) => `${item.name} ${item.description}`.toLowerCase().includes(search.trim().toLowerCase());
  const filteredMenu = search.trim() ? menu.filter(searchMatches) : menu;

  return <main className="min-h-screen bg-neutral-canvas pb-16 text-neutral-ink md:pb-0">
    <CustomerNavBar fixed onSearch={setSearch} onLocationClick={() => setAddressModalOpen(true)} locationName="Karachi" />
    <section className="relative mt-16 h-[390px] overflow-hidden md:mt-20 md:h-[600px]">
      <img src={images.biryani} alt="Authentic Karachi biryani" className="absolute inset-0 size-full object-cover" /><div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/30 to-transparent" />
      <div className="relative mx-auto flex h-full max-w-screen-xl items-center px-5 md:px-6"><div className="max-w-xl animate-[fade-up_.7s_ease-out] text-white">
        <span className="inline-block rounded-lg bg-orange-500 px-3 py-2 text-xs font-bold">FLAT 25% OFF</span><h1 className="mt-5 font-display text-3xl font-bold leading-tight md:text-display-lg">The Most Authentic<br /><span className="text-orange-100">Karachi Flavors</span></h1><p className="mt-3 max-w-lg text-sm leading-6 text-white/90 md:text-body-lg">Experience the legendary taste of Orange. From steaming Biryanis to sizzling BBQ, we bring the heart of Karachi to your doorstep.</p><Link href="/menu" className="mt-7 inline-flex rounded-xl bg-orange-500 px-10 py-4 text-body-sm font-bold shadow-lg transition hover:-translate-y-0.5 hover:bg-orange-800">Order Now</Link>
      </div></div>
    </section>

    <section className="mx-auto max-w-screen-xl px-5 py-12 md:px-6 md:py-16"><h2 className="font-display text-heading-md font-semibold">Explore Cuisines</h2><div className="mt-6 grid gap-4 md:mt-10 md:grid-cols-3 md:gap-6">
      {(categories.length ? categories : Object.keys(categoryMeta).map((name, index) => ({ _id: name, name, displayOrder: index } as ApiCategory))).slice(0, 3).map((category) => { const meta = categoryMeta[category.name] ?? categoryMeta.BBQ; return <Link key={category._id} href={`/menu?category=${category._id}`} className="group relative h-40 overflow-hidden rounded-2xl shadow-card md:h-64"><img src={meta.image} alt={category.name} className="size-full object-cover transition duration-700 group-hover:scale-110" /><span className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent" /><span className="absolute bottom-4 left-4 text-white md:bottom-6 md:left-6"><strong className="block font-display text-heading-sm md:text-heading-md">{category.name}</strong><span className="flex items-center gap-1 text-caption md:text-body-sm">{meta.tagline} <span className="material-symbols-outlined text-sm">arrow_forward</span></span></span></Link>; })}
    </div></section>

    <section className="bg-neutral-soft py-12 md:py-16"><div className="mx-auto max-w-screen-xl px-5 md:px-6"><div className="flex items-end justify-between"><div><h2 className="font-display text-heading-md font-semibold">{search.trim() ? `Search results for “${search}”` : 'Popular Right Now'}</h2><p className="mt-1 text-body-sm text-neutral-copy">{search.trim() ? `${filteredMenu.length} item${filteredMenu.length === 1 ? '' : 's'} found` : 'Most ordered items in your area'}</p></div><Link href="/menu" className="text-body-sm font-semibold text-orange-800">See All</Link></div><div className="mt-7 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 md:mt-10 md:gap-6">{filteredMenu.slice(0, 8).map((item, index) => <FoodCard key={item._id} item={item} rating={(4.6 + (index % 4) / 10).toFixed(1)} onAdd={(event) => flash(item, event)} />)}</div>{search.trim() && !filteredMenu.length && <p className="mt-8 text-center text-body-sm text-neutral-copy">No dishes match your search. Try a cuisine or dish name.</p>}</div></section>

    <section className="mx-auto max-w-screen-xl px-5 py-12 md:px-6 md:py-16"><h2 className="font-display text-heading-md font-semibold">Top Picks</h2><div className="mt-4 flex gap-2 overflow-x-auto pb-1">{['All', 'Best Sellers', 'New Arrival', 'Vegetarian'].map((name) => <button key={name} onClick={() => setTab(name)} className={`shrink-0 rounded-full px-4 py-1.5 text-caption font-semibold transition ${tab === name ? 'bg-orange-500 text-white' : 'bg-neutral-blue text-neutral-copy hover:bg-orange-200'}`}>{name}</button>)}</div><div className="mt-7 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">{visiblePicks.map((item) => <Link key={item._id} href={`/menu/${item._id}`} className="group rounded-xl border border-orange-800/20 bg-white p-2 transition hover:-translate-y-1 hover:border-orange-500 hover:shadow-card"><div className="aspect-[16/9] overflow-hidden rounded-lg"><img src={item.imageUrl} alt={item.name} className="size-full object-cover transition duration-500 group-hover:scale-110" /></div><div className="p-1 pt-3"><h3 className="text-body-sm font-medium">{item.name}</h3><p className="mt-1 flex items-center gap-1 text-caption text-neutral-copy"><span className="material-symbols-outlined text-[12px]">schedule</span> 25-35 mins</p><div className="mt-2 flex items-center justify-between"><strong className="text-body-sm">{pkr(item.price)}</strong><span className="material-symbols-outlined text-orange-800 transition group-hover:translate-x-1">arrow_forward</span></div></div></Link>)}</div></section>
    <CustomerFooter />
    <AddressModal open={addressModalOpen} address={address} onClose={() => setAddressModalOpen(false)} onSave={(nextAddress) => { setAddress(nextAddress); window.localStorage.setItem('orange-delivery-address', nextAddress); setAddressModalOpen(false); setNotice('Delivery address saved'); window.setTimeout(() => setNotice(''), 2200); }} />
    {flyer && <span aria-hidden className="pointer-events-none fixed z-[70] grid size-10 place-items-center rounded-full bg-orange-500 text-white shadow-lg" style={{ left: flyer.startX, top: flyer.startY, transform: flyer.flying ? `translate(calc(-50% + ${flyer.distanceX}px), calc(-50% + ${flyer.distanceY}px)) scale(.45)` : 'translate(-50%, -50%) scale(1)', opacity: flyer.flying ? 0.35 : 1, transition: 'transform 680ms cubic-bezier(.2,.8,.25,1), opacity 680ms ease-in' }}><span className="material-symbols-outlined text-[20px]">shopping_bag</span></span>}
    {notice && <div className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2 rounded-full bg-neutral-ink px-5 py-3 text-body-sm font-semibold text-white shadow-menu">{notice}</div>}
  </main>;
}

function FoodCard({ item, rating, onAdd }: { item: ApiMenuItem; rating: string; onAdd: (event: ReactMouseEvent<HTMLButtonElement>) => void }) { return <article className="overflow-hidden rounded-xl bg-white shadow-card md:rounded-2xl"><Link href={`/menu/${item._id}`}><div className="relative aspect-[16/9] overflow-hidden"><img src={item.imageUrl} alt={item.name} className="size-full object-cover transition duration-500 hover:scale-105" /><span className="absolute right-3 top-3 rounded-full bg-white/90 px-2 py-1 text-caption font-semibold"><span className="text-yellow-500">★</span> {rating}</span></div></Link><div className="p-4"><h3 className="truncate font-display text-body-sm font-semibold">{item.name}</h3><p className="mt-1 truncate text-caption text-neutral-copy">{item.description}</p><div className="mt-3 flex items-center justify-between"><strong className="text-caption font-bold text-orange-800 md:text-body-sm">{pkr(item.price)}</strong><button onClick={onAdd} aria-label={`Add ${item.name} to cart`} className="grid size-9 place-items-center rounded-xl bg-orange-500 text-white transition hover:bg-orange-800 active:scale-90"><span className="material-symbols-outlined text-[20px]">add</span></button></div></div></article>; }
function AddressModal({ open, address, onClose, onSave }: { open: boolean; address: string; onClose: () => void; onSave: (address: string) => void }) {
  const [value, setValue] = useState(address); const [status, setStatus] = useState(''); const inputRef = useRef<HTMLInputElement>(null);
  useEffect(() => setValue(address), [address, open]);
  useEffect(() => {
    if (!open || !inputRef.current) return;
    let autocomplete: any;
    loadGoogleMaps().then(() => {
      if (!inputRef.current) return;
      autocomplete = new window.google.maps.places.Autocomplete(inputRef.current, { componentRestrictions: { country: 'pk' }, fields: ['formatted_address', 'geometry', 'name'] });
      autocomplete.addListener('place_changed', () => {
        const place = autocomplete.getPlace(); const point = place.geometry?.location;
        if (!point) { setStatus('Select an address from the Google suggestions.'); return; }
        if (!isKarachi(point.lat(), point.lng())) { setStatus('Orange currently delivers only within Karachi.'); return; }
        setValue(place.formatted_address ?? place.name ?? 'Karachi, Pakistan'); setStatus('Karachi address selected.');
      });
    }).catch((error: Error) => setStatus(error.message));
    return () => { if (autocomplete) window.google?.maps?.event?.clearInstanceListeners(autocomplete); };
  }, [open]);
  if (!open) return null;
  const useCurrentLocation = () => { if (!navigator.geolocation) { setStatus('Your browser does not support location access.'); return; } setStatus('Getting your current location…'); navigator.geolocation.getCurrentPosition(({ coords }) => { if (!isKarachi(coords.latitude, coords.longitude)) { setStatus('Orange currently delivers only within Karachi. Please choose a Karachi address.'); return; } loadGoogleMaps().then(() => { new window.google.maps.Geocoder().geocode({ location: { lat: coords.latitude, lng: coords.longitude } }, (results: any[], geocodeStatus: string) => { const result = geocodeStatus === 'OK' ? results.find((entry) => entry.formatted_address?.toLowerCase().includes('karachi')) ?? results[0] : null; setValue(result?.formatted_address ?? `Current location in Karachi (${coords.latitude.toFixed(4)}, ${coords.longitude.toFixed(4)})`); setStatus('Current Karachi location selected. You can save it now.'); }); }).catch(() => { setValue(`Current location in Karachi (${coords.latitude.toFixed(4)}, ${coords.longitude.toFixed(4)})`); setStatus('Current Karachi location selected. You can save it now.'); }); }, () => setStatus('Location access was not granted. Enter a Karachi address instead.'), { enableHighAccuracy: true, timeout: 10000 }); };
  return <div className="fixed inset-0 z-[60] grid place-items-center bg-black/45 p-4" role="dialog" aria-modal="true" aria-labelledby="address-title"><section className="w-full max-w-md rounded-2xl bg-white p-6 shadow-menu"><div className="flex items-start justify-between gap-4"><div><span className="grid size-11 place-items-center rounded-xl bg-orange-100 text-orange-800"><span className="material-symbols-outlined">location_on</span></span><h2 id="address-title" className="mt-4 font-display text-heading-lg font-bold">Choose your delivery address</h2><p className="mt-2 text-body-sm text-neutral-copy">Orange is currently available in Karachi only.</p></div><button type="button" onClick={onClose} aria-label="Close address selector" className="grid size-9 place-items-center rounded-full text-neutral-copy hover:bg-neutral-soft"><span className="material-symbols-outlined">close</span></button></div><button type="button" onClick={useCurrentLocation} className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl border border-orange-800/20 bg-orange-100/40 px-4 py-3 text-body-sm font-semibold text-orange-800 transition hover:bg-orange-100"><span className="material-symbols-outlined">my_location</span>Use my current location</button><div className="my-5 flex items-center gap-3 text-caption text-neutral-copy before:h-px before:flex-1 before:bg-neutral-border after:h-px after:flex-1 after:bg-neutral-border">OR</div><label className="block text-body-sm font-semibold">Karachi delivery address<input ref={inputRef} value={value} onChange={(event) => setValue(event.target.value)} placeholder="Start typing an address in Karachi" className="mt-2 w-full rounded-xl border border-neutral-border px-4 py-3 text-body-sm font-normal outline-none transition focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20" /></label>{status && <p className="mt-3 text-caption text-neutral-copy">{status}</p>}<button type="button" disabled={!value.trim()} onClick={() => onSave(value.trim())} className="mt-6 w-full rounded-xl bg-orange-500 py-3 text-body-sm font-bold text-white transition hover:bg-orange-800 disabled:cursor-not-allowed disabled:opacity-50">Confirm Karachi address</button></section></div>;
}
function Footer() { return <footer className="border-t border-orange-800/20 bg-neutral-soft"><div className="mx-auto max-w-screen-xl px-5 py-12 md:px-6 md:py-16"><div className="grid gap-9 sm:grid-cols-2 md:grid-cols-4 md:gap-12"><div><h2 className="font-display text-heading-md font-bold text-orange-800">Orange</h2><p className="mt-5 max-w-[230px] text-caption leading-5 text-neutral-copy">Delivering authentic flavors and premium dining experiences across Karachi. From tradition to modern innovation, we define taste.</p><div className="mt-6 flex gap-4 text-neutral-copy"><span className="material-symbols-outlined text-[19px]">qr_code_2</span><span className="material-symbols-outlined text-[19px]">photo_camera</span><span className="material-symbols-outlined text-[19px]">alternate_email</span></div></div><FooterGroup title="Menu" links={['Fast Food', 'Chinese Cuisine', 'Pakistani BBQ', 'Desserts', 'Beverages']} /><FooterGroup title="Quick Links" links={['About Us', 'Contact Support', 'Order Tracking', 'Privacy Policy', 'Terms of Service']} /><div><h3 className="font-semibold">Contact</h3><ul className="mt-5 space-y-3 text-caption text-neutral-copy"><li className="flex gap-2"><span className="material-symbols-outlined text-[15px]">location_on</span>DHA Phase 6, Karachi, Pakistan</li><li className="flex gap-2"><span className="material-symbols-outlined text-[15px]">call</span>+92 21 3456 7890</li><li className="flex gap-2"><span className="material-symbols-outlined text-[15px]">mail</span>info@orangefood.pk</li></ul></div></div><div className="mt-12 flex flex-col gap-4 border-t border-orange-800/20 pt-6 text-caption text-neutral-copy md:flex-row md:items-center md:justify-between"><span>© 2024 Orange Food Pakistan. All rights reserved.</span><div className="flex gap-2"><span className="rounded bg-white px-2 py-1 text-[10px] font-bold">VISA</span><span className="rounded bg-white px-2 py-1 text-[10px] font-bold">mastercard</span></div></div></div></footer>; }
function FooterGroup({ title, links }: { title: string; links: string[] }) { return <div><h3 className="font-semibold">{title}</h3><ul className="mt-5 space-y-3 text-caption text-neutral-copy">{links.map((link) => <li key={link}><a href="#" className="transition hover:text-orange-800">{link}</a></li>)}</ul></div>; }
