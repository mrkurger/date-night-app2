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
      className="group relative overflow-hidden rounded-lg shadow-lg bg-gray-800"
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      layout
    >
      <Image
        src={getProfileImage(advertiser)}
        alt={advertiser.name}
        width={Number(advertiser.imageWidth) || 400}
        height={Number(advertiser.imageHeight) || 600}
        className="w-full h-auto object-cover"
        priority={false}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
      <div className="absolute bottom-0 left-0 p-3 w-full text-white">
        <h3 className="text-md font-bold truncate">{advertiser.name}</h3>
        <div className="flex items-center text-xs text-gray-300 mt-1">
          <MapPin className="w-3 h-3 mr-1 flex-shrink-0" />
          <span className="truncate">{advertiser.location}</span>
          {advertiser.distance && <span className="mx-1">·</span>}
          {advertiser.distance && <span className="truncate">{advertiser.distance}</span>}
        </div>
        {advertiser.isOnline !== undefined && (
          <div className="absolute top-3 right-3 flex items-center">
            <Circle
              className={`w-3 h-3 ${
                advertiser.isOnline // Changed from onlineStatus
                  ? 'text-green-500 fill-green-500'
                  : 'text-gray-500 fill-gray-500'
              }`}
            />
            <span className="ml-1.5 text-xs text-white sr-only">
              {advertiser.isOnline ? 'Online' : 'Offline'} {/* Changed from onlineStatus */}
            </span>
          </div>
        )}
        {advertiser.isVip && (
          <div className="absolute top-3 left-3 bg-amber-500 text-amber-950 px-1.5 py-0.5 rounded-sm text-xs font-bold">
            VIP
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default AdvertiserCard;
