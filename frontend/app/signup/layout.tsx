import type { Metadata } from 'next';
export const metadata: Metadata = { title: 'Create account', description: 'Create an Orange food delivery account.', robots: { index: false, follow: false } };
export default function Layout({ children }: Readonly<{ children: React.ReactNode }>) { return children; }
