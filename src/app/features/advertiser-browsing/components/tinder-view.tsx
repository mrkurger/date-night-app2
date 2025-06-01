'use client';

import { useState, useRef } from 'react';
import { motion, type PanInfo, useAnimation } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { HeartIcon, XIcon, StarIcon } from 'lucide-react';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface TinderViewProps {
  advertisers: any[];
}

export default function TinderView({ advertisers }: TinderViewProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState<'left' | 'right' | ''>('');
  const controls = useAnimation();
  const constraintsRef = useRef(null);

  const currentAdvertiser = advertisers[currentIndex];

  // We will show 3 sponsored ads below the main card
  const sponsoredAds = advertisers.slice(0, 3);

  const handleDragEnd = async (info: PanInfo) => {
    const threshold = 100;
    if (info.offset.x > threshold) {
      setDirection('right');
      await controls.start({ x: '100vw', opacity: 0 });
      handleLike();
    } else if (info.offset.x < -threshold) {
      setDirection('left');
      await controls.start({ x: '-100vw', opacity: 0 });
      handleDislike();
    } else {
      controls.start({ x: 0, opacity: 1 });
    }
  };

  const handleLike = () => {
    if (currentIndex < advertisers.length - 1) {
      setCurrentIndex(currentIndex + 1);
      controls.set({ x: 0, opacity: 1 });
      setDirection('');
    }
  };

  const handleDislike = () => {
    if (currentIndex < advertisers.length - 1) {
      setCurrentIndex(currentIndex + 1);
      controls.set({ x: 0, opacity: 1 });
      setDirection('');
    }
  };

  if (!currentAdvertiser) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <p className="text-lg text-gray-400">No more advertisers to show. Check back later!</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8">
      {/* Main Tinder Card */}
      <div className="relative h-[70vh] w-full overflow-hidden" ref={constraintsRef}>
        <motion.div
          drag="x"
          dragConstraints={constraintsRef}
          onDragEnd={(_, info) => handleDragEnd(info)}
          animate={controls}
          initial={{ x: 0, opacity: 1 }}
          className="absolute inset-0 cursor-grab active:cursor-grabbing"
        >
          <Link href={`/advertiser/${currentAdvertiser.id}`}>
            <Card className="w-full h-full overflow-hidden relative group">
              <div className="absolute inset-0">
                <Image
                  src={currentAdvertiser.image || '/placeholder.svg?height=600&width=400'}
                  alt={currentAdvertiser.name}
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Overlay with gradient */}
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />

              {/* Content */}
              <div className="absolute bottom-0 left-0 right-0 p-6">
                <div className="flex items-center gap-2 mb-1">
                  <h2 className="text-2xl font-bold text-white">
                    {currentAdvertiser.name}, {currentAdvertiser.age}
                  </h2>
                  {currentAdvertiser.isVip && (
                    <Badge className="bg-yellow-500 text-yellow-950">VIP</Badge>
                  )}
                  {currentAdvertiser.isOnline && (
                    <Badge className="bg-green-500 text-green-950">Online</Badge>
                  )}
                </div>

                <div className="flex items-center gap-2 mb-3">
                  <StarIcon className="w-4 h-4 text-yellow-500" />
                  <span className="text-white">{currentAdvertiser.rating}</span>
                  <span className="text-gray-300 text-sm">• {currentAdvertiser.location}</span>
                </div>

                <p className="text-gray-200 mb-4">{currentAdvertiser.description}</p>

                <div className="flex gap-2 overflow-x-auto pb-2">
                  {currentAdvertiser.tags.map((tag: string) => (
                    <Badge
                      key={tag}
                      variant="outline"
                      className="bg-gray-800/60 text-gray-200 whitespace-nowrap"
                    >
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Swipe indicators */}
              <div
                className={cn(
                  'absolute top-6 right-6 p-3 rounded-full bg-green-500/80 transition-opacity duration-300',
                  direction === 'right' ? 'opacity-100' : 'opacity-0',
                )}
              >
                <HeartIcon className="w-8 h-8 text-white" />
              </div>
              <div
                className={cn(
                  'absolute top-6 left-6 p-3 rounded-full bg-red-500/80 transition-opacity duration-300',
                  direction === 'left' ? 'opacity-100' : 'opacity-0',
                )}
              >
                <XIcon className="w-8 h-8 text-white" />
              </div>
            </Card>
          </Link>
        </motion.div>
      </div>

      {/* Action buttons */}
      <div className="flex justify-center gap-6">
        <button
          onClick={handleDislike}
          className="w-16 h-16 flex items-center justify-center rounded-full bg-red-100 text-red-500 hover:bg-red-200 transition-colors"
        >
          <XIcon className="w-8 h-8" />
        </button>
        <button
          onClick={handleLike}
          className="w-16 h-16 flex items-center justify-center rounded-full bg-green-100 text-green-500 hover:bg-green-200 transition-colors"
        >
          <HeartIcon className="w-8 h-8" />
        </button>
      </div>

      {/* Sponsored ads below */}
      <div className="mt-8">
        <h3 className="text-xl font-semibold mb-4">Sponsored Advertisers</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {sponsoredAds.map(ad => (
            <Link key={ad.id} href={`/advertiser/${ad.id}`}>
              <Card className="overflow-hidden hover:shadow-md transition-shadow">
                <div className="aspect-[3/4] relative">
                  <Image
                    src={ad.image || '/placeholder.svg?height=400&width=300'}
                    alt={ad.name}
                    className="object-cover w-full h-full"
                  />
                  <div className="absolute top-2 right-2">
                    <Badge className="bg-gray-800/70">Sponsored</Badge>
                  </div>
                </div>
                <div className="p-3">
                  <div className="flex justify-between items-center">
                    <h4 className="font-medium">
                      {ad.name}, {ad.age}
                    </h4>
                    <div className="flex items-center">
                      <StarIcon className="w-4 h-4 text-yellow-500 mr-1" />
                      <span className="text-sm">{ad.rating}</span>
                    </div>
                  </div>
                  <p className="text-sm text-gray-400">{ad.location}</p>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
