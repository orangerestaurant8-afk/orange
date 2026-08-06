'use client';

import { useEffect, useRef, useState } from 'react';
import { HeroSlide } from './HeroSlide';
import type { HeroSlideData } from '@/data/heroSlides';

const AUTOPLAY_MS = 5000;
export function HeroCarousel({ slides }: { slides: HeroSlideData[] }) {
  const [active, setActive] = useState(0); const [paused, setPaused] = useState(false); const startX = useRef<number | null>(null); const activeSlides = slides.filter((slide) => slide.enabled); const multiple = activeSlides.length > 1;
  useEffect(() => setActive(0), [activeSlides.length]);
  useEffect(() => { if (!multiple || paused || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return; const timer = window.setInterval(() => setActive((index) => (index + 1) % activeSlides.length), AUTOPLAY_MS); return () => window.clearInterval(timer); }, [activeSlides.length, multiple, paused]);
  if (!activeSlides.length) return null;
  const go = (index: number) => setActive((index + activeSlides.length) % activeSlides.length);
  return <section className="hero-carousel" aria-roledescription="carousel" aria-label="Orange featured offers" tabIndex={0} onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)} onFocus={() => setPaused(true)} onBlur={() => setPaused(false)} onTouchStart={(event) => { startX.current = event.touches[0].clientX; setPaused(true); }} onTouchEnd={(event) => { if (startX.current !== null && Math.abs(event.changedTouches[0].clientX - startX.current) > 42) go(active + (event.changedTouches[0].clientX < startX.current ? 1 : -1)); startX.current = null; setPaused(false); }} onKeyDown={(event) => { if (event.key === 'ArrowLeft') go(active - 1); if (event.key === 'ArrowRight') go(active + 1); }}>
    {activeSlides.map((slide, index) => <HeroSlide key={slide.id} slide={slide} active={index === active} priority={index === 0} />)}
    {multiple && <><button type="button" className="hero-carousel__arrow hero-carousel__arrow--prev" onClick={() => go(active - 1)} aria-label="Previous offer"><span className="material-symbols-outlined">arrow_back</span></button><button type="button" className="hero-carousel__arrow hero-carousel__arrow--next" onClick={() => go(active + 1)} aria-label="Next offer"><span className="material-symbols-outlined">arrow_forward</span></button><div className="hero-carousel__progress" aria-label={`Offer ${active + 1} of ${activeSlides.length}`}>{activeSlides.map((slide, index) => <button key={slide.id} type="button" onClick={() => go(index)} aria-label={`Show offer ${index + 1}`} aria-current={index === active}><b>{String(index + 1).padStart(2, '0')}</b><i className={index === active && !paused ? 'is-running' : ''} /></button>)}</div></>}
  </section>;
}
