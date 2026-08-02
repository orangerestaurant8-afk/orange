import type { Metadata } from 'next';
export const metadata: Metadata = { title: 'Order tracking', description: 'Track your Orange food delivery order.', robots: { index: false, follow: false } };
export default function Layout({ children }: Readonly<{ children: React.ReactNode }>) { return children; }
