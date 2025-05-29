import * as React from 'react';
import { AuthProvider } from '../context/auth-context';
import { DataProvider } from '../context/data-context';
import './globals.css';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          <DataProvider>{children}</DataProvider>
        </AuthProvider>
      </body>
    </html>
  );
}

export const metadata = {
  generator: 'v0.dev',
};
