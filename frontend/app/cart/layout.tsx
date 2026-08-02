import type { Metadata } from 'next';
export const metadata: Metadata = { title: 'Your cart', description: 'Review your Orange order before checkout.', robots: { index: false, follow: false } };
export default function Layout({ children }: Readonly<{ children: React.ReactNode }>) { return children; }
