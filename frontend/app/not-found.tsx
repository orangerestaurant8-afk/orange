import Link from 'next/link';

export default function NotFound() {
  return <main className="grid min-h-screen place-items-center bg-neutral-canvas p-6 text-center"><section><p className="text-overline font-bold text-orange-800">404 · NOT FOUND</p><h1 className="mt-3 font-display text-display-sm text-neutral-ink">This order is not on the menu.</h1><p className="mt-3 text-body-sm text-neutral-muted">The page you requested doesn’t exist or may have moved.</p><Link href="/" className="mt-7 inline-block rounded-lg bg-orange-500 px-5 py-3 font-semibold text-white">Return home</Link></section></main>;
}
