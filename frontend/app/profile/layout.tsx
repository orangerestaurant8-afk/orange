import type { Metadata } from 'next';
import ProfileLayoutClient from './ProfileLayoutClient';
export const metadata: Metadata = { title: 'Your profile', description: 'Manage your Orange account and orders.', robots: { index: false, follow: false } };
export default function Layout({ children }: Readonly<{ children: React.ReactNode }>) { return <ProfileLayoutClient>{children}</ProfileLayoutClient>; }
