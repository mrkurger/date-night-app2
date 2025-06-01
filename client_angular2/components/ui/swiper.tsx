'use client';

import * as React from 'react';
import { motion, PanInfo, useAnimation } from 'framer-motion';

interface SwiperProps {
  children: React.ReactNode;
  onSwipe?: (direction: 'left' | 'right' | 'up') => void;
  threshold?: number;
  className?: string;
}

export function Swiper({ children, onSwipe, threshold = 100, className = '' }: SwiperProps) {
  const controls = useAnimation();
  const [direction, setDirection] = React.useState<'left' | 'right' | 'up' | null>(null);

  // Handle drag end
  const handleDragEnd = (e: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    const { offset, velocity } = info;

    // Horizontal swipe detection
    if (Math.abs(offset.x) > threshold || Math.abs(velocity.x) > 0.5) {
      const direction = offset.x > 0 ? 'right' : 'left';

      controls
        .start({
          x: direction === 'left' ? -250 : 250,
          opacity: 0,
          transition: { duration: 0.3 },
        })
        .then(() => {
          controls.set({ x: 0, opacity: 1 });
          if (onSwipe) onSwipe(direction);
        });

      setDirection(direction);
      return;
    }

    // Upward swipe/flick detection (like Tinder)
    if (offset.y < -threshold || velocity.y < -0.5) {
      controls
        .start({
          y: -250,
          opacity: 0,
          transition: { duration: 0.3 },
        })
        .then(() => {
          controls.set({ y: 0, opacity: 1 });
          if (onSwipe) onSwipe('up');
        });

      setDirection('up');
      return;
    }

    // Reset position if no swipe detected
    controls.start({ x: 0, y: 0, opacity: 1 });
    setDirection(null);
  };

  // Calculate rotation based on drag position
  const getRotation = (x: number) => {
    // Limit rotation to a reasonable amount
    return Math.min(Math.max(x / 15, -20), 20);
  };

  return (
    <motion.div
      className={`touch-manipulation will-change-transform ${className}`}
      animate={controls}
      drag
      dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
      dragElastic={0.9}
      onDragEnd={handleDragEnd}
      style={{
        rotateZ: direction === 'left' ? -10 : direction === 'right' ? 10 : 0,
      }}
      whileDrag={{
        scale: 1.05,
        cursor: 'grabbing',
        rotateZ: ({ offset }: { offset?: { x?: number; y?: number } }) =>
          getRotation(offset?.x || 0),
      }}
    >
      {children}
    </motion.div>
  );
}
