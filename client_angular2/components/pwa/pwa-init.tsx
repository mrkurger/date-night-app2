'use client';

import { useEffect } from 'react';
import { PWASetup } from '@/components/pwa/pwa-setup';
import { createRoot } from 'react-dom/client';

export function PWAInit() {
  useEffect(() => {
    const pwaRoot = document.getElementById('pwa-root');
    if (pwaRoot) {
      const root = createRoot(pwaRoot);
      root.render(<PWASetup />);
    }
  }, []);

  return null;
}
