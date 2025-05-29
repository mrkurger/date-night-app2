'use client';

import React, { useEffect, useState, useCallback } from 'react';
import TabNavigation from '@/components/tab-navigation';
import ChatWidget from '@/components/chat/chat-widget';
import NetflixView from '@/components/netflix-view';
import TinderView from '@/components/tinder-view';
import PremiumAdsSection from '@/components/premium-ads-section';
import PaidPlacementSidebar from '@/components/paid-placement-sidebar';
import { useSidebar } from '@/components/ui/sidebar';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search } from 'lucide-react';
import { debounce } from 'lodash';

// Define the Advertiser interface according to the NetflixView component's needs
interface Advertiser {
  id: number;
  name: string;
  location: string;
  image: string;
  aspectRatio?: string; // e.g., "16:9", "4:3", "1:1"
}

// Extended initial set of advertisers with aspectRatio for varied layout
const initialAdvertisers: Advertiser[] = [
  {
    id: 1,
    name: 'Jasmine',
    location: 'Stockholm, Sweden',
    image: '/placeholder.svg?height=600&width=400&text=Jasmine',
    aspectRatio: '2:3',
  },
  {
    id: 2,
    name: 'Crystal',
    location: 'Oslo, Norway',
    image: '/placeholder.svg?height=400&width=600&text=Crystal',
    aspectRatio: '3:2',
  },
  {
    id: 3,
    name: 'Destiny',
    location: 'Copenhagen, Denmark',
    image: '/placeholder.svg?height=500&width=500&text=Destiny',
    aspectRatio: '1:1',
  },
  {
    id: 4,
    name: 'Amber',
    location: 'Helsinki, Finland',
    image: '/placeholder.svg?height=600&width=300&text=Amber',
    aspectRatio: '1:2',
  },
  {
    id: 5,
    name: 'Sophia',
    location: 'Gothenburg, Sweden',
    image: '/placeholder.svg?height=450&width=600&text=Sophia',
    aspectRatio: '4:3',
  },
  {
    id: 6,
    name: 'Tiffany',
    location: 'Bergen, Norway',
    image: '/placeholder.svg?height=600&width=400&text=Tiffany',
    aspectRatio: '2:3',
  },
  {
    id: 7,
    name: 'Melody',
    location: 'Aarhus, Denmark',
    image: '/placeholder.svg?height=300&width=600&text=Melody',
    aspectRatio: '2:1',
  },
  {
    id: 8,
    name: 'Victoria',
    location: 'Reykjavik, Iceland',
    image: '/placeholder.svg?height=500&width=500&text=Victoria',
    aspectRatio: '1:1',
  },
];

// Simulate fetching more advertisers
const fetchMoreAdvertisers = async (page: number): Promise<Advertiser[]> => {
  console.log(`Fetching page ${page}`);
  return new Promise(resolve => {
    setTimeout(() => {
      const newAdvertisers = Array.from({ length: 8 }, (_, i) => {
        const id = page * 8 + i + 1;
        // Cycle through predefined aspect ratios for variety
        const aspectRatios = ['2:3', '3:2', '1:1', '1:2', '4:3', '2:1'];
        const aspectRatio = aspectRatios[id % aspectRatios.length];
        return {
          id,
          name: `Advertiser ${id}`,
          location: `City ${id}, Country`,
          image: `/placeholder.svg?height=${Math.floor(
            Math.random() * 300 + 300,
          )}&width=${Math.floor(Math.random() * 300 + 300)}&text=Advertiser+${id}`,
          aspectRatio,
        };
      });
      resolve(newAdvertisers);
    }, 1000); // Simulate network delay
  });
};

export default function BrowsePage() {
  const [advertisers, setAdvertisers] = useState<Advertiser[]>(initialAdvertisers);
  const [page, setPage] = useState(1); // Start with page 1 for fetching more
  const [isLoading, setIsLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true); // Assume there's more data initially
  const [activeView, setActiveView] = useState<'grid' | 'cards' | 'map' | 'nearby' | 'featured'>(
    'grid',
  );
  const [selectedLocation, setSelectedLocation] = useState<{
    country: string;
    city: string;
  } | null>(null);
  const [displayedAdvertisers, setDisplayedAdvertisers] = useState(advertisers);
  const [premiumAds, setPremiumAds] = useState([]);
  const [paidPlacementAds, setPaidPlacementAds] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const { state } = useSidebar();

  // Initialize premium and paid placement ads
  useEffect(() => {
    // Filter premium ads
    const premium = advertisers.filter(ad => ad.isPremium);
    setPremiumAds(premium);

    // Select random ads for paid placement sidebar
    const randomAds = [...advertisers].sort(() => 0.5 - Math.random()).slice(0, 5);
    setPaidPlacementAds(randomAds);

    // Initial display
    setDisplayedAdvertisers(advertisers);
  }, []);

  // Filter advertisers based on selected location
  useEffect(() => {
    if (!isSearching) {
      if (selectedLocation) {
        const filtered = advertisers.filter(
          advertiser =>
            advertiser.location.includes(selectedLocation.city) &&
            advertiser.location.includes(selectedLocation.country),
        );
        setDisplayedAdvertisers(filtered.length > 0 ? filtered : advertisers);
      } else {
        setDisplayedAdvertisers(advertisers);
      }
    }
  }, [selectedLocation, isSearching]);

  // Handle search
  const handleSearch = e => {
    e.preventDefault();
    setIsSearching(true);

    if (!searchQuery.trim()) {
      setIsSearching(false);
      return setDisplayedAdvertisers(advertisers);
    }

    const query = searchQuery.toLowerCase();

    // First, get premium ads that match the search
    const matchingPremiumAds = advertisers.filter(
      ad =>
        ad.isPremium &&
        (ad.name.toLowerCase().includes(query) ||
          ad.description.toLowerCase().includes(query) ||
          ad.location.toLowerCase().includes(query) ||
          ad.tags.some(tag => tag.toLowerCase().includes(query))),
    );

    // Then, get regular ads that match the search
    const matchingRegularAds = advertisers.filter(
      ad =>
        !ad.isPremium &&
        (ad.name.toLowerCase().includes(query) ||
          ad.description.toLowerCase().includes(query) ||
          ad.location.toLowerCase().includes(query) ||
          ad.tags.some(tag => tag.toLowerCase().includes(query))),
    );

    // Combine premium ads first, then regular ads
    setDisplayedAdvertisers([...matchingPremiumAds, ...matchingRegularAds]);
  };

  // Reset search
  const clearSearch = () => {
    setSearchQuery('');
    setIsSearching(false);
    setDisplayedAdvertisers(advertisers);
  };

  const loadMoreAdvertisers = useCallback(
    debounce(async () => {
      if (isLoading || !hasMore) return;

      setIsLoading(true);
      const newAdvertisers = await fetchMoreAdvertisers(page);
      if (newAdvertisers.length > 0) {
        setAdvertisers(prev => [...prev, ...newAdvertisers]);
        setPage(prev => prev + 1);
      } else {
        setHasMore(false); // No more advertisers to load
      }
      setIsLoading(false);
    }, 300),
    [isLoading, hasMore, page],
  ); // Debounce to prevent rapid firing

  return (
    <div className="min-h-screen">
      <div className="container mx-auto px-4 py-4">
        {/* Search bar */}
        <div className="mb-2">
          <form onSubmit={handleSearch} className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                type="search"
                placeholder="Search by name, location, services..."
                className="pl-10 bg-background/10 border-gray-700 focus:border-pink-500"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
              />
            </div>
            <Button type="submit" className="bg-pink-600 hover:bg-pink-700">
              Search
            </Button>
            {isSearching && (
              <Button variant="outline" onClick={clearSearch}>
                Clear
              </Button>
            )}
          </form>
        </div>
      </div>

      <TabNavigation activeView={activeView} onChange={view => setActiveView(view)} />

      <div className="container mx-auto px-4 py-4">
        {selectedLocation && !isSearching && (
          <div className="mb-4">
            <h2 className="text-xl font-semibold">
              Advertisers in {selectedLocation.city}, {selectedLocation.country}
            </h2>
          </div>
        )}

        {isSearching && (
          <div className="mb-4">
            <h2 className="text-xl font-semibold">Search results for "{searchQuery}"</h2>
            <p className="text-gray-400">Found {displayedAdvertisers.length} advertisers</p>
          </div>
        )}

        <div className="flex flex-col lg:flex-row gap-6">
          <div className="flex-1">
            {/* Premium ads section - only show if not searching or if we have premium results */}
            {(!isSearching || (isSearching && displayedAdvertisers.some(ad => ad.isPremium))) && (
              <PremiumAdsSection
                premiumAds={
                  isSearching ? displayedAdvertisers.filter(ad => ad.isPremium) : premiumAds
                }
              />
            )}

            {/* Main content area */}
            {activeView === 'grid' && (
              <NetflixView
                advertisers={
                  isSearching
                    ? displayedAdvertisers.filter(ad => !ad.isPremium)
                    : displayedAdvertisers.filter(ad => !ad.isPremium)
                }
                loadMore={loadMoreAdvertisers}
              />
            )}
            {activeView === 'cards' && <TinderView advertisers={displayedAdvertisers} />}
            {activeView === 'map' && (
              <div className="bg-gray-800/50 rounded-lg p-8 text-center">
                <h3 className="text-xl mb-2">Map View</h3>
                <p className="text-gray-400">Map view is coming soon!</p>
              </div>
            )}
            {activeView === 'nearby' && (
              <div className="bg-gray-800/50 rounded-lg p-8 text-center">
                <h3 className="text-xl mb-2">Nearby Advertisers</h3>
                <p className="text-gray-400">Nearby view is coming soon!</p>
              </div>
            )}
            {activeView === 'featured' && (
              <div className="bg-gray-800/50 rounded-lg p-8 text-center">
                <h3 className="text-xl mb-2">Featured Advertisers</h3>
                <p className="text-gray-400">Featured view is coming soon!</p>
              </div>
            )}
          </div>

          {/* Right sidebar with paid placement ads */}
          <div className="hidden lg:block">
            <PaidPlacementSidebar ads={paidPlacementAds} />
          </div>
        </div>
      </div>

      {/* Chat Widget */}
      <ChatWidget />
    </div>
  );
}
