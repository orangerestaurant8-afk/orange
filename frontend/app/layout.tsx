import type { Metadata } from 'next';
import '../styles/globals.css';

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'),
  title: { default: 'Orange Cloud Kitchen | Karachi', template: '%s | Orange Cloud Kitchen' },
  description: 'Where taste makes memories. Freshly prepared food, delivered across Karachi.',
  openGraph: { type: 'website', siteName: 'Orange Cloud Kitchen', title: 'Orange Cloud Kitchen | Karachi', description: 'Where taste makes memories.' },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
