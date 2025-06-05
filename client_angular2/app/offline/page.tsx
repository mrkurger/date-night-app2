'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { WifiOffIcon } from 'lucide-react';

export default function OfflinePage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background text-foreground p-4">
      <div className="flex flex-col items-center justify-center text-center max-w-md">
        <div className="mb-8 p-6 rounded-full bg-muted">
          <WifiOffIcon className="h-12 w-12" />
        </div>
        <h1 className="text-4xl font-bold mb-4">You&apos;re offline</h1>
        <p className="text-muted-foreground mb-8">
          It seems you&apos;ve lost your internet connection. Check your connection and try again.
        </p>
        <div className="space-y-4">
          <Button size="lg" onClick={() => window.location.reload()} className="w-full">
            Try again
          </Button>
          <Link href="/carousely">
            <Button size="lg" variant="outline" className="w-full">
              Go to Carousely
            </Button>
          </Link>
        </div>

        <div className="mt-8 text-sm text-muted-foreground">
          <p>You can continue using some features in offline mode.</p>
        </div>
      </div>
    </div>
  );
}
