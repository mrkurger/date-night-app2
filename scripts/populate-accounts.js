require('dotenv').config();
import mongoose from 'mongoose';
import argon2 from 'argon2';
import User from '../server/models/user.model';
import Ad from '../server/models/ad.model';
import fs from 'fs/promises';
import path from 'path';

// Norwegian counties
const COUNTIES = [
  'Oslo', 'Viken', 'Innlandet', 'Vestfold og Telemark', 
  'Agder', 'Rogaland', 'Vestland', 'Møre og Romsdal', 
  'Trøndelag', 'Nordland', 'Troms og Finnmark'
];

// Cities by county
const CITIES = {
  'Oslo': ['Oslo'],
  'Viken': ['Drammen', 'Fredrikstad', 'Moss', 'Sarpsborg', 'Lillestrøm'],
  'Innlandet': ['Hamar', 'Lillehammer', 'Gjøvik'],
  'Vestfold og Telemark': ['Tønsberg', 'Sandefjord', 'Skien', 'Porsgrunn'],
  'Agder': ['Kristiansand', 'Arendal'],
  'Rogaland': ['Stavanger', 'Sandnes', 'Haugesund'],
  'Vestland': ['Bergen', 'Ålesund', 'Førde'],
  'Møre og Romsdal': ['Molde', 'Kristiansund', 'Ålesund'],
  'Trøndelag': ['Trondheim', 'Steinkjer', 'Stjørdal'],
  'Nordland': ['Bodø', 'Narvik', 'Mo i Rana'],
  'Troms og Finnmark': ['Tromsø', 'Alta', 'Hammerfest']
};

// Categories for ads
const CATEGORIES = ['Escort', 'Striptease', 'Massage', 'Webcam', 'Phone'];

// Services by category
const SERVICES = {
  'Escort': [
    { name: 'Dinner Date', description: 'Elegant companionship for dinner events', price: 2500 },
    { name: 'Overnight', description: 'Full night companionship', price: 8000 },
    { name: 'Weekend Getaway', description: 'Weekend travel companion', price: 15000 }
  ],
  'Striptease': [
    { name: 'Private Show', description: 'One-on-one performance', price: 3000 },
    { name: 'Party Performance', description: 'Group entertainment', price: 5000 },
    { name: 'Custom Choreography', description: 'Personalized dance routine', price: 4000 }
  ],
  'Massage': [
    { name: 'Swedish Massage', description: 'Classic relaxation massage', price: 1200 },
    { name: 'Deep Tissue', description: 'Therapeutic deep pressure massage', price: 1500 },
    { name: 'Aromatherapy', description: 'Massage with essential oils', price: 1800 }
  ],
  'Webcam': [
    { name: 'Private Session', description: 'One-on-one video chat', price: 1000 },
    { name: 'Custom Content', description: 'Personalized video content', price: 1500 }
  ],
  'Phone': [
    { name: 'Voice Call', description: 'Private phone conversation', price: 800 },
    { name: 'Text Chat', description: 'Messaging service', price: 500 }
  ]
};

// Tags for ads
const TAGS = [
  'GFE', 'PSE', 'Couples', 'BDSM', 'Fetish', 'Roleplay', 
  'Massage', 'Tantric', 'Nuru', 'Lingerie', 'Cosplay', 
  'Travel Companion', 'Dinner Date', 'Party', 'Events'
];

// Languages
const LANGUAGES = ['Norwegian', 'English', 'Swedish', 'Danish', 'Spanish', 'French', 'German', 'Italian', 'Russian', 'Polish'];

// Hair colors
const HAIR_COLORS = ['Blonde', 'Brunette', 'Black', 'Red', 'Auburn', 'Grey', 'White', 'Blue', 'Pink', 'Purple'];

// Eye colors
const EYE_COLORS = ['Blue', 'Green', 'Brown', 'Hazel', 'Grey', 'Amber'];

// Body types
const BODY_TYPES = ['Slim', 'Athletic', 'Average', 'Curvy', 'Plus Size', 'Muscular'];

// Ethnicities
const ETHNICITIES = ['Caucasian', 'Asian', 'Black', 'Hispanic', 'Middle Eastern', 'Mixed'];

// Genders
const GENDERS = ['female', 'male', 'transgender', 'non-binary'];

// Generate a random point in Norway
function getRandomNorwegianCoordinates() {
  // Norway's approximate bounding box
  const minLat = 58.0;
  const maxLat = 71.0;
  const minLng = 4.0;
  const maxLng = 31.0;
  
  // Generate random coordinates within the bounding box
  const lat = minLat + Math.random() * (maxLat - minLat);
  const lng = minLng + Math.random() * (maxLng - minLng);
  
  return [lng, lat]; // GeoJSON uses [longitude, latitude]
}

// Generate random coordinates near a city
function getRandomCityCoordinates(county, city) {
  // Base coordinates for some major cities (longitude, latitude)
  const cityCoordinates = {
    'Oslo': [10.7522, 59.9139],
    'Bergen': [5.3220, 60.3913],
    'Trondheim': [10.3951, 63.4305],
    'Stavanger': [5.7331, 58.9700],
    'Drammen': [10.2052, 59.7440],
    'Fredrikstad': [10.9298, 59.2181],
    'Kristiansand': [7.9956, 58.1599],
    'Tromsø': [18.9553, 69.6492]
  };
  
  // If we have coordinates for this city, use them as a base
  if (cityCoordinates[city]) {
    const [baseLng, baseLat] = cityCoordinates[city];
    // Add some random variation (within ~10km)
    const latVariation = (Math.random() - 0.5) * 0.1;
    const lngVariation = (Math.random() - 0.5) * 0.2;
    return [baseLng + lngVariation, baseLat + latVariation];
  }
  
  // Fallback to random coordinates in Norway
  return getRandomNorwegianCoordinates();
}

// Generate a random phone number
function getRandomPhoneNumber() {
  return `+47 ${Math.floor(100 + Math.random() * 900)} ${Math.floor(10 + Math.random() * 90)} ${Math.floor(100 + Math.random() * 900)}`;
}

// Generate random tags
function getRandomTags() {
  const numTags = Math.floor(Math.random() * 5) + 1;
  const shuffled = [...TAGS].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, numTags);
}

// Generate random services for a category
function getRandomServices(category) {
  if (!SERVICES[category]) return [];
  
  const services = [...SERVICES[category]];
  const numServices = Math.floor(Math.random() * services.length) + 1;
  const shuffled = services.sort(() => 0.5 - Math.random());
  
  return shuffled.slice(0, numServices).map(service => ({
    name: service.name,
    description: service.description,
    price: service.price + Math.floor(Math.random() * 500),
    included: Math.random() > 0.7
  }));
}

// Generate random pricing options
function getRandomPricing() {
  const durations = ['30min', '1hour', '2hours', 'overnight', 'custom'];
  const numPrices = Math.floor(Math.random() * 3) + 1;
  
  const pricing = [];
  for (let i = 0; i < numPrices; i++) {
    const duration = durations[Math.floor(Math.random() * durations.length)];
    let amount;
    
    switch (duration) {
      case '30min':
        amount = 800 + Math.floor(Math.random() * 700);
        break;
      case '1hour':
        amount = 1500 + Math.floor(Math.random() * 1000);
        break;
      case '2hours':
        amount = 2500 + Math.floor(Math.random() * 1500);
        break;
      case 'overnight':
        amount = 5000 + Math.floor(Math.random() * 5000);
        break;
      case 'custom':
        amount = 3000 + Math.floor(Math.random() * 2000);
        break;
    }
    
    pricing.push({
      amount,
      currency: 'NOK',
      duration,
      customDuration: duration === 'custom' ? `${Math.floor(Math.random() * 5) + 3} hours` : undefined
    });
  }
  
  return pricing;
}

// Generate random availability
function getRandomAvailability() {
  const availability = [];
  const daysOfWeek = [0, 1, 2, 3, 4, 5, 6]; // Sunday to Saturday
  
  // Shuffle days and pick a random number of days
  const shuffledDays = [...daysOfWeek].sort(() => 0.5 - Math.random());
  const numDays = Math.floor(Math.random() * 5) + 2; // 2-6 days
  
  for (let i = 0; i < numDays; i++) {
    const day = shuffledDays[i];
    
    // Random start and end times
    const startHour = Math.floor(Math.random() * 12) + 10; // 10 AM to 10 PM
    const endHour = Math.min(23, startHour + Math.floor(Math.random() * 8) + 2); // 2-10 hours after start
    
    availability.push({
      dayOfWeek: day,
      startTime: `${startHour.toString().padStart(2, '0')}:00`,
      endTime: `${endHour.toString().padStart(2, '0')}:00`
    });
  }
  
  return availability;
}

// Generate random travel itinerary
function getRandomTravelItinerary() {
  const itineraries = [];
  const numItineraries = Math.floor(Math.random() * 3); // 0-2 itineraries
  
  if (numItineraries === 0) return [];
  
  const now = new Date();
  
  for (let i = 0; i < numItineraries; i++) {
    // Random county and city
    const county = COUNTIES[Math.floor(Math.random() * COUNTIES.length)];
    const citiesInCounty = CITIES[county] || ['Unknown'];
    const city = citiesInCounty[Math.floor(Math.random() * citiesInCounty.length)];
    
    // Random dates in the future
    const startDaysFromNow = Math.floor(Math.random() * 30) + 1; // 1-30 days from now
    const durationDays = Math.floor(Math.random() * 7) + 1; // 1-7 days
    
    const arrivalDate = new Date(now);
    arrivalDate.setDate(arrivalDate.getDate() + startDaysFromNow);
    
    const departureDate = new Date(arrivalDate);
    departureDate.setDate(departureDate.getDate() + durationDays);
    
    // Random coordinates for the city
    const coordinates = getRandomCityCoordinates(county, city);
    
    itineraries.push({
      destination: {
        city,
        county,
        country: 'Norway',
        location: {
          type: 'Point',
          coordinates
        }
      },
      arrivalDate,
      departureDate,
      accommodation: {
        name: Math.random() > 0.5 ? `Hotel ${city}` : undefined,
        address: Math.random() > 0.7 ? `${Math.floor(Math.random() * 100) + 1} Main St, ${city}` : undefined,
        location: Math.random() > 0.5 ? {
          type: 'Point',
          coordinates
        } : undefined,
        showAccommodation: Math.random() > 0.7
      },
      availability: getRandomAvailability(),
      notes: Math.random() > 0.7 ? `Visiting ${city} for a short stay. Available for bookings.` : undefined,
      status: 'planned'
    });
  }
  
  return itineraries;
}

// Generate a random ad
function generateRandomAd(advertiserId) {
  const county = COUNTIES[Math.floor(Math.random() * COUNTIES.length)];
  const citiesInCounty = CITIES[county] || ['Unknown'];
  const city = citiesInCounty[Math.floor(Math.random() * citiesInCounty.length)];
  const category = CATEGORIES[Math.floor(Math.random() * CATEGORIES.length)];
  const coordinates = getRandomCityCoordinates(county, city);
  const isTouring = Math.random() > 0.7;
  
  // Random attributes
  const gender = GENDERS[Math.floor(Math.random() * GENDERS.length)];
  const age = Math.floor(Math.random() * 20) + 20; // 20-39
  const height = Math.floor(Math.random() * 30) + 160; // 160-189 cm
  const weight = Math.floor(Math.random() * 40) + 50; // 50-89 kg
  const bodyType = BODY_TYPES[Math.floor(Math.random() * BODY_TYPES.length)];
  const hairColor = HAIR_COLORS[Math.floor(Math.random() * HAIR_COLORS.length)];
  const eyeColor = EYE_COLORS[Math.floor(Math.random() * EYE_COLORS.length)];
  const ethnicity = ETHNICITIES[Math.floor(Math.random() * ETHNICITIES.length)];
  
  // Random languages (2-4)
  const numLanguages = Math.floor(Math.random() * 3) + 2;
  const shuffledLanguages = [...LANGUAGES].sort(() => 0.5 - Math.random());
  const languages = shuffledLanguages.slice(0, numLanguages);
  
  return {
    title: `${category} Services in ${city}`,
    description: `Professional ${category.toLowerCase()} services available in ${city}, ${county}. Flexible hours, discrete location. I offer a variety of services tailored to your needs and preferences. Contact me to book an appointment or learn more about what I offer.`,
    shortDescription: `${category} services in ${city} - professional and discrete.`,
    advertiser: advertiserId,
    category,
    subcategory: Math.random() > 0.5 ? `Premium ${category}` : undefined,
    county,
    city,
    location: {
      type: 'Point',
      coordinates
    },
    address: {
      street: Math.random() > 0.7 ? `${Math.floor(Math.random() * 100) + 1} ${city} Street` : undefined,
      postalCode: Math.random() > 0.7 ? `${Math.floor(Math.random() * 9000) + 1000}` : undefined,
      hidden: Math.random() > 0.3 // 70% chance of hiding address
    },
    contact: {
      phone: getRandomPhoneNumber(),
      email: Math.random() > 0.5 ? `contact${Math.floor(Math.random() * 1000)}@example.com` : undefined,
      website: Math.random() > 0.8 ? `https://example.com/${Math.floor(Math.random() * 1000)}` : undefined,
      telegram: Math.random() > 0.7 ? `@user${Math.floor(Math.random() * 10000)}` : undefined,
      whatsapp: Math.random() > 0.7 ? getRandomPhoneNumber() : undefined,
      preferred: ['phone', 'email', 'telegram', 'whatsapp'][Math.floor(Math.random() * 4)]
    },
    pricing: getRandomPricing(),
    availability: getRandomAvailability(),
    services: getRandomServices(category),
    profileImage: `/uploads/default-profile-${Math.floor(Math.random() * 5) + 1}.jpg`,
    album: Array.from({ length: Math.floor(Math.random() * 5) + 1 }, (_, i) => 
      `/uploads/default-album-${Math.floor(Math.random() * 10) + 1}.jpg`
    ),
    featured: Math.random() > 0.8,
    verified: Math.random() > 0.7,
    active: true,
    boosted: Math.random() > 0.9,
    boostExpires: Math.random() > 0.9 ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) : undefined,
    views: Math.floor(Math.random() * 1000),
    clicks: Math.floor(Math.random() * 500),
    likes: Math.floor(Math.random() * 100),
    ageVerificationRequired: true,
    tags: getRandomTags(),
    attributes: {
      age,
      gender,
      height,
      weight,
      bodyType,
      hairColor,
      eyeColor,
      ethnicity,
      languages
    },
    travelItinerary: isTouring ? getRandomTravelItinerary() : [],
    currentLocation: {
      type: 'Point',
      coordinates
    },
    isTouring,
    createdAt: new Date(Date.now() - Math.floor(Math.random() * 30) * 24 * 60 * 60 * 1000),
    updatedAt: new Date(),
    expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
  };
}

// Generate a random user
function generateRandomUser(role, index) {
  const gender = GENDERS[Math.floor(Math.random() * GENDERS.length)];
  const firstName = gender === 'female' ? 
    ['Sofia', 'Emma', 'Olivia', 'Nora', 'Ella', 'Maja', 'Ingrid', 'Sara', 'Amalie', 'Leah'][Math.floor(Math.random() * 10)] :
    ['Liam', 'Noah', 'Oliver', 'Emil', 'Oskar', 'Elias', 'Aksel', 'Mathias', 'Magnus', 'Jakob'][Math.floor(Math.random() * 10)];
  
  const lastName = ['Hansen', 'Johansen', 'Olsen', 'Larsen', 'Andersen', 'Pedersen', 'Nilsen', 'Kristiansen', 'Jensen', 'Karlsen'][Math.floor(Math.random() * 10)];
  
  const username = role === 'advertiser' ? 
    `${firstName.toLowerCase()}_${role}${index}` : 
    `${firstName.toLowerCase()}${Math.floor(Math.random() * 1000)}`;
  
  const email = `${username}@example.com`;
  
  // Random location in Norway
  const county = COUNTIES[Math.floor(Math.random() * COUNTIES.length)];
  const citiesInCounty = CITIES[county] || ['Unknown'];
  const city = citiesInCounty[Math.floor(Math.random() * citiesInCounty.length)];
  const coordinates = getRandomCityCoordinates(county, city);
  
  return {
    username,
    email,
    password: 'Password123!',
    name: `${firstName} ${lastName}`,
    role,
    profileImage: `/uploads/default-profile-${Math.floor(Math.random() * 5) + 1}.jpg`,
    album: Array.from({ length: Math.floor(Math.random() * 3) + 1 }, (_, i) => 
      `/uploads/default-album-${Math.floor(Math.random() * 10) + 1}.jpg`
    ),
    online: Math.random() > 0.7,
    lastActive: new Date(Date.now() - Math.floor(Math.random() * 24) * 60 * 60 * 1000),
    currentLocation: {
      type: 'Point',
      coordinates
    },
    bio: role === 'advertiser' ? 
      `Professional ${['escort', 'massage therapist', 'entertainer'][Math.floor(Math.random() * 3)]} based in ${city}. Available for bookings and special events.` :
      `${['Looking for companionship', 'Interested in meeting new people', 'Here to explore'][Math.floor(Math.random() * 3)]}`,
    preferences: {
      notifications: {
        email: Math.random() > 0.3,
        push: Math.random() > 0.3
      },
      privacy: {
        showOnlineStatus: Math.random() > 0.3,
        showLastActive: Math.random() > 0.3
      }
    },
    verified: Math.random() > 0.5,
    verificationLevel: Math.floor(Math.random() * 5),
    verificationBadges: {
      identity: Math.random() > 0.5,
      photo: Math.random() > 0.6,
      phone: Math.random() > 0.7,
      email: Math.random() > 0.4,
      address: Math.random() > 0.8
    },
    subscriptionTier: ['free', 'premium', 'vip'][Math.floor(Math.random() * 3)],
    createdAt: new Date(Date.now() - Math.floor(Math.random() * 90) * 24 * 60 * 60 * 1000),
    updatedAt: new Date()
  };
}

// Create uploads directory if it doesn't exist
function ensureUploadsDirectory() {
  const uploadsDir = path.join(__dirname, '../server/uploads');
  const thumbnailsDir = path.join(uploadsDir, 'thumbnails');
  
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
    console.log('Created uploads directory');
  }
  
  if (!fs.existsSync(thumbnailsDir)) {
    fs.mkdirSync(thumbnailsDir, { recursive: true });
    console.log('Created thumbnails directory');
  }
}

async function populateAccounts() {
  try {
    // Connect to MongoDB
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/date_night', {
      serverSelectionTimeoutMS: 5000,
      connectTimeoutMS: 5000,
      socketTimeoutMS: 45000
    });
    console.log('✓ Connected to MongoDB');
    
    // Ensure uploads directory exists
    ensureUploadsDirectory();
    
    // Create admin account
    console.log('Creating admin account...');
    const adminPassword = await argon2.hash('AdminPass123!');
    const admin = new User({
      username: 'admin',
      email: 'admin@datenight.io',
      password: adminPassword,
      name: 'System Administrator',
      role: 'admin',
      verified: true,
      verificationLevel: 5,
      verificationBadges: {
        identity: true,
        photo: true,
        phone: true,
        email: true,
        address: true
      }
    });
    await admin.save();
    console.log('✓ Admin account created');
    
    // Create regular user accounts
    console.log('Creating regular user accounts...');
    const regularUsers = [];
    for (let i = 0; i < 3; i++) {
      const userData = generateRandomUser('user', i + 1);
      const hashedPassword = await argon2.hash(userData.password);
      userData.password = hashedPassword;
      
      const user = new User(userData);
      await user.save();
      regularUsers.push(user);
    }
    console.log(`✓ ${regularUsers.length} regular user accounts created`);
    
    // Create advertiser accounts
    console.log('Creating advertiser accounts...');
    const advertisers = [];
    for (let i = 0; i < 15; i++) {
      const userData = generateRandomUser('advertiser', i + 1);
      const hashedPassword = await argon2.hash(userData.password);
      userData.password = hashedPassword;
      
      const user = new User(userData);
      await user.save();
      advertisers.push(user);
    }
    console.log(`✓ ${advertisers.length} advertiser accounts created`);
    
    // Create ads for each advertiser
    console.log('Creating ads for advertisers...');
    let totalAds = 0;
    for (const advertiser of advertisers) {
      const numAds = Math.floor(Math.random() * 3) + 1; // 1-3 ads per advertiser
      
      for (let i = 0; i < numAds; i++) {
        const adData = generateRandomAd(advertiser._id);
        const ad = new Ad(adData);
        await ad.save();
        totalAds++;
      }
    }
    console.log(`✓ ${totalAds} ads created`);
    
    console.log('\n✨ Accounts populated successfully!');
    console.log(`Created 1 admin account`);
    console.log(`Created ${regularUsers.length} regular user accounts`);
    console.log(`Created ${advertisers.length} advertiser accounts`);
    console.log(`Created ${totalAds} ads`);
    
    console.log('\nTest accounts:');
    console.log('Admin: admin@datenight.io / AdminPass123!');
    console.log('Regular users: [username]@example.com / Password123!');
    console.log('Advertisers: [username]@example.com / Password123!');
    
  } catch (error) {
    console.error('\n❌ Error populating accounts:', error);
  } finally {
    if (mongoose.connection) {
      await mongoose.connection.close();
    }
    process.exit(0);
  }
}

populateAccounts();