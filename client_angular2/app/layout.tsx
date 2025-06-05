import * as React from 'react';
import { AuthProvider } from '../context/auth-context';
import { DataProvider } from '../context/data-context';
import { Toaster } from '@/components/ui/toaster';
import '../styles/globals.css';

export const metadata = {
  title: 'Carousely - Tinder-Style Dating App',
  description: 'A modern PWA dating app with a wheel carousel interface',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Carousely',
  },
  formatDetection: {
    telephone: false,
  },
  icons: {
    icon: '/icons/icon-192x192.png',
    shortcut: '/icons/icon-192x192.png',
    apple: '/icons/apple-touch-icon.png',
  },
  generator: 'v0.dev',
};

// Add viewport export
export const viewport = {
  themeColor: '#ec4899',
  viewport: 'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <link rel="apple-touch-icon" sizes="180x180" href="/icons/apple-touch-icon.png" />
        <link rel="icon" type="image/png" sizes="32x32" href="/icons/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/icons/favicon-16x16.png" />
      </head>
      <body>
        <AuthProvider>
          <DataProvider>{children}</DataProvider>
          <Toaster />
        </AuthProvider>
      </body>
    </html>
  );
}
