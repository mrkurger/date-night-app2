'use client';

import { v4 as uuidv4 } from 'uuid';

export interface Advertiser {
  id: string;
  name: string;
  age: number;
  location: string;
  bio: string;
  images: string[];
  tags: string[];
  rating: number;
  isVip?: boolean;
  isOnline?: boolean;
}

// Sample lists for generating random data
const names = [
  'Emma',
  'Olivia',
  'Ava',
  'Isabella',
  'Sophia',
  'Charlotte',
  'Mia',
  'Amelia',
  'Harper',
  'Evelyn',
  'Liam',
  'Noah',
  'William',
  'James',
  'Oliver',
  'Benjamin',
  'Elijah',
  'Lucas',
  'Mason',
  'Logan',
  'Alexander',
  'Ethan',
  'Jacob',
  'Michael',
  'Daniel',
  'Henry',
  'Jackson',
  'Sebastian',
  'Aiden',
  'Matthew',
];

const locations = [
  'New York, NY',
  'Los Angeles, CA',
  'Chicago, IL',
  'Houston, TX',
  'Phoenix, AZ',
  'Philadelphia, PA',
  'San Antonio, TX',
  'San Diego, CA',
  'Dallas, TX',
  'San Jose, CA',
  'Austin, TX',
  'Jacksonville, FL',
  'Fort Worth, TX',
  'Columbus, OH',
  'San Francisco, CA',
  'Charlotte, NC',
  'Indianapolis, IN',
  'Seattle, WA',
  'Denver, CO',
  'Washington, DC',
];

const bioTemplates = [
  'Love traveling and trying new foods. Always up for an adventure!',
  'Coffee enthusiast, book lover, and fitness junkie.',
  'Passionate about photography and exploring the outdoors.',
  "Music lover and concert goer. Let's share our playlists!",
  'Foodie who loves to cook and try new restaurants.',
  "Avid hiker and nature enthusiast. Let's go on an adventure!",
  'Film buff who enjoys a good movie night. Popcorn is a must!',
  'Animal lover with a soft spot for rescue pets.',
  'Yoga instructor by day, wine connoisseur by night.',
  'Tech enthusiast always keeping up with the latest trends.',
  'Craft beer aficionado and home brewer.',
  'Aspiring chef who loves experimenting with new recipes.',
  'Art lover who enjoys museum hopping and gallery openings.',
  'Fitness fanatic who loves challenging workouts.',
  'Beach lover and surfer always chasing the perfect wave.',
];

const tags = [
  'Travel',
  'Fitness',
  'Cooking',
  'Reading',
  'Photography',
  'Music',
  'Art',
  'Movies',
  'Hiking',
  'Gaming',
  'Technology',
  'Fashion',
  'Dancing',
  'Yoga',
  'Sports',
  'Wine',
  'Beer',
  'Coffee',
  'Food',
  'Pets',
  'Running',
  'Swimming',
  'Climbing',
  'Biking',
  'Skiing',
  'Snowboarding',
  'Camping',
  'Fishing',
  'Gardening',
  'DIY',
];

// Mock image URLs (normally would be from S3, Cloudinary, etc)
// Using placeholder images for development
const generateImageUrl = (index: number, gender?: string) => {
  const width = 500;
  const height = 700;
  const g = gender === 'male' ? 'men' : 'women';
  return `https://randomuser.me/api/portraits/${g}/${index % 99}.jpg`;
};

/**
 * Generate a mock data set of advertisers
 *
 * @param count Number of advertiser profiles to generate
 * @returns Array of advertiser objects
 */
export function generateMockAdvertisers(count: number = 25): Advertiser[] {
  const advertisers: Advertiser[] = [];

  for (let i = 0; i < count; i++) {
    const id = uuidv4();
    const gender = Math.random() > 0.5 ? 'male' : 'female';
    const name = names[Math.floor(Math.random() * names.length)];
    const age = Math.floor(Math.random() * 15) + 25; // 25-40 age range
    const location = locations[Math.floor(Math.random() * locations.length)];
    const bio = bioTemplates[Math.floor(Math.random() * bioTemplates.length)];

    // Generate 1-5 images per advertiser
    const imageCount = Math.floor(Math.random() * 4) + 1;
    const images = Array.from({ length: imageCount }, (_, idx) =>
      generateImageUrl(i * 10 + idx, gender),
    );

    // Generate 2-6 tags per advertiser
    const tagCount = Math.floor(Math.random() * 4) + 2;
    const shuffledTags = [...tags].sort(() => 0.5 - Math.random());
    const selectedTags = shuffledTags.slice(0, tagCount);

    // Random rating between 3-5
    const rating = Math.floor(Math.random() * 20 + 30) / 10;

    // ~20% chance to be VIP
    const isVip = Math.random() < 0.2;

    // ~60% chance to be online
    const isOnline = Math.random() < 0.6;

    advertisers.push({
      id,
      name: name || 'Unknown',
      age,
      location: location || 'Unknown',
      bio: bio || 'No bio available',
      images,
      tags: selectedTags,
      rating,
      isVip,
      isOnline,
    });
  }

  return advertisers;
}
