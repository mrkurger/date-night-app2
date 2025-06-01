'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';
import { getFallbackFemaleImage, isValidImageUrl } from '@/lib/data';

interface ProfileAvatarProps {
  src?: string;
  name: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  userId?: string | number; // Add userId for consistent image selection
}

export function ProfileAvatar({ src, name, size = 'md', className, userId }: ProfileAvatarProps) {
  const [imageError, setImageError] = useState(false);

  // Size classes
  const sizeClasses = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-16 h-16 text-lg',
    xl: 'w-24 h-24 text-2xl',
  };

  // Get initials from name
  const getInitials = (name: string) => {
    if (!name) return '?';
    const parts = name.split(' ');
    if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
    return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
  };

  const initials = getInitials(name);

  // Use female image if src is invalid or missing
  const imageSource =
    src && isValidImageUrl(src) && !imageError ? src : getFallbackFemaleImage(userId);

  return (
    <div className={cn('relative rounded-full overflow-hidden', sizeClasses[size], className)}>
      <Image
        src={imageSource}
        alt={name}
        className="w-full h-full object-cover"
        onError={() => {
          // If the female image also fails, show initials
          setImageError(true);
        }}
      />
      {imageError && (
        <div
          className={cn(
            'absolute inset-0 flex items-center justify-center rounded-full bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 font-medium',
          )}
        >
          {initials}
        </div>
      )}
    </div>
  );
}
