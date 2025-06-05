'use client';

import * as React from 'react';
import { useState, useEffect } from 'react';
import Image from 'next/image';
import { Advertiser, getAdvertisers, getProfileImage } from '@/lib/data'; // Assuming getAdvertisers fetches all and we filter locally
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import EnhancedNavbar from '@/components/enhanced-navbar'; // Corrected import
import { Footer } from '@/components/footer'; // Corrected import
import { ArrowRight } from 'lucide-react'; // Import icon

// Mock function to get favorite IDs (replace with actual logic, e.g., from context or API)
const getFavoriteAdvertiserIds = (): number[] => {
  // For demonstration, let's say advertisers with ID 1, 3, 5 are favorites
  // In a real app, this would come from user data, localStorage, or a backend
  const storedFavorites = localStorage.getItem('favoriteAdvertiserIds');
  if (storedFavorites) {
    return JSON.parse(storedFavorites);
  }
  // Default favorites if nothing in localStorage
  return [1, 3, 5];
};

const FavoritesPage: React.FC = () => {
  const [favoriteAdvertisers, setFavoriteAdvertisers] = useState<Advertiser[]>([]);
  const [allAdvertisers, setAllAdvertisers] = useState<Advertiser[]>([]);

  useEffect(() => {
    const advertisers = getAdvertisers();
    setAllAdvertisers(advertisers);
    const favoriteIds = getFavoriteAdvertiserIds();
    const favorites = advertisers.filter(adv => favoriteIds.includes(adv.id));
    setFavoriteAdvertisers(favorites);
  }, []);

  // Function to remove from favorites (example)
  const removeFromFavorites = (advertiserId: number) => {
    const currentFavoriteIds = getFavoriteAdvertiserIds();
    const updatedFavoriteIds = currentFavoriteIds.filter(id => id !== advertiserId);
    localStorage.setItem('favoriteAdvertiserIds', JSON.stringify(updatedFavoriteIds));
    setFavoriteAdvertisers((prev: Advertiser[]) =>
      prev.filter((adv: Advertiser) => adv.id !== advertiserId),
    ); // Added types for prev and adv
    // Potentially update a global state/context if used
  };

  return (
    <>
      <EnhancedNavbar />
      <div className="min-h-screen bg-gradient-to-b from-slate-900 to-purple-900 text-white">
        <main className="container mx-auto px-4 py-12">
          <header className="mb-10 text-center">
            <h1 className="text-5xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-pink-400 via-purple-400 to-indigo-400">
              Your Favorite Profiles
            </h1>
            <p className="mt-3 text-xl text-slate-300">
              The advertisers you&apos;ve saved. Revisit them anytime.
            </p>
          </header>

          {favoriteAdvertisers.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
              {favoriteAdvertisers.map((adv: Advertiser) => (
                <Card
                  key={adv.id}
                  className="bg-slate-800 border-slate-700 shadow-xl rounded-lg overflow-hidden flex flex-col transform transition-all duration-300 hover:scale-105 hover:shadow-purple-500/40"
                >
                  <CardHeader className="p-0 relative">
                    <div className="relative h-72">
                      <Image
                        src={getProfileImage(adv)}
                        alt={adv.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                    {adv.isVip && (
                      <Badge
                        variant="secondary"
                        className="absolute top-3 right-3 bg-yellow-400 text-slate-900 font-bold px-2 py-1 text-xs rounded-full shadow-md"
                      >
                        VIP
                      </Badge>
                    )}
                    {adv.isOnline && (
                      <div className="absolute bottom-3 left-3 flex items-center space-x-1.5 bg-green-500/80 text-white px-2.5 py-1 rounded-full text-xs font-semibold backdrop-blur-sm">
                        <span className="w-2 h-2 bg-green-300 rounded-full animate-pulse"></span>
                        <span>Online</span>
                      </div>
                    )}
                  </CardHeader>
                  <CardContent className="p-5 flex-grow">
                    <div className="flex justify-between items-center mb-2">
                      <CardTitle className="text-2xl font-semibold text-pink-400 hover:text-pink-300 transition-colors">
                        {adv.name}
                      </CardTitle>
                      <span
                        className={`text-lg ${'★'.repeat(Math.floor(adv.rating))}${'☆'.repeat(
                          5 - Math.floor(adv.rating),
                        )} text-yellow-400`}
                      ></span>
                    </div>
                    <p className="text-sm text-slate-400 mb-1">
                      {adv.city} - Age: {adv.age}
                    </p>
                    <p className="text-sm text-slate-400 mb-3">
                      Rating: {adv.rating.toFixed(1)} ({adv.reviewsCount} reviews)
                    </p>
                    {adv.headline && (
                      <p
                        className="text-md text-slate-300 italic mb-3 truncate"
                        title={adv.headline}
                      >
                        “{adv.headline}”
                      </p>
                    )}
                    {adv.tags && adv.tags.length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-4">
                        {adv.tags.slice(0, 3).map(tag => (
                          <Badge
                            key={tag}
                            variant="outline"
                            className="border-purple-400 text-purple-300 text-xs px-2.5 py-0.5"
                          >
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </CardContent>
                  <CardFooter className="p-5 bg-slate-800/50 border-t border-slate-700 mt-auto flex items-center justify-between">
                    <Button
                      variant="default"
                      className="w-2/3 bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white font-semibold shadow-md hover:shadow-lg transition-all duration-300 transform hover:-translate-y-0.5"
                      onClick={() => console.log('View profile:', adv.id)}
                    >
                      View Profile
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-slate-400 border-slate-600 hover:bg-slate-700 hover:text-red-400 hover:border-red-500 transition-colors"
                      onClick={() => removeFromFavorites(adv.id)}
                      title="Remove from favorites"
                    >
                      Remove
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-20">
              <svg
                className="mx-auto h-16 w-16 text-slate-500 mb-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth="1.5"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z"
                />
              </svg>
              <p className="text-2xl font-semibold text-slate-400">
                You haven&apos;t favorited any profiles yet.
              </p>
              <p className="mt-2 text-slate-500">Start browsing and add some!</p>
              <Button
                variant="default"
                className="mt-6 bg-pink-500 hover:bg-pink-600 text-white font-semibold px-6 py-2.5 rounded-lg shadow-md hover:shadow-lg transition-all"
                onClick={() => (window.location.href = '/advertisers')} // Simple navigation
              >
                Browse Advertisers
              </Button>
            </div>
          )}
        </main>
      </div>
      <Footer />
    </>
  );
};

export default FavoritesPage;
