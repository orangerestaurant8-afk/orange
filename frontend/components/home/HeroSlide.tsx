'use client';

import Link from 'next/link';
import { useState } from 'react';
import type { HeroSlideData } from '@/data/heroSlides';

export function HeroSlide({ slide, active, priority }: { slide: HeroSlideData; active: boolean; priority: boolean }) {
  const [loaded, setLoaded] = useState(false); const [failed, setFailed] = useState(false);
  const overlay = `hero-overlay--${slide.overlay ?? 'left-gradient'}`;
  return <article className={`hero-slide ${active ? 'is-active' : ''} hero-slide--${slide.alignment ?? 'left'}`} aria-hidden={!active}>
    <picture className={`hero-slide__media ${loaded ? 'is-loaded' : ''} ${failed ? 'is-failed' : ''}`}>
      {slide.mobileImage && <source media="(max-width: 767px)" srcSet={slide.mobileImage} />}
      {!failed && <img src={slide.image} alt={active ? slide.imageAlt : ''} onLoad={() => setLoaded(true)} onError={() => setFailed(true)} fetchPriority={priority ? 'high' : 'auto'} loading={priority ? 'eager' : 'lazy'} style={{ objectPosition: slide.imagePosition ?? 'center' }} />}
      {failed && <span className="hero-slide__fallback"><span className="material-symbols-outlined">restaurant</span> Orange</span>}
    </picture>
    <span className={`hero-slide__overlay ${overlay}`} />
    <div className="hero-slide__content"><div>
      {slide.badge && <span className="hero-slide__badge">{slide.badge}</span>}
      <h1>{slide.title}</h1>
      {slide.subtitle && <p className="hero-slide__subtitle">{slide.subtitle}</p>}
      {slide.description && <p className="hero-slide__description">{slide.description}</p>}
      {(slide.ctaLink || slide.secondaryCtaLink) && <div className="hero-slide__actions">
        {slide.ctaLink && slide.ctaText && <Link href={slide.ctaLink}>{slide.ctaText}<span>→</span></Link>}
        {slide.secondaryCtaLink && slide.secondaryCtaText && <Link href={slide.secondaryCtaLink} className="hero-slide__secondary">{slide.secondaryCtaText}</Link>}
      </div>}
    </div></div>
  </article>;
}
