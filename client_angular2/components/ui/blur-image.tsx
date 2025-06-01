'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { cn } from '@/lib/utils';

interface BlurImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  fill?: boolean;
  priority?: boolean;
  className?: string;
  containerClassName?: string;
  imagePlaceholder?: string;
  objectFit?: 'contain' | 'cover' | 'fill';
  quality?: number;
}

/**
 * BlurImage component with progressive loading effect
 * Uses a combination of Next.js Image and custom placeholder handling
 */
export function BlurImage({
  src,
  alt,
  width,
  height,
  fill = false,
  priority = false,
  className = '',
  containerClassName = '',
  imagePlaceholder,
  objectFit = 'cover',
  quality = 80,
}: BlurImageProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [blurDataUrl, setBlurDataUrl] = useState<string | undefined>(imagePlaceholder);

  // Fetch blurhash placeholder if not provided
  useEffect(() => {
    if (!imagePlaceholder && src) {
      const fetchPlaceholder = async () => {
        try {
          // Only fetch placeholder for remote images
          if (src.startsWith('http')) {
            const optimizedImageUrl = `/api/image-optimize?url=${encodeURIComponent(
              src,
            )}&w=40&blur=true`;
            const response = await fetch(optimizedImageUrl);
            const data = await response.json();

            if (data?.placeholder) {
              setBlurDataUrl(data.placeholder);
            }
          }
        } catch (error) {
          console.error('Error generating placeholder:', error);
        }
      };

      fetchPlaceholder();
    }
  }, [src, imagePlaceholder]);

  // Handle image load completion
  const handleImageLoad = () => {
    setIsLoading(false);
  };

  // Generate optimized image URL
  const getOptimizedSrc = (url: string) => {
    if (!url.startsWith('http')) return url;

    // Only apply optimization to remote URLs
    const w = width || 800;
    return `/api/image-optimize?url=${encodeURIComponent(url)}&w=${w}&q=${quality}`;
  };

  return (
    <div
      className={cn(
        'overflow-hidden relative',
        isLoading ? 'animate-pulse bg-muted' : '',
        containerClassName,
      )}
    >
      <Image
        src={getOptimizedSrc(src)}
        alt={alt}
        {...(fill ? { fill: true } : { width: width || 800, height: height || 600 })}
        priority={priority}
        quality={quality}
        onLoad={handleImageLoad}
        className={cn(
          'transition-all duration-500',
          isLoading ? 'scale-110 blur-sm' : 'scale-100 blur-0',
          objectFit === 'cover' && 'object-cover',
          objectFit === 'contain' && 'object-contain',
          objectFit === 'fill' && 'object-fill',
          className,
        )}
        placeholder={blurDataUrl ? 'blur' : 'empty'}
        {...(blurDataUrl ? { blurDataURL: blurDataUrl } : {})}
        {...(fill ? { sizes: '100vw' } : {})}
      />
    </div>
  );
}
