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

// Female profile images from assets/img/profiles
const femaleImages = [
  '/assets/img/profiles/female-01.jpg',
  '/assets/img/profiles/female-02.jpg',
  '/assets/img/profiles/female-03.jpg',
  '/assets/img/profiles/female-04.jpg',
  '/assets/img/profiles/female-05.jpg',
  '/assets/img/profiles/female-06.jpg',
  '/assets/img/profiles/female-07.jpg',
  '/assets/img/profiles/female-08.jpg',
  '/assets/img/profiles/female-09.jpg',
  '/assets/img/profiles/female-10.jpg',
  '/assets/img/profiles/female-11.jpg',
  '/assets/img/profiles/female-12.jpg',
  '/assets/img/profiles/female-13.jpg',
  '/assets/img/profiles/female-14.jpg',
  '/assets/img/profiles/female-15.jpg',
  '/assets/img/profiles/female-16.jpg',
  '/assets/img/profiles/female-17.jpg',
  '/assets/img/profiles/female-18.jpg',
  '/assets/img/profiles/female-19.jpg',
  '/assets/img/profiles/female-20.jpg',
  '/assets/img/profiles/female-21.jpg',
  '/assets/img/profiles/female-22.jpg',
  '/assets/img/profiles/female-23.jpg',
  '/assets/img/profiles/female-24.jpg',
  '/assets/img/profiles/female-25.jpg',
  '/assets/img/profiles/female-26.jpg',
  '/assets/img/profiles/female-27.jpg',
  '/assets/img/profiles/female-28.jpg',
  '/assets/img/profiles/female-29.jpg',
];

// Utility function to get a random female image
export const getRandomFemaleImage = (): string => {
  const randomIndex = Math.floor(Math.random() * femaleImages.length);
  return femaleImages[randomIndex] || '/placeholder.svg';
};

// Utility function to get a specific female image by index
export const getFemaleImageByIndex = (index: number): string => {
  return femaleImages[index % femaleImages.length] || '/placeholder.svg';
};

// Utility function to get a fallback female image for any advertiser without an image
export const getFallbackFemaleImage = (advertiserId?: string | number): string => {
  if (advertiserId) {
    // Use advertiser ID to get consistent image for the same advertiser
    const id = typeof advertiserId === 'string' ? parseInt(advertiserId) || 0 : advertiserId;
    return getFemaleImageByIndex(id);
  }
  return getRandomFemaleImage();
};

// Enhanced utility function to get profile image with male replacement logic
export const getProfileImage = (advertiser: any): string => {
  // Check if advertiser has a valid image and is not male
  if (
    advertiser.image &&
    advertiser.image !== '/placeholder.svg' &&
    advertiser.image !== '/assets/img/default-profile.jpg' &&
    !advertiser.image.includes('placeholder') &&
    advertiser.attributes?.gender !== 'male' &&
    advertiser.gender !== 'male'
  ) {
    return advertiser.image;
  }

  // For male advertisers or missing images, return female image
  return getFallbackFemaleImage(advertiser.id || advertiser._id);
};

// Utility function to check if an image URL is valid/not a placeholder
export const isValidImageUrl = (imageUrl?: string): boolean => {
  if (!imageUrl) return false;

  const placeholderPatterns = [
    '/placeholder.svg',
    '/assets/img/default-profile.jpg',
    '/assets/images/placeholder.jpg',
    '/assets/images/default-profile.jpg',
    'placeholder',
    'default-profile',
  ];

  return !placeholderPatterns.some(pattern => imageUrl.includes(pattern));
};

// Export the female images array for use in other components
export { femaleImages };

// Update the sample advertisers to use female profile images
const advertisers: Advertiser[] = [
  {
    id: 1,
    name: 'Sofia',
    age: 24,
    city: 'Miami',
    location: 'Miami, FL',
    image: getFemaleImageByIndex(0),
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
    image: getFemaleImageByIndex(1),
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
    image: getFemaleImageByIndex(2),
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
    image: getFemaleImageByIndex(3),
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
    image: getFemaleImageByIndex(4),
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

// Generate additional female advertisers using the profile images
// Add more advertisers with different IDs
const femaleNames = [
  'Aria',
  'Luna',
  'Maya',
  'Zoe',
  'Chloe',
  'Mia',
  'Lily',
  'Grace',
  'Ruby',
  'Ivy',
  'Jade',
  'Rose',
  'Sage',
  'Iris',
  'Hazel',
  'Violet',
  'Daisy',
  'Willow',
  'Aurora',
  'Nova',
];

for (let i = 6; i < 35; i++) {
  // Generate more advertisers to use all 29 images
  const nameIndex = (i - 6) % femaleNames.length;
  const femaleImageIndex = (i - 6) % femaleImages.length;

  const cities = [
    'New York',
    'Los Angeles',
    'Chicago',
    'Miami',
    'Las Vegas',
    'Seattle',
    'Austin',
    'Denver',
  ];
  const locations = [
    'New York, NY',
    'Los Angeles, CA',
    'Chicago, IL',
    'Miami, FL',
    'Las Vegas, NV',
    'Seattle, WA',
    'Austin, TX',
    'Denver, CO',
  ];

  advertisers.push({
    id: i,
    name: femaleNames[nameIndex] || 'Unknown',
    age: Math.floor(Math.random() * 15) + 20, // Ages 20-34
    city: cities[Math.floor(Math.random() * cities.length)] || 'Unknown',
    location: locations[Math.floor(Math.random() * locations.length)] || 'Unknown',
    image: getFemaleImageByIndex(femaleImageIndex),
    rating: Math.round((Math.random() * 2 + 3) * 10) / 10, // 3.0-5.0 rating
    price: `$${Math.floor(Math.random() * 200) + 100}/hr`, // $100-300/hr
    isOnline: Math.random() > 0.3, // 70% online
    isVip: Math.random() > 0.7, // 30% VIP
    description: 'A passionate and engaging companion ready to make your acquaintance.',
    tags: ['Fun', 'Engaging', 'Social', 'Professional', 'Elegant', 'Charming']
      .sort(() => 0.5 - Math.random())
      .slice(0, Math.floor(Math.random() * 3) + 1),
    headline: `Meet ${femaleNames[nameIndex]} - Your Perfect Companion`,
    reviewsCount: Math.floor(Math.random() * 150) + 10,
    likes: Math.floor(Math.random() * 800) + 100,
    commentsCount: Math.floor(Math.random() * 50) + 5,
    hasPhotos: true, // All have photos
    hasVideos: Math.random() > 0.4, // 60% have videos
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
