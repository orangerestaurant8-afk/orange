'use client';

import { useEffect } from 'react';

export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => { console.error(error); }, [error]);
  return <main className="grid min-h-screen place-items-center bg-neutral-canvas p-6 text-center"><section className="max-w-md rounded-xl bg-neutral-white p-8 shadow-float"><p className="text-overline font-bold text-orange-800">SOMETHING WENT WRONG</p><h1 className="mt-3 font-display text-heading-lg text-neutral-ink">We couldn’t serve that page.</h1><p className="mt-3 text-body-sm text-neutral-muted">Please try again. If the problem continues, return to the menu.</p><button onClick={reset} className="mt-6 rounded-lg bg-orange-500 px-5 py-3 font-semibold text-white">Try again</button></section></main>;
}
