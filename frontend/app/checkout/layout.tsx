import type { Metadata } from 'next';
export const metadata: Metadata = { title: 'Checkout', description: 'Complete your Orange food delivery order.', robots: { index: false, follow: false } };
export default function Layout({ children }: Readonly<{ children: React.ReactNode }>) { return children; }
