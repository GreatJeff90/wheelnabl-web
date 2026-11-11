import type { Metadata } from 'next';
import { Poppins } from 'next/font/google';
import InstallPrompt from '@/components/InstallPrompt';
import './globals.css';

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700', '800', '900'],
  variable: '--font-poppins',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Wheelnabl | Estate Mobility',
  description: 'Smart transit system for Golf Estate',
  manifest: '/manifest.json',
  icons: {
    icon: '/logo.ico',
    apple: '/apple-icon-192.png',
  },
  other: {
    'mobile-web-app-capable': 'yes',
    'apple-mobile-web-app-capable': 'yes',
    'apple-mobile-web-app-status-style': 'black-translucent',
    'apple-mobile-web-app-title': 'Wheelnabl',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={poppins.variable} suppressHydrationWarning>
      <body className="font-sans antialiased min-h-screen flex flex-col bg-white text-slate-900" suppressHydrationWarning>
        {children}
        <InstallPrompt />
      </body>
    </html>
  );
}