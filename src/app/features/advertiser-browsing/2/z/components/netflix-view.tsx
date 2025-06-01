'use client';

import React, { useEffect } from 'react'; // Removed unused 'useRef'
import { useInView } from 'react-intersection-observer';

interface Advertiser {
  id: number;
  name: string;
  // age: number; // Removed as per new design focus
  location: string;
  // description: string; // Removed as per new design focus
  // tags: string[]; // Removed as per new design focus
  image: string;
  // rating: number; // Removed as per new design focus
  // isVip: boolean; // Removed as per new design focus
  // isOnline: boolean; // Removed as per new design focus
  aspectRatio?: string; // Added aspectRatio e.g., "16:9", "4:3", "1:1"
}

interface NetflixViewProps {
  advertisers: Advertiser[];
  loadMore?: () => void; // Made loadMore optional as it might not always be needed initially
}

export default function NetflixView({ advertisers, loadMore }: NetflixViewProps) {
  const { ref, inView } = useInView({
    threshold: 0,
    triggerOnce: false, // Set to false to trigger every time it comes into view
  });

  useEffect(() => {
    if (inView && loadMore) {
      // Check if loadMore is provided before calling
      loadMore();
    }
  }, [inView, loadMore]);

  // Helper to determine column span based on aspectRatio
  const getColumnSpan = (aspectRatio?: string) => {
    if (!aspectRatio) return 'col-span-1'; // Default span for items without a specific aspect ratio

    // Example logic: wider images take up more space.
    // This can be adjusted based on the desired visual outcome.
    const parts = aspectRatio.split(':');
    if (parts.length === 2) {
      const width = parseInt(parts[0], 10);
      const height = parseInt(parts[1], 10);
      if (width > height) {
        return 'col-span-2'; // Landscape-ish images
      } else if (height > width) {
        return 'col-span-1'; // Portrait-ish images
      }
    }
    return 'col-span-1'; // Square or default
  };

  if (!advertisers || advertisers.length === 0) {
    return (
      <div className="text-center py-12">
        <h3 className="text-xl mb-2">No advertisers to display</h3>
        <p className="text-gray-400">Check back later or try adjusting filters if available.</p>
      </div>
    );
  }

  return (
    <div className="p-4 bg-black">
      {' '}
      {/* Added bg-black for a Netflix-like feel */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2 sm:gap-3 md:gap-4">
        {' '}
        {/* Adjusted gap and columns for responsiveness */}
        {advertisers.map(advertiser => (
          <div
            key={advertiser.id}
            className={`group relative overflow-hidden rounded-md ${getColumnSpan(
              advertiser.aspectRatio,
            )}`}
            // Using padding-top hack for aspect ratio if specific aspectRatio is given, otherwise default to a common one like 3:4 or 4:3
            // The style approach with aspectRatio directly is better if supported and correctly implemented.
            // For simplicity and broader compatibility, especially with Tailwind, direct style or a class-based approach might be preferred.
            // Let's ensure the image itself drives the aspect ratio within its container.
            // The container will be part of a grid, and its span is determined by getColumnSpan.
            // The image will fill this container.
          >
            <Image
              src={advertiser.image}
              alt={`Photo of ${advertiser.name}`}
              // Ensure images cover their container; aspect ratio is handled by the grid item's span and the image filling it.
              className="w-full h-auto object-cover transition-transform duration-300 ease-in-out group-hover:scale-105"
              // To enforce varying heights based on image's natural aspect ratio while fitting width:
              // We might need to set a fixed height or let the grid auto-flow handle it.
              // For a masonry-like varying height, CSS grid's `grid-auto-rows: minmax(min-content, max-content)` or similar might be needed,
              // or a JS library for masonry layouts if Tailwind alone isn't sufficient for the dynamic heights based on content.
              // Given the "varying sizes" from the PNG, this implies images might not all conform to the same aspect ratio within their grid cell.
              // The `getColumnSpan` handles width variation. For height, if images have different intrinsic aspect ratios, `h-auto` should allow them to scale proportionally.
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <div className="absolute bottom-0 left-0 right-0 p-2 sm:p-3 md:p-4 bg-gradient-to-t from-black/90 to-transparent">
              <h3 className="text-white text-sm sm:text-md md:text-lg font-semibold truncate">
                {advertiser.name}
              </h3>
              <p className="text-gray-300 text-xs sm:text-sm truncate">{advertiser.location}</p>
            </div>
          </div>
        ))}
      </div>
      {loadMore && (
        <div ref={ref} className="h-20 flex justify-center items-center">
          {' '}
          {/* Made sentinel visible for debugging, can be styled as a loader */}
          <p className="text-white">Loading more...</p> {/* Basic loader text */}
        </div>
      )}
    </div>
  );
}
