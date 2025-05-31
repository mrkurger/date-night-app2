'use client';

import type React from 'react';
import MasonryGrid from '@/components/MasonryGrid';
import { useState, useEffect } from 'react';
import EnhancedNavbar from '@/components/enhanced-navbar';
import { Footer } from '@/components/footer';
import { MediaTicker } from '@/components/media-ticker';
import { EnhancedCarousel } from '@/components/enhanced-carousel';
import {
  getAdvertisers,
  getPremiumAdvertisers,
  getOnlineAdvertisers,
  Advertiser,
  getFemaleImageByIndex,
} from '@/lib/data';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Search } from 'lucide-react';
import { TipFrenzy } from '@/components/TipFrenzy';

export default function BrowsePage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const [allAdvertisers, setAllAdvertisers] = useState<Advertiser[]>([]);
  const [premiumAdvertisers, setPremiumAdvertisers] = useState<Advertiser[]>([]);
  const [onlineAdvertisers, setOnlineAdvertisers] = useState<Advertiser[]>([]);
  const [newAdvertisers, setNewAdvertisers] = useState<Advertiser[]>([]);
  const [popularAdvertisers, setPopularAdvertisers] = useState<Advertiser[]>([]);

  // Use our local female profile images instead of Unsplash URLs

  useEffect(() => {
    // Get all advertisers with distances
    const all = getAdvertisers().map((adv, index) => ({
      ...adv,
      image: getFemaleImageByIndex(index + 1),
      distance: Math.floor(Math.random() * 20) + 1,
    }));
    setAllAdvertisers(all);

    // Get premium advertisers
    const premium = getPremiumAdvertisers().map((adv, index) => ({
      ...adv,
      image: getFemaleImageByIndex(index + 1),
      distance: Math.floor(Math.random() * 20) + 1,
      isPremium: true,
    }));
    setPremiumAdvertisers(premium);

    // Get online advertisers
    const online = getOnlineAdvertisers().map((adv, index) => ({
      ...adv,
      image: getFemaleImageByIndex(index + 1),
      distance: Math.floor(Math.random() * 20) + 1,
    }));
    setOnlineAdvertisers(online);

    // Get new advertisers (most recent 10)
    const newOnes = [...all]
      .sort(() => Math.random() - 0.5)
      .slice(0, 10)
      .map((adv, index) => ({
        ...adv,
        image: getFemaleImageByIndex(index + 1),
        distance: Math.floor(Math.random() * 20) + 1,
      }));
    setNewAdvertisers(newOnes);

    // Get popular advertisers (highest rated)
    const popular = [...all]
      .sort((a, b) => (b.rating || 0) - (a.rating || 0))
      .slice(0, 10)
      .map((adv, index) => ({
        ...adv,
        image: getFemaleImageByIndex(index + 1),
        distance: Math.floor(Math.random() * 20) + 1,
      }));
    setPopularAdvertisers(popular);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real app, you would search and filter the advertisers
    console.log('Searching for:', searchQuery);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <EnhancedNavbar />
      <MediaTicker />
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <h1 className="text-3xl font-bold mb-8 text-gray-800">Browse Advertisers</h1>

          <form onSubmit={handleSearch} className="flex w-full md:w-auto">
            <Input
              type="search"
              placeholder="Search advertisers..."
              value={searchQuery}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value)}
              className="w-full md:w-[300px]"
            />
            <Button type="submit" className="ml-2">
              <Search className="h-4 w-4 mr-2" />
              Search
            </Button>
          </form>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-8">
          <TabsList className="grid grid-cols-3 md:grid-cols-5 mb-6">
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="premium">Premium</TabsTrigger>
            <TabsTrigger value="online">Online Now</TabsTrigger>
            <TabsTrigger value="new">New</TabsTrigger>
            <TabsTrigger value="popular">Popular</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="mt-0">
            <MasonryGrid items={allAdvertisers.slice(0, 7)} className="mb-12" />
            <EnhancedCarousel advertisers={allAdvertisers} title="All Advertisers" />
          </TabsContent>

          <TabsContent value="premium" className="mt-0">
            <MasonryGrid items={premiumAdvertisers.slice(0, 7)} className="mb-12" />
            <EnhancedCarousel advertisers={premiumAdvertisers} title="Premium Picks" />
          </TabsContent>
          <TabsContent value="online" className="mt-0">
            <MasonryGrid items={onlineAdvertisers.slice(0, 7)} className="mb-12" />
            <EnhancedCarousel advertisers={onlineAdvertisers} title="Online Now" />
          </TabsContent>
          <TabsContent value="new" className="mt-0">
            <MasonryGrid items={newAdvertisers.slice(0, 7)} className="mb-12" />
            <EnhancedCarousel advertisers={newAdvertisers} title="New Faces" />
          </TabsContent>
          <TabsContent value="popular" className="mt-0">
            <MasonryGrid items={popularAdvertisers.slice(0, 7)} className="mb-12" />
            <EnhancedCarousel advertisers={popularAdvertisers} title="Popular Choices" />
          </TabsContent>
        </Tabs>
      </div>
      <TipFrenzy />
      <Footer />
    </div>
  );
}
