'use client';
import * as React from 'react';
import { useState, useEffect, useMemo } from 'react';
import { getAdvertisers, Advertiser, getProfileImage } from '@/lib/data'; // Ensure Advertiser is imported
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import EnhancedNavbar from '@/components/enhanced-navbar'; // Corrected import
import { Footer } from '@/components/footer'; // Corrected import

interface Filters {
  onlineOnly: boolean;
  vipOnly: boolean;
  searchTerm: string;
}

const AdvertisersPage: React.FC = () => {
  const [advertisers, setAdvertisers] = useState<Advertiser[]>([]);
  const [filters, setFilters] = useState<Filters>({
    onlineOnly: false,
    vipOnly: false,
    searchTerm: '',
  });
  const [visibleCount, setVisibleCount] = useState(10);

  useEffect(() => {
    setAdvertisers(getAdvertisers());
  }, []);

  const loadMoreAdvertisers = () => {
    setVisibleCount((prevCount: number) => prevCount + 10); // Added type for prevCount
  };

  const filteredAdvertisers = useMemo(() => {
    let tempAdvertisers = advertisers;

    if (filters.onlineOnly) {
      tempAdvertisers = tempAdvertisers.filter((adv: Advertiser) => adv.isOnline); // Added type for adv
    }
    if (filters.vipOnly) {
      tempAdvertisers = tempAdvertisers.filter((adv: Advertiser) => adv.isVip); // Added type for adv
    }
    if (filters.searchTerm) {
      tempAdvertisers = tempAdvertisers.filter(
        (
          adv: Advertiser, // Added type for adv
        ) =>
          adv.name.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
          (adv.headline && adv.headline.toLowerCase().includes(filters.searchTerm.toLowerCase())),
      );
    }

    return tempAdvertisers.slice(0, visibleCount);
  }, [advertisers, filters, visibleCount]);

  return (
    <>
      <EnhancedNavbar />
      <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 text-white">
        <main className="container mx-auto px-4 py-8">
          <header className="mb-8 text-center">
            <h1 className="text-5xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-pink-500 via-red-500 to-yellow-500">
              Meet Our Advertisers
            </h1>
            <p className="mt-2 text-lg text-slate-400">
              Browse profiles, filter by your preferences, and find your perfect match.
            </p>
          </header>

          <div className="mb-8 p-6 bg-slate-800 rounded-xl shadow-2xl flex flex-col md:flex-row gap-6 items-center">
            <Input
              type="text"
              placeholder="Search by name..."
              className="flex-grow bg-slate-700 border-slate-600 placeholder-slate-400 text-white focus:ring-pink-500 focus:border-pink-500"
              value={filters.searchTerm}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setFilters({ ...filters, searchTerm: e.target.value })
              }
            />
            <div className="flex items-center space-x-4">
              <div className="flex items-center">
                <Checkbox
                  id="filter-online"
                  className="text-pink-500 focus:ring-pink-500 border-slate-600 data-[state=checked]:bg-pink-500 data-[state=checked]:text-white"
                  checked={filters.onlineOnly}
                  onCheckedChange={(checked: boolean | 'indeterminate') =>
                    setFilters({ ...filters, onlineOnly: checked === true })
                  }
                />
                <label htmlFor="filter-online" className="ml-2 text-sm font-medium text-slate-300">
                  Online Now
                </label>
              </div>
              <div className="flex items-center">
                <Checkbox
                  id="filter-vip"
                  className="text-pink-500 focus:ring-pink-500 border-slate-600 data-[state=checked]:bg-pink-500 data-[state=checked]:text-white"
                  checked={filters.vipOnly}
                  onCheckedChange={(checked: boolean | 'indeterminate') =>
                    setFilters({ ...filters, vipOnly: checked === true })
                  }
                />
                <label htmlFor="filter-vip" className="ml-2 text-sm font-medium text-slate-300">
                  VIP Members
                </label>
              </div>
            </div>
          </div>

          {filteredAdvertisers.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
              {filteredAdvertisers.map((adv: Advertiser) => (
                <div
                  key={adv.id}
                  className="bg-slate-800 rounded-xl shadow-2xl overflow-hidden transform transition-all duration-300 hover:scale-105 hover:shadow-pink-500/30"
                >
                  <img
                    src={getProfileImage(adv)}
                    alt={adv.name}
                    className="w-full h-72 object-cover"
                  />
                  <div className="p-6">
                    <div className="flex justify-between items-center mb-2">
                      <h2 className="text-2xl font-semibold text-pink-400">{adv.name}</h2>
                      {adv.isVip && (
                        <span className="px-3 py-1 text-xs font-bold text-yellow-300 bg-yellow-500/20 rounded-full">
                          VIP
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-slate-400 mb-1">{adv.city}</p>
                    <p className="text-sm text-slate-400 mb-3">Age: {adv.age}</p>
                    <div className="flex items-center mb-3">
                      <span
                        className={`text-yellow-400 ${'★'.repeat(
                          Math.floor(adv.rating),
                        )}${'☆'.repeat(5 - Math.floor(adv.rating))}`}
                      ></span>
                      <span className="ml-2 text-sm text-slate-400">({adv.rating.toFixed(1)})</span>
                    </div>
                    <p className="text-lg font-semibold text-slate-200 mb-4">{adv.price}</p>
                    <Button
                      variant="default"
                      className="w-full bg-pink-600 hover:bg-pink-700 text-white font-semibold transition-colors duration-300"
                      onClick={() => console.log('View profile:', adv.name)}
                    >
                      View Profile
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <p className="text-2xl text-slate-500">No advertisers match your criteria.</p>
            </div>
          )}

          {visibleCount <
            advertisers.filter(adv => {
              if (filters.onlineOnly && !adv.isOnline) return false;
              if (filters.vipOnly && !adv.isVip) return false;
              return (
                adv.name.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
                (adv.headline &&
                  adv.headline.toLowerCase().includes(filters.searchTerm.toLowerCase()))
              );
            }).length && (
            <div className="mt-12 text-center">
              <Button
                onClick={loadMoreAdvertisers}
                variant="outline"
                className="bg-transparent border-pink-500 text-pink-500 hover:bg-pink-500 hover:text-white transition-colors duration-300 px-8 py-3 text-lg"
              >
                Load More Advertisers
              </Button>
            </div>
          )}
        </main>
      </div>
      <Footer />
    </>
  );
};

export default AdvertisersPage;
