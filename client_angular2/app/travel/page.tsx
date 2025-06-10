'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { InfoIcon } from 'lucide-react';
import EnhancedNavbar from '@/components/enhanced-navbar';
import { Footer } from '@/components/footer';
import TravelMap from './components/travel-map';
import ItineraryList from './components/itinerary-list';
import { useAuth } from '@/hooks/use-auth';

export default function TravelPage() {
  const { user, isAuthenticated } = useAuth();
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState('map');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Get adId from query params if provided
  const adId = searchParams.get('adId');

  useEffect(() => {
    // Check for URL parameters and set initial state
    const view = searchParams.get('view');
    if (view === 'list' || view === 'map') {
      setActiveTab(view);
    }

    // Simulate loading data
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, [searchParams]);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <EnhancedNavbar />

      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-800">Travel Itinerary</h1>

          {isAuthenticated && (
            <Link href="/travel/create">
              <Button className="bg-pink-500 hover:bg-pink-600">Create New Itinerary</Button>
            </Link>
          )}
        </div>

        <Alert className="mb-6 bg-blue-50 border-blue-200">
          <InfoIcon className="h-4 w-4 text-blue-500" />
          <AlertTitle className="text-blue-800">Travel Management</AlertTitle>
          <AlertDescription className="text-blue-700">
            Create and manage your travel plans. Let potential clients know when you&apos;ll be in
            their area.
          </AlertDescription>
        </Alert>

        <Tabs defaultValue={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full max-w-md grid-cols-2 mb-6">
            <TabsTrigger value="map">Map View</TabsTrigger>
            <TabsTrigger value="list">List View</TabsTrigger>
          </TabsList>

          <TabsContent value="map" className="mt-4">
            <div className="bg-white rounded-lg shadow-md p-4 h-[600px]">
              <TravelMap isLoading={isLoading} adId={adId || undefined} />
            </div>
          </TabsContent>

          <TabsContent value="list" className="mt-4">
            <div className="bg-white rounded-lg shadow-md p-4">
              <ItineraryList isLoading={isLoading} adId={adId || undefined} />
            </div>
          </TabsContent>
        </Tabs>
      </main>

      <Footer />
    </div>
  );
}
