'use client';

import React, { useState } from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';

// Carousels
import { EnhancedProfileCarousel } from '@/components/EnhancedProfileCarousel';
import { AdvertiserCarousel } from '@/components/advertiser-carousel';
import { CompactAdvertiserCarousel } from '@/components/compact-advertiser-carousel';
import { EnhancedCarousel } from '@/components/enhanced-carousel';
import ImageCarousel from '@/components/image-carousel';

// Grids
import { InfiniteScrollGrid } from '@/components/InfiniteScrollGrid';
import NetflixViewGrid from '@/components/NetflixViewGrid';

// Navbars
import EnhancedNavbar from '@/components/enhanced-navbar';
import { MainNav } from '@/components/main-nav';
import { MobileNav } from '@/components/mobile-nav';

// Views & Hubs
import TinderView from '@/components/TinderView';
import EnhancedTinderView from '@/components/enhanced-tinder-view';
import { GamifiedContentHub } from '@/components/GamifiedContentHub';
import { TipFrenzy } from '@/components/TipFrenzy';
import { DashboardWidgets } from '@/components/dashboard-widgets';
import RankingsPage from '@/components/RankingsPage';

// Utilities
import { ProfileAvatar } from '@/components/profile-avatar';
import { MediaTicker } from '@/components/media-ticker';
import MoneyRain from '@/components/money-rain';
import { DebugInfo } from '@/components/debug-info';
import { UserReview } from '@/components/user-review';

// MagicUI Components
import { ShimmerButton } from '@/components/ui/shimmer-button';
import { NumberTicker } from '@/components/ui/number-ticker';
import { SparklesText } from '@/components/ui/sparkles-text';
import { MagicCard } from '@/components/ui/magic-card';
import { BorderBeam } from '@/components/ui/border-beam';
import { NeonGradientCard } from '@/components/ui/neon-gradient-card';
import { RippleButton } from '@/components/ui/ripple-button';
import { AnimatedShinyText } from '@/components/ui/animated-shiny-text';
import Particles from '@/components/ui/particles';
import Confetti from '@/components/ui/confetti';
import { Meteors } from '@/components/ui/meteors';

// Add sample data
const sampleImages: string[] = [
  '/images/sample1.jpg',
  '/images/sample2.jpg',
  '/images/sample3.jpg',
];

// Sample data for carousel components (simple format)
const sampleAdvertisers = [
  {
    id: 1,
    name: 'Acme Inc',
    image: '/images/sample1.jpg',
    age: 25,
    city: 'Los Angeles',
    rating: 4.8,
    distance: 2,
    price: '150',
    tags: ['premium', 'verified'],
    description: 'Premium entertainment services',
    isOnline: true,
  },
  {
    id: 2,
    name: 'Beta Corp',
    image: '/images/sample2.jpg',
    age: 28,
    city: 'New York',
    rating: 4.6,
    distance: 5,
    price: '120',
    tags: ['new', 'trending'],
    description: 'Trending entertainment options',
    isOnline: false,
  },
  {
    id: 3,
    name: 'Gamma Ltd',
    image: '/images/sample3.jpg',
    age: 26,
    city: 'Miami',
    rating: 4.9,
    distance: 1,
    price: '200',
    tags: ['vip', 'exclusive'],
    description: 'Exclusive VIP experiences',
    isOnline: true,
  },
];

const sampleReview = {
  id: '1',
  user: 'Alice',
  rating: 5,
  date: '2025-05-30',
  comment: 'Great service!',
  userImage: '/avatars/sample1.jpg',
};

export default function ComponentDemoPage() {
  const [activeTab, setActiveTab] = useState('carousels');

  return (
    <div className="p-8 space-y-6">
      <h1 className="text-3xl font-bold">Component Showcase</h1>
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="carousels">Carousels</TabsTrigger>
          <TabsTrigger value="grids">Grids</TabsTrigger>
          <TabsTrigger value="navbars">Navbars</TabsTrigger>
          <TabsTrigger value="views">Views & Hubs</TabsTrigger>
          <TabsTrigger value="reviews">Review System</TabsTrigger>
          <TabsTrigger value="magicui">MagicUI</TabsTrigger>
          <TabsTrigger value="utils">Utilities</TabsTrigger>
        </TabsList>

        <TabsContent value="carousels">
          <section className="space-y-4">
            <h2 className="text-2xl font-semibold">EnhancedProfileCarousel</h2>
            <EnhancedProfileCarousel />

            <h2 className="text-2xl font-semibold">AdvertiserCarousel</h2>
            <AdvertiserCarousel advertisers={sampleAdvertisers} />

            <h2 className="text-2xl font-semibold">CompactAdvertiserCarousel</h2>
            <CompactAdvertiserCarousel advertisers={sampleAdvertisers} />

            <h2 className="text-2xl font-semibold">EnhancedCarousel</h2>
            <EnhancedCarousel advertisers={sampleAdvertisers} />

            <h2 className="text-2xl font-semibold">ImageCarousel</h2>
            <ImageCarousel images={sampleImages} />
          </section>
        </TabsContent>

        <TabsContent value="grids">
          <section className="space-y-8">
            <div className="space-y-4">
              <h2 className="text-2xl font-semibold">InfiniteScrollGrid</h2>
              <p className="text-gray-600">Infinite scroll grid with lazy loading</p>
              <InfiniteScrollGrid />
            </div>

            <div className="space-y-4">
              <h2 className="text-2xl font-semibold">🧱 Masonry Grid Showcase</h2>
              <div className="text-center p-8 bg-gradient-to-br from-blue-900/20 to-purple-900/20 rounded-lg border border-blue-500/30">
                <h3 className="text-2xl font-bold text-white mb-4">
                  Complete Masonry Grid Collection
                </h3>
                <p className="text-gray-300 mb-6">
                  Explore all masonry grid implementations with dynamic layouts, infinite scroll,
                  and interactive profile cards perfect for dating platforms.
                </p>
                <div className="flex justify-center">
                  <a
                    href="/demo/components/masonry"
                    className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-semibold rounded-lg transition-all duration-300 transform hover:scale-105"
                  >
                    <span className="mr-2">🧱</span>
                    View Masonry Showcase
                  </a>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-8">
                  <div className="p-4 bg-gray-800/50 rounded-lg">
                    <div className="text-2xl mb-2">📱</div>
                    <h4 className="font-semibold text-white">Responsive Design</h4>
                    <p className="text-sm text-gray-400">Adapts to all screen sizes</p>
                  </div>
                  <div className="p-4 bg-gray-800/50 rounded-lg">
                    <div className="text-2xl mb-2">⚡</div>
                    <h4 className="font-semibold text-white">Infinite Scroll</h4>
                    <p className="text-sm text-gray-400">Automatic content loading</p>
                  </div>
                  <div className="p-4 bg-gray-800/50 rounded-lg">
                    <div className="text-2xl mb-2">🎨</div>
                    <h4 className="font-semibold text-white">Custom Layouts</h4>
                    <p className="text-sm text-gray-400">Dynamic grid patterns</p>
                  </div>
                  <div className="p-4 bg-gray-800/50 rounded-lg">
                    <div className="text-2xl mb-2">💫</div>
                    <h4 className="font-semibold text-white">Smooth Animations</h4>
                    <p className="text-sm text-gray-400">Framer Motion effects</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h2 className="text-2xl font-semibold">NetflixViewGrid</h2>
              <p className="text-gray-600">Netflix-style grid layout</p>
              <NetflixViewGrid />
            </div>
          </section>
        </TabsContent>

        <TabsContent value="navbars">
          <section className="space-y-4">
            <h2 className="text-2xl font-semibold">EnhancedNavbar</h2>
            <EnhancedNavbar />

            <h2 className="text-2xl font-semibold">MainNav</h2>
            <MainNav />

            <h2 className="text-2xl font-semibold">MobileNav</h2>
            <MobileNav />
          </section>
        </TabsContent>

        <TabsContent value="views">
          <section className="space-y-4">
            <h2 className="text-2xl font-semibold">TinderView</h2>
            <TinderView />

            <h2 className="text-2xl font-semibold">EnhancedTinderView</h2>
            <EnhancedTinderView />

            <h2 className="text-2xl font-semibold">GamifiedContentHub</h2>
            <GamifiedContentHub />

            <h2 className="text-2xl font-semibold">TipFrenzy</h2>
            <TipFrenzy />

            <h2 className="text-2xl font-semibold">DashboardWidgets</h2>
            <DashboardWidgets />

            <h2 className="text-2xl font-semibold">RankingsPage</h2>
            <RankingsPage />
          </section>
        </TabsContent>

        <TabsContent value="reviews">
          <section className="space-y-4">
            <div className="text-center p-8 bg-gradient-to-br from-purple-900/20 to-blue-900/20 rounded-lg border border-purple-500/30">
              <h2 className="text-3xl font-bold text-white mb-4">
                🌟 Enhanced Review & Ranking System
              </h2>
              <p className="text-gray-300 mb-6">
                Experience our comprehensive review system with multi-category ratings, dynamic
                leaderboards, achievement unlocks, and casino-style rewards!
              </p>
              <div className="flex justify-center">
                <a
                  href="/demo/components/review-ranking"
                  className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white font-semibold rounded-lg transition-all duration-300 transform hover:scale-105"
                >
                  <span className="mr-2">🚀</span>
                  Launch Review System Demo
                </a>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-8">
                <div className="p-4 bg-gray-800/50 rounded-lg">
                  <div className="text-2xl mb-2">⭐</div>
                  <h3 className="font-semibold text-white">Multi-Category Ratings</h3>
                  <p className="text-sm text-gray-400">
                    Rate on looks, personality, communication & entertainment
                  </p>
                </div>
                <div className="p-4 bg-gray-800/50 rounded-lg">
                  <div className="text-2xl mb-2">🏆</div>
                  <h3 className="font-semibold text-white">Dynamic Leaderboards</h3>
                  <p className="text-sm text-gray-400">Real-time rankings with trend indicators</p>
                </div>
                <div className="p-4 bg-gray-800/50 rounded-lg">
                  <div className="text-2xl mb-2">🏅</div>
                  <h3 className="font-semibold text-white">Achievement System</h3>
                  <p className="text-sm text-gray-400">Unlock badges and rewards for milestones</p>
                </div>
                <div className="p-4 bg-gray-800/50 rounded-lg">
                  <div className="text-2xl mb-2">🎰</div>
                  <h3 className="font-semibold text-white">Casino Rewards</h3>
                  <p className="text-sm text-gray-400">
                    Scratch cards, coins, and gambling integration
                  </p>
                </div>
              </div>
            </div>
          </section>
        </TabsContent>

        <TabsContent value="magicui">
          <section className="space-y-8">
            <div className="space-y-4">
              <h2 className="text-2xl font-semibold">ShimmerButton</h2>
              <div className="flex gap-4 flex-wrap">
                <ShimmerButton background="linear-gradient(45deg, #1e40af, #3b82f6)">
                  Casino Blue
                </ShimmerButton>
              </div>
            </div>

            <div className="space-y-4">
              <h2 className="text-2xl font-semibold">NumberTicker</h2>
              <div className="flex gap-8 flex-wrap">
                <div className="text-center">
                  <div className="text-sm text-gray-600 mb-2">Jackpot</div>
                  <div className="text-3xl font-bold text-yellow-500">
                    $<NumberTicker value={125000} />
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h2 className="text-2xl font-semibold">SparklesText</h2>
              <div className="text-center">
                <SparklesText
                  className="text-4xl font-bold"
                  colors={{ first: '#FFD700', second: '#FF6B6B' }}
                  sparklesCount={12}
                >
                  JACKPOT WINNER!
                </SparklesText>
              </div>
            </div>

            <div className="space-y-4">
              <h2 className="text-2xl font-semibold">MagicCard</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <MagicCard className="p-6 bg-gradient-to-br from-purple-900 to-blue-900">
                  <div className="text-white">
                    <h3 className="text-lg font-bold mb-2">Blackjack</h3>
                    <p className="text-sm opacity-80">Classic card game with 21 target</p>
                  </div>
                </MagicCard>
                <MagicCard className="p-6 bg-gradient-to-br from-red-900 to-pink-900">
                  <div className="text-white">
                    <h3 className="text-lg font-bold mb-2">Roulette</h3>
                    <p className="text-sm opacity-80">Spin the wheel of fortune</p>
                  </div>
                </MagicCard>
                <MagicCard className="p-6 bg-gradient-to-br from-green-900 to-emerald-900">
                  <div className="text-white">
                    <h3 className="text-lg font-bold mb-2">Poker</h3>
                    <p className="text-sm opacity-80">Texas Hold&apos;em tournament</p>
                  </div>
                </MagicCard>
              </div>
            </div>

            <div className="space-y-4">
              <h2 className="text-2xl font-semibold">RippleButton</h2>
              <div className="flex gap-4 flex-wrap">
                <RippleButton
                  rippleColor="#ef4444"
                  className="bg-red-600 hover:bg-red-700 text-white border-red-500"
                >
                  Red Bet
                </RippleButton>
                <RippleButton
                  rippleColor="#1f2937"
                  className="bg-gray-800 hover:bg-gray-900 text-white border-gray-600"
                >
                  Black Bet
                </RippleButton>
                <RippleButton
                  rippleColor="#10b981"
                  className="bg-green-600 hover:bg-green-700 text-white border-green-500"
                >
                  Even Bet
                </RippleButton>
              </div>
            </div>

            <div className="space-y-4">
              <h2 className="text-2xl font-semibold">AnimatedShinyText</h2>
              <div className="text-center space-y-4">
                <AnimatedShinyText className="text-2xl font-bold">
                  ✨ Welcome to the Casino ✨
                </AnimatedShinyText>
                <AnimatedShinyText className="text-lg">
                  🎰 Try your luck today! 🎰
                </AnimatedShinyText>
              </div>
            </div>

            <div className="space-y-4">
              <h2 className="text-2xl font-semibold">NeonGradientCard</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <NeonGradientCard>
                  <div className="p-6 text-center">
                    <h3 className="text-xl font-bold mb-2">VIP Lounge</h3>
                    <p className="text-sm opacity-70">Exclusive high-stakes gaming</p>
                  </div>
                </NeonGradientCard>
                <NeonGradientCard borderSize={3} borderRadius={15}>
                  <div className="p-6 text-center">
                    <h3 className="text-xl font-bold mb-2">Tournament</h3>
                    <p className="text-sm opacity-70">Weekly poker championship</p>
                  </div>
                </NeonGradientCard>
              </div>
            </div>

            <div className="space-y-4">
              <h2 className="text-2xl font-semibold">BorderBeam</h2>
              <div className="relative p-8 bg-gradient-to-br from-gray-900 to-gray-800 rounded-xl">
                <BorderBeam size={300} duration={12} colorFrom="#FFD700" colorTo="#FF6B6B" />
                <div className="text-center text-white">
                  <h3 className="text-xl font-bold mb-2">Active Game Table</h3>
                  <p className="opacity-80">This table has an animated border beam</p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h2 className="text-2xl font-semibold">Background Effects</h2>
              <div className="relative h-64 bg-gradient-to-br from-purple-900 to-blue-900 rounded-xl overflow-hidden">
                <Particles
                  className="absolute inset-0"
                  quantity={20}
                  color="#ffffff"
                  staticity={30}
                  ease={50}
                />
                <Meteors number={8} className="opacity-50" />
                <div className="relative z-10 flex items-center justify-center h-full">
                  <div className="text-white text-center">
                    <h3 className="text-xl font-bold mb-2">Atmospheric Effects</h3>
                    <p className="opacity-80">Particles and meteors create casino ambiance</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h2 className="text-2xl font-semibold">Confetti Celebration</h2>
              <div className="relative h-32 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-xl overflow-hidden">
                <Confetti globalstart={true} />
                <div className="relative z-10 flex items-center justify-center h-full">
                  <div className="text-white text-center">
                    <h3 className="text-lg font-bold">🎉 BIG WIN! 🎉</h3>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </TabsContent>

        <TabsContent value="utils">
          <section className="space-y-4">
            <h2 className="text-2xl font-semibold">ProfileAvatar</h2>
            <ProfileAvatar src="/avatars/sample1.jpg" name="Sample User" size="lg" />

            <h2 className="text-2xl font-semibold">MediaTicker</h2>
            <MediaTicker />

            <h2 className="text-2xl font-semibold">MoneyRain</h2>
            <MoneyRain isActive={true} />

            <h2 className="text-2xl font-semibold">DebugInfo</h2>
            <DebugInfo data={{ sample: 'debug data' }} title="Sample Debug" />

            <h2 className="text-2xl font-semibold">UserReview</h2>
            <UserReview review={sampleReview} />
          </section>
        </TabsContent>
      </Tabs>
    </div>
  );
}
