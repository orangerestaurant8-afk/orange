'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import {
  apiClient,
  type ApiCategory,
  type ApiDeal,
  type ApiHeroSlide,
  type ApiLocation,
  type ApiMenuItem,
} from '@/lib/apiClient';
import { useCartStore } from '@/lib/store/cartStore';

const fallbackCategories: ApiCategory[] = ['Fast Food', 'Chinese Food', 'BBQ'].map(
  (name, displayOrder) => ({ _id: name, name, displayOrder }),
);
const categoryImage: Record<string, string> = {
  'Fast Food': '/images/hero/hero-burger-meal.svg',
  'Chinese Food': '/images/hero/hero-variety.svg',
  BBQ: '/images/hero/hero-signature.svg',
};
const categoryCopy: Record<string, string> = {
  'Fast Food': 'Crispy, stacked and satisfying.',
  'Chinese Food': 'Wok-tossed comfort, made fresh.',
  BBQ: 'Smoky grill favourites, made to share.',
};
const fallbackSeed: Array<[string, string, number, string, string]> = [
  [
    'Mighty Zinger',
    'Classic crispy burger with cheese and signature sauce.',
    650,
    'Fast Food',
    '/images/hero/hero-burger-meal.svg',
  ],
  [
    'Masala Fries',
    'Thick-cut fries tossed in Orange Karachi street masala.',
    320,
    'Fast Food',
    '/images/hero/hero-burger-meal.svg',
  ],
  [
    'Spicy Wings (6pc)',
    'Crispy chicken wings with a hot and tangy glaze.',
    550,
    'Fast Food',
    '/images/hero/hero-burger-meal.svg',
  ],
  [
    'Chicken Chow Mein',
    'Wok-tossed noodles with chicken and crunchy vegetables.',
    790,
    'Chinese Food',
    '/images/hero/hero-variety.svg',
  ],
  [
    'Chicken Manchurian',
    'Crispy chicken in a sweet, spicy Indo-Chinese sauce.',
    950,
    'Chinese Food',
    '/images/hero/hero-variety.svg',
  ],
  [
    'Egg Fried Rice',
    'Fragrant rice, egg, spring vegetables and soy.',
    550,
    'Chinese Food',
    '/images/hero/hero-variety.svg',
  ],
  [
    'Orange Special Platter',
    'Mixed grill with signature spices, naan and chutney.',
    2450,
    'BBQ',
    '/images/hero/hero-signature.svg',
  ],
  [
    'Beef Seekh Kabab',
    'Four tender, spiced beef skewers with mint chutney.',
    890,
    'BBQ',
    '/images/hero/hero-signature.svg',
  ],
  [
    'Chicken Malai Boti',
    'Creamy charcoal-grilled boneless chicken skewers.',
    980,
    'BBQ',
    '/images/hero/hero-signature.svg',
  ],
];
const fallbackItems: ApiMenuItem[] = fallbackSeed.map(
  ([name, description, price, category, imageUrl], index) => ({
    _id: `fallback-${index}`,
    name,
    description,
    price,
    category,
    imageUrl,
    isAvailable: true,
    spiceLevel: 'medium',
    addOns: [],
  }),
);
const money = (value: number) => `Rs. ${value.toLocaleString('en-PK')}`;
const categoryName = (item: ApiMenuItem) => {
  const category = item.category;
  return typeof category === 'string' ? category : (category?.name ?? 'Uncategorized');
};

function ProductImage({ item, priority = false }: { item: ApiMenuItem; priority?: boolean }) {
  const [failed, setFailed] = useState(false);
  return (
    <div className="order-product__image">
      {failed ? (
        <Image
          src="/images/hero/hero-signature.svg"
          alt="Orange food"
          fill
          sizes="(max-width: 680px) 50vw, 25vw"
          className="object-cover"
        />
      ) : (
        <Image
          src={item.imageUrl}
          alt={item.name}
          fill
          sizes="(max-width: 680px) 50vw, (max-width: 1024px) 33vw, 25vw"
          className="object-cover transition duration-500 group-hover:scale-105"
          priority={priority}
          onError={() => setFailed(true)}
        />
      )}
    </div>
  );
}
function ProductCard({
  item,
  onAdd,
  featured = false,
}: {
  item: ApiMenuItem;
  onAdd: (item: ApiMenuItem) => void;
  featured?: boolean;
}) {
  return (
    <article className={`order-product group ${featured ? 'order-product--featured' : ''}`}>
      <Link href={`/menu/${item._id}`} aria-label={`View ${item.name}`}>
        <ProductImage item={item} priority={featured} />
      </Link>
      <div className="order-product__body">
        <div>
          <h3>{item.name}</h3>
          <p>{item.description}</p>
        </div>
        <div className="order-product__footer">
          <strong>{money(item.price)}</strong>
          <div className="flex gap-2">
            <Link className="order-product__options" href={`/menu/${item._id}`}>
              Options
            </Link>
            <button
              type="button"
              onClick={() => onAdd(item)}
              aria-label={`Add ${item.name} to cart`}
            >
              <span className="material-symbols-outlined">add</span>
            </button>
          </div>
        </div>
      </div>
    </article>
  );
}
function CartDrawer({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { items, update, remove } = useCartStore();
  const count = items.reduce((sum, item) => sum + item.quantity, 0);
  const total = items.reduce((sum, item) => sum + item.quantity * item.price, 0);
  return (
    <div className={`order-drawer ${open ? 'is-open' : ''}`} aria-hidden={!open}>
      <button
        className="order-drawer__backdrop"
        onClick={onClose}
        aria-label="Close cart"
        tabIndex={open ? 0 : -1}
      />
      <aside className="order-drawer__panel" role="dialog" aria-modal="true" aria-label="Your cart">
        <header>
          <div>
            <p>Your order</p>
            <h2>
              {count ? `${count} item${count === 1 ? '' : 's'} in your cart` : 'Your cart is empty'}
            </h2>
          </div>
          <button type="button" onClick={onClose} aria-label="Close cart">
            <span className="material-symbols-outlined">close</span>
          </button>
        </header>
        {items.length ? (
          <>
            <div className="order-drawer__items">
              {items.map((item) => (
                <article key={item._id}>
                  <Image
                    src={item.imageUrl}
                    alt=""
                    width={72}
                    height={72}
                    className="object-cover"
                    onError={(event) => {
                      event.currentTarget.style.opacity = '0';
                    }}
                  />
                  <div>
                    <h3>{item.name}</h3>
                    <p>{money(item.price)}</p>
                    <div className="order-drawer__quantity">
                      <button
                        onClick={() => update(item._id, item.quantity - 1)}
                        aria-label={`Reduce ${item.name}`}
                      >
                        −
                      </button>
                      <span>{item.quantity}</span>
                      <button
                        onClick={() => update(item._id, item.quantity + 1)}
                        aria-label={`Increase ${item.name}`}
                      >
                        +
                      </button>
                    </div>
                  </div>
                  <button
                    className="order-drawer__remove"
                    onClick={() => remove(item._id)}
                    aria-label={`Remove ${item.name}`}
                  >
                    <span className="material-symbols-outlined">delete</span>
                  </button>
                </article>
              ))}
            </div>
            <footer>
              <p>
                <span>Subtotal</span>
                <strong>{money(total)}</strong>
              </p>
              <Link href="/cart" onClick={onClose}>
                Review order <span>→</span>
              </Link>
            </footer>
          </>
        ) : (
          <div className="order-drawer__empty">
            <span className="material-symbols-outlined">shopping_bag</span>
            <p>Add dishes from the menu whenever you are ready.</p>
            <button onClick={onClose}>Browse the menu</button>
          </div>
        )}
      </aside>
    </div>
  );
}

export function OrderingExperience() {
  const [items, setItems] = useState<ApiMenuItem[]>([]);
  const [categories, setCategories] = useState<ApiCategory[]>([]);
  const [deals, setDeals] = useState<ApiDeal[]>([]);
  const [slides, setSlides] = useState<ApiHeroSlide[]>([]);
  const [locations, setLocations] = useState<ApiLocation[]>([]);
  const [selectedLocation, setSelectedLocation] = useState<ApiLocation | null>(null);
  const [locationOpen, setLocationOpen] = useState(false);
  const [activeSlide, setActiveSlide] = useState(0);
  const [searchOpen, setSearchOpen] = useState(false);
  const [active, setActive] = useState('');
  const [query, setQuery] = useState('');
  const [menuOpen, setMenuOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const [notice, setNotice] = useState('');
  const add = useCartStore((state) => state.add);
  const cartCount = useCartStore((state) =>
    state.items.reduce((sum, item) => sum + item.quantity, 0),
  );
  useEffect(() => {
    const stored = window.localStorage.getItem('orange-location');
    Promise.all([
      apiClient.get('/locations'),
      apiClient.get('/hero-slides'),
      apiClient.get('/categories'),
    ])
      .then(([locationResponse, bannerResponse, categoryResponse]) => {
        const nextLocations = locationResponse.data.data ?? [];
        setLocations(nextLocations);
        setSlides(bannerResponse.data.data ?? []);
        setCategories(categoryResponse.data.data ?? []);
        const selected =
          nextLocations.find((location: ApiLocation) => location._id === stored) ?? null;
        setSelectedLocation(selected);
        setLocationOpen(!selected);
      })
      .catch(() => setLocationOpen(true));
  }, []);
  useEffect(() => {
    apiClient
      .get('/menu', { params: selectedLocation ? { location: selectedLocation._id } : {} })
      .then((response) => setItems(response.data.data ?? []))
      .catch(() => setItems([]));
    if (selectedLocation)
      apiClient
        .get('/deals', { params: { location: selectedLocation._id } })
        .then((response) => setDeals(response.data.data ?? []))
        .catch(() => setDeals([]));
  }, [selectedLocation]);
  useEffect(() => {
    if (slides.length < 2) return;
    const timer = window.setInterval(
      () => setActiveSlide((current) => (current + 1) % slides.length),
      6500,
    );
    return () => window.clearInterval(timer);
  }, [slides.length]);
  useEffect(() => {
    if (!notice) return;
    const timer = window.setTimeout(() => setNotice(''), 2200);
    return () => window.clearTimeout(timer);
  }, [notice]);
  const visibleItems = useMemo(
    () =>
      items.filter(
        (item) =>
          `${item.name} ${item.description} ${item.tags?.join(' ') ?? ''} ${categoryName(item)}`
            .toLowerCase()
            .includes(query.toLowerCase()) &&
          (!active || categoryName(item) === active),
      ),
    [items, query, active],
  );
  const featured = items
    .filter((item) => item.featured)
    .concat(items.filter((item) => !item.featured))
    .slice(0, 4);
  const addItem = (item: ApiMenuItem) => {
    if (!selectedLocation && locations.length) {
      setLocationOpen(true);
      return;
    }
    add(item);
    setNotice(`${item.name} added to your order`);
  };
  const selectCategory = (name: string) => {
    setActive(name);
    setQuery('');
    document.getElementById('menu')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };
  const chooseLocation = (location: ApiLocation) => {
    setSelectedLocation(location);
    window.localStorage.setItem('orange-location', location._id);
    setLocationOpen(false);
    setNotice(`Now ordering from ${location.name}`);
  };
  const signature = items.find((item) => /platter/i.test(item.name)) ?? items[0];
  return (
    <main className="order-page">
      <div className="order-bar">
        <button type="button" onClick={() => setLocationOpen(true)}>
          <span className="material-symbols-outlined">location_on</span> Delivering across selected
          Karachi areas
        </button>
        <span className="hidden sm:inline">Freshly prepared after you order</span>
      </div>
      <header className="order-header">
        <Link href="#home" className="order-brand" aria-label="Orange home">
          <Image
            src="/orange-cloud-kitchen.svg"
            alt="Orange Cloud Kitchen"
            width={160}
            height={46}
            priority
          />
        </Link>
        <nav aria-label="Main navigation">
          <a href="#home">Home</a>
          <a href="#menu" onClick={() => setActive('')}>
            Menu
          </a>
          <a href="#categories">Categories</a>
          <a href="#about">About</a>
          <a href="#contact">Contact</a>
        </nav>
        <div className="order-header__actions">
          <button
            className="order-search"
            aria-label="Search the menu"
            onClick={() => setSearchOpen(true)}
          >
            <span className="material-symbols-outlined">search</span>
          </button>
          <button
            className="order-cart"
            onClick={() => setCartOpen(true)}
            aria-label={`Open cart, ${cartCount} items`}
          >
            <span className="material-symbols-outlined">shopping_bag</span>
            <b>{cartCount}</b>
            <span className="hidden lg:inline">Your order</span>
          </button>
          <button
            className="order-menu-toggle"
            onClick={() => setMenuOpen(true)}
            aria-label="Open navigation"
          >
            <span className="material-symbols-outlined">menu</span>
          </button>
        </div>
      </header>
      <div className={`order-mobile-nav ${menuOpen ? 'is-open' : ''}`}>
        <button onClick={() => setMenuOpen(false)} aria-label="Close navigation">
          <span className="material-symbols-outlined">close</span>
        </button>
        <Image src="/orange-cloud-kitchen.svg" alt="Orange Cloud Kitchen" width={180} height={52} />
        <nav>
          {[
            ['Home', '#home'],
            ['Menu', '#menu'],
            ['Categories', '#categories'],
            ['About', '#about'],
            ['Contact', '#contact'],
          ].map(([label, href]) => (
            <a key={href} href={href} onClick={() => setMenuOpen(false)}>
              {label}
            </a>
          ))}
        </nav>
        <button
          onClick={() => {
            setMenuOpen(false);
            setCartOpen(true);
          }}
        >
          View your order ({cartCount})
        </button>
      </div>
      <section id="home" className="order-hero">
        <div className="order-hero__copy">
          <span>Orange Cloud Kitchen · Karachi</span>
          <h1>
            Big flavour,
            <br />
            <em>made for craving.</em>
          </h1>
          <p>Fresh burgers, wok-tossed favourites and smoky BBQ prepared after you order.</p>
          <div>
            <a href="#menu">
              Order now <span>→</span>
            </a>
            <a className="order-hero__secondary" href="#categories">
              Explore menu
            </a>
          </div>
        </div>
        <div className="order-hero__image">
          <Image
            src="/images/hero/hero-signature.svg"
            alt="Orange signature food selection"
            fill
            priority
            sizes="(max-width: 768px) 100vw, 55vw"
          />
        </div>
      </section>
      <section id="categories" className="order-categories">
        <div className="order-section-title">
          <span>Pick your craving</span>
          <h2>What are you in the mood for?</h2>
        </div>
        <div className="order-category-rail">
          {categories.map((category) => (
            <button
              key={category._id}
              className={active === category.name ? 'is-active' : ''}
              onClick={() => selectCategory(category.name)}
            >
              <Image
                src={categoryImage[category.name] ?? '/images/hero/hero-variety.svg'}
                alt=""
                fill
                sizes="120px"
              />
              <span>{category.name}</span>
            </button>
          ))}
        </div>
      </section>
      <section className="order-featured">
        <div className="order-section-title">
          <span>Kitchen favourites</span>
          <h2>Start with the most-loved dishes.</h2>
          <p>Popular choices from the Orange menu, ready to add to your order.</p>
        </div>
        <div className="order-featured__grid">
          {featured.map((item) => (
            <ProductCard key={item._id} item={item} onAdd={addItem} featured />
          ))}
        </div>
      </section>
      {signature && (
        <section className="order-signature">
          <div>
            <span>From the Orange kitchen</span>
            <h2>{signature.name}</h2>
            <p>{signature.description}</p>
            <button onClick={() => addItem(signature)}>
              Add to order <span>→</span>
            </button>
          </div>
          <Image
            src={signature.imageUrl}
            alt="Orange signature dish"
            fill
            sizes="(max-width: 800px) 100vw, 50vw"
            className="object-cover"
          />
        </section>
      )}
      <section id="menu" className="order-menu">
        <div className="order-menu__top">
          <div className="order-section-title">
            <span>The full menu</span>
            <h2>Order your way.</h2>
            <p>Browse every available dish without leaving the page.</p>
          </div>
          <label>
            <span className="material-symbols-outlined">search</span>
            <input
              id="menu-search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search dishes"
            />
          </label>
        </div>
        <div className="order-tabs">
          <button className={!active ? 'is-active' : ''} onClick={() => setActive('')}>
            All dishes
          </button>
          {categories.map((category) => (
            <button
              key={category._id}
              className={active === category.name ? 'is-active' : ''}
              onClick={() => setActive(category.name)}
            >
              {category.name}
            </button>
          ))}
        </div>
        {categories
          .filter((category) => !active || active === category.name)
          .map((category) => {
            const categoryItems = visibleItems.filter(
              (item) => categoryName(item) === category.name,
            );
            return (
              <section
                id={`category-${category._id}`}
                key={category._id}
                className="order-menu__group"
              >
                <div>
                  <h3>{category.name}</h3>
                  <p>{categoryCopy[category.name] ?? 'Freshly prepared Orange favourites.'}</p>
                </div>
                <div className="order-menu__grid">
                  {categoryItems.map((item) => (
                    <ProductCard key={item._id} item={item} onAdd={addItem} />
                  ))}
                </div>
                {!categoryItems.length && (
                  <p className="order-empty">No available dishes match this search.</p>
                )}
              </section>
            );
          })}
      </section>
      <section id="about" className="order-about">
        <Image
          src="/images/hero/hero-variety.svg"
          alt="Orange menu variety"
          width={700}
          height={420}
        />
        <div>
          <span>About Orange</span>
          <h2>Where taste makes memories.</h2>
          <p>
            Orange brings freshly prepared comfort food to Karachi, from quick bites to generous
            meals for sharing.
          </p>
          <p>Every order is made on demand and packed with care for delivery.</p>
        </div>
      </section>
      <section className="order-steps">
        <span>How it works</span>
        <h2>Your next meal is three simple steps away.</h2>
        <div>
          <article>
            <b>01</b>
            <h3>Choose your dishes</h3>
            <p>Browse the menu and select what you are craving.</p>
          </article>
          <article>
            <b>02</b>
            <h3>Add to your order</h3>
            <p>Review quantities and options in your cart.</p>
          </article>
          <article>
            <b>03</b>
            <h3>Confirm delivery</h3>
            <p>Complete your delivery details at checkout.</p>
          </article>
        </div>
      </section>
      <footer id="contact" className="order-footer">
        <div>
          <Image
            src="/orange-cloud-kitchen.svg"
            alt="Orange Cloud Kitchen"
            width={165}
            height={48}
          />
          <p>Freshly prepared food, delivered with care across Karachi.</p>
        </div>
        <div>
          <h2>Find Orange</h2>
          <a href="tel:+922134567890">+92 21 3456 7890</a>
          <a href="mailto:info@orangecloudkitchen.pk">info@orangecloudkitchen.pk</a>
          <a
            href="https://www.google.com/maps/search/?api=1&query=DHA+Phase+6,+Karachi,+Pakistan"
            target="_blank"
            rel="noreferrer"
          >
            DHA Phase 6, Karachi, Pakistan
          </a>
        </div>
        <div>
          <h2>Quick links</h2>
          <a href="#menu">Menu</a>
          <a href="#about">About Orange</a>
          <Link href="/profile/orders">Track order</Link>
        </div>
        <p className="order-footer__legal">© {new Date().getFullYear()} Orange Cloud Kitchen.</p>
      </footer>
      {deals.length > 0 && (
        <section id="deals" className="order-featured">
          <div className="order-section-title">
            <span>Orange offers</span>
            <h2>Deals made to share.</h2>
          </div>
          <div className="order-featured__grid">
            {deals.map((deal) => (
              <article className="order-product" key={deal._id}>
                {deal.imageUrl && (
                  <div className="order-product__image">
                    <Image
                      src={deal.imageUrl}
                      alt={deal.name}
                      fill
                      sizes="(max-width: 680px) 50vw, 25vw"
                      className="object-cover"
                    />
                  </div>
                )}
                <div className="order-product__body">
                  <h3>{deal.name}</h3>
                  <p>{deal.description}</p>
                  <div className="order-product__footer">
                    <strong>{money(deal.price)}</strong>
                    {deal.originalPrice && <del>{money(deal.originalPrice)}</del>}
                    <a href="#menu">Customize</a>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>
      )}
      {locationOpen && (
        <div
          className="fixed inset-0 z-[100] grid place-items-center bg-black/60 p-4"
          role="dialog"
          aria-modal="true"
          aria-label="Select delivery location"
        >
          <section className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl">
            <span className="material-symbols-outlined text-3xl text-orange-500">location_on</span>
            <h2 className="mt-3 font-display text-3xl text-neutral-ink">
              Where should we deliver?
            </h2>
            <p className="mt-2 text-sm text-neutral-muted">
              Your location determines menu availability and delivery charges.
            </p>
            <div className="mt-5 max-h-72 space-y-2 overflow-auto">
              {locations.map((location) => (
                <button
                  key={location._id}
                  onClick={() => chooseLocation(location)}
                  className="w-full rounded-xl border border-neutral-border p-4 text-left transition hover:border-orange-500 hover:bg-orange-100"
                >
                  <b className="block text-neutral-ink">{location.name}</b>
                  <span className="mt-1 block text-sm text-neutral-muted">
                    {location.address ||
                      location.estimatedDeliveryTime ||
                      'Delivery details available at checkout'}
                  </span>
                </button>
              ))}
              {!locations.length && (
                <p className="rounded-xl bg-neutral-soft p-4 text-sm text-neutral-muted">
                  Delivery locations are not available yet. Please contact Orange to place an order.
                </p>
              )}
            </div>
            {selectedLocation && (
              <button
                onClick={() => setLocationOpen(false)}
                className="mt-5 text-sm font-bold text-orange-800"
              >
                Keep current location
              </button>
            )}
          </section>
        </div>
      )}
      {searchOpen && (
        <div
          className="fixed inset-0 z-[100] bg-black/60 p-4 sm:p-10"
          role="dialog"
          aria-modal="true"
        >
          <section className="mx-auto max-w-3xl rounded-2xl bg-white p-5 shadow-2xl">
            <div className="flex gap-3">
              <input
                autoFocus
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === 'Escape') setSearchOpen(false);
                  if (event.key === 'Enter' && visibleItems[0]) addItem(visibleItems[0]);
                }}
                placeholder="Search dishes, categories and tags"
                className="h-12 min-w-0 flex-1 rounded-lg border border-neutral-border px-4 outline-none focus:border-orange-500"
              />
              <button
                onClick={() => setSearchOpen(false)}
                aria-label="Close search"
                className="grid size-12 place-items-center rounded-lg bg-neutral-soft"
              >
                ×
              </button>
            </div>
            <div className="mt-4 max-h-[65vh] overflow-auto">
              {visibleItems.slice(0, 12).map((item) => (
                <button
                  key={item._id}
                  onClick={() => addItem(item)}
                  className="flex w-full items-center gap-3 border-b border-neutral-border p-3 text-left hover:bg-orange-100"
                >
                  <Image
                    src={item.imageUrl}
                    alt=""
                    width={54}
                    height={54}
                    className="size-14 rounded-lg object-cover"
                  />
                  <span className="min-w-0 flex-1">
                    <b className="block text-neutral-ink">{item.name}</b>
                    <small className="block truncate text-neutral-muted">
                      {categoryName(item)} · {money(item.price)}
                    </small>
                  </span>
                  <span className="material-symbols-outlined text-orange-500">add_circle</span>
                </button>
              ))}
              {query && !visibleItems.length && (
                <p className="p-6 text-center text-neutral-muted">
                  No active dishes match “{query}”.
                </p>
              )}
            </div>
          </section>
        </div>
      )}
      <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} />
      {notice && (
        <div className="order-notice" role="status">
          {notice}
        </div>
      )}
      <button className="order-mobile-cart" onClick={() => setCartOpen(true)}>
        <span>{cartCount ? `${cartCount} item${cartCount === 1 ? '' : 's'}` : 'Your order'}</span>
        <b>
          View cart <span>→</span>
        </b>
      </button>
    </main>
  );
}
