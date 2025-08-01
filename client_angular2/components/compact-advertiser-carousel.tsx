'use client';

import { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import Link from 'next/link';

interface Advertiser {
  id: string | number;
  name: string;
  age?: number;
  location?: string;
  distance?: number;
  image?: string;
  isVip?: boolean;
  isOnline?: boolean;
}

interface CompactAdvertiserCarouselProps {
  advertisers: Advertiser[];
  title?: string;
  className?: string;
}

export function CompactAdvertiserCarousel({
  advertisers,
  title,
  className,
}: CompactAdvertiserCarouselProps) {
  const [scrollPosition, setScrollPosition] = useState(0);
  const carouselRef = useRef<HTMLDivElement>(null);

  const handleScroll = (direction: 'left' | 'right') => {
    if (!carouselRef.current) return;

    const container = carouselRef.current;
    const cardWidth = 280; // approximate width of each card including gap
    const scrollAmount = cardWidth * 2; // scroll by 2 cards at a time

    if (direction === 'left') {
      container.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
    } else {
      container.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
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

  return (
    <div className={cn('relative', className)}>
      {title && <h2 className="text-2xl font-bold mb-6">{title}</h2>}

      <div className="relative">
        {/* Left scroll button */}
        <Button
          variant="outline"
          size="icon"
          className={cn(
            'absolute left-0 top-1/2 -translate-y-1/2 z-10 rounded-full bg-white/80 shadow-md -ml-5',
            !canScrollLeft && 'opacity-0 pointer-events-none',
          )}
          onClick={() => handleScroll('left')}
        >
          <ChevronLeft className="h-5 w-5" />
        </Button>

        {/* Carousel container */}
        <div
          ref={carouselRef}
          className="flex overflow-x-auto gap-4 pb-4 pt-2 px-2 snap-x snap-mandatory scrollbar-hide"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {advertisers.map(advertiser => (
            <Link
              key={advertiser.id}
              href={`/advertiser/${advertiser.id}`}
              className="flex-shrink-0 w-[250px] snap-start"
            >
              <div className="relative rounded-2xl overflow-hidden shadow-md h-[350px] transition-transform duration-300 hover:scale-[1.02]">
                {/* Card Image */}
                <Image
                  src={
                    advertiser.image ||
                    `/placeholder.svg?height=350&width=250&text=${advertiser.name}`
                  }
                  alt={advertiser.name}
                  fill
                  className="object-cover"
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

                {/* VIP badge */}
                {advertiser.isVip && (
                  <div className="absolute top-3 right-3">
                    <Badge className="bg-amber-500 text-white px-2 py-1 text-xs font-medium rounded-full">
                      VIP
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
              </div>
            </Link>
          ))}
        </div>

        {/* Right scroll button */}
        <Button
          variant="outline"
          size="icon"
          className={cn(
            'absolute right-0 top-1/2 -translate-y-1/2 z-10 rounded-full bg-white/80 shadow-md -mr-5',
            !canScrollRight && 'opacity-0 pointer-events-none',
          )}
          onClick={() => handleScroll('right')}
        >
          <ChevronRight className="h-5 w-5" />
        </Button>
      </div>
    </div>
  );
}
