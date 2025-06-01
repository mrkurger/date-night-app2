'use client';

import { useState, useRef, useCallback, forwardRef, useImperativeHandle } from 'react';
import { motion, useMotionValue, useTransform, PanInfo } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { Card } from '@/components/ui/card';
import { BlurImage } from '@/components/ui/blur-image';
import { cn } from '@/lib/utils';

export interface Advertiser {
  id: string;
  name: string;
  age: number;
  location: string;
  bio: string;
  images: string[];
  tags: string[];
  isVip?: boolean;
}

export interface TinderCardStackRef {
  triggerSwipe: (direction: 'left' | 'right' | 'up') => void;
}

interface TinderCardStackProps {
  advertisers: Advertiser[];
  onSwipeLeft?: (advertiser: Advertiser) => void;
  onSwipeRight?: (advertiser: Advertiser) => void;
  onSwipeUp?: (advertiser: Advertiser) => void;
}

const SWIPE_THRESHOLD = 100;
const ROTATION_FACTOR = 0.1;
const VISIBLE_CARDS = 4;

const TinderCardStack = forwardRef<TinderCardStackRef, TinderCardStackProps>(
  ({ advertisers, onSwipeLeft, onSwipeRight, onSwipeUp }, ref) => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [exitDirection, setExitDirection] = useState<'left' | 'right' | 'up' | null>(null);

    const handleSwipe = useCallback(
      (direction: 'left' | 'right' | 'up') => {
        if (currentIndex >= advertisers.length) return;

        const currentAdvertiser = advertisers[currentIndex];
        if (!currentAdvertiser) return;

        setExitDirection(direction);

        // Call appropriate callback
        if (direction === 'left' && onSwipeLeft) {
          onSwipeLeft(currentAdvertiser);
        } else if (direction === 'right' && onSwipeRight) {
          onSwipeRight(currentAdvertiser);
        } else if (direction === 'up' && onSwipeUp) {
          onSwipeUp(currentAdvertiser);
        }

        // Move to next card after animation
        setTimeout(() => {
          setCurrentIndex(prev => prev + 1);
          setExitDirection(null);
        }, 300);
      },
      [currentIndex, advertisers, onSwipeLeft, onSwipeRight, onSwipeUp],
    );

    const handleDragEnd = useCallback(
      (info: PanInfo) => {
        const { offset, velocity } = info;
        const swipeThreshold = SWIPE_THRESHOLD;

        // Determine swipe direction based on offset and velocity
        if (Math.abs(offset.x) > Math.abs(offset.y)) {
          // Horizontal swipe
          if (offset.x > swipeThreshold || velocity.x > 500) {
            handleSwipe('right');
          } else if (offset.x < -swipeThreshold || velocity.x < -500) {
            handleSwipe('left');
          }
        } else {
          // Vertical swipe
          if (offset.y < -swipeThreshold || velocity.y < -500) {
            handleSwipe('up');
          }
        }
      },
      [handleSwipe],
    );

    // Expose triggerSwipe method to parent component
    useImperativeHandle(ref, () => ({
      triggerSwipe: (direction: 'left' | 'right' | 'up') => {
        handleSwipe(direction);
      },
    }));

    if (advertisers.length === 0) {
      return (
        <div className="flex items-center justify-center h-96 text-gray-500">
          No more profiles to show
        </div>
      );
    }

    if (currentIndex >= advertisers.length) {
      return (
        <div className="flex flex-col items-center justify-center h-96 text-gray-500">
          <h3 className="text-xl font-semibold mb-2">That&apos;s everyone!</h3>
          <p>Check back later for new profiles</p>
        </div>
      );
    }

    return (
      <div
        className="perspective-1000 relative w-full h-[600px] flex items-center justify-center"
        style={{ perspective: '1000px' }}
      >
        {/* Render visible cards */}
        {Array.from({ length: VISIBLE_CARDS }).map((_, index) => {
          const cardIndex = currentIndex + index;
          if (cardIndex >= advertisers.length) return null;

          const advertiser = advertisers[cardIndex];
          if (!advertiser) return null;

          const isTopCard = index === 0;
          const zIndex = VISIBLE_CARDS - index;
          const scale = 1 - index * 0.05;
          const yOffset = index * 8;
          const rotation = index * 2;

          const cardProps: TinderCardProps = {
            advertiser,
            isTopCard,
            zIndex,
            scale,
            yOffset,
            rotation,
            exitDirection: isTopCard ? exitDirection : null,
          };

          if (isTopCard && handleDragEnd) {
            cardProps.onDragEnd = handleDragEnd;
          }

          return <TinderCard key={`${advertiser.id}-${cardIndex}`} {...cardProps} />;
        })}

        {/* Instructions */}
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 text-sm text-gray-400 bg-black/50 px-4 py-2 rounded-full">
          Swipe right to like • Swipe left to pass • Swipe up to super like
        </div>
      </div>
    );
  },
);

TinderCardStack.displayName = 'TinderCardStack';

export default TinderCardStack;

interface TinderCardProps {
  advertiser: Advertiser;
  isTopCard: boolean;
  zIndex: number;
  scale: number;
  yOffset: number;
  rotation: number;
  onDragEnd?: (info: PanInfo) => void;
  exitDirection: 'left' | 'right' | 'up' | null;
}

function TinderCard({
  advertiser,
  isTopCard,
  zIndex,
  scale,
  yOffset,
  rotation,
  onDragEnd,
  exitDirection,
}: TinderCardProps) {
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rotateZ = useTransform(x, [-300, 300], [-30, 30]);
  const opacity = useTransform(x, [-300, -150, 0, 150, 300], [0, 1, 1, 1, 0]);

  // Swipe indicator opacities (always create these hooks)
  const passOpacity = useTransform(x, [-150, -50], [1, 0]);
  const likeOpacity = useTransform(x, [50, 150], [1, 0]);
  const superLikeOpacity = useTransform(y, [-150, -50], [1, 0]);

  const { ref: lazyLoadRef, inView } = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  // Exit animation variants
  const exitVariants = {
    left: { x: -1000, opacity: 0, transition: { duration: 0.3 } },
    right: { x: 1000, opacity: 0, transition: { duration: 0.3 } },
    up: { y: -1000, opacity: 0, transition: { duration: 0.3 } },
  };

  return (
    <motion.div
      className={`absolute cursor-grab active:cursor-grabbing ${
        exitDirection ? 'exiting-card' : ''
      }`}
      data-card-state={exitDirection ? 'exiting' : 'active'}
      style={{
        zIndex,
        x: isTopCard ? x : 0,
        y: isTopCard ? y : 0,
        rotateZ: isTopCard ? rotateZ : rotation,
        scale,
        opacity: isTopCard ? opacity : 1,
      }}
      initial={{
        scale,
        y: yOffset,
        rotateZ: rotation,
      }}
      animate={
        exitDirection && isTopCard
          ? exitVariants[exitDirection]
          : {
              scale,
              y: yOffset,
              rotateZ: rotation,
            }
      }
      drag={isTopCard}
      dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
      dragElastic={0.7}
      onDragEnd={onDragEnd}
      whileDrag={{ scale: 1.05 }}
    >
      <Card className="w-80 h-[400px] overflow-hidden rounded-2xl shadow-2xl bg-white">
        <div ref={lazyLoadRef} className="relative w-full h-full">
          {inView && (
            <>
              <BlurImage
                src={advertiser.images?.[0] || '/placeholder.svg'}
                alt={advertiser.name}
                width={320}
                height={400}
                className="w-full h-full object-cover"
                priority={isTopCard}
                quality={isTopCard ? 90 : 70}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />

              {/* Card content */}
              <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                <h3 className="text-2xl font-bold flex items-center mb-1">
                  {advertiser.name}, {advertiser.age}
                  {advertiser.isVip && (
                    <span className="ml-2 px-2 py-1 bg-yellow-500 text-black text-xs rounded-full font-semibold">
                      VIP
                    </span>
                  )}
                </h3>
                <p className="text-sm opacity-90 mb-2">{advertiser.location}</p>
                <p className="text-sm line-clamp-2 mb-3">{advertiser.bio}</p>

                {/* Tags */}
                <div className="flex flex-wrap gap-1">
                  {advertiser.tags.slice(0, 3).map(tag => (
                    <span key={tag} className="px-2 py-1 bg-white/20 text-xs rounded-full">
                      {tag}
                    </span>
                  ))}
                  {advertiser.tags.length > 3 && (
                    <span className="px-2 py-1 bg-white/20 text-xs rounded-full">
                      +{advertiser.tags.length - 3}
                    </span>
                  )}
                </div>
              </div>

              {/* Swipe indicators */}
              {isTopCard && (
                <>
                  <motion.div
                    className="absolute top-8 left-8 px-4 py-2 bg-red-500 text-white font-bold rounded-lg transform -rotate-12"
                    style={{ opacity: passOpacity }}
                  >
                    PASS
                  </motion.div>
                  <motion.div
                    className="absolute top-8 right-8 px-4 py-2 bg-green-500 text-white font-bold rounded-lg transform rotate-12"
                    style={{ opacity: likeOpacity }}
                  >
                    LIKE
                  </motion.div>
                  <motion.div
                    className="absolute top-8 left-1/2 transform -translate-x-1/2 px-4 py-2 bg-blue-500 text-white font-bold rounded-lg"
                    style={{ opacity: superLikeOpacity }}
                  >
                    SUPER LIKE
                  </motion.div>
                </>
              )}
            </>
          )}
        </div>
      </Card>
    </motion.div>
  );
}
