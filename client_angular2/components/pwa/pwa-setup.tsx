'use client';

import { useEffect, useState } from 'react';
import { PWAService } from '@/services/pwa.service';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/toast';

export function PWASetup() {
  const [installPrompt, setInstallPrompt] = useState<any>(null);
  const [serviceWorkerRegistered, setServiceWorkerRegistered] = useState(false);
  const [pwaService] = useState(() => PWAService.getInstance());

  // Register service worker on component mount
  useEffect(() => {
    const registerSW = async () => {
      const registration = await pwaService.registerServiceWorker();
      setServiceWorkerRegistered(registration !== null);

      // Listen for service worker updates
      if (registration) {
        registration.onupdatefound = () => {
          const installingWorker = registration.installing;
          if (installingWorker) {
            installingWorker.onstatechange = () => {
              if (installingWorker.state === 'installed') {
                if (navigator.serviceWorker.controller) {
                  // New content is available; show update notification
                  toast({
                    title: 'App update available',
                    description: 'Refresh to update to the latest version',
                    variant: 'default',
                    duration: 5000,
                  });
                }
              }
            };
          }
        };
      }
    };

    // Run registration
    registerSW();

    // Handle beforeinstallprompt event for PWA installation
    const beforeInstallPromptHandler = (e: Event) => {
      e.preventDefault();
      setInstallPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', beforeInstallPromptHandler);

    // Handle appinstalled event
    const appInstalledHandler = () => {
      toast({
        title: 'App installed',
        description: 'Carousely has been installed successfully!',
        variant: 'success',
        duration: 3000,
      });
      setInstallPrompt(null);
    };

    window.addEventListener('appinstalled', appInstalledHandler);

    // Check if the app is already installed
    const isInstalled = pwaService.isInstalled();
    if (isInstalled) {
      setInstallPrompt(null);
    }

    // Cleanup event listeners
    return () => {
      window.removeEventListener('beforeinstallprompt', beforeInstallPromptHandler);
      window.removeEventListener('appinstalled', appInstalledHandler);
    };
  }, [pwaService]);

  // Handle installation click
  const handleInstallClick = async () => {
    if (installPrompt) {
      installPrompt.prompt();
      const choiceResult = await installPrompt.userChoice;

      if (choiceResult.outcome === 'accepted') {
        toast({
          title: 'Installing app',
          description: 'Carousely is being installed',
          variant: 'success',
          duration: 3000,
        });
      }

      setInstallPrompt(null);
    }
  };

  if (!installPrompt) return null;

  return (
    <div className="fixed bottom-4 inset-x-4 bg-card border rounded-lg shadow-lg p-4 z-50 sm:w-80 sm:right-4 sm:left-auto">
      <h3 className="font-semibold mb-2">Install Carousely</h3>
      <p className="text-sm text-muted-foreground mb-3">
        Install our app for the best experience with offline support!
      </p>
      <div className="flex justify-end">
        <Button variant="outline" size="sm" className="mr-2" onClick={() => setInstallPrompt(null)}>
          Not now
        </Button>
        <Button size="sm" onClick={handleInstallClick}>
          Install
        </Button>
      </div>
    </div>
  );
}
