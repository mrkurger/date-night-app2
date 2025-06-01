'use client';

import * as React from 'react';
import { useState, useEffect } from 'react';
import EnhancedNavbar from '@/components/enhanced-navbar';
import { CarouselWheel } from '@/components/carousely/carousel-wheel';
import { generateMockAdvertisers, Advertiser } from '@/services/mock-advertisers';
import { toast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { BellIcon, CompassIcon, HeartIcon, XIcon } from 'lucide-react';
import { PWAInit } from '@/components/pwa/pwa-init';

export default function CarouselyPage() {
  const [advertisers, setAdvertisers] = useState<Advertiser[]>([]);
  const [loading, setLoading] = useState(true);
  const [geolocationEnabled, setGeolocationEnabled] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);

  // Generate mock data and check cache on component mount
  useEffect(() => {
    // First, try to use cached data for instant loading
    try {
      const cachedData = localStorage.getItem('carousely-advertisers');
      if (cachedData) {
        const parsedData = JSON.parse(cachedData);
        setAdvertisers(parsedData);
        setLoading(false);
        return; // Skip the mock data generation if we have cached data
      }
    } catch (error) {
      console.error('Error loading cached data:', error);
    }

    // If no cached data, generate mock data with minimal delay for testing
    const timer = setTimeout(
      () => {
        const mockData = generateMockAdvertisers(25);
        setAdvertisers(mockData);
        setLoading(false);

        // Cache data in localStorage for offline use
        try {
          localStorage.setItem('carousely-advertisers', JSON.stringify(mockData));
        } catch (error) {
          console.error('Error caching advertiser data:', error);
        }
      },
      process.env.NODE_ENV === 'test' ? 100 : 800,
    );

    return () => clearTimeout(timer);
  }, []);

  // Handle geolocation permission
  const requestGeolocation = () => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        position => {
          setGeolocationEnabled(true);
          toast({
            title: 'Location enabled',
            description: 'Finding matches near you!',
            duration: 3000,
          });
        },
        error => {
          toast({
            title: 'Location access denied',
            description: 'Enable location for better matches',
            duration: 3000,
            variant: 'destructive',
          });
        },
      );
    }
  };

  // Handle push notification permission
  const requestNotifications = async () => {
    if ('Notification' in window) {
      const permission = await Notification.requestPermission();

      if (permission === 'granted') {
        setNotificationsEnabled(true);
        toast({
          title: 'Notifications enabled',
          description: "We'll notify you of new matches!",
          duration: 3000,
        });
      } else {
        toast({
          title: 'Notifications disabled',
          description: 'Enable notifications to get match alerts',
          duration: 3000,
          variant: 'destructive',
        });
      }
    }
  };

  // Handle swipe actions
  const handleSwipe = (direction: 'left' | 'right', advertiserId: string) => {
    if (direction === 'right') {
      toast({
        title: "It's a match!",
        description: 'You liked this profile',
        duration: 2000,
      });
    }

    // Remove advertiser from list after swipe
    setAdvertisers(prev => prev.filter(ad => ad.id !== advertiserId));
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <EnhancedNavbar />
      <PWAInit />
      <main className="pt-16 md:pt-16">
        <div className="container mx-auto p-4">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold">Find Your Match</h1>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="icon"
                onClick={requestGeolocation}
                className={geolocationEnabled ? 'bg-green-100' : ''}
                data-testid="geolocation-button"
              >
                <CompassIcon className={geolocationEnabled ? 'text-green-600' : ''} />
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={requestNotifications}
                className={notificationsEnabled ? 'bg-green-100' : ''}
                data-testid="notification-button"
              >
                <BellIcon className={notificationsEnabled ? 'text-green-600' : ''} />
              </Button>
            </div>
          </div>

          {loading ? (
            <div
              className="h-[600px] flex items-center justify-center"
              data-testid="loading-spinner-container"
            >
              <div
                className="animate-spin rounded-full h-20 w-20 border-t-2 border-b-2 border-primary"
                data-testid="loading-spinner"
              ></div>
            </div>
          ) : (
            <>
              <div className="relative mb-8" data-testid="carousel-container">
                <CarouselWheel advertisers={advertisers} onSwipe={handleSwipe} />

                {/* Swipe action buttons */}
                <div
                  className="absolute bottom-6 left-1/2 transform -translate-x-1/2 flex gap-4"
                  data-testid="action-buttons"
                >
                  <Button
                    size="lg"
                    variant="destructive"
                    className="rounded-full h-14 w-14 flex items-center justify-center shadow-lg"
                    onClick={() => handleSwipe('left', advertisers[0]?.id)}
                    data-testid="dislike-button"
                  >
                    <XIcon size={24} />
                  </Button>
                  <Button
                    size="lg"
                    variant="default"
                    className="rounded-full h-14 w-14 flex items-center justify-center bg-gradient-to-r from-pink-500 to-rose-500 shadow-lg"
                    onClick={() => handleSwipe('right', advertisers[0]?.id)}
                    data-testid="like-button"
                  >
                    <HeartIcon size={24} />
                  </Button>
                </div>
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
}
