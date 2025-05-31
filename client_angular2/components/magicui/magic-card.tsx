'use client';

import React, { useCallback, useEffect } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface MagicCardProps {
  children: React.ReactNode;
  className?: string;
  gradientSize?: number;
  gradientColor?: string;
  gradientOpacity?: number;
  onClick?: () => void;
}

export const MagicCard = React.forwardRef<HTMLDivElement, MagicCardProps>(
  (
    {
      children,
      className,
      gradientSize = 200,
      gradientColor = '#262626',
      gradientOpacity = 0.8,
      onClick,
    },
    ref,
  ) => {
    const [mousePosition, setMousePosition] = React.useState({ x: 0, y: 0 });
    const [isHovering, setIsHovering] = React.useState(false);

    const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
      const rect = e.currentTarget.getBoundingClientRect();
      setMousePosition({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      });
    }, []);

    const handleMouseEnter = useCallback(() => {
      setIsHovering(true);
    }, []);

    const handleMouseLeave = useCallback(() => {
      setIsHovering(false);
    }, []);

    return (
      <motion.div
        ref={ref}
        className={cn(
          'relative overflow-hidden rounded-xl border border-gray-800 bg-gray-900 p-6',
          className,
        )}
        onMouseMove={handleMouseMove}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onClick={onClick}
        style={{
          background: isHovering
            ? `radial-gradient(${gradientSize}px circle at ${mousePosition.x}px ${
                mousePosition.y
              }px, ${gradientColor}${Math.round(gradientOpacity * 255).toString(
                16,
              )}, transparent 80%)`
            : undefined,
        }}
        whileHover={{ scale: 1.02 }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      >
        <div className="relative z-10">{children}</div>
        {isHovering && (
          <motion.div
            className="pointer-events-none absolute inset-0 opacity-30"
            style={{
              background: `radial-gradient(${gradientSize}px circle at ${mousePosition.x}px ${mousePosition.y}px, ${gradientColor}, transparent 80%)`,
            }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.3 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          />
        )}
      </motion.div>
    );
  },
);

MagicCard.displayName = 'MagicCard';
