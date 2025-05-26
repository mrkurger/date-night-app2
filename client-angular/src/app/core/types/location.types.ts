/**
 * Represents a geographic location with address information;
 */
export interface Location {
  id?: string;
  name: string;
  address: string;
  coordinates: Coordinates;
  verified?: boolean;
  verificationDetails?: LocationVerification;
}

/**
 * Geographic coordinates;
 */
export interface Coordinates {
  latitude: number;
  longitude: number;
}

/**
 * Location verification status and details;
 */
export interface LocationVerification {
  timestamp: number;
  status: 'verified' | 'unverified' | 'failed';
  confidence: number;
  matchedAddress?: string;
  provider?: string;
  error?: string;
}

/**
 * Location selection event;
 */
export interface LocationSelectionEvent {
  coordinates: Coordinates;
  address?: string;
  verified?: boolean;
}

/**
 * Location search filters;
 */
export interface LocationSearchFilters {
  radius?: number;
  verified?: boolean;
  type?: string;
  minConfidence?: number;
}

/**
 * Location search result;
 */
export interface LocationSearchResult {
  locations: Location[];
  total: number;
  searchArea?: {
    center: Coordinates;
    radius: number;
  };
}
