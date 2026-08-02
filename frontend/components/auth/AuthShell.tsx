import type { ReactNode } from 'react';

const foodImages = [
  'https://lh3.googleusercontent.com/aida-public/AB6AXuCizOrrgIGxcG3yEyR0CthNO7iBku7mBfK6Omz2JuphxN_D9xEBiPlP13OL5ZGo8rngA2HXkuY2EAXiDjATYWM1Ks0o1F4xQkrZQMFawu0RTp-QmtP5odgsJymo6OudQ_Bl0updF7LLiEysJ2uAV3im49VLhxkSyFUBexsmntufiWLZWqoBX3Ms6M3QGYyeh7a13TDkSXwHgnIGgt9B4qS9HGupjidkH_t6T8w_vwcBf7EQfhsDn0StDw',
  'https://lh3.googleusercontent.com/aida-public/AB6AXuCTYmCQXZH328B2mgmUyRLw2hd9zasqMQwXJmv-5U3-kGbcQj3D-YqTp9tjxz68-dn_v8_55pd8u2WORlCSl5FQOBwWzDkzBdDc70-9D9tTiButq8s1OrGTgptm_vwlRdGp9XWdM4v_2leqphQz7g-yGWkuPGIQ0x9voyyv5gy3y49e0YHB-ruHYDFN7LuosnzGljnAFf1r2VAqYxaaFWP5N-5uxxYWvNCz1isQgyy54gEi7-n2IjCW6g',
  'https://lh3.googleusercontent.com/aida-public/AB6AXuCPkkdezO1TP93zVAuMh9oEjWY7o4tGonAG1W6u9dSk5F6IEeQ2QpQy5Ttz8neMyXAgdVHqWWt1fhxnWonu__KmS6mTLxdYvZ4dpTt-nyauKNnmDj_gywq-XeLQZaHcbBeUfd5JDPKGmr3HM5JGGBJiAeF5DCxUr8i8yl9hS4TJ4vnog3VOuh2kj6DaIG_Nvs-oM0mwmIEzzr3W2qigdrhfmceFlRQjXsRrFGhsVskh5LHPv4XD1MM-3w',
];

export function AuthShell({ children }: { children: ReactNode }) {
  return <main className="min-h-screen bg-[#f9f9ff] md:flex">
    <aside className="relative hidden min-h-screen overflow-hidden bg-gradient-to-br from-[#a94400] via-[#f16a08] to-[#ca8352] p-12 text-white md:flex md:w-[60%] md:flex-col">
      <div><h1 className="font-display text-[46px] font-bold tracking-tight">Orange</h1><p className="mt-1 text-[20px] font-semibold">Authentic Flavors of Karachi, Delivered.</p></div>
      <div className="mx-auto mt-10 grid w-full max-w-[680px] grid-cols-2 gap-3"><img src={foodImages[0]} alt="Grilled kebabs" className="h-[250px] w-full rounded-2xl object-cover shadow-2xl" /><img src={foodImages[1]} alt="Karachi biryani" className="mt-8 h-[250px] w-full rounded-2xl object-cover shadow-2xl" /><img src={foodImages[2]} alt="Orange restaurant dishes" className="col-span-2 -mt-1 h-[170px] w-full rounded-2xl object-cover shadow-2xl" /></div>
      <div className="mt-auto flex items-center justify-between text-[15px] font-semibold"><span>Over 500+ Top Restaurants</span><span className="flex items-center gap-2"><span className="material-symbols-outlined text-[18px]">verified</span>Trusted by 1M+ Foodies</span></div>
    </aside>
    <section className="flex min-h-screen flex-1 flex-col px-6 py-10 md:items-center md:justify-center md:px-10 md:py-8">
      <div className="mb-14 text-center md:hidden"><span className="mx-auto grid size-[84px] place-items-center rounded-[20px] bg-orange-500 text-white shadow-float" style={{ transform: 'rotate(3deg)' }}><span className="material-symbols-outlined text-[42px]" style={{ transform: 'rotate(-3deg)', fontVariationSettings: "'FILL' 1" }}>restaurant</span></span><h1 className="mt-5 font-display text-[34px] font-semibold text-orange-800">Orange</h1><p className="mt-2 text-[18px] text-neutral-copy">Fastest Delivery in Karachi</p></div>
      <div className="w-full max-w-[560px]">{children}</div>
    </section>
  </main>;
}

export function AuthPhoneField({ value, onChange }: { value: string; onChange: (value: string) => void }) {
  return <label className="block"><span className="mb-2 block text-[15px] font-semibold text-neutral-copy">Phone Number</span><div className="flex h-14 items-center rounded-lg border border-[#e0c0b1] bg-white px-4 transition focus-within:border-orange-500 focus-within:ring-2 focus-within:ring-orange-500/20"><span className="mr-3 font-display text-[18px] font-semibold text-neutral-ink">+92</span><input value={value} onChange={(event) => onChange(event.target.value.replace(/[^0-9+]/g, ''))} inputMode="tel" autoComplete="tel" placeholder="300 1234567" className="min-w-0 flex-1 bg-transparent font-display text-[18px] font-semibold text-neutral-ink outline-none placeholder:text-[#d3daea]" /></div></label>;
}

export function ContinueButton({ children, loading, onClick }: { children: ReactNode; loading: boolean; onClick: () => void }) { return <button type="button" onClick={onClick} disabled={loading} className="flex h-14 w-full items-center justify-center gap-2 rounded-lg bg-orange-500 font-display text-[18px] font-semibold text-white shadow-float transition hover:bg-orange-800 disabled:opacity-60">{loading ? 'Please wait…' : <>{children}<span className="material-symbols-outlined text-[22px]">arrow_forward</span></>}</button>; }

export function Terms() { return <p className="text-center text-[16px] leading-6 text-neutral-copy">By continuing, you agree to our <a href="#" className="font-semibold text-orange-800">Terms of Service</a> and <a href="#" className="font-semibold text-orange-800">Privacy Policy</a>.</p>; }
