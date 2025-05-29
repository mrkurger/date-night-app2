export interface Advertiser {
  id: number;
  name: string;
  age: number;
  location: string;
  description: string;
  tags: string[];
  image: string;
  imageWidth?: number; // Added imageWidth property
  imageHeight?: number; // Added imageHeight property
  rating: number;
  isVip: boolean;
  views?: number; // Added views property
  duration?: string; // Added duration property
  category?: string; // Added category property
  onlineStatus?: boolean; // Added onlineStatus property
  isLive?: boolean; // Added isLive property
  distance?: string; // Added distance property
  price?: string; // Added price property
}
