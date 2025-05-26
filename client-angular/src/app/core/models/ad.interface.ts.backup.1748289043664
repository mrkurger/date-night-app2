/**
 * Interface for ads from the server
 *
 * Note: This interface includes both properties returned directly from the server
 * and derived properties used in the UI components.
 */
export interface Ad {
  // Core properties
  _id: string;
  id?: string;
  title?: string;
  description?: string;
  category?: string;
  price?: number;
  location?: {
    city: string;
    county: string;
  };
  images?: string[] | { url: string; type?: string }[];
  media?: {
    type: string; // 'image' or 'video'
    url: string;
  }[];
  advertiser?:
    | string
    | {
        _id: string;
        username: string;
        profileImage?: string;
      };
  userId: string; // ID of the user who created the ad
  advertiserName?: string; // Name of the advertiser
  advertiserImage?: string; // Profile image of the advertiser

  // Status flags
  isActive: boolean;
  isFeatured: boolean;
  isTrending: boolean;
  isTouring: boolean;
  isVerified?: boolean;
  isAdvertiserOnline?: boolean;

  // Analytics
  viewCount: number; // From server
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
  tags?: string[]; // Used for displaying ad tags in list view
  views?: number; // Mapped from viewCount for UI consistency
  age?: number; // Age of the advertiser or service provider
  cardState?: string; // For Tinder-style swiping animations
  reviews?: Array<{
    id: string;
    userId: string;
    username: string;
    rating: number;
    comment: string;
    date: string;
  }>;
  services?: Array<{
    id: string;
    name: string;
    description?: string;
    price?: number;
    duration?: number;
  }>;
}

// Interface for creating new ads
export interface AdCreateDTO {
  title: string;
  description: string;
  category: string;
  price: number;
  location: {
    city: string;
    county: string;
  };
  isActive: boolean;
  age?: number;
  images?: {
    url: string;
    type?: string;
  }[];
  media?: {
    type: string; // 'image' or 'video'
    url: string;
  }[];
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
  tags?: string[];
}

// Interface for filtering ads
export interface AdFilters {
  category?: string;
  city?: string;
  county?: string;
  minPrice?: number;
  maxPrice?: number;
  minAge?: number;
  maxAge?: number;
  isActive?: boolean;
  isFeatured?: boolean;
  isTouring?: boolean;
  tags?: string[];
  sortBy?: 'price' | 'createdAt' | 'viewCount' | 'clickCount' | 'age';
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
