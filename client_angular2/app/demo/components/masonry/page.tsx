'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import MasonryGrid from '@/components/MasonryGrid';
import { MasonryGrid as MasonryGridSimple } from '@/components/masonry-grid';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Grid3X3, 
  LayoutGrid, 
  Sparkles,
  Users,
  Heart,
  Star,
  Crown,
  Zap
} from 'lucide-react';

// Sample data for MasonryGrid (card-based)
const sampleMasonryItems = [
  {
    id: '1',
    name: 'Sophia Star',
    location: 'Los Angeles',
    image: '/placeholder.svg?height=600&width=400&text=Sophia',
    distance: '2 km',
    onlineStatus: true,
    imageWidth: 400,
    imageHeight: 600
  },
  {
    id: '2',
    name: 'Alex Charm',
    location: 'New York',
    image: '/placeholder.svg?height=400&width=400&text=Alex',
    distance: '5 km',
    onlineStatus: false,
    imageWidth: 400,
    imageHeight: 400
  },
  {
    id: '3',
    name: 'Emma Elite',
    location: 'Miami',
    image: '/placeholder.svg?height=500&width=400&text=Emma',
    distance: '1 km',
    onlineStatus: true,
    imageWidth: 400,
    imageHeight: 500
  },
  {
    id: '4',
    name: 'Ryan Cool',
    location: 'Chicago',
    image: '/placeholder.svg?height=450&width=400&text=Ryan',
    distance: '3 km',
    onlineStatus: true,
    imageWidth: 400,
    imageHeight: 450
  },
  {
    id: '5',
    name: 'Luna Bright',
    location: 'Las Vegas',
    image: '/placeholder.svg?height=550&width=400&text=Luna',
    distance: '4 km',
    onlineStatus: false,
    imageWidth: 400,
    imageHeight: 550
  },
  {
    id: '6',
    name: 'Max Power',
    location: 'San Francisco',
    image: '/placeholder.svg?height=480&width=400&text=Max',
    distance: '6 km',
    onlineStatus: true,
    imageWidth: 400,
    imageHeight: 480
  },
  {
    id: '7',
    name: 'Zara Divine',
    location: 'Seattle',
    image: '/placeholder.svg?height=520&width=400&text=Zara',
    distance: '2 km',
    onlineStatus: true,
    imageWidth: 400,
    imageHeight: 520
  },
  {
    id: '8',
    name: 'Jake Thunder',
    location: 'Austin',
    image: '/placeholder.svg?height=420&width=400&text=Jake',
    distance: '7 km',
    onlineStatus: false,
    imageWidth: 400,
    imageHeight: 420
  }
];

// Sample data for MasonryGrid (layout-based)
const sampleMasonryAdvertisers = [
  {
    id: '1',
    name: 'Sophia Star',
    age: 25,
    location: 'Los Angeles',
    image: '/placeholder.svg?height=600&width=400&text=Sophia',
    isVip: true,
    isOnline: true,
    isPremium: false
  },
  {
    id: '2',
    name: 'Alex Charm',
    age: 28,
    location: 'New York',
    image: '/placeholder.svg?height=400&width=400&text=Alex',
    isVip: false,
    isOnline: false,
    isPremium: true
  },
  {
    id: '3',
    name: 'Emma Elite',
    age: 26,
    location: 'Miami',
    image: '/placeholder.svg?height=500&width=400&text=Emma',
    isVip: true,
    isOnline: true,
    isPremium: true
  },
  {
    id: '4',
    name: 'Ryan Cool',
    age: 30,
    location: 'Chicago',
    image: '/placeholder.svg?height=450&width=400&text=Ryan',
    isVip: false,
    isOnline: true,
    isPremium: false
  },
  {
    id: '5',
    name: 'Luna Bright',
    age: 24,
    location: 'Las Vegas',
    image: '/placeholder.svg?height=550&width=400&text=Luna',
    isVip: true,
    isOnline: false,
    isPremium: true
  },
  {
    id: '6',
    name: 'Max Power',
    age: 29,
    location: 'San Francisco',
    image: '/placeholder.svg?height=480&width=400&text=Max',
    isVip: false,
    isOnline: true,
    isPremium: false
  },
  {
    id: '7',
    name: 'Zara Divine',
    age: 27,
    location: 'Seattle',
    image: '/placeholder.svg?height=520&width=400&text=Zara',
    isVip: true,
    isOnline: true,
    isPremium: true
  }
];

export default function MasonryShowcase() {
  const [activeTab, setActiveTab] = useState('card-based');
  const [loadingMore, setLoadingMore] = useState(false);

  const handleLoadMore = async () => {
    setLoadingMore(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    setLoadingMore(false);
    return sampleMasonryItems.slice(0, 3); // Return some new items
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="flex items-center justify-center space-x-3 mb-4">
            <div className="p-3 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full">
              <LayoutGrid className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-4xl font-bold text-white">
              Masonry Grid Showcase
            </h1>
          </div>
          
          <p className="text-xl text-gray-300 mb-6">
            Explore different masonry grid implementations with dynamic layouts and infinite scroll
          </p>

          <div className="flex items-center justify-center space-x-4">
            <Badge className="bg-blue-500/20 text-blue-300 border-blue-500/30">
              <Grid3X3 className="h-4 w-4 mr-1" />
              Dynamic Layouts
            </Badge>
            <Badge className="bg-purple-500/20 text-purple-300 border-purple-500/30">
              <Users className="h-4 w-4 mr-1" />
              Profile Cards
            </Badge>
            <Badge className="bg-green-500/20 text-green-300 border-green-500/30">
              <Zap className="h-4 w-4 mr-1" />
              Infinite Scroll
            </Badge>
            <Badge className="bg-yellow-500/20 text-yellow-300 border-yellow-500/30">
              <Sparkles className="h-4 w-4 mr-1" />
              Hover Effects
            </Badge>
          </div>
        </motion.div>

        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 bg-gray-800/50 border border-gray-700">
            <TabsTrigger value="card-based" className="flex items-center space-x-2">
              <Grid3X3 className="h-4 w-4" />
              <span>Card-Based Masonry</span>
            </TabsTrigger>
            <TabsTrigger value="layout-based" className="flex items-center space-x-2">
              <LayoutGrid className="h-4 w-4" />
              <span>Layout-Based Masonry</span>
            </TabsTrigger>
          </TabsList>

          {/* Card-Based Masonry */}
          <TabsContent value="card-based" className="space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-white flex items-center space-x-2">
                    <Grid3X3 className="h-6 w-6" />
                    <span>Card-Based Masonry Grid</span>
                  </h2>
                  <p className="text-gray-400">
                    Traditional masonry grid using AdvertiserCard components with infinite scroll
                  </p>
                </div>
                
                <Button
                  onClick={handleLoadMore}
                  disabled={loadingMore}
                  className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
                >
                  {loadingMore ? (
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    >
                      <Sparkles className="h-4 w-4 mr-2" />
                    </motion.div>
                  ) : (
                    <Zap className="h-4 w-4 mr-2" />
                  )}
                  {loadingMore ? 'Loading...' : 'Load More'}
                </Button>
              </div>

              <div className="p-6 bg-gray-800/30 rounded-lg border border-gray-700">
                <MasonryGrid 
                  items={sampleMasonryItems} 
                  fetchMoreItems={handleLoadMore}
                  className="min-h-[600px]"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-300">
                <div className="flex items-start space-x-2">
                  <Grid3X3 className="h-4 w-4 text-blue-500 mt-0.5" />
                  <div>
                    <strong>Responsive Grid:</strong> Adapts from 1 column on mobile to 4 columns on desktop
                  </div>
                </div>
                <div className="flex items-start space-x-2">
                  <Zap className="h-4 w-4 text-green-500 mt-0.5" />
                  <div>
                    <strong>Infinite Scroll:</strong> Automatically loads more content as you scroll
                  </div>
                </div>
                <div className="flex items-start space-x-2">
                  <Users className="h-4 w-4 text-purple-500 mt-0.5" />
                  <div>
                    <strong>Profile Cards:</strong> Rich advertiser cards with images and details
                  </div>
                </div>
              </div>
            </motion.div>
          </TabsContent>

          {/* Layout-Based Masonry */}
          <TabsContent value="layout-based" className="space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4"
            >
              <div>
                <h2 className="text-2xl font-bold text-white flex items-center space-x-2">
                  <LayoutGrid className="h-6 w-6" />
                  <span>Layout-Based Masonry Grid</span>
                </h2>
                <p className="text-gray-400">
                  Modern masonry grid with custom layout patterns and hover effects
                </p>
              </div>

              <div className="p-6 bg-gray-800/30 rounded-lg border border-gray-700">
                <MasonryGridSimple 
                  advertisers={sampleMasonryAdvertisers}
                  className="min-h-[600px]"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-300">
                <div className="flex items-start space-x-2">
                  <LayoutGrid className="h-4 w-4 text-blue-500 mt-0.5" />
                  <div>
                    <strong>Custom Layouts:</strong> Predefined grid patterns for visual variety
                  </div>
                </div>
                <div className="flex items-start space-x-2">
                  <Heart className="h-4 w-4 text-red-500 mt-0.5" />
                  <div>
                    <strong>Hover Effects:</strong> Smooth animations and interactive elements
                  </div>
                </div>
                <div className="flex items-start space-x-2">
                  <Crown className="h-4 w-4 text-yellow-500 mt-0.5" />
                  <div>
                    <strong>Status Badges:</strong> VIP, Premium, and Online indicators
                  </div>
                </div>
              </div>
            </motion.div>
          </TabsContent>
        </Tabs>

        {/* Features Overview */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-12 p-6 bg-gradient-to-r from-gray-800/50 to-gray-700/50 rounded-lg border border-gray-600"
        >
          <h3 className="text-xl font-bold text-white mb-4">🎯 Masonry Grid Features</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm text-gray-300">
            <div className="flex items-start space-x-2">
              <Grid3X3 className="h-4 w-4 text-blue-500 mt-0.5" />
              <div>
                <strong>Responsive Design:</strong> Automatically adjusts columns based on screen size
              </div>
            </div>
            <div className="flex items-start space-x-2">
              <Zap className="h-4 w-4 text-green-500 mt-0.5" />
              <div>
                <strong>Performance Optimized:</strong> Efficient rendering with intersection observers
              </div>
            </div>
            <div className="flex items-start space-x-2">
              <Sparkles className="h-4 w-4 text-purple-500 mt-0.5" />
              <div>
                <strong>Smooth Animations:</strong> Framer Motion powered transitions and effects
              </div>
            </div>
            <div className="flex items-start space-x-2">
              <Users className="h-4 w-4 text-orange-500 mt-0.5" />
              <div>
                <strong>Profile Integration:</strong> Seamlessly displays user profiles and details
              </div>
            </div>
            <div className="flex items-start space-x-2">
              <Heart className="h-4 w-4 text-red-500 mt-0.5" />
              <div>
                <strong>Interactive Elements:</strong> Hover effects, status indicators, and badges
              </div>
            </div>
            <div className="flex items-start space-x-2">
              <Star className="h-4 w-4 text-yellow-500 mt-0.5" />
              <div>
                <strong>Dating Platform Ready:</strong> Perfect for dating and social applications
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
