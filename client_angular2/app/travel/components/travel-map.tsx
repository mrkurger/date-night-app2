'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import dynamic from 'next/dynamic';
import { TravelService } from '@/services/travel-service';

// Dynamically import the map component to avoid SSR issues
const Map = dynamic(() => import('@/components/map'), {
  ssr: false,
  loading: () => (
    <div className="h-full w-full flex items-center justify-center">
      <Skeleton className="h-[500px] w-full rounded-md" />
    </div>
  ),
});

interface TravelMapProps {
  isLoading?: boolean;
  adId?: string;
}

export default function TravelMap({ isLoading = false, adId }: TravelMapProps) {
  const [itineraries, setItineraries] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
  const [trackingEnabled, setTrackingEnabled] = useState(false);
  const trackingIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const fetchItineraries = useCallback(async () => {
    try {
      setError(null);
      let fetchedItineraries: any[] = [];
      
      try {
        if (adId) {
          // If adId is provided, get itineraries for this specific ad
          fetchedItineraries = await TravelService.getItinerariesByAdId(adId);
        } else {
          // Otherwise get all itineraries for the user
          fetchedItineraries = await TravelService.getAllItineraries();
        }
        
        setItineraries(fetchedItineraries);
      } catch (apiError) {
        console.error('API error:', apiError);
        setError('Failed to load itineraries from the server. Using mock data instead.');
        
        // Fallback to mock data if API call fails
        const mockItineraries = [
          {
            id: '1',
            destination: {
              city: 'Oslo',
              county: 'Oslo',
              location: {
                coordinates: [10.7522, 59.9139], // [longitude, latitude]
              },
            },
            arrivalDate: '2025-06-15T12:00:00Z',
            departureDate: '2025-06-20T12:00:00Z',
            status: 'planned',
          },
          {
            id: '2',
            destination: {
              city: 'Bergen',
              county: 'Vestland',
              location: {
                coordinates: [5.3221, 60.3913],
              },
            },
            arrivalDate: '2025-06-22T12:00:00Z',
            departureDate: '2025-06-28T12:00:00Z',
            status: 'planned',
          },
          {
            id: '3',
            destination: {
              city: 'Trondheim',
              county: 'Trøndelag',
              location: {
                coordinates: [10.3951, 63.4305],
              },
            },
            arrivalDate: '2025-07-01T12:00:00Z',
            departureDate: '2025-07-07T12:00:00Z',
            status: 'planned',
          },
        ];
        
        setItineraries(mockItineraries);
      }
    } catch (err) {
      console.error('Error fetching itineraries:', err);
      setError('Unable to load travel itineraries. Please try again later.');
    }
  }, [adId]);

  useEffect(() => {
    if (!isLoading) {
      fetchItineraries();
    }

    return () => {
      if (trackingIntervalRef.current) {
        clearInterval(trackingIntervalRef.current);
      }
    };
  }, [isLoading, fetchItineraries]);

  const handleLocationTrackingToggle = () => {
    if (trackingEnabled) {
      // Stop tracking
      if (trackingIntervalRef.current) {
        clearInterval(trackingIntervalRef.current);
        trackingIntervalRef.current = null;
      }
      setTrackingEnabled(false);
    } else {
      // Start tracking
      startLocationTracking();
      setTrackingEnabled(true);
    }
  };

  const startLocationTracking = () => {
    // First get initial location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        position => {
          const newPosition: [number, number] = [
            position.coords.longitude,
            position.coords.latitude,
          ];
          setUserLocation(newPosition);
          
          // If we have an ad ID, update the location on the server
          if (adId) {
            updateLocationOnServer(newPosition);
          }
        },
        error => {
          console.error('Error getting location:', error);
          setError('Unable to access your location. Please check your browser permissions.');
        },
      );

      // Then set up interval for continued tracking
      trackingIntervalRef.current = setInterval(() => {
        navigator.geolocation.getCurrentPosition(
          position => {
            const newPosition: [number, number] = [
              position.coords.longitude,
              position.coords.latitude,
            ];
            setUserLocation(newPosition);
            
            // If we have an ad ID, update the location on the server
            if (adId) {
              updateLocationOnServer(newPosition);
            }
          },
          error => {
            console.error('Error getting location:', error);
          },
        );
      }, 60000); // Update every minute
    } else {
      setError('Geolocation is not supported by this browser.');
    }
  };

  const updateLocationOnServer = async (coordinates: [number, number]) => {
    if (!adId) return;
    
    try {
      await TravelService.updateCurrentLocation(adId, coordinates);
      console.log('Location updated on server');
    } catch (err) {
      console.error('Failed to update location on server:', err);
    }
  };

  const prepareMapMarkers = () => {
    if (!itineraries || itineraries.length === 0) return [];

    return itineraries.map(itinerary => ({
      id: itinerary.id,
      position: itinerary.destination.location.coordinates,
      popup: `<strong>${itinerary.destination.city}, ${itinerary.destination.county}</strong><br/>
      ${new Date(itinerary.arrivalDate).toLocaleDateString()} - ${new Date(
        itinerary.departureDate,
      ).toLocaleDateString()}`,
      status: itinerary.status,
    }));
  };

  const getMapCenter = () => {
    if (userLocation) return userLocation;
    if (itineraries.length > 0) return itineraries[0].destination.location.coordinates;
    return [10.7522, 59.9139]; // Default to Oslo, Norway if nothing else available
  };

  if (isLoading) {
    return (
      <Card className="h-[600px]">
        <CardContent className="p-0">
          <div className="h-[600px] w-full flex items-center justify-center">
            <Skeleton className="h-full w-full rounded-md" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Card className="h-[600px]">
        <CardContent className="p-0">
          <div className="h-[600px] w-full">
            <Map
              center={getMapCenter()}
              zoom={6}
              markers={prepareMapMarkers()}
              userLocation={userLocation}
              onLoad={() => setMapLoaded(true)}
            />
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button
          variant="outline"
          className={trackingEnabled ? 'bg-blue-100 border-blue-300' : ''}
          onClick={handleLocationTrackingToggle}
        >
          {trackingEnabled ? 'Stop Sharing Location' : 'Share My Location'}
        </Button>
      </div>
    </div>
  );
}
