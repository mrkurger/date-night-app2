'use client';

import * as React from 'react'; // Ensure React is imported for JSX
import { useState, useEffect, useRef, useCallback } from 'react';
import AdvertiserCard from '@/components/ui/AdvertiserCard'; // Changed to default import
// import { ChevronRight } from "lucide-react"; // Assuming this is not used in the simplified card view for now

// Interface for advertiser data, aligning with AdvertiserCard props
interface Advertiser {
  id: string | number; // Match AdvertiserCard's Advertiser interface
  name: string;
  location?: string; // Changed from city to location, and made optional
  image: string;
  distance?: string; // Added to match
  onlineStatus?: boolean; // Added to match
  imageWidth?: number; // Added to match
  imageHeight?: number; // Added to match
  // Include other fields if they are part of your advertiser data model
  // and might be used by MasonryGrid or passed to AdvertiserCard indirectly.
}

interface MasonryGridProps {
  className?: string;
  items?: Advertiser[]; // Changed from initialItems to items and made it optional
  fetchMoreItems?: () => Promise<Advertiser[]>; // Made fetchMoreItems optional
}

export default function MasonryGrid({
  className,
  items = [], // Changed from initialItems to items
  fetchMoreItems, // Kept fetchMoreItems
}: MasonryGridProps) {
  const [displayedItems, setDisplayedItems] = useState<Advertiser[]>(items); // Changed to displayedItems and initialized with items
  const [hasMore, setHasMore] = useState(!!fetchMoreItems); // Set based on fetchMoreItems presence
  const [isLoading, setIsLoading] = useState(false);
  const observer = useRef<IntersectionObserver | null>(null);

  const loadMoreItems = useCallback(async () => {
    if (isLoading || !hasMore || !fetchMoreItems) return; // Added check for fetchMoreItems
    setIsLoading(true);
    try {
      const newItems = await fetchMoreItems();
      if (newItems.length === 0) {
        setHasMore(false);
      } else {
        setDisplayedItems((prevItems: Advertiser[]) => [...prevItems, ...newItems]); // Changed to setDisplayedItems
      }
    } catch (error) {
      console.error('Failed to fetch more items:', error);
    } finally {
      setIsLoading(false);
    }
  }, [fetchMoreItems, isLoading, hasMore]);

  const lastItemRef = useCallback(
    (node: HTMLDivElement | null) => {
      if (isLoading) return;
      if (observer.current) observer.current.disconnect();
      observer.current = new IntersectionObserver(entries => {
        if (entries[0].isIntersecting && hasMore) {
          loadMoreItems();
        }
      });
      if (node) observer.current.observe(node);
    },
    [isLoading, hasMore, loadMoreItems],
  );

  useEffect(() => {
    // Initialize displayedItems if items prop is provided and displayedItems is empty
    if (items.length > 0 && displayedItems.length === 0) {
      setDisplayedItems(items);
    }
    // Initial load if fetchMoreItems is provided and no items are present
    if (displayedItems.length === 0 && fetchMoreItems && hasMore && !isLoading) {
      loadMoreItems();
    }
  }, [loadMoreItems, items, displayedItems.length, fetchMoreItems, hasMore, isLoading]); // Added items and fetchMoreItems to dependency array

  if (displayedItems.length === 0 && !isLoading && !hasMore) {
    return (
      <div className={`flex items-center justify-center h-64 ${className}`}>
        <div className="text-gray-500">No advertisers found.</div>
      </div>
    );
  }

  if (displayedItems.length === 0 && isLoading) {
    return (
      <div className={`flex items-center justify-center h-64 ${className}`}>
        <div className="text-gray-500">Loading advertisers...</div>
      </div>
    );
  }

  const gridClasses = `grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 ${className}`;

  return (
    <div className={gridClasses}>
      {displayedItems.map((item: Advertiser, index: number) => {
        // Changed to displayedItems
        const cardContent = <AdvertiserCard key={item.id} advertiser={item} />;
        if (displayedItems.length === index + 1 && fetchMoreItems) {
          // Changed to displayedItems and added fetchMoreItems check
          return (
            <div ref={lastItemRef} key={`${item.id}-observer`}>
              {cardContent}
            </div>
          );
        }
        return cardContent;
      })}
      {isLoading && <div className="col-span-full text-center p-4">Loading more...</div>}
      {!hasMore && displayedItems.length > 0 && (
        <div className="col-span-full text-center p-4 text-gray-500">
          No more advertisers to load.
        </div>
      )}
    </div>
  );
}
