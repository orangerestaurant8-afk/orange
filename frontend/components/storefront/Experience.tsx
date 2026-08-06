'use client';

import Image from 'next/image';
import Link from 'next/link';
import { type MouseEvent, type ReactNode, useEffect, useRef, useState } from 'react';
import type { ApiMenuItem } from '@/lib/apiClient';

export const motion = { fast: 160, normal: 360, slow: 650, ease: 'cubic-bezier(.22,.8,.28,1)' };

export function PageLoader({ ready }: { ready: boolean }) {
  const [visible, setVisible] = useState(true); const [exiting, setExiting] = useState(false);
  useEffect(() => { if (!ready) return; const exit = window.setTimeout(() => setExiting(true), 120); const remove = window.setTimeout(() => setVisible(false), 620); return () => { window.clearTimeout(exit); window.clearTimeout(remove); }; }, [ready]);
  if (!visible) return null;
  return <div className={`page-loader ${exiting ? 'is-exiting' : ''}`} aria-live="polite" aria-label="Loading Orange"><div className="page-loader__mark">Orange</div><div className="page-loader__line"><span className={ready ? 'is-ready' : ''} /></div><p>Preparing something delicious</p></div>;
}

export function BlurImage({ src, alt, priority = false, className = '', sizes = '(max-width: 767px) 50vw, 25vw' }: { src?: string; alt: string; priority?: boolean; className?: string; sizes?: string }) {
  const [loaded, setLoaded] = useState(false); const [failed, setFailed] = useState(false);
  return <div className={`blur-image ${loaded ? 'is-loaded' : ''} ${failed ? 'is-failed' : ''} ${className}`}>
    {src && !failed ? <Image src={src} alt={alt} fill sizes={sizes} priority={priority} onLoad={() => setLoaded(true)} onError={() => setFailed(true)} /> : <span className="blur-image__fallback"><span className="material-symbols-outlined">restaurant</span><span>Orange</span></span>}
  </div>;
}

export function ScrollReveal({ children, className = '', delay = 0 }: { children: ReactNode; className?: string; delay?: number }) {
  const ref = useRef<HTMLDivElement>(null); const [seen, setSeen] = useState(false);
  useEffect(() => { const node = ref.current; if (!node) return; const observer = new IntersectionObserver(([entry]) => { if (entry.isIntersecting) { setSeen(true); observer.disconnect(); } }, { threshold: .12 }); observer.observe(node); return () => observer.disconnect(); }, []);
  return <div ref={ref} className={`reveal ${seen ? 'is-seen' : ''} ${className}`} style={{ transitionDelay: `${delay}ms` }}>{children}</div>;
}

export function SectionHeading({ eyebrow, title, copy, action }: { eyebrow?: string; title: string; copy?: string; action?: ReactNode }) { return <div className="section-heading"><div><span className="eyebrow">{eyebrow ?? 'Orange favourites'}</span><h2>{title}</h2>{copy && <p>{copy}</p>}</div>{action}</div>; }

export function ProductCard({ item, rating, onAdd }: { item: ApiMenuItem; rating: string; onAdd: (event: MouseEvent<HTMLButtonElement>) => void }) {
  return <article className="product-card"><Link href={`/menu/${item._id}`} className="product-card__image"><BlurImage src={item.imageUrl} alt={item.name} /><span className="product-card__rating"><span>★</span>{rating}</span></Link><div className="product-card__body"><Link href={`/menu/${item._id}`}><h3>{item.name}</h3></Link><p>{item.description}</p><div className="product-card__meta"><strong>Rs {item.price.toLocaleString('en-PK')}</strong><button type="button" onClick={onAdd} aria-label={`Add ${item.name} to cart`}><span className="material-symbols-outlined">add</span><span className="sr-only">Add</span></button></div></div></article>;
}
