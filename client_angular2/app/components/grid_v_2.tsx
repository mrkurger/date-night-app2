'use client';
import React, { useState, useRef, useEffect } from 'react';
import { motion, useInView } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { MapPin } from 'lucide-react';

interface Advertiser {
  id: number;
  name: string;
  image: string;
  distance: string;
  isOnline: boolean;
}

interface MasonryGridProps {
  className?: string;
}

const MasonryGrid: React.FC<MasonryGridProps> = ({ className }) => {
  const [advertisers, setAdvertisers] = useState<Advertiser[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [page, setPage] = useState<number>(1);

  const observerRef = useRef<HTMLDivElement | null>(null);

  // Mock data generator
  const generateMockData = (pageNum: number): Advertiser[] => {
    const startId = (pageNum - 1) * 10 + 1;
    return Array.from({ length: 10 }, (_, i) => ({
      id: startId + i,
      name: `Advertiser ${startId + i}`,
      image: `https://source.unsplash.com/random/300x${300 + ((startId + i) % 200)}?sig=${
        startId + i
      }`,
      distance: `${Math.floor(Math.random() * 10) + 1} km away`,
      isOnline: Math.random() > 0.5,
    }));
  };

  const loadMore = () => {
    if (isLoading) return;

    setIsLoading(true);

    // Simulate API call
    setTimeout(() => {
      const newAdvertisers = generateMockData(page);
      setAdvertisers(prev => [...prev, ...newAdvertisers]);
      setPage(prev => prev + 1);
      setIsLoading(false);
    }, 800);
  };

  useEffect(() => {
    loadMore();
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => {
        if (entries[0].isIntersecting && !isLoading) {
          loadMore();
        }
      },
      { threshold: 0.5 },
    );

    if (observerRef.current) {
      observer.observe(observerRef.current);
    }

    return () => {
      if (observerRef.current) {
        observer.unobserve(observerRef.current);
      }
    };
  }, [isLoading]);

  return (
    <div className={cn('w-full', className)}>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 p-4">
        {advertisers.map(advertiser => (
          <AdvertiserCard
            key={advertiser.id}
            advertiser={advertiser}
            className={`${advertiser.id % 3 === 0 ? 'sm:col-span-2' : ''}`}
          />
        ))}
      </div>
      <div ref={observerRef} className="h-10 w-full flex items-center justify-center">
        {isLoading && (
          <div className="inline-block size-6 animate-spin rounded-full border-4 border-border border-t-foreground" />
        )}
      </div>
    </div>
  );
};

interface AdvertiserCardProps {
  advertiser: Advertiser;
  className?: string;
}

const AdvertiserCard: React.FC<AdvertiserCardProps> = ({ advertiser, className }) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(cardRef, {
    once: true,
    amount: 0.3,
  });

  return (
    <motion.div
      ref={cardRef}
      initial={{ opacity: 0, y: 50 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className={cn('', className)}
    >
      <Card className="overflow-hidden h-full">
        <div className="relative h-48 sm:h-64 overflow-hidden">
          <img
            src={advertiser.image}
            alt={advertiser.name}
            className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
          />
          <div className="absolute top-2 right-2">
            <Badge
              variant={advertiser.isOnline ? 'default' : 'outline'}
              className={cn(
                advertiser.isOnline ? 'bg-green-500 hover:bg-green-600' : 'text-muted-foreground',
              )}
            >
              {advertiser.isOnline ? 'Online' : 'Offline'}
            </Badge>
          </div>
        </div>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Avatar>
                <AvatarImage src={advertiser.image} alt={advertiser.name} />
                <AvatarFallback>{advertiser.name.substring(0, 2)}</AvatarFallback>
              </Avatar>
              <div>
                <h3 className="font-medium text-foreground">{advertiser.name}</h3>
                <div className="flex items-center text-sm text-muted-foreground">
                  <MapPin className="mr-1 h-3 w-3" />
                  <span>{advertiser.distance}</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export function InfiniteScrollMasonryDemo() {
  return (
    <div className="container mx-auto py-10">
      <h2 className="text-2xl font-bold mb-6 text-center text-foreground">Discover Advertisers</h2>
      <MasonryGrid />
    </div>
  );
}

export default InfiniteScrollMasonryDemo;
