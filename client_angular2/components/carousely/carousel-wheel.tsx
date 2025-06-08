'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion, PanInfo, useAnimation, animate } from 'framer-motion';
import { Card } from '@/components/ui/card';
import Image from 'next/image';
import { BlurImage } from '@/components/ui/blur-image';
import { cn } from '@/lib/utils';
import { Swiper } from '@/components/ui/swiper';
import { useInView } from 'react-intersection-observer';

interface Advertiser {
  id: string;
  name: string;
  age: number;
  location: string;
  bio: string;
  images: string[];
  tags: string[];
  rating: number;
  isVip?: boolean;
  isOnline?: boolean;
}

interface CarouselWheelProps {
  advertisers: Advertiser[];
  onSwipe?: (direction: 'left' | 'right', advertiserId: string) => void;
}

export function CarouselWheel({ advertisers, onSwipe }: CarouselWheelProps) {
  // Card state
  const [activeCardIndex, setActiveCardIndex] = useState(0);
  const [dragStartX, setDragStartX] = useState(0);
  const [wheelRotation, setWheelRotation] = useState(0);
  const [visibleCards, setVisibleCards] = useState<number[]>([0, 1, 2, 3, 4]);
  const wheelRef = useRef<HTMLDivElement | null>(null);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);

  // Wheel setup
  const wheelRadius = 600; // Radius of the wheel
  const totalCards = advertisers.length;
  const cardAngle = 360 / Math.min(totalCards, 10); // Distribute up to 10 cards around the wheel

  // Animation controls
  const controls = useAnimation();

  // Calculate which cards should be visible based on the wheel rotation
  useEffect(() => {
    if (totalCards <= 0) return;

    // Calculate which cards are currently in view
    const visibleIndexes: number[] = [];
    const angleOffset = wheelRotation % 360;

    // Add cards that would be visible in the front half of the wheel
    for (let i = 0; i < totalCards; i++) {
      const cardPosition = (i * cardAngle + angleOffset) % 360;
      if (cardPosition <= 180) {
        visibleIndexes.push(i % totalCards);
      }
    }

    // If we've calculated less than 5 cards or half the total, add more
    while (visibleIndexes.length < Math.min(5, Math.ceil(totalCards / 2))) {
      const lastIndex = visibleIndexes[visibleIndexes.length - 1];
      const nextIndex = lastIndex !== undefined ? (lastIndex + 1) % totalCards : 0;
      if (!visibleIndexes.includes(nextIndex)) {
        visibleIndexes.push(nextIndex);
      } else {
        break;
      }
    }

    setVisibleCards(visibleIndexes);
    setActiveCardIndex(visibleIndexes[0] || 0);
  }, [wheelRotation, totalCards, cardAngle]);

  // Handle wheel rotation via drag
  const handleDragStart = (e: React.MouseEvent | React.TouchEvent) => {
    if ('touches' in e) {
      setDragStartX(e.touches[0]?.clientX || 0);
    } else {
      setDragStartX(e.clientX);
    }
  };

  const handleDrag = (e: React.MouseEvent | React.TouchEvent) => {
    if (!wheelRef.current) return;

    let clientX;
    if ('touches' in e) {
      clientX = e.touches[0]?.clientX || 0;
    } else {
      clientX = e.clientX;
    }

    const deltaX = clientX - dragStartX;
    // Adjust rotation sensitivity
    const rotationDelta = deltaX * 0.5;

    // Update wheel rotation
    setWheelRotation(prev => prev + rotationDelta);
    setDragStartX(clientX);
  };

  // Handle flick-up gesture for "liking"
  const handleFlickUp = (index: number) => {
    if (onSwipe) {
      onSwipe('right', advertisers[index]?.id || '');

      // Animate the card flying up
      const cardElement = cardRefs.current[index];
      if (cardElement) {
        animate(
          cardElement,
          {
            y: -500,
            opacity: 0,
            scale: 0.8,
            rotateZ: Math.random() * 20 - 10,
          },
          { duration: 0.5 },
        );

        // Remove from visible cards after animation
        setTimeout(() => {
          setVisibleCards(prev => prev.filter(i => i !== index));
        }, 500);
      }
    }
  };

  // Calculate positions for each card based on wheel rotation
  const getCardStyle = (index: number): React.CSSProperties => {
    // Calculate angle for this card on the wheel
    const angle = index * cardAngle + wheelRotation;
    const radians = (angle * Math.PI) / 180;

    // Calculate position on the wheel
    const x = Math.sin(radians) * wheelRadius;
    const z = Math.cos(radians) * wheelRadius;

    // Calculate scale based on z position (depth)
    const scale = 0.5 + ((z + wheelRadius) / (wheelRadius * 2)) * 0.5;

    // Calculate opacity based on z position
    const opacity = z > 0 ? 0.3 + (z / wheelRadius) * 0.7 : 0;

    // Card should be fully visible when it's at the front of the wheel
    const isActive = index === activeCardIndex;
    const zIndex = Math.round(z + 1000);

    return {
      transform: `translateX(${x}px) translateZ(${z}px) scale(${scale})`,
      opacity,
      zIndex,
      transition: 'transform 0.3s ease, opacity 0.3s ease',
      pointerEvents: isActive ? ('auto' as const) : ('none' as const),
    };
  };

  // Lazy loading images with Intersection Observer
  const { ref: lazyLoadRef, inView } = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  // Image compression service URL
  const getOptimizedImageUrl = (url: string, width = 500) => {
    // Use local image optimization service or CDN
    return `/api/image-optimize?url=${encodeURIComponent(url)}&w=${width}`;
  };

  if (advertisers.length === 0) {
    return <div className="flex items-center justify-center h-96">No advertisers available</div>;
  }

  return (
    <div
      className="relative h-[600px] w-full overflow-hidden perspective-1000"
      ref={wheelRef}
      data-testid="carousel-wheel"
    >
      <div
        className="absolute w-full h-full"
        style={{ transformStyle: 'preserve-3d', perspective: '1000px' }}
        onMouseDown={handleDragStart}
        onTouchStart={handleDragStart}
        onMouseMove={e => e.buttons === 1 && handleDrag(e)}
        onTouchMove={handleDrag}
        data-testid="carousel-wheel-container"
      >
        {advertisers.map((advertiser, index) => (
          <div
            key={advertiser.id}
            ref={el => (cardRefs.current[index] = el)}
            className={cn(
              'absolute top-1/2 left-1/2 w-80 h-[400px] cursor-grab active:cursor-grabbing',
              visibleCards.includes(index) ? '' : 'hidden',
            )}
            style={getCardStyle(index)}
            onDoubleClick={() => handleFlickUp(index)}
            data-testid="advertiser-card"
            data-card-index={index}
          >
            <Card className="w-full h-full overflow-hidden rounded-xl shadow-xl">
              <div ref={lazyLoadRef} className="relative w-full h-full">
                {inView && (
                  <>
                    <BlurImage
                      src={advertiser.images?.[0] || '/placeholder.svg'}
                      alt={advertiser.name}
                      width={320}
                      height={400}
                      className="w-full h-full object-cover"
                      priority={index === activeCardIndex}
                      quality={index === activeCardIndex ? 85 : 70}
                      data-testid="card-image"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />

                    {/* Card content */}
                    <div
                      className="absolute bottom-0 left-0 right-0 p-4 text-white"
                      data-testid="card-content"
                    >
                      <h3 className="text-xl font-bold flex items-center" data-testid="card-title">
                        {advertiser.name}, {advertiser.age}
                        {advertiser.isVip && (
                          <span
                            className="ml-2 px-2 py-0.5 bg-yellow-500 text-black text-xs rounded-full"
                            data-testid="vip-badge"
                          >
                            VIP
                          </span>
                        )}
                      </h3>
                      <p className="text-sm opacity-90">{advertiser.location}</p>
                      <p className="mt-1 text-sm line-clamp-2">{advertiser.bio}</p>

                      {/* Tags */}
                      <div className="flex flex-wrap gap-1 mt-2">
                        {advertiser.tags.slice(0, 3).map(tag => (
                          <span key={tag} className="px-2 py-0.5 bg-white/20 text-xs rounded-full">
                            {tag}
                          </span>
                        ))}
                        {advertiser.tags.length > 3 && (
                          <span className="px-2 py-0.5 bg-white/20 text-xs rounded-full">
                            +{advertiser.tags.length - 3}
                          </span>
                        )}
                      </div>
                    </div>
                  </>
                )}
              </div>
            </Card>
          </div>
        ))}
      </div>

      {/* Instructions */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 text-sm text-gray-400 bg-black/50 px-3 py-1 rounded-full">
        Drag to spin • Flick up to like
      </div>
    </div>
  );
}
