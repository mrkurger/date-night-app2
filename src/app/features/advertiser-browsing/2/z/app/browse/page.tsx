'use client';

import { useState, useEffect } from 'react';
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

// Enhanced sample data with premium flag and better images
const advertisers = [
  {
    id: 1,
    name: 'Jasmine',
    age: 25,
    location: 'Stockholm, Sweden',
    description:
      'Professional dancer with 5 years of experience. Specializing in private performances.',
    tags: ['dancer', 'performer', 'private events'],
    image: '/placeholder.svg?height=400&width=300&text=Jasmine',
    rating: 4.8,
    isVip: true,
    isOnline: true,
    isPremium: true,
  },
  {
    id: 2,
    name: 'Crystal',
    age: 27,
    location: 'Oslo, Norway',
    description: 'Certified massage therapist offering relaxing and therapeutic sessions.',
    tags: ['massage', 'therapy', 'relaxation'],
    image: '/placeholder.svg?height=400&width=300&text=Crystal',
    rating: 4.9,
    isVip: false,
    isOnline: true,
    isPremium: true,
  },
  {
    id: 3,
    name: 'Destiny',
    age: 24,
    location: 'Copenhagen, Denmark',
    description: 'Experienced entertainer specializing in exclusive private shows.',
    tags: ['entertainer', 'exclusive', 'private'],
    image: '/placeholder.svg?height=400&width=300&text=Destiny',
    rating: 4.7,
    isVip: true,
    isOnline: false,
    isPremium: true,
  },
  {
    id: 4,
    name: 'Amber',
    age: 26,
    location: 'Helsinki, Finland',
    description: 'Professional dancer with background in ballet and contemporary styles.',
    tags: ['dancer', 'performer', 'artistic'],
    image: '/placeholder.svg?height=400&width=300&text=Amber',
    rating: 4.6,
    isVip: false,
    isOnline: true,
    isPremium: false,
  },
  {
    id: 5,
    name: 'Sophia',
    age: 28,
    location: 'Gothenburg, Sweden',
    description:
      'Experienced massage therapist specializing in deep tissue and relaxation techniques.',
    tags: ['massage', 'therapy', 'wellness'],
    image: '/placeholder.svg?height=400&width=300&text=Sophia',
    rating: 4.9,
    isVip: true,
    isOnline: true,
    isPremium: true,
  },
  {
    id: 6,
    name: 'Tiffany',
    age: 25,
    location: 'Bergen, Norway',
    description: 'Professional entertainer with expertise in private performances.',
    tags: ['entertainer', 'private', 'events'],
    image: '/placeholder.svg?height=400&width=300&text=Tiffany',
    rating: 4.7,
    isVip: false,
    isOnline: false,
    isPremium: false,
  },
  {
    id: 7,
    name: 'Melody',
    age: 27,
    location: 'Aarhus, Denmark',
    description: 'Skilled dancer with experience in various styles and private events.',
    tags: ['dancer', 'performer', 'versatile'],
    image: '/placeholder.svg?height=400&width=300&text=Melody',
    rating: 4.8,
    isVip: true,
    isOnline: true,
    isPremium: false,
  },
  {
    id: 8,
    name: 'Victoria',
    age: 26,
    location: 'Reykjavik, Iceland',
    description: 'Licensed massage therapist offering premium relaxation services.',
    tags: ['massage', 'premium', 'relaxation'],
    image: '/placeholder.svg?height=400&width=300&text=Victoria',
    rating: 4.9,
    isVip: false,
    isOnline: true,
    isPremium: false,
  },
  // Additional advertisers for infinite scrolling
  {
    id: 9,
    name: 'Natalie',
    age: 24,
    location: 'Stockholm, Sweden',
    description: 'Experienced dancer specializing in private performances and events.',
    tags: ['dancer', 'performer', 'events'],
    image: '/placeholder.svg?height=400&width=300&text=Natalie',
    rating: 4.7,
    isVip: true,
    isOnline: true,
    isPremium: false,
  },
  {
    id: 10,
    name: 'Emma',
    age: 26,
    location: 'Oslo, Norway',
    description: 'Professional massage therapist with expertise in relaxation techniques.',
    tags: ['massage', 'therapy', 'wellness'],
    image: '/placeholder.svg?height=400&width=300&text=Emma',
    rating: 4.8,
    isVip: false,
    isOnline: true,
    isPremium: false,
  },
  {
    id: 11,
    name: 'Olivia',
    age: 25,
    location: 'Copenhagen, Denmark',
    description: 'Versatile entertainer offering exclusive private shows.',
    tags: ['entertainer', 'exclusive', 'private'],
    image: '/placeholder.svg?height=400&width=300&text=Olivia',
    rating: 4.6,
    isVip: true,
    isOnline: false,
    isPremium: false,
  },
  {
    id: 12,
    name: 'Isabella',
    age: 27,
    location: 'Helsinki, Finland',
    description: 'Skilled dancer with background in multiple dance styles.',
    tags: ['dancer', 'performer', 'artistic'],
    image: '/placeholder.svg?height=400&width=300&text=Isabella',
    rating: 4.7,
    isVip: false,
    isOnline: true,
    isPremium: false,
  },
];

// Function to simulate loading more advertisers (for infinite scrolling)
const getMoreAdvertisers = page => {
  // In a real app, this would be an API call
  return advertisers.slice(0, 8).map(ad => ({
    ...ad,
    id: ad.id + page * 12,
    name: `${ad.name} ${page}`,
    isPremium: false,
  }));
};

export default function BrowsePage() {
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

  // Load more advertisers for infinite scrolling
  const loadMore = page => {
    const newAds = getMoreAdvertisers(page);
    setDisplayedAdvertisers(prev => [...prev, ...newAds]);
  };

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
                loadMore={loadMore}
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
