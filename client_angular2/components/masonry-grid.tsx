'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

interface Advertiser {
  id: string | number;
  name: string;
  age?: number;
  location?: string;
  distance?: number;
  image?: string;
  isVip?: boolean;
  isOnline?: boolean;
  isPremium?: boolean;
}

interface MasonryGridProps {
  advertisers: Advertiser[];
  className?: string;
}

export function MasonryGrid({ advertisers, className }: MasonryGridProps) {
  const [hoveredId, setHoveredId] = useState<string | number | null>(null);

  // We need at least 7 advertisers for the grid
  const gridAdvertisers = advertisers.slice(0, Math.min(7, advertisers.length));

  // If we have less than 7, duplicate some to fill the grid
  while (gridAdvertisers.length < 7) {
    const advertiser = gridAdvertisers[gridAdvertisers.length % advertisers.length];
    if (!advertiser) break; // Avoid infinite loop

    const newAdvertiser: Advertiser = {
      id: advertiser.id || '',
      name: advertiser.name || '',
    };

    // Only add optional properties if they exist
    if (advertiser.age !== undefined) newAdvertiser.age = advertiser.age;
    if (advertiser.location !== undefined) newAdvertiser.location = advertiser.location;
    if (advertiser.distance !== undefined) newAdvertiser.distance = advertiser.distance;
    if (advertiser.image !== undefined) newAdvertiser.image = advertiser.image;
    if (advertiser.isVip !== undefined) newAdvertiser.isVip = advertiser.isVip;
    if (advertiser.isOnline !== undefined) newAdvertiser.isOnline = advertiser.isOnline;
    if (advertiser.isPremium !== undefined) newAdvertiser.isPremium = advertiser.isPremium;

    gridAdvertisers.push(newAdvertiser);
  }

  // Define the grid layout
  const gridLayout = [
    { className: 'col-span-1 row-span-2 md:col-span-1 md:row-span-2' }, // Tall left
    { className: 'col-span-2 row-span-1 md:col-span-2 md:row-span-1' }, // Wide top right
    { className: 'col-span-2 row-span-1 md:col-span-1 md:row-span-1' }, // Medium middle
    { className: 'col-span-1 row-span-1 md:col-span-1 md:row-span-1' }, // Small top right
    { className: 'col-span-1 row-span-1 md:col-span-1 md:row-span-1' }, // Small bottom left
    { className: 'col-span-2 row-span-1 md:col-span-2 md:row-span-1' }, // Wide bottom
    { className: 'col-span-1 row-span-2 md:col-span-1 md:row-span-2' }, // Tall right
  ];

  return (
    <div className={cn('grid grid-cols-3 md:grid-cols-4 gap-4', className)}>
      {gridAdvertisers.map((advertiser, index) => (
        <Link
          key={`${advertiser.id}-${index}`}
          href={`/advertiser/${advertiser.id}`}
          className={cn('relative overflow-hidden rounded-2xl group', gridLayout[index]?.className)}
          onMouseEnter={() => setHoveredId(advertiser.id)}
          onMouseLeave={() => setHoveredId(null)}
        >
          <div className="absolute inset-0 w-full h-full">
            <Image
              src={
                advertiser.image || `/placeholder.svg?height=600&width=400&text=${advertiser.name}`
              }
              alt={advertiser.name}
              fill
              className="object-cover transition-transform duration-700 ease-in-out group-hover:scale-110"
            />
          </div>

          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />

          {/* Online indicator */}
          {advertiser.isOnline && (
            <div className="absolute top-3 left-3">
              <Badge className="bg-green-500 text-white px-2 py-1 text-xs font-medium rounded-full">
                Online
              </Badge>
            </div>
          )}

          {/* VIP badge */}
          {advertiser.isVip && (
            <div className="absolute top-3 right-3">
              <Badge className="bg-amber-500 text-white px-2 py-1 text-xs font-medium rounded-full">
                VIP
              </Badge>
            </div>
          )}

          {/* Premium badge */}
          {advertiser.isPremium && (
            <div className="absolute top-3 right-3">
              <Badge className="bg-purple-500 text-white px-2 py-1 text-xs font-medium rounded-full">
                Premium
              </Badge>
            </div>
          )}

          {/* Content */}
          <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
            <h3 className="text-xl font-bold mb-1">
              {advertiser.name}
              {advertiser.age && <span className="ml-2">{advertiser.age}</span>}
            </h3>
            <p className="text-sm text-white/80">{advertiser.location}</p>
          </div>

          {/* Arrow */}
          <div className="absolute bottom-4 right-4">
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{
                opacity: hoveredId === advertiser.id ? 1 : 0,
                x: hoveredId === advertiser.id ? 0 : -10,
              }}
              transition={{ duration: 0.3 }}
            >
              <ChevronRight className="h-6 w-6 text-white" />
            </motion.div>
          </div>
        </Link>
      ))}
    </div>
  );
}
