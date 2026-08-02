import type { Metadata } from 'next';
export const metadata: Metadata = { title: 'Order confirmed', description: 'Your Orange order confirmation.', robots: { index: false, follow: false } };
export default function Layout({ children }: Readonly<{ children: React.ReactNode }>) { return children; }
