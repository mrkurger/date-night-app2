'use client';
import Image from 'next/image';

import * as React from 'react';
import { useState, useEffect, useMemo } from 'react';
import { Advertiser, getAdvertisers } from '@/lib/data';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import EnhancedNavbar from '@/components/enhanced-navbar'; // Corrected import
import { Footer } from '@/components/footer'; // Corrected import
import { ArrowRight, SearchX } from 'lucide-react'; // Import icons

// Define the structure for search filters
interface SearchFilters {
  location: string;
  minAge: string;
  maxAge: string;
  minRating: string;
  isOnline: boolean;
  isVip: boolean;
  tags: string[];
}

const SearchPage: React.FC = () => {
  const [advertisers, setAdvertisers] = useState<Advertiser[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState<SearchFilters>({
    location: '',
    minAge: '',
    maxAge: '',
    minRating: '',
    isOnline: false,
    isVip: false,
    tags: [],
  });

  useEffect(() => {
    setAdvertisers(getAdvertisers());
  }, []);

  const handleFilterChange = (
    filterName: keyof SearchFilters,
    value: string | boolean | string[],
  ) => {
    setFilters((prevFilters: SearchFilters) => ({
      // Added type for prevFilters
      ...prevFilters,
      [filterName]: value,
    }));
  };

  const filteredAdvertisers = useMemo(() => {
    return advertisers.filter((adv: Advertiser) => {
      // Search term filter (name or headline)
      const termMatch =
        searchTerm === '' ||
        adv.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (adv.headline && adv.headline.toLowerCase().includes(searchTerm.toLowerCase()));

      // Location filter
      const locationMatch =
        filters.location === '' || adv.city.toLowerCase().includes(filters.location.toLowerCase());

      // Age filter
      const minAge = parseInt(filters.minAge, 10);
      const maxAge = parseInt(filters.maxAge, 10);
      const ageMatch = (isNaN(minAge) || adv.age >= minAge) && (isNaN(maxAge) || adv.age <= maxAge);

      // Rating filter
      const minRating = parseFloat(filters.minRating);
      const ratingMatch = isNaN(minRating) || adv.rating >= minRating;

      // Online status filter
      const onlineMatch = !filters.isOnline || adv.isOnline;

      // VIP status filter
      const vipMatch = !filters.isVip || adv.isVip;

      // Tags filter
      const tagsMatch =
        filters.tags.length === 0 || filters.tags.every((tag: string) => adv.tags?.includes(tag));

      return (
        termMatch &&
        locationMatch &&
        ageMatch &&
        ratingMatch &&
        onlineMatch &&
        vipMatch &&
        tagsMatch
      );
    });
  }, [advertisers, searchTerm, filters]);

  // Unique values for filter dropdowns
  const uniqueLocations = useMemo(
    () => Array.from(new Set(advertisers.map((adv: Advertiser) => adv.city))),
    [advertisers],
  );
  const allTags = useMemo(
    () => Array.from(new Set(advertisers.flatMap((adv: Advertiser) => adv.tags || []))),
    [advertisers],
  );

  return (
    <>
      <EnhancedNavbar />
      <div className="min-h-screen bg-gray-900 text-white p-4 md:p-8">
        <header className="mb-8">
          <h1 className="text-4xl font-bold text-center text-pink-500">
            Advanced Advertiser Search
          </h1>
          <p className="text-center text-gray-400 mt-2">
            Find exactly who you&apos;re looking for with our detailed filters.
          </p>
        </header>

        {/* Search Input and Main Filters */}
        <div className="mb-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-end p-6 bg-gray-800 rounded-lg shadow-xl">
          <Input
            type="text"
            placeholder="Search by name or headline..."
            className="lg:col-span-2 bg-gray-700 border-gray-600 placeholder-gray-400 text-white focus:ring-pink-500 focus:border-pink-500"
            value={searchTerm}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
          />
          <div className="flex items-center space-x-2">
            <Checkbox
              id="filter-online-search"
              checked={filters.isOnline}
              onCheckedChange={(checked: boolean | 'indeterminate') =>
                handleFilterChange('isOnline', checked === true)
              }
              className="text-pink-500 focus:ring-pink-500 border-gray-600 data-[state=checked]:bg-pink-500 data-[state=checked]:text-white"
            />
            <label htmlFor="filter-online-search" className="text-sm text-gray-300">
              Online Now
            </label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="filter-vip-search"
              checked={filters.isVip}
              onCheckedChange={(checked: boolean | 'indeterminate') =>
                handleFilterChange('isVip', checked === true)
              }
              className="text-pink-500 focus:ring-pink-500 border-gray-600 data-[state=checked]:bg-pink-500 data-[state=checked]:text-white"
            />
            <label htmlFor="filter-vip-search" className="text-sm text-gray-300">
              VIP Members
            </label>
          </div>
        </div>

        {/* Detailed Filter Section */}
        <div className="mb-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 p-6 bg-gray-800 rounded-lg shadow-xl">
          <div>
            <label
              htmlFor="location-filter"
              className="block text-sm font-medium text-gray-300 mb-1"
            >
              Location
            </label>
            <Select
              onValueChange={(value: string) => handleFilterChange('location', value)} // Added type for value
              value={filters.location}
            >
              <SelectTrigger className="w-full bg-gray-700 border-gray-600 text-white focus:ring-pink-500 focus:border-pink-500">
                <SelectValue placeholder="Any Location" />
              </SelectTrigger>
              <SelectContent className="bg-gray-700 text-white border-gray-600">
                <SelectItem value="" className="hover:bg-gray-600">
                  Any Location
                </SelectItem>
                {uniqueLocations.map(
                  (
                    location: string, // Added type for location
                  ) => (
                    <SelectItem key={location} value={location} className="hover:bg-gray-600">
                      {location}
                    </SelectItem>
                  ),
                )}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label
              htmlFor="min-age-filter"
              className="block text-sm font-medium text-gray-300 mb-1"
            >
              Min Age
            </label>
            <Input
              id="min-age-filter"
              type="number"
              placeholder="Any"
              value={filters.minAge}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                handleFilterChange('minAge', e.target.value)
              }
              className="bg-gray-700 border-gray-600 text-white"
            />
          </div>
          <div>
            <label
              htmlFor="max-age-filter"
              className="block text-sm font-medium text-gray-300 mb-1"
            >
              Max Age
            </label>
            <Input
              id="max-age-filter"
              type="number"
              placeholder="Any"
              value={filters.maxAge}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                handleFilterChange('maxAge', e.target.value)
              }
              className="bg-gray-700 border-gray-600 text-white"
            />
          </div>
          <div>
            <label
              htmlFor="min-rating-filter"
              className="block text-sm font-medium text-gray-300 mb-1"
            >
              Min Rating
            </label>
            <Select
              onValueChange={(value: string) => handleFilterChange('minRating', value)} // Added type for value
              value={filters.minRating}
            >
              <SelectTrigger className="w-full bg-gray-700 border-gray-600 text-white focus:ring-pink-500 focus:border-pink-500">
                <SelectValue placeholder="Any Rating" />
              </SelectTrigger>
              <SelectContent className="bg-gray-700 text-white border-gray-600">
                <SelectItem value="" className="hover:bg-gray-600">
                  Any Rating
                </SelectItem>
                {[1, 2, 3, 4, 4.5, 4.8].map(r => (
                  <SelectItem key={r} value={String(r)} className="hover:bg-gray-600">
                    {r} ★ & up
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="lg:col-span-4">
            <label className="block text-sm font-medium text-gray-300 mb-2">Tags</label>
            <div className="flex flex-wrap gap-2">
              {allTags.map(
                (
                  tag: string, // Added type for tag
                ) => (
                  <div key={tag} className="flex items-center space-x-2">
                    <Checkbox
                      id={`tag-${tag}`}
                      checked={filters.tags.includes(tag)}
                      onCheckedChange={(checked: boolean | 'indeterminate') => {
                        const newTags = checked
                          ? [...filters.tags, tag]
                          : filters.tags.filter((t: string) => t !== tag); // Added type for t
                        handleFilterChange('tags', newTags);
                      }}
                      className="text-pink-500 focus:ring-pink-500 border-gray-600 data-[state=checked]:bg-pink-500 data-[state=checked]:text-white"
                    />
                    <label htmlFor={`tag-${tag}`} className="text-sm text-gray-300 cursor-pointer">
                      {tag}
                    </label>
                  </div>
                ),
              )}
            </div>
          </div>
        </div>

        {/* Results Section */}
        {filteredAdvertisers.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredAdvertisers.map((adv: Advertiser) => (
              <Card
                key={adv.id}
                className="bg-gray-800 border-gray-700 shadow-lg hover:shadow-pink-500/30 transition-shadow duration-300 flex flex-col"
              >
                <CardHeader className="p-0 relative h-64">
                  <Image
                    src={adv.image}
                    alt={adv.name}
                    fill
                    className="object-cover rounded-t-lg"
                  />
                </CardHeader>
                <CardContent className="p-4 flex-grow">
                  <div className="flex justify-between items-start mb-2">
                    <CardTitle className="text-xl font-semibold text-pink-400">
                      {adv.name}
                    </CardTitle>
                    {adv.isVip && (
                      <Badge variant="secondary" className="bg-yellow-500/20 text-yellow-300">
                        VIP
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-gray-400">
                    {adv.city} - Age: {adv.age}
                  </p>
                  <div className="flex items-center my-2">
                    <span
                      className={`text-yellow-400 ${'★'.repeat(Math.floor(adv.rating))}${'☆'.repeat(
                        5 - Math.floor(adv.rating),
                      )}`}
                    ></span>
                    <span className="ml-2 text-xs text-gray-400">({adv.rating.toFixed(1)})</span>
                  </div>
                  {adv.headline && (
                    <p className="text-sm text-gray-300 italic mb-2 truncate" title={adv.headline}>
                      {adv.headline}
                    </p>
                  )}
                  {adv.tags && adv.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-3">
                      {adv.tags.slice(0, 3).map(tag => (
                        <Badge
                          key={tag}
                          variant="outline"
                          className="text-xs border-gray-600 text-gray-400"
                        >
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  )}
                </CardContent>
                <CardFooter className="p-4 border-t border-gray-700 mt-auto">
                  <Button
                    variant="default"
                    className="w-full bg-pink-600 hover:bg-pink-700 text-white"
                  >
                    View Profile
                    <ArrowRight className="w-3 h-3 ml-1.5" />
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-16 text-gray-500">
            <SearchX className="w-20 h-20 mx-auto text-neutral-600 mb-4" />
            <p className="text-xl">No advertisers match your current filters.</p>
            <p className="text-sm">Try adjusting your search criteria.</p>
          </div>
        )}
      </div>
      <Footer />
    </>
  );
};

export default SearchPage;
