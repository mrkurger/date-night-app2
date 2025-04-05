/**
 * Interface for ads from the server
 *
 * Note: This interface includes both properties returned directly from the server
 * and derived properties used in the UI components.
 */
export interface Ad {
  // Core properties
  _id: string;
  title: string;
  description: string;
  category: string;
  price: number;
  location: string;
  images: string[];
  advertiser: string;

  // Status flags
  isActive: boolean;
  isFeatured: boolean;
  isTrending: boolean;
  isTouring: boolean;

  // Analytics
  viewCount: number;  // From server
  clickCount: number;
  inquiryCount: number;

  // Timestamps
  createdAt: string;
  updatedAt: string;
  expiresAt?: string;

  // Tour information
  tourDates?: {
    start: string;
    end: string;
    cities: string[];
  };

  // UI-specific properties (may be derived from server data)
  tags?: string[];      // Used for displaying ad tags in list view
  views?: number;       // Mapped from viewCount for UI consistency
}

// Interface for creating new ads
export interface AdCreateDTO {
  title: string;
  description: string;
  category: string;
  price: number;
  location: string;
  isActive: boolean;
  tourDates?: {
    start: string;
    end: string;
    cities: string[];
  };
}

// Interface for updating existing ads
export interface AdUpdateDTO extends Partial<AdCreateDTO> {
  isFeatured?: boolean;
  isTouring?: boolean;
}

// Interface for filtering ads
export interface AdFilters {
  category?: string;
  location?: string;
  minPrice?: number;
  maxPrice?: number;
  isActive?: boolean;
  isFeatured?: boolean;
  isTouring?: boolean;
  sortBy?: 'price' | 'createdAt' | 'viewCount' | 'clickCount';
  sortOrder?: 'asc' | 'desc';
}

// Interface for ad statistics
export interface AdStats {
  viewCount: number;
  clickCount: number;
  inquiryCount: number;
  conversionRate: number;
  dailyStats: {
    date: string;
    views: number;
    clicks: number;
    inquiries: number;
  }[];
}
