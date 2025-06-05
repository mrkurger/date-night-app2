import React, { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import InfiniteScroll from 'react-infinite-scroll-component';

interface Advertiser {
  image: string;
  name: string;
  city: string;
}

const NetflixViewGrid = () => {
  const [advertisers, setAdvertisers] = useState<Advertiser[]>([]);
  const [hasMore, setHasMore] = useState(true);

  const fetchMoreData = useCallback(async () => {
    try {
      const response = await fetch('/api/advertisers'); // Replace with actual API endpoint
      const data: Advertiser[] = await response.json();
      if (data.length === 0) {
        setHasMore(false);
        return;
      }
      setAdvertisers(prev => [...prev, ...data]);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  }, []);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      fetchMoreData();
    }
  }, [fetchMoreData]);

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Advertisers</h1>
      <InfiniteScroll
        dataLength={advertisers.length}
        next={fetchMoreData}
        hasMore={hasMore}
        loader={<h4>Loading...</h4>}
        endMessage={<p className="text-center">No more advertisers to show</p>}
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {advertisers.map((advertiser, index) => (
            <div key={index} className="relative group overflow-hidden rounded-lg shadow-lg h-64">
              <Image
                src={advertiser.image}
                alt={advertiser.name}
                fill
                className="object-cover transition-transform duration-300 group-hover:scale-105"
              />
              <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white p-2">
                <h2 className="text-lg font-semibold">{advertiser.name}</h2>
                <p className="text-sm">{advertiser.city}</p>
              </div>
            </div>
          ))}
        </div>
      </InfiniteScroll>
    </div>
  );
};

export default NetflixViewGrid;
