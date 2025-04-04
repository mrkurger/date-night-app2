// Interface for ads from the server
export interface Ad {
  _id: string;
  title: string;
  description: string;
  category: string;
  price: number;
  location: string;
  images: string[];
  advertiser: string;
  isActive: boolean;
  isFeatured: boolean;
  isTrending: boolean;
  isTouring: boolean;
  viewCount: number;
  clickCount: number;
  inquiryCount: number;
  createdAt: string;
  updatedAt: string;
  expiresAt?: string;
  tourDates?: {
    start: string;
    end: string;
    cities: string[];
  };
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
