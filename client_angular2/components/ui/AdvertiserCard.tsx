'use client';

import Image from 'next/image';
import { motion } from 'framer-motion';
import { MapPin, Circle } from 'lucide-react'; // Wifi not used, Circle for online status
import { getProfileImage } from '@/lib/data';

export interface Advertiser {
  id: string | number;
  name: string;
  location?: string; // Made location optional
  distance?: string;
  isOnline?: boolean; // Changed from onlineStatus to isOnline
  isVip?: boolean; // Added isVip
  image: string;
  imageWidth?: number;
  imageHeight?: number;
  age?: number; // Added to match data structure from lib/data
  rating?: number; // Added to match data structure from lib/data
  price?: string; // Added to match data structure from lib/data
  description?: string; // Added to match data structure from lib/data
  tags?: string[]; // Added to match data structure from lib/data
  category?: string; // Added category property
  views?: number; // Added views property
  duration?: string; // Added duration property
}

interface AdvertiserCardProps {
  advertiser: Advertiser;
}

const AdvertiserCard: React.FC<AdvertiserCardProps> = ({ advertiser }) => {
  return (
    <motion.div
      className="group relative overflow-hidden rounded-lg shadow-md transform transition-all duration-300 hover:scale-[1.03] hover:shadow-lg"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      layout
    >
      <div className="relative w-full h-full">
        <Image
          src={getProfileImage(advertiser)}
          alt={advertiser.name}
          fill={true}
          className="object-cover transition-transform duration-700 group-hover:scale-110"
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          priority={false}
        />

        {/* Hover overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

        {/* Status indicators - only show in compact view */}
        {advertiser.isVip && (
          <div className="absolute top-3 right-3 bg-yellow-400 text-slate-900 font-bold px-2 py-1 text-xs rounded-full shadow-md">
            VIP
          </div>
        )}

        {advertiser.isOnline && (
          <div className="absolute top-3 left-3 flex items-center space-x-1.5 bg-green-500/80 text-white px-2.5 py-1 rounded-full text-xs font-semibold backdrop-blur-sm">
            <span className="w-2 h-2 bg-green-300 rounded-full animate-pulse"></span>
            <span>Online</span>
          </div>
        )}

        {/* Location overlay similar to reference image */}
        <div className="location-overlay">
          <div>
            <h3 className="text-lg font-semibold text-white">
              {advertiser.name}
              {advertiser.age ? `, ${advertiser.age}` : ''}
            </h3>
            <p className="text-sm text-gray-200 flex items-center">
              <MapPin className="w-3 h-3 mr-1 flex-shrink-0" />
              {advertiser.location || 'Unknown Location'}
            </p>
          </div>
        </div>

        {/* Navigation circle button like in reference */}
        <div className="arrow-nav opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
            className="w-4 h-4"
          >
            <path
              fillRule="evenodd"
              d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z"
              clipRule="evenodd"
            />
          </svg>
        </div>
      </div>
    </motion.div>
  );
};

export default AdvertiserCard;
