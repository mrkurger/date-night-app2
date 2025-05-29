export interface Advertiser {
  id: number;
  name: string;
  age: number;
  city: string; // Will be mapped to location in components that need it
  image: string; // Used as profilePicture in some contexts
  rating: number; // Used as averageRating in some contexts
  price: string;
  isOnline: boolean; // Used as onlineStatus in some contexts
  isVip?: boolean;
  description?: string;
  tags?: string[];
  location?: string; // Added to consolidate, will use this over city where appropriate

  // Added fields based on error analysis
  headline?: string;
  reviewsCount?: number;
  likes?: number;
  commentsCount?: number;
  hasPhotos?: boolean;
  hasVideos?: boolean;
  country?: string;
  createdAt?: string; // Or Date
}

// Replace the femaleImages array with these more realistic image URLs
const femaleImages = [
  '/img/1.webp', // Replaced Unsplash URL
  '/img/2.jpeg', // Replaced Unsplash URL
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=400&h=600&fit=crop',
  'https://images.unsplash.com/photo-1517841905240-b8d87734a5a2?q=80&w=400&h=600&fit=crop',
  'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?q=80&w=400&h=600&fit=crop',
  'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?q=80&w=400&h=600&fit=crop',
  'https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=400&h=600&fit=crop',
  'https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?q=80&w=400&h=600&fit=crop',
  'https://images.unsplash.com/photo-1548142813-c348350df52b?q=80&w=400&h=600&fit=crop',
  'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=400&h=600&fit=crop',
];

// Add male images for variety
const maleImages = [
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=400&h=600&fit=crop',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=400&h=600&fit=crop',
  'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?q=80&w=400&h=600&fit=crop',
  '/img/4.jpeg',
  'https://images.unsplash.com/photo-1618077360395-f3068be8e001?q=80&w=400&h=600&fit=crop',
];

// Update the sample advertisers to use these images and add more image variety
const advertisers: Advertiser[] = [
  {
    id: 1,
    name: 'Sofia',
    age: 24,
    city: 'Miami',
    location: 'Miami, FL',
    image: '/img/enjoying-the-beach-v0-ecajs9ieitue1.webp', // Replaced Unsplash URL
    rating: 4.9,
    price: '$150/hr',
    isOnline: true,
    isVip: true,
    description: 'Professional model and entertainer',
    tags: ['Model', 'Entertainer', 'Luxury'],
    headline: 'Your Miami Dream Date',
    reviewsCount: 150,
    likes: 1200,
    commentsCount: 45,
    hasPhotos: true,
    hasVideos: false,
    country: 'USA',
    createdAt: '2023-01-15',
  },
  {
    id: 2,
    name: 'Isabella',
    age: 28,
    city: 'Los Angeles',
    location: 'Los Angeles, CA',
    image: '/img/stranda.jpeg', // Replaced Unsplash URL
    rating: 4.8,
    price: '$200/hr',
    isOnline: false,
    isVip: false,
    description: 'Experienced performer and dancer',
    tags: ['Performer', 'Dancer', 'Nightlife'],
    headline: "LA's Finest Companion",
    reviewsCount: 200,
    likes: 950,
    commentsCount: 60,
    hasPhotos: true,
    hasVideos: true,
    country: 'USA',
    createdAt: '2022-11-20',
  },
  {
    id: 3,
    name: 'Emma',
    age: 26,
    city: 'New York',
    location: 'New York, NY',
    image:
      'https://images.unsplash.com/photo-1517841905240-b8d87734a5a2?q=80&w=400&h=600&fit=crop&crop=face',
    rating: 4.7,
    price: '$180/hr',
    isOnline: true,
    isVip: true,
    description: 'Creative artist and model',
    tags: ['Artist', 'Model', 'Photoshoot'],
    headline: 'NYC Artistic Muse',
    reviewsCount: 120,
    likes: 1100,
    commentsCount: 30,
    hasPhotos: true,
    hasVideos: false,
    country: 'USA',
    createdAt: '2023-03-10',
  },
  {
    id: 4,
    name: 'Olivia',
    age: 23,
    city: 'Las Vegas',
    location: 'Las Vegas, NV',
    image:
      'https://images.unsplash.com/photo-1488716820095-cbe80883c496?w=400&h=600&fit=crop&crop=face',
    rating: 4.9,
    price: '$220/hr',
    isOnline: true,
    isVip: false,
    description: 'Entertainment specialist',
    tags: ['Dancer', 'Model', 'VIP'],
    headline: 'Vegas Nightlife Queen',
    reviewsCount: 250,
    likes: 1500,
    commentsCount: 70,
    hasPhotos: true,
    hasVideos: true,
    country: 'USA',
    createdAt: '2023-05-01',
  },
  {
    id: 5,
    name: 'Ava',
    age: 29,
    city: 'Chicago',
    location: 'Chicago, IL',
    image:
      'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=400&h=600&fit=crop&crop=face',
    rating: 4.6,
    price: '$160/hr',
    isOnline: false,
    isVip: true,
    description: 'Professional companion',
    tags: ['Companion', 'Luxury', 'VIP'],
    headline: "Chicagoland's Charmer",
    reviewsCount: 180,
    likes: 800,
    commentsCount: 50,
    hasPhotos: true,
    hasVideos: false,
    country: 'USA',
    createdAt: '2022-09-05',
  },
];

// Update the function that adds more advertisers to use realistic images
// Add more advertisers with different IDs
for (let i = 6; i < 15; i++) {
  const isFemale = Math.random() > 0.2; // 80% female advertisers
  const imageArray = isFemale ? femaleImages : maleImages;
  const randomImageIndex = Math.floor(Math.random() * imageArray.length);
  const mainImage = imageArray[randomImageIndex];
  advertisers.push({
    id: i,
    name: isFemale ? `User${i}` : `UserM${i}`,
    age: Math.floor(Math.random() * 15) + 20,
    city: ['New York', 'Los Angeles', 'Chicago', 'Miami', 'Las Vegas'][
      Math.floor(Math.random() * 5)
    ],
    location: ['New York, NY', 'Los Angeles, CA', 'Chicago, IL', 'Miami, FL', 'Las Vegas, NV'][
      Math.floor(Math.random() * 5)
    ],
    image: mainImage,
    rating: Math.round((Math.random() * 2 + 3) * 10) / 10,
    price: `$${Math.floor(Math.random() * 100) + 100}/hr`,
    isOnline: Math.random() > 0.3,
    isVip: Math.random() > 0.7,
    description: 'A passionate and engaging companion ready to make your acquaintance.',
    tags: ['Fun', 'Engaging', 'Social']
      .sort(() => 0.5 - Math.random())
      .slice(0, Math.floor(Math.random() * 2) + 1),
    headline: `Exciting New Profile ${i}`,
    reviewsCount: Math.floor(Math.random() * 100),
    likes: Math.floor(Math.random() * 500),
    commentsCount: Math.floor(Math.random() * 50),
    hasPhotos: Math.random() > 0.2,
    hasVideos: Math.random() > 0.5,
    country: 'USA',
    createdAt: `2023-${String(Math.floor(Math.random() * 12) + 1).padStart(2, '0')}-${String(
      Math.floor(Math.random() * 28) + 1,
    ).padStart(2, '0')}`,
  });
}

// Function to get all advertisers
export const getAdvertisers = (): Advertiser[] => {
  return advertisers;
};

// Function to get advertiser by ID
export const getAdvertiserById = (id: number): Advertiser | undefined => {
  console.log('Looking for advertiser with ID:', id, 'Type:', typeof id);

  // Find advertiser by exact ID match
  const advertiser = advertisers.find(adv => adv.id === id);

  console.log('Found advertiser:', advertiser);
  return advertiser;
};

// Function to get premium advertisers
export const getPremiumAdvertisers = (): Advertiser[] => {
  return advertisers.filter(adv => adv.rating >= 4.8);
};

// Function to get online advertisers
export const getOnlineAdvertisers = (): Advertiser[] => {
  return advertisers.filter(adv => adv.isOnline);
};

// Function to search advertisers
export const searchAdvertisers = (query: string): Advertiser[] => {
  const lowerQuery = query.toLowerCase();
  return advertisers.filter(
    adv =>
      adv.name.toLowerCase().includes(lowerQuery) || adv.city.toLowerCase().includes(lowerQuery),
  );
};
