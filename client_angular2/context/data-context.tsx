'use client';

import * as React from 'react';
import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { Advertiser, getAdvertisers, getAdvertiserById as fetchDataById } from '@/lib/data'; // Corrected import path

interface DataContextType {
  advertisers: Advertiser[];
  loading: boolean;
  error: Error | null;
  getAdvertiserById: (id: number | string) => Advertiser | undefined;
  // Add other data-related functions or state here if needed
  // e.g., searchAdvertisers, filterAdvertisers, etc.
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [advertisers, setAdvertisers] = useState<Advertiser[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    try {
      const data = getAdvertisers();
      setAdvertisers(data);
    } catch (e) {
      setError(e instanceof Error ? e : new Error('Failed to fetch advertisers'));
    } finally {
      setLoading(false);
    }
  }, []);

  const getAdvertiserById = (id: number | string): Advertiser | undefined => {
    const numericId = typeof id === 'string' ? parseInt(id, 10) : id;
    if (isNaN(numericId)) {
      console.error('Invalid ID provided to getAdvertiserById:', id);
      return undefined;
    }
    // First, try to find in the already loaded advertisers list for efficiency
    const advertiserFromState = advertisers.find((adv: Advertiser) => adv.id === numericId);
    if (advertiserFromState) {
      return advertiserFromState;
    }
    // If not found in state (e.g., direct access or not yet loaded fully), try fetching directly
    // This assumes fetchDataById can handle being called multiple times or has its own caching if needed
    console.warn(
      `Advertiser with ID ${numericId} not found in current state, attempting direct fetch.`,
    );
    return fetchDataById(numericId);
  };

  return (
    <DataContext.Provider value={{ advertisers, loading, error, getAdvertiserById }}>
      {children}
    </DataContext.Provider>
  );
};

export const useData = (): DataContextType => {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};
