'use client';

import { useState, useEffect } from 'react';
import { useInView } from 'react-intersection-observer';
import Masonry from 'react-masonry-css';
import { motion } from 'framer-motion';

import EnhancedNavbar from '@/components/enhanced-navbar';
import AdvertiserCard, { Advertiser as AdvertiserCardType } from '@/components/ui/AdvertiserCard';
import { Advertiser } from '../../../src/app/features/advertiser-browsing/models/advertiser.interface';

const initialAdvertisersData: Advertiser[] = [
  {
    id: 1,
    name: 'Sophia',
    location: 'Miami, FL',
    distance: '2 km away',
    onlineStatus: true, // Updated from isOnline
    image:
      'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=800&h=1200&fit=crop&crop=faces',
    imageWidth: 800,
    imageHeight: 1200,
    age: 24,
    category: 'Trending Now',
    rating: 4.9,
    views: 12500,
    duration: '45 min',
    price: '$25',
    isVip: true,
    isLive: true,
    description: 'Sophia is a top-rated advertiser known for her engaging content.',
    tags: ['trending', 'popular', 'engaging'],
  },
  {
    id: 2,
    name: 'Isabella',
    location: 'Los Angeles, CA',
    distance: '15 km away',
    onlineStatus: false, // Updated from isOnline
    image:
      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=1200&h=800&fit=crop&crop=faces',
    imageWidth: 1200,
    imageHeight: 800,
    age: 28,
    category: 'New Arrivals',
    rating: 4.7,
    views: 9800,
    duration: '30 min',
    price: '$20',
    isVip: false,
    isLive: false,
    description: 'Isabella is a rising star with fresh and creative content.',
    tags: ['new', 'creative', 'fresh'],
  },
  {
    id: 3,
    name: 'Emma',
    location: 'New York, NY',
    distance: '5 km away',
    onlineStatus: true, // Updated from isOnline
    image:
      'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=600&h=900&fit=crop&crop=faces',
    imageWidth: 600,
    imageHeight: 900,
    age: 23,
    category: 'Top Rated',
    rating: 4.9,
    views: 15200,
    duration: '38 min',
    price: '$30',
    isVip: true,
    isLive: true,
  },
  {
    id: 4,
    name: 'Olivia',
    location: 'Las Vegas, NV',
    distance: '10 km away',
    onlineStatus: true, // Updated from isOnline
    image:
      'https://images.unsplash.com/photo-1488716820095-cbe80883c496?w=1000&h=700&fit=crop&crop=faces',
    imageWidth: 1000,
    imageHeight: 700,
    age: 25,
    category: 'VIP Exclusive',
    rating: 4.7,
    views: 6800,
    duration: '28 min',
    price: '$35',
    isVip: true,
    isLive: false,
  },
  {
    id: 5,
    name: 'Ava',
    location: 'Chicago, IL',
    distance: '3 km away',
    onlineStatus: false, // Updated from isOnline
    image:
      'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=700&h=1000&fit=crop&crop=faces',
    imageWidth: 700,
    imageHeight: 1000,
    age: 22,
    category: 'Trending Now',
    rating: 4.5,
    views: 9500,
    duration: '40 min',
    price: '$22', // Changed to string
    isVip: false,
    isLive: true,
  },
  {
    id: 6,
    name: 'Mia',
    location: 'Houston, TX',
    distance: '8 km away',
    onlineStatus: true, // Updated from isOnline
    image:
      'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=900&h=1200&fit=crop&crop=faces',
    imageWidth: 900,
    imageHeight: 1200,
    age: 27,
    category: 'New Arrivals',
    rating: 4.6,
    views: 11000,
    duration: '35 min',
    price: '$28', // Changed to string
    isVip: true,
    isLive: false,
  },
  // Add more advertisers to make the list longer for scrolling (at least 20-30 for good effect)
  {
    id: 7,
    name: 'Liam',
    location: 'San Francisco, CA',
    distance: '7 km away',
    onlineStatus: true, // Updated from isOnline
    image:
      'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=600&h=900&fit=crop&crop=faces',
    imageWidth: 600,
    imageHeight: 900,
    age: 24,
    category: 'Top Rated',
    rating: 4.9,
    views: 15200,
    duration: '38 min',
    price: '$30', // Changed to string
    isVip: true,
    isLive: true,
  },
  {
    id: 8,
    name: 'Noah',
    location: 'Seattle, WA',
    distance: '10 km away',
    onlineStatus: false, // Updated from isOnline
    image:
      'https://images.unsplash.com/photo-1488716820095-cbe80883c496?w=1000&h=700&fit=crop&crop=faces',
    imageWidth: 1000,
    imageHeight: 700,
    age: 26,
    category: 'VIP Exclusive',
    rating: 4.7,
    views: 6800,
    duration: '28 min',
    price: '$35', // Changed to string
    isVip: true,
    isLive: false,
  },
  {
    id: 9,
    name: 'Oliver',
    location: 'Austin, TX',
    distance: '4 km away',
    onlineStatus: true, // Updated from isOnline
    image:
      'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=700&h=1000&fit=crop&crop=faces',
    imageWidth: 700,
    imageHeight: 1000,
    age: 22,
    category: 'Trending Now',
    rating: 4.5,
    views: 9500,
    duration: '40 min',
    price: '$22', // Changed to string
    isVip: false,
    isLive: true,
  },
  {
    id: 10,
    name: 'Elijah',
    location: 'Denver, CO',
    distance: '9 km away',
    onlineStatus: true, // Updated from isOnline
    image:
      'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=900&h=1200&fit=crop&crop=faces',
    imageWidth: 900,
    imageHeight: 1200,
    age: 27,
    category: 'New Arrivals',
    rating: 4.6,
    views: 11000,
    duration: '35 min',
    price: '$28', // Changed to string
    isVip: true,
    isLive: false,
  },
  {
    id: 11,
    name: 'James',
    location: 'Boston, MA',
    distance: '6 km away',
    onlineStatus: false, // Updated from isOnline
    image:
      'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=600&h=900&fit=crop&crop=faces',
    imageWidth: 600,
    imageHeight: 900,
    age: 24,
    category: 'Top Rated',
    rating: 4.9,
    views: 15200,
    duration: '38 min',
    price: '$30', // Changed to string
    isVip: true,
    isLive: true,
  },
  {
    id: 12,
    name: 'Benjamin',
    location: 'Phoenix, AZ',
    distance: '11 km away',
    onlineStatus: true, // Updated from isOnline
    image:
      'https://images.unsplash.com/photo-1488716820095-cbe80883c496?w=1000&h=700&fit=crop&crop=faces',
    imageWidth: 1000,
    imageHeight: 700,
    age: 26,
    category: 'VIP Exclusive',
    rating: 4.7,
    views: 6800,
    duration: '28 min',
    price: '$35', // Changed to string
    isVip: true,
    isLive: false,
  },
  {
    id: 13,
    name: 'Lucas',
    location: 'San Diego, CA',
    distance: '3 km away',
    onlineStatus: true, // Updated from isOnline
    image:
      'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=700&h=1000&fit=crop&crop=faces',
    imageWidth: 700,
    imageHeight: 1000,
    age: 22,
    category: 'Trending Now',
    rating: 4.5,
    views: 9500,
    duration: '40 min',
    price: '$22', // Changed to string
    isVip: false,
    isLive: true,
  },
  {
    id: 14,
    name: 'Mason',
    location: 'Dallas, TX',
    distance: '8 km away',
    onlineStatus: false, // Updated from isOnline
    image:
      'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=900&h=1200&fit=crop&crop=faces',
    imageWidth: 900,
    imageHeight: 1200,
    age: 27,
    category: 'New Arrivals',
    rating: 4.6,
    views: 11000,
    duration: '35 min',
    price: '$28', // Changed to string
    isVip: true,
    isLive: false,
  },
  {
    id: 15,
    name: 'Logan',
    location: 'San Jose, CA',
    distance: '5 km away',
    onlineStatus: true, // Updated from isOnline
    image:
      'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=600&h=900&fit=crop&crop=faces',
    imageWidth: 600,
    imageHeight: 900,
    age: 24,
    category: 'Top Rated',
    rating: 4.9,
    views: 15200,
    duration: '38 min',
    price: '$30', // Changed to string
    isVip: true,
    isLive: true,
  },
  {
    id: 16,
    name: 'Alexander',
    location: 'Austin, TX',
    distance: '10 km away',
    onlineStatus: false, // Updated from isOnline
    image:
      'https://images.unsplash.com/photo-1488716820095-cbe80883c496?w=1000&h=700&fit=crop&crop=faces',
    imageWidth: 1000,
    imageHeight: 700,
    age: 26,
    category: 'VIP Exclusive',
    rating: 4.7,
    views: 6800,
    duration: '28 min',
    price: '$35', // Changed to string
    isVip: true,
    isLive: false,
  },
  {
    id: 17,
    name: 'William',
    location: 'Seattle, WA',
    distance: '4 km away',
    onlineStatus: true, // Updated from isOnline
    image:
      'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=700&h=1000&fit=crop&crop=faces',
    imageWidth: 700,
    imageHeight: 1000,
    age: 22,
    category: 'Trending Now',
    rating: 4.5,
    views: 9500,
    duration: '40 min',
    price: '$22', // Changed to string
    isVip: false,
    isLive: true,
  },
  {
    id: 18,
    name: 'James',
    location: 'Boston, MA',
    distance: '6 km away',
    onlineStatus: false, // Updated from isOnline
    image:
      'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=600&h=900&fit=crop&crop=faces',
    imageWidth: 600,
    imageHeight: 900,
    age: 24,
    category: 'Top Rated',
    rating: 4.9,
    views: 15200,
    duration: '38 min',
    price: '$30', // Changed to string
    isVip: true,
    isLive: true,
  },
  {
    id: 19,
    name: 'Benjamin',
    location: 'Phoenix, AZ',
    distance: '11 km away',
    onlineStatus: true, // Updated from isOnline
    image:
      'https://images.unsplash.com/photo-1488716820095-cbe80883c496?w=1000&h=700&fit=crop&crop=faces',
    imageWidth: 1000,
    imageHeight: 700,
    age: 26,
    category: 'VIP Exclusive',
    rating: 4.7,
    views: 6800,
    duration: '28 min',
    price: '$35', // Changed to string
    isVip: true,
    isLive: false,
  },
  {
    id: 20,
    name: 'Lucas',
    location: 'San Diego, CA',
    distance: '3 km away',
    onlineStatus: true, // Updated from isOnline
    image:
      'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=700&h=1000&fit=crop&crop=faces',
    imageWidth: 700,
    imageHeight: 1000,
    age: 22,
    category: 'Trending Now',
    rating: 4.5,
    views: 9500,
    duration: '40 min',
    price: '$22', // Changed to string
    isVip: false,
    isLive: true,
  },
  {
    id: 21,
    name: 'Mason',
    location: 'Dallas, TX',
    distance: '8 km away',
    onlineStatus: false, // Updated from isOnline
    image:
      'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=900&h=1200&fit=crop&crop=faces',
    imageWidth: 900,
    imageHeight: 1200,
    age: 27,
    category: 'New Arrivals',
    rating: 4.6,
    views: 11000,
    duration: '35 min',
    price: '$28', // Changed to string
    isVip: true,
    isLive: false,
  },
  {
    id: 22,
    name: 'Logan',
    location: 'San Jose, CA',
    distance: '5 km away',
    onlineStatus: true, // Updated from isOnline
    image:
      'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=600&h=900&fit=crop&crop=faces',
    imageWidth: 600,
    imageHeight: 900,
    age: 24,
    category: 'Top Rated',
    rating: 4.9,
    views: 15200,
    duration: '38 min',
    price: '$30', // Changed to string
    isVip: true,
    isLive: true,
  },
  {
    id: 23,
    name: 'Alexander',
    location: 'Austin, TX',
    distance: '10 km away',
    onlineStatus: false, // Updated from isOnline
    image:
      'https://images.unsplash.com/photo-1488716820095-cbe80883c496?w=1000&h=700&fit=crop&crop=faces',
    imageWidth: 1000,
    imageHeight: 700,
    age: 26,
    category: 'VIP Exclusive',
    rating: 4.7,
    views: 6800,
    duration: '28 min',
    price: '$35', // Changed to string
    isVip: true,
    isLive: false,
  },
  {
    id: 24,
    name: 'William',
    location: 'Seattle, WA',
    distance: '4 km away',
    onlineStatus: true, // Updated from isOnline
    image:
      'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=700&h=1000&fit=crop&crop=faces',
    imageWidth: 700,
    imageHeight: 1000,
    age: 22,
    category: 'Trending Now',
    rating: 4.5,
    views: 9500,
    duration: '40 min',
    price: '$22', // Changed to string
    isVip: false,
    isLive: true,
  },
  {
    id: 25,
    name: 'James',
    location: 'Boston, MA',
    distance: '6 km away',
    onlineStatus: false, // Updated from isOnline
    image:
      'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=600&h=900&fit=crop&crop=faces',
    imageWidth: 600,
    imageHeight: 900,
    age: 24,
    category: 'Top Rated',
    rating: 4.9,
    views: 15200,
    duration: '38 min',
    price: '$30', // Changed to string
    isVip: true,
    isLive: true,
  },
  {
    id: 26,
    name: 'Benjamin',
    location: 'Phoenix, AZ',
    distance: '11 km away',
    onlineStatus: true, // Updated from isOnline
    image:
      'https://images.unsplash.com/photo-1488716820095-cbe80883c496?w=1000&h=700&fit=crop&crop=faces',
    imageWidth: 1000,
    imageHeight: 700,
    age: 26,
    category: 'VIP Exclusive',
    rating: 4.7,
    views: 6800,
    duration: '28 min',
    price: '$35', // Changed to string
    isVip: true,
    isLive: false,
  },
  {
    id: 27,
    name: 'Lucas',
    location: 'San Diego, CA',
    distance: '3 km away',
    onlineStatus: true, // Updated from isOnline
    image:
      'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=700&h=1000&fit=crop&crop=faces',
    imageWidth: 700,
    imageHeight: 1000,
    age: 22,
    category: 'Trending Now',
    rating: 4.5,
    views: 9500,
    duration: '40 min',
    price: '$22', // Changed to string
    isVip: false,
    isLive: true,
  },
  {
    id: 28,
    name: 'Mason',
    location: 'Dallas, TX',
    distance: '8 km away',
    onlineStatus: false, // Updated from isOnline
    image:
      'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=900&h=1200&fit=crop&crop=faces',
    imageWidth: 900,
    imageHeight: 1200,
    age: 27,
    category: 'New Arrivals',
    rating: 4.6,
    views: 11000,
    duration: '35 min',
    price: '$28', // Changed to string
    isVip: true,
    isLive: false,
  },
  {
    id: 29,
    name: 'Logan',
    location: 'San Jose, CA',
    distance: '5 km away',
    onlineStatus: true, // Updated from isOnline
    image:
      'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=600&h=900&fit=crop&crop=faces',
    imageWidth: 600,
    imageHeight: 900,
    age: 24,
    category: 'Top Rated',
    rating: 4.9,
    views: 15200,
    duration: '38 min',
    price: '$30', // Changed to string
    isVip: true,
    isLive: true,
  },
  {
    id: 30,
    name: 'Alexander',
    location: 'Austin, TX',
    distance: '10 km away',
    onlineStatus: false, // Updated from isOnline
    image:
      'https://images.unsplash.com/photo-1488716820095-cbe80883c496?w=1000&h=700&fit=crop&crop=faces',
    imageWidth: 1000,
    imageHeight: 700,
    age: 26,
    category: 'VIP Exclusive',
    rating: 4.7,
    views: 6800,
    duration: '28 min',
    price: '$35', // Changed to string
    isVip: true,
    isLive: false,
  },
];

const ITEMS_PER_LOAD = 6; // Number of items to load each time

export default function NetflixViewPage() {
  const [displayedAdvertisers, setDisplayedAdvertisers] = useState<AdvertiserCardType[]>([]);
  const [loadedCount, setLoadedCount] = useState(0);
  const { ref, inView } = useInView({ threshold: 0.5 }); // Trigger when 50% visible

  // Initial load
  useEffect(() => {
    loadMoreAdvertisers();
  }, []);

  // Load more when 'inView' becomes true
  useEffect(() => {
    if (inView) {
      loadMoreAdvertisers();
    }
  }, [inView]);

  const loadMoreAdvertisers = () => {
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
  };

  const breakpointColumnsObj = {
    default: 5, // Number of columns by default
    1536: 5, // 2xl
    1280: 4, // xl
    1024: 3, // lg
    768: 2, // md
    640: 1, // sm
  };

  return (
    <div className="min-h-screen bg-black text-white">
      <EnhancedNavbar />
      <div className="px-4 sm:px-6 lg:px-8 py-8">
        {displayedAdvertisers.length > 0 ? (
          <Masonry
            breakpointCols={breakpointColumnsObj}
            className="my-masonry-grid flex w-auto -ml-4"
            columnClassName="my-masonry-grid_column bg-clip-padding pl-4"
          >
            {displayedAdvertisers.map((advertiser: AdvertiserCardType) => (
              <motion.div
                key={advertiser.id}
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <AdvertiserCard advertiser={advertiser} />
              </motion.div>
            ))}
          </Masonry>
        ) : (
          <p>Loading advertisers...</p>
        )}

        {/* Load more trigger */}
        {loadedCount < initialAdvertisersData.length && (
          <div ref={ref} className="flex justify-center items-center h-20">
            <p>Loading more...</p>
          </div>
        )}
        {loadedCount >= initialAdvertisersData.length && displayedAdvertisers.length > 0 && (
          <div className="text-center py-10 text-gray-500">
            <p>You've reached the end of the line!</p>
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
