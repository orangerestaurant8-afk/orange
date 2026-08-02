import type { Metadata } from 'next';
export const metadata: Metadata = { title: 'Menu', description: 'Browse Orange’s food delivery menu in Karachi.', alternates: { canonical: '/menu' } };
export default function Layout({ children }: Readonly<{ children: React.ReactNode }>) { return children; }
