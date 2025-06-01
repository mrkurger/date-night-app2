'use client';

import Image, { ImageProps } from 'next/image';
import { useState } from 'react';
import { cn } from '@/lib/utils';

interface OptimizedImageProps extends Omit<ImageProps, 'onLoad' | 'onError'> {
  fallbackSrc?: string;
  showLoader?: boolean;
  loaderClassName?: string;
  errorClassName?: string;
  onLoadComplete?: () => void;
  onError?: () => void;
}

export function OptimizedImage({
  src,
  alt,
  className,
  fallbackSrc = '/placeholder.svg',
  showLoader = true,
  loaderClassName,
  errorClassName,
  onLoadComplete,
  onError,
  priority = false,
  quality = 80,
  ...props
}: OptimizedImageProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [currentSrc, setCurrentSrc] = useState(src);

  const handleLoad = () => {
    setIsLoading(false);
    onLoadComplete?.();
  };

  const handleError = () => {
    setIsLoading(false);
    setHasError(true);
    if (currentSrc !== fallbackSrc) {
      setCurrentSrc(fallbackSrc);
    }
    onError?.();
  };

  return (
    <div className="relative overflow-hidden">
      {/* Loading skeleton */}
      {isLoading && showLoader && (
        <div
          className={cn(
            'absolute inset-0 bg-muted animate-pulse',
            loaderClassName
          )}
        />
      )}

      <Image
        src={currentSrc}
        alt={alt}
        className={cn(
          'transition-opacity duration-300',
          isLoading ? 'opacity-0' : 'opacity-100',
          hasError && errorClassName,
          className
        )}
        onLoad={handleLoad}
        onError={handleError}
        priority={priority}
        quality={quality}
        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        {...props}
      />
    </div>
  );
}

// Specialized components for common use cases
export function ProfileImage({
  src,
  alt,
  size = 'md',
  className,
  ...props
}: OptimizedImageProps & {
  size?: 'sm' | 'md' | 'lg' | 'xl';
}) {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16',
    xl: 'w-24 h-24',
  };

  return (
    <OptimizedImage
      src={src}
      alt={alt}
      width={size === 'sm' ? 32 : size === 'md' ? 48 : size === 'lg' ? 64 : 96}
      height={size === 'sm' ? 32 : size === 'md' ? 48 : size === 'lg' ? 64 : 96}
      className={cn(
        'rounded-full object-cover',
        sizeClasses[size],
        className
      )}
      quality={90}
      {...props}
    />
  );
}

export function HeroImage({
  src,
  alt,
  className,
  ...props
}: OptimizedImageProps) {
  return (
    <OptimizedImage
      src={src}
      alt={alt}
      fill
      className={cn('object-cover', className)}
      priority
      quality={90}
      sizes="100vw"
      {...props}
    />
  );
}

export function CardImage({
  src,
  alt,
  aspectRatio = 'square',
  className,
  ...props
}: OptimizedImageProps & {
  aspectRatio?: 'square' | 'video' | 'portrait' | 'landscape';
}) {
  const aspectClasses = {
    square: 'aspect-square',
    video: 'aspect-video',
    portrait: 'aspect-[3/4]',
    landscape: 'aspect-[4/3]',
  };

  return (
    <div className={cn('relative overflow-hidden', aspectClasses[aspectRatio])}>
      <OptimizedImage
        src={src}
        alt={alt}
        fill
        className={cn('object-cover', className)}
        quality={85}
        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        {...props}
      />
    </div>
  );
}

// Hook for preloading images
export function useImagePreloader() {
  const preloadImage = (src: string): Promise<void> => {
    return new Promise((resolve, reject) => {
      const img = new window.Image();
      img.onload = () => resolve();
      img.onerror = reject;
      img.src = src;
    });
  };

  const preloadImages = async (srcs: string[]): Promise<void> => {
    try {
      await Promise.all(srcs.map(preloadImage));
    } catch (error) {
      console.warn('Failed to preload some images:', error);
    }
  };

  return { preloadImage, preloadImages };
}
