import type { Metadata } from 'next';
export const metadata: Metadata = { title: 'Sign in', description: 'Sign in to Orange food delivery.', robots: { index: false, follow: false } };
export default function Layout({ children }: Readonly<{ children: React.ReactNode }>) { return children; }
