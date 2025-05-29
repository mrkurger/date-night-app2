'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { AdvertiserProfile } from '@/components/advertiser/advertiser-profile';
import type { Advertiser } from '@/lib/data';
import { Header } from '@/components/header';
import { useData } from '@/context/data-context';
import { DebugInfo } from '@/components/debug-info';

export function AdvertiserDetailWrapper({ id }: { id: string }) {
  const router = useRouter();
  const { getAdvertiser } = useData();
  const [advertiser, setAdvertiser] = useState<Advertiser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showDebug, setShowDebug] = useState(false);

  useEffect(() => {
    console.log('Fetching advertiser with ID:', id);

    try {
      // Fetch the advertiser data
      const fetchedAdvertiser = getAdvertiser(id);
      console.log('Fetched advertiser:', fetchedAdvertiser);

      if (fetchedAdvertiser) {
        setAdvertiser(fetchedAdvertiser);
      } else {
        console.error(`Advertiser with ID ${id} not found`);
        setError(`Advertiser with ID ${id} not found`);
      }
    } catch (err) {
      console.error('Error fetching advertiser:', err);
      if (err instanceof Error) {
        setError(`Error fetching advertiser: ${err.message}`);
      } else {
        setError('An unknown error occurred while fetching advertiser data.');
      }
    } finally {
      setLoading(false);
    }
  }, [id, getAdvertiser]);

  // Show loading state
  if (loading) {
    return (
      <div>
        <Header />
        <div className="container mx-auto py-8 flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-pink-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-lg">Loading advertiser profile...</p>
          </div>
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div>
        <Header />
        <div className="container mx-auto py-8 flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-red-500 mb-4">Error</h2>
            <p className="text-lg mb-4">{error}</p>
            <div className="space-y-4">
              <Button onClick={() => router.push('/advertisers')}>Browse All Advertisers</Button>

              <div>
                <Button variant="outline" onClick={() => setShowDebug(!showDebug)}>
                  {showDebug ? 'Hide Debug Info' : 'Show Debug Info'}
                </Button>

                {showDebug && (
                  <DebugInfo
                    data={{
                      requestedId: id,
                      typeOfId: typeof id,
                      error,
                    }}
                    title="Debug Information"
                  />
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // If we have an advertiser, show the profile
  if (advertiser) {
    return (
      <div>
        <Header />
        <AdvertiserProfile advertiser={advertiser} />

        {showDebug && (
          <div className="container mx-auto px-4 mt-8">
            <Button variant="outline" onClick={() => setShowDebug(!showDebug)}>
              {showDebug ? 'Hide Debug Info' : 'Show Debug Info'}
            </Button>
            {showDebug && <DebugInfo data={advertiser} title="Advertiser Data" />}
          </div>
        )}
      </div>
    );
  }

  // Fallback - should not reach here
  return (
    <div>
      <Header />
      <div className="container mx-auto py-8 text-center">
        <p>Something went wrong. Please try again.</p>
        <Button className="mt-4" onClick={() => router.push('/advertisers')}>
          Browse All Advertisers
        </Button>
      </div>
    </div>
  );
}
