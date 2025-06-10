'use client';

import { useState, useEffect, useCallback } from 'react';
import { useInView } from 'react-intersection-observer';
import { motion } from 'framer-motion';
import './netflix-view.css';

import EnhancedNavbar from '@/components/enhanced-navbar';
import AdvertiserCard, { Advertiser as AdvertiserCardType } from '@/components/ui/AdvertiserCard';

const initialAdvertisersData: AdvertiserCardType[] = [
  {
    id: 1,
    name: 'Sophia',
    location: 'Miami, FL',
    distance: '2 km away',
    isOnline: true, // Updated from onlineStatus
    image: '/assets/img/profiles/female-01.jpg',
    imageWidth: 800,
    imageHeight: 1200,
    age: 24,
    category: 'Trending Now',
    rating: 4.9,
    views: 12500,
    duration: '45 min',
    price: '$25',
    isVip: true,
    description: 'Sophia is a top-rated advertiser known for her engaging content.',
    tags: ['trending', 'popular', 'engaging'],
  },
  {
    id: 2,
    name: 'Isabella',
    location: 'Los Angeles, CA',
    distance: '15 km away',
    isOnline: false, // Updated from onlineStatus
    image: '/assets/img/profiles/female-02.jpg',
    imageWidth: 1200,
    imageHeight: 800,
    age: 28,
    category: 'New Arrivals',
    rating: 4.7,
    views: 9800,
    duration: '30 min',
    price: '$20',
    isVip: false,
    description: 'Isabella is a rising star with fresh and creative content.',
    tags: ['new', 'creative', 'fresh'],
  },
  {
    id: 3,
    name: 'Emma',
    location: 'New York, NY',
    distance: '5 km away',
    isOnline: true, // Updated from onlineStatus
    image: '/assets/img/profiles/female-03.jpg',
    imageWidth: 600,
    imageHeight: 900,
    age: 23,
    category: 'Top Rated',
    rating: 4.9,
    views: 15200,
    duration: '38 min',
    price: '$30',
    isVip: true,
    description: 'Emma is a top-rated performer with amazing content.',
    tags: ['top-rated', 'live', 'vip'],
  },
  {
    id: 4,
    name: 'Olivia',
    location: 'Las Vegas, NV',
    distance: '10 km away',
    isOnline: true, // Updated from onlineStatus
    image: '/assets/img/profiles/female-04.jpg',
    imageWidth: 1000,
    imageHeight: 700,
    age: 25,
    category: 'VIP Exclusive',
    rating: 4.7,
    views: 6800,
    duration: '28 min',
    price: '$35',
    isVip: true,
    description: 'Olivia offers exclusive VIP content from Las Vegas.',
    tags: ['vip', 'exclusive', 'vegas'],
  },
  {
    id: 5,
    name: 'Ava',
    location: 'Chicago, IL',
    distance: '3 km away',
    isOnline: false, // Updated from onlineStatus
    image: '/assets/img/profiles/female-05.jpg',
    imageWidth: 700,
    imageHeight: 1000,
    age: 22,
    category: 'Trending Now',
    rating: 4.5,
    views: 9500,
    duration: '40 min',
    price: '$22', // Changed to string
    isVip: false,
    description: 'Ava is trending with her engaging live content.',
    tags: ['trending', 'live', 'young'],
  },
  {
    id: 6,
    name: 'Mia',
    location: 'Houston, TX',
    distance: '8 km away',
    isOnline: true, // Updated from onlineStatus
    image: '/assets/img/profiles/female-06.jpg',
    imageWidth: 900,
    imageHeight: 1200,
    age: 27,
    category: 'New Arrivals',
    rating: 4.6,
    views: 11000,
    duration: '35 min',
    price: '$28', // Changed to string
    isVip: true,
    description: 'Mia brings fresh new content from Houston.',
    tags: ['new', 'vip', 'houston'],
  },
  // Add more advertisers to make the list longer for scrolling (at least 20-30 for good effect)
  {
    id: 7,
    name: 'Charlotte',
    location: 'San Francisco, CA',
    distance: '7 km away',
    isOnline: true, // Updated from onlineStatus
    image: '/assets/img/profiles/female-07.jpg',
    imageWidth: 600,
    imageHeight: 900,
    age: 24,
    category: 'Top Rated',
    rating: 4.9,
    views: 15200,
    duration: '38 min',
    price: '$30', // Changed to string
    isVip: true,
    description: 'Charlotte is a top-rated performer from San Francisco.',
    tags: ['top-rated', 'live', 'vip'],
  },
  {
    id: 8,
    name: 'Amelia',
    location: 'Seattle, WA',
    distance: '10 km away',
    isOnline: false, // Updated from isOnline
    image: '/assets/img/profiles/female-08.jpg',
    imageWidth: 1000,
    imageHeight: 700,
    age: 26,
    category: 'VIP Exclusive',
    rating: 4.7,
    views: 6800,
    duration: '28 min',
    price: '$35', // Changed to string
    isVip: true,
  },
  {
    id: 9,
    name: 'Harper',
    location: 'Austin, TX',
    distance: '4 km away',
    isOnline: true, // Updated from isOnline
    image: '/assets/img/profiles/female-09.jpg',
    imageWidth: 700,
    imageHeight: 1000,
    age: 22,
    category: 'Trending Now',
    rating: 4.5,
    views: 9500,
    duration: '40 min',
    price: '$22', // Changed to string
    isVip: false,
  },
  {
    id: 10,
    name: 'Evelyn',
    location: 'Denver, CO',
    distance: '9 km away',
    isOnline: true, // Updated from isOnline
    image: '/assets/img/profiles/female-10.jpg',
    imageWidth: 900,
    imageHeight: 1200,
    age: 27,
    category: 'New Arrivals',
    rating: 4.6,
    views: 11000,
    duration: '35 min',
    price: '$28', // Changed to string
    isVip: true,
  },
  {
    id: 11,
    name: 'Abigail',
    location: 'Boston, MA',
    distance: '6 km away',
    isOnline: false, // Updated from isOnline
    image: '/assets/img/profiles/female-11.jpg',
    imageWidth: 600,
    imageHeight: 900,
    age: 24,
    category: 'Top Rated',
    rating: 4.9,
    views: 15200,
    duration: '38 min',
    price: '$30', // Changed to string
    isVip: true,
  },
  {
    id: 12,
    name: 'Emily',
    location: 'Phoenix, AZ',
    distance: '11 km away',
    isOnline: true, // Updated from isOnline
    image: '/assets/img/profiles/female-12.jpg',
    imageWidth: 1000,
    imageHeight: 700,
    age: 26,
    category: 'VIP Exclusive',
    rating: 4.7,
    views: 6800,
    duration: '28 min',
    price: '$35', // Changed to string
    isVip: true,
  },
  {
    id: 13,
    name: 'Elizabeth',
    location: 'San Diego, CA',
    distance: '3 km away',
    isOnline: true, // Updated from isOnline
    image: '/assets/img/profiles/female-13.jpg',
    imageWidth: 700,
    imageHeight: 1000,
    age: 22,
    category: 'Trending Now',
    rating: 4.5,
    views: 9500,
    duration: '40 min',
    price: '$22', // Changed to string
    isVip: false,
  },
  {
    id: 14,
    name: 'Sofia',
    location: 'Dallas, TX',
    distance: '8 km away',
    isOnline: false, // Updated from isOnline
    image: '/assets/img/profiles/female-14.jpg',
    imageWidth: 900,
    imageHeight: 1200,
    age: 27,
    category: 'New Arrivals',
    rating: 4.6,
    views: 11000,
    duration: '35 min',
    price: '$28', // Changed to string
    isVip: true,
  },
  {
    id: 15,
    name: 'Avery',
    location: 'San Jose, CA',
    distance: '5 km away',
    isOnline: true, // Updated from isOnline
    image: '/assets/img/profiles/female-15.jpg',
    imageWidth: 600,
    imageHeight: 900,
    age: 24,
    category: 'Top Rated',
    rating: 4.9,
    views: 15200,
    duration: '38 min',
    price: '$30', // Changed to string
    isVip: true,
  },
  {
    id: 16,
    name: 'Ella',
    location: 'Austin, TX',
    distance: '10 km away',
    isOnline: false, // Updated from isOnline
    image: '/assets/img/profiles/female-16.jpg',
    imageWidth: 1000,
    imageHeight: 700,
    age: 26,
    category: 'VIP Exclusive',
    rating: 4.7,
    views: 6800,
    duration: '28 min',
    price: '$35', // Changed to string
    isVip: true,
  },
  {
    id: 17,
    name: 'Scarlett',
    location: 'Seattle, WA',
    distance: '4 km away',
    isOnline: true, // Updated from isOnline
    image: '/assets/img/profiles/female-17.jpg',
    imageWidth: 700,
    imageHeight: 1000,
    age: 22,
    category: 'Trending Now',
    rating: 4.5,
    views: 9500,
    duration: '40 min',
    price: '$22', // Changed to string
    isVip: false,
  },
  {
    id: 18,
    name: 'Grace',
    location: 'Boston, MA',
    distance: '6 km away',
    isOnline: false, // Updated from isOnline
    image: '/assets/img/profiles/female-18.jpg',
    imageWidth: 600,
    imageHeight: 900,
    age: 24,
    category: 'Top Rated',
    rating: 4.9,
    views: 15200,
    duration: '38 min',
    price: '$30', // Changed to string
    isVip: true,
  },
  {
    id: 19,
    name: 'Chloe',
    location: 'Phoenix, AZ',
    distance: '11 km away',
    isOnline: true, // Updated from isOnline
    image: '/assets/img/profiles/female-19.jpg',
    imageWidth: 1000,
    imageHeight: 700,
    age: 26,
    category: 'VIP Exclusive',
    rating: 4.7,
    views: 6800,
    duration: '28 min',
    price: '$35', // Changed to string
    isVip: true,
  },
  {
    id: 20,
    name: 'Victoria',
    location: 'San Diego, CA',
    distance: '3 km away',
    isOnline: true, // Updated from isOnline
    image: '/assets/img/profiles/female-20.jpg',
    imageWidth: 700,
    imageHeight: 1000,
    age: 22,
    category: 'Trending Now',
    rating: 4.5,
    views: 9500,
    duration: '40 min',
    price: '$22', // Changed to string
    isVip: false,
  },
  {
    id: 21,
    name: 'Madison',
    location: 'Dallas, TX',
    distance: '8 km away',
    isOnline: false, // Updated from isOnline
    image: '/assets/img/profiles/female-21.jpg',
    imageWidth: 900,
    imageHeight: 1200,
    age: 27,
    category: 'New Arrivals',
    rating: 4.6,
    views: 11000,
    duration: '35 min',
    price: '$28', // Changed to string
    isVip: true,
  },
  {
    id: 22,
    name: 'Luna',
    location: 'San Jose, CA',
    distance: '5 km away',
    isOnline: true, // Updated from isOnline
    image: '/assets/img/profiles/female-22.jpg',
    imageWidth: 600,
    imageHeight: 900,
    age: 24,
    category: 'Top Rated',
    rating: 4.9,
    views: 15200,
    duration: '38 min',
    price: '$30', // Changed to string
    isVip: true,
  },
  {
    id: 23,
    name: 'Stella',
    location: 'Austin, TX',
    distance: '10 km away',
    isOnline: false, // Updated from isOnline
    image: '/assets/img/profiles/female-23.jpg',
    imageWidth: 1000,
    imageHeight: 700,
    age: 26,
    category: 'VIP Exclusive',
    rating: 4.7,
    views: 6800,
    duration: '28 min',
    price: '$35', // Changed to string
    isVip: true,
  },
  {
    id: 24,
    name: 'Hazel',
    location: 'Seattle, WA',
    distance: '4 km away',
    isOnline: true, // Updated from isOnline
    image: '/assets/img/profiles/female-24.jpg',
    imageWidth: 700,
    imageHeight: 1000,
    age: 22,
    category: 'Trending Now',
    rating: 4.5,
    views: 9500,
    duration: '40 min',
    price: '$22', // Changed to string
    isVip: false,
  },
  {
    id: 25,
    name: 'Violet',
    location: 'Boston, MA',
    distance: '6 km away',
    isOnline: false, // Updated from isOnline
    image: '/assets/img/profiles/female-25.jpg',
    imageWidth: 600,
    imageHeight: 900,
    age: 24,
    category: 'Top Rated',
    rating: 4.9,
    views: 15200,
    duration: '38 min',
    price: '$30', // Changed to string
    isVip: true,
  },
  {
    id: 26,
    name: 'Aurora',
    location: 'Phoenix, AZ',
    distance: '11 km away',
    isOnline: true, // Updated from isOnline
    image: '/assets/img/profiles/female-26.jpg',
    imageWidth: 1000,
    imageHeight: 700,
    age: 26,
    category: 'VIP Exclusive',
    rating: 4.7,
    views: 6800,
    duration: '28 min',
    price: '$35', // Changed to string
    isVip: true,
  },
  {
    id: 27,
    name: 'Savannah',
    location: 'San Diego, CA',
    distance: '3 km away',
    isOnline: true, // Updated from isOnline
    image: '/assets/img/profiles/female-27.jpg',
    imageWidth: 700,
    imageHeight: 1000,
    age: 22,
    category: 'Trending Now',
    rating: 4.5,
    views: 9500,
    duration: '40 min',
    price: '$22', // Changed to string
    isVip: false,
  },
  {
    id: 28,
    name: 'Brooklyn',
    location: 'Dallas, TX',
    distance: '8 km away',
    isOnline: false, // Updated from isOnline
    image: '/assets/img/profiles/female-28.jpg',
    imageWidth: 900,
    imageHeight: 1200,
    age: 27,
    category: 'New Arrivals',
    rating: 4.6,
    views: 11000,
    duration: '35 min',
    price: '$28', // Changed to string
    isVip: true,
  },
  {
    id: 29,
    name: 'Bella',
    location: 'San Jose, CA',
    distance: '5 km away',
    isOnline: true, // Updated from isOnline
    image: '/assets/img/profiles/female-29.jpg',
    imageWidth: 600,
    imageHeight: 900,
    age: 24,
    category: 'Top Rated',
    rating: 4.9,
    views: 15200,
    duration: '38 min',
    price: '$30', // Changed to string
    isVip: true,
  },
  {
    id: 30,
    name: 'Aria',
    location: 'Austin, TX',
    distance: '10 km away',
    isOnline: false, // Updated from isOnline
    image: '/assets/img/profiles/female-01.jpg', // Cycle back to first image for variety
    imageWidth: 1000,
    imageHeight: 700,
    age: 26,
    category: 'VIP Exclusive',
    rating: 4.7,
    views: 6800,
    duration: '28 min',
    price: '$35', // Changed to string
    isVip: true,
  },
];

const ITEMS_PER_LOAD = 6; // Number of items to load each time

export default function NetflixViewPage() {
  const [displayedAdvertisers, setDisplayedAdvertisers] = useState<AdvertiserCardType[]>([]);
  const [loadedCount, setLoadedCount] = useState(0);
  const { ref, inView } = useInView({ threshold: 0.5 }); // Trigger when 50% visible

  const loadMoreAdvertisers = useCallback(() => {
    const currentLoadedCount = loadedCount;
    const newLoadedCount = Math.min(
      currentLoadedCount + ITEMS_PER_LOAD,
      initialAdvertisersData.length,
    );
    if (newLoadedCount > currentLoadedCount) {
      setDisplayedAdvertisers((prev: AdvertiserCardType[]) => [
        ...prev,
        ...initialAdvertisersData.slice(currentLoadedCount, newLoadedCount),
      ]);
      setLoadedCount(newLoadedCount);
    }
  }, [loadedCount]);

  // Initial load
  useEffect(() => {
    loadMoreAdvertisers();
  }, [loadMoreAdvertisers]);

  // Load more when 'inView' becomes true
  useEffect(() => {
    if (inView) {
      loadMoreAdvertisers();
    }
  }, [inView, loadMoreAdvertisers]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 to-purple-900 text-white">
      <EnhancedNavbar />
      <div className="container mx-auto px-4 py-12">
        <header className="mb-10 text-center">
          <h1 className="text-5xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-pink-400 via-purple-400 to-indigo-400">
            Discover Profiles
          </h1>
          <p className="mt-3 text-xl text-slate-300">
            Browse through our collection in a rich visual experience
          </p>
        </header>
        {displayedAdvertisers.length > 0 ? (
          <div className="masonry-grid gap-6">
            {displayedAdvertisers.map((advertiser: AdvertiserCardType, index) => {
              // Determine card size based on image dimensions and index for variety
              const aspectRatio = (advertiser.imageWidth || 400) / (advertiser.imageHeight || 600);
              const imageWidth = advertiser.imageWidth || 400;
              const imageHeight = advertiser.imageHeight || 600;
              let cardSizeClass = '';

              // Create more variety by using index and image properties
              if (index % 7 === 0 && aspectRatio > 1.0) {
                // Every 7th item that's landscape becomes extra wide
                cardSizeClass = 'masonry-item-extra-wide';
              } else if (index % 5 === 0 && aspectRatio < 0.8) {
                // Every 5th item that's portrait becomes extra tall
                cardSizeClass = 'masonry-item-extra-tall';
              } else if (aspectRatio > 1.3) {
                // Wide landscape images
                cardSizeClass = 'masonry-item-wide';
              } else if (aspectRatio < 0.6) {
                // Very tall portrait images
                cardSizeClass = 'masonry-item-tall';
              } else if (imageWidth > 900 || imageHeight > 1000) {
                // Large images
                cardSizeClass = 'masonry-item-large';
              } else if (index % 3 === 0) {
                // Every 3rd item gets medium size for variety
                cardSizeClass = 'masonry-item-medium';
              } else {
                // Regular size
                cardSizeClass = 'masonry-item-regular';
              }

              return (
                <motion.div
                  key={advertiser.id}
                  className={`masonry-item ${cardSizeClass}`}
                  initial={{ opacity: 0, y: 50 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                >
                  <AdvertiserCard advertiser={advertiser} />
                </motion.div>
              );
            })}
          </div>
        ) : (
          <div className="flex justify-center items-center py-20">
            <div className="flex flex-col items-center space-y-4">
              <div className="animate-spin h-10 w-10 rounded-full border-4 border-purple-400 border-t-transparent"></div>
              <p className="text-xl text-slate-300">Loading advertisers...</p>
            </div>
          </div>
        )}

        {/* Load more trigger */}
        {loadedCount < initialAdvertisersData.length && (
          <div ref={ref} className="flex justify-center items-center h-20 py-8">
            <div className="flex flex-col items-center space-y-4">
              <div className="animate-spin h-6 w-6 rounded-full border-2 border-purple-400 border-t-transparent"></div>
              <p className="text-slate-300">Loading more...</p>
            </div>
          </div>
        )}
        {loadedCount >= initialAdvertisersData.length && displayedAdvertisers.length > 0 && (
          <div className="text-center py-10 text-slate-400">
            <p>You&apos;ve reached the end of the collection!</p>
          </div>
        )}
      </div>
      <div className="h-20"></div> {/* Spacer at the bottom */}
    </div>
  );
}

// Add this to your global CSS (e.g., app/globals.css or a specific CSS file for this page)
/*
.my-masonry-grid {
  display: flex;
  margin-left: -16px; // Adjust if your gap is different, should be negative of column padding
  width: auto;
}
.my-masonry-grid_column {
  padding-left: 16px; // This is your gap
  background-clip: padding-box;
}

// Ensure items in column don't have default bottom margin if it causes issues
.my-masonry-grid_column > div {
  margin-bottom: 16px; // This is the vertical gap between items in the same column
}
*/
