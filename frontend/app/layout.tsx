import type { Metadata } from 'next';
import '../styles/globals.css';

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'),
  title: { default: 'Orange | Food delivery in Karachi', template: '%s | Orange' },
  description: 'Order favourites from Karachi restaurants with Orange.',
  openGraph: { type: 'website', siteName: 'Orange', title: 'Orange | Food delivery in Karachi', description: 'Order favourites from Karachi restaurants with Orange.' },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
