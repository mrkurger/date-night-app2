'use client';

import { useState, useRef, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';

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

interface EnhancedCarouselProps {
  advertisers: Advertiser[];
  title?: string;
  className?: string;
  variant?: 'default' | 'premium';
}

export function EnhancedCarousel({
  advertisers,
  title,
  className,
  variant = 'default',
}: EnhancedCarouselProps) {
  const [scrollPosition, setScrollPosition] = useState(0);
  const [activeIndex, setActiveIndex] = useState(0);
  const [showInfo, setShowInfo] = useState<string | number | null>(null);
  const carouselRef = useRef<HTMLDivElement>(null);
  const isPremium = variant === 'premium';

  const handleScroll = (direction: 'left' | 'right') => {
    if (!carouselRef.current) return;

    const container = carouselRef.current;
    const cardWidth = isPremium ? 350 : 280; // approximate width of each card including gap
    const scrollAmount = cardWidth * (isPremium ? 1 : 2); // scroll by 1 or 2 cards at a time

    if (direction === 'left') {
      container.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
      setActiveIndex(Math.max(0, activeIndex - 1));
    } else {
      container.scrollBy({ left: scrollAmount, behavior: 'smooth' });
      setActiveIndex(Math.min(advertisers.length - 1, activeIndex + 1));
    }

    setShowInfo(null);
  };

  // Update scroll position for button visibility
  useEffect(() => {
    if (!carouselRef.current) return;

    const container = carouselRef.current;

    const handleScrollEvent = () => {
      setScrollPosition(container.scrollLeft);
    };

    container.addEventListener('scroll', handleScrollEvent);
    return () => container.removeEventListener('scroll', handleScrollEvent);
  }, []);

  const canScrollLeft = scrollPosition > 0;
  const canScrollRight = carouselRef.current
    ? scrollPosition < carouselRef.current.scrollWidth - carouselRef.current.clientWidth - 10
    : true;

  const toggleInfo = (id: string | number) => {
    setShowInfo(showInfo === id ? null : id);
  };

  return (
    <div className={cn('relative', className)}>
      {title && (
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">{title}</h2>
          <div className="flex space-x-2">
            <Button
              variant="outline"
              size="icon"
              className={cn('rounded-full', !canScrollLeft && 'opacity-50 cursor-not-allowed')}
              onClick={() => handleScroll('left')}
              disabled={!canScrollLeft}
            >
              <ChevronLeft className="h-5 w-5" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className={cn('rounded-full', !canScrollRight && 'opacity-50 cursor-not-allowed')}
              onClick={() => handleScroll('right')}
              disabled={!canScrollRight}
            >
              <ChevronRight className="h-5 w-5" />
            </Button>
          </div>
        </div>
      )}

      <div className="relative">
        {/* Carousel container */}
        <div
          ref={carouselRef}
          className={cn(
            'flex overflow-x-auto gap-4 pb-4 pt-2 px-2 snap-x snap-mandatory scrollbar-hide',
            isPremium ? 'h-[450px]' : 'h-[350px]',
          )}
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {advertisers.map(advertiser => (
            <div
              key={advertiser.id}
              className={cn(
                'flex-shrink-0 snap-start relative rounded-2xl overflow-hidden shadow-md transition-transform duration-300 hover:scale-[1.02]',
                isPremium ? 'w-[350px]' : 'w-[280px]',
              )}
              onClick={() => isPremium && toggleInfo(advertiser.id)}
            >
              {/* Card Image */}
              <img
                src={
                  advertiser.image ||
                  `/placeholder.svg?height=450&width=350&text=${advertiser.name}`
                }
                alt={advertiser.name}
                className="w-full h-full object-cover"
              />

              {/* Overlay gradient */}
              <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/70"></div>

              {/* Online indicator */}
              {advertiser.isOnline && (
                <div className="absolute top-3 left-3">
                  <Badge className="bg-green-500 text-white px-2 py-1 text-xs font-medium rounded-full">
                    Online
                  </Badge>
                </div>
              )}

              {/* Distance */}
              {advertiser.distance !== undefined && (
                <div className="absolute top-3 left-1/2 -translate-x-1/2">
                  <Badge className="bg-black/60 text-white px-2 py-1 text-xs font-medium rounded-full">
                    {advertiser.distance} km
                  </Badge>
                </div>
              )}

              {/* VIP/Premium badge */}
              {(advertiser.isVip || advertiser.isPremium) && (
                <div className="absolute top-3 right-3">
                  <Badge
                    className={cn(
                      'px-2 py-1 text-xs font-medium rounded-full',
                      advertiser.isPremium ? 'bg-purple-500 text-white' : 'bg-amber-500 text-white',
                    )}
                  >
                    {advertiser.isPremium ? 'Premium' : 'VIP'}
                  </Badge>
                </div>
              )}

              {/* Advertiser name */}
              <div className="absolute bottom-4 left-4 right-4 text-white">
                <h3 className="text-lg font-bold">
                  {advertiser.name}
                  {advertiser.age && <span className="ml-2">{advertiser.age}</span>}
                </h3>
                {advertiser.location && (
                  <p className="text-sm text-white/80">{advertiser.location}</p>
                )}
              </div>

              {/* Info panel that slides in (only for premium variant) */}
              {isPremium && (
                <AnimatePresence>
                  {showInfo === advertiser.id && (
                    <motion.div
                      initial={{ x: 300, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      exit={{ x: 300, opacity: 0 }}
                      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                      className="absolute inset-0 bg-black/80 p-6 flex flex-col justify-between"
                    >
                      <div>
                        <h3 className="text-2xl font-bold text-white mb-2">
                          {advertiser.name}
                          {advertiser.age && <span className="ml-2">{advertiser.age}</span>}
                        </h3>
                        {advertiser.location && (
                          <p className="text-white/80 mb-4">{advertiser.location}</p>
                        )}
                        <p className="text-white/90 mb-6">
                          Premium advertiser with exclusive content and services. Contact now for
                          special offers.
                        </p>
                      </div>

                      <Button
                        className="w-full bg-pink-600 hover:bg-pink-700 text-white"
                        onClick={e => {
                          e.stopPropagation();
                          window.location.href = `/advertiser/${advertiser.id}`;
                        }}
                      >
                        View Profile
                      </Button>
                    </motion.div>
                  )}
                </AnimatePresence>
              )}

              {/* Link overlay (only for non-premium variant) */}
              {!isPremium && (
                <Link
                  href={`/advertiser/${advertiser.id}`}
                  className="absolute inset-0 z-10"
                  aria-label={`View ${advertiser.name}'s profile`}
                />
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
