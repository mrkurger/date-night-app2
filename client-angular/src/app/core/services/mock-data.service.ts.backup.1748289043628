import { Injectable } from '@angular/core';

export interface MockAdvertiser {
  id: string;
  profileName: string;
  realName?: string;
  age: number;
  nationality: string;
  location: {
    city: string;
    area?: string;
    coordinates?: [number, number];
  };
  pricing: {
    hourlyRate: number;
    minimumHours?: number;
    currency: string;
  };
  stats: {
    views: number;
    likes: number;
    favorites: number;
    reviews: number;
    rating: number;
  };
  images: {
    profile: string;
    carousel: string[];
  };
  details: {
    height?: number;
    measurements?: string;
    languages: string[];
    services: string[];
    availability: string[];
    description: string;
  };
  contact: {
    phone?: string;
    email?: string;
    website?: string;
    socialMedia?: {
      instagram?: string;
      twitter?: string;
      onlyfans?: string;
    };
  };
  verification: {
    verified: boolean;
    verifiedDate?: Date;
    documents?: string[];
  };
  preferences: {
    incall: boolean;
    outcall: boolean;
    minimumNotice?: string;
    maxDistance?: number;
  };
}

@Injectable({
  providedIn: 'root',
})
export class MockDataService {
  private readonly profileNames = [
    'Destiny',
    'Luna',
    'Crystal',
    'Diamond',
    'Sapphire',
    'Ruby',
    'Angel',
    'Phoenix',
    'Raven',
    'Star',
    'Sky',
    'Jade',
    'Trinity',
    'Bella',
    'Scarlett',
    'Aurora',
    'Jasmine',
    'Lotus',
    'Rose',
    'Violet',
    'Amber',
    'Summer',
    'Autumn',
    'Winter',
    'Spring',
    'Storm',
    'Rain',
    'River',
    'Meadow',
    'Dawn',
    'Dusk',
    'Twilight',
    'Venus',
    'Athena',
    'Artemis',
    'Selena',
    'Nova',
    'Celeste',
    'Serenity',
    'Harmony',
    'Melody',
    'Echo',
    'Aria',
    'Lyra',
    'Calypso',
    'Siren',
    'Mystique',
    'Fantasy',
    'Dream',
    'Paradise',
    'Heaven',
    'Bliss',
    'Joy',
    'Grace',
    'Hope',
    'Faith',
    'Charity',
    'Destiny',
    'Karma',
    'Kismet',
    'Fate',
    'Fortune',
    'Lucky',
    'Charm',
    'Magic',
    'Wonder',
    'Mystery',
    'Secret',
    'Enigma',
    'Riddle',
    'Quest',
    'Journey',
    'Adventure',
    'Spirit',
    'Soul',
  ];

  private readonly nationalities = [
    'American',
    'Brazilian',
    'Colombian',
    'Czech',
    'Dutch',
    'English',
    'French',
    'German',
    'Hungarian',
    'Italian',
    'Japanese',
    'Korean',
    'Norwegian',
    'Polish',
    'Romanian',
    'Russian',
    'Spanish',
    'Swedish',
    'Thai',
    'Ukrainian',
  ];

  private readonly norwegianCities = [
    'Oslo',
    'Bergen',
    'Trondheim',
    'Stavanger',
    'Drammen',
    'Fredrikstad',
    'Kristiansand',
    'Sandnes',
    'Tromsø',
    'Sarpsborg',
    'Skien',
    'Ålesund',
    'Sandefjord',
    'Haugesund',
    'Tønsberg',
    'Moss',
    'Porsgrunn',
    'Bodø',
    'Arendal',
    'Hamar',
  ];

  private readonly services = [
    'Massage',
    'Companionship',
    'Dinner Date',
    'Travel Companion',
    'GFE',
    'Couples',
    'Fantasy',
    'Role Play',
    'Fetish',
    'BDSM',
    'Tantra',
    'Striptease',
    'Lap Dance',
    'Private Show',
    'Photoshoot',
  ];

  private readonly languages = [
    'English',
    'Norwegian',
    'Spanish',
    'French',
    'German',
    'Italian',
    'Portuguese',
    'Russian',
    'Polish',
    'Czech',
    'Romanian',
    'Hungarian',
    'Thai',
    'Japanese',
    'Korean',
    'Chinese',
    'Arabic',
    'Hindi',
    'Turkish',
  ];

  private readonly availability = [
    'Monday - Friday',
    'Weekends Only',
    'Evenings Only',
    '24/7',
    'By Appointment',
    'Incall Only',
    'Outcall Only',
    'Limited Availability',
  ];

  private readonly descriptions = [
    'Elegant and sophisticated companion for the discerning gentleman.',
    'Your perfect date for any occasion, from casual to high-class events.',
    'Experienced masseuse offering relaxation and stress relief.',
    'Playful and adventurous spirit ready to make your fantasies come true.',
    'Professional model and dancer available for private shows.',
    'High-class companion with a taste for luxury and adventure.',
    'Sweet and sensual companion for unforgettable moments.',
    'Exotic beauty with a passion for life and new experiences.',
    'VIP escort specializing in exclusive dinner dates and travel.',
    'Charming and witty companion for sophisticated gentlemen.',
  ];

  generateMockAdvertisers(count: number = 75): MockAdvertiser[] {
    const advertisers: MockAdvertiser[] = [];

    for (let i = 0; i < count; i++) {
      advertisers.push(this.generateMockAdvertiser());
    }

    return advertisers;
  }

  private generateMockAdvertiser(): MockAdvertiser {
    const age = Math.floor(Math.random() * (45 - 20) + 20);
    const hourlyRate = Math.floor(Math.random() * (5000 - 2000) + 2000);
    const city = this.getRandomItem(this.norwegianCities);
    const profileName = this.getRandomItem(this.profileNames);
    const nationality = this.getRandomItem(this.nationalities);

    return {
      id: this.generateId(),
      profileName,
      age,
      nationality,
      location: {
        city,
        area: this.generateArea(city),
        coordinates: this.generateCoordinates(city),
      },
      pricing: {
        hourlyRate,
        minimumHours: Math.random() > 0.5 ? 2 : 1,
        currency: 'NOK',
      },
      stats: {
        views: Math.floor(Math.random() * 10000),
        likes: Math.floor(Math.random() * 1000),
        favorites: Math.floor(Math.random() * 500),
        reviews: Math.floor(Math.random() * 100),
        rating: Number((Math.random() * (5 - 3.5) + 3.5).toFixed(1)),
      },
      images: {
        profile: this.generateProfileImage(),
        carousel: this.generateCarouselImages(),
      },
      details: {
        height: Math.floor(Math.random() * (180 - 155) + 155),
        measurements: this.generateMeasurements(),
        languages: this.getRandomItems(this.languages, Math.floor(Math.random() * 3) + 1),
        services: this.getRandomItems(this.services, Math.floor(Math.random() * 8) + 3),
        availability: this.getRandomItems(this.availability, Math.floor(Math.random() * 3) + 1),
        description: this.getRandomItem(this.descriptions),
      },
      contact: {
        phone: Math.random() > 0.5 ? this.generatePhoneNumber() : undefined,
        email: Math.random() > 0.5 ? `${profileName.toLowerCase()}@example.com` : undefined,
        website: Math.random() > 0.7 ? `https://www.${profileName.toLowerCase()}.com` : undefined,
        socialMedia:
          Math.random() > 0.5
            ? {
                instagram: Math.random() > 0.5 ? `@${profileName.toLowerCase()}` : undefined,
                twitter: Math.random() > 0.5 ? `@${profileName.toLowerCase()}` : undefined,
                onlyfans: Math.random() > 0.5 ? `${profileName.toLowerCase()}` : undefined,
              }
            : undefined,
      },
      verification: {
        verified: Math.random() > 0.3,
        verifiedDate: new Date(Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000),
      },
      preferences: {
        incall: Math.random() > 0.3,
        outcall: Math.random() > 0.3,
        minimumNotice: '1 hour',
        maxDistance: Math.floor(Math.random() * 100) + 10,
      },
    };
  }

  private generateId(): string {
    return Math.random().toString(36).substring(2, 15);
  }

  private generateArea(city: string): string {
    const areas: { [key: string]: string[] } = {
      Oslo: ['Frogner', 'Majorstuen', 'Grünerløkka', 'St. Hanshaugen', 'Sagene'],
      Bergen: ['Bergenhus', 'Årstad', 'Fana', 'Fyllingsdalen', 'Laksevåg'],
      Trondheim: ['Midtbyen', 'Østbyen', 'Lerkendal', 'Heimdal', 'Byåsen'],
      // Add more cities and areas as needed
    };

    return areas[city] ? this.getRandomItem(areas[city]) : 'City Center';
  }

  private generateCoordinates(city: string): [number, number] {
    const coordinates: { [key: string]: [number, number] } = {
      Oslo: [59.9139, 10.7522],
      Bergen: [60.3913, 5.3221],
      Trondheim: [63.4305, 10.3951],
      // Add more cities and coordinates as needed
    };

    if (coordinates[city]) {
      const [lat, lng] = coordinates[city];
      return [lat + (Math.random() - 0.5) * 0.1, lng + (Math.random() - 0.5) * 0.1];
    }

    return [59.9139, 10.7522]; // Default to Oslo
  }

  private generateMeasurements(): string {
    const bust = Math.floor(Math.random() * (40 - 32) + 32);
    const waist = Math.floor(Math.random() * (30 - 22) + 22);
    const hips = Math.floor(Math.random() * (42 - 32) + 32);
    return `${bust}-${waist}-${hips}`;
  }

  private generateProfileImage(): string {
    // For now, return a placeholder image URL
    // In a real application, you would use actual image URLs
    return `https://picsum.photos/400/600?random=${Math.random()}`;
  }

  private generateCarouselImages(): string[] {
    const count = Math.floor(Math.random() * 5) + 3;
    return Array(count)
      .fill(null)
      .map(() => `https://picsum.photos/800/1200?random=${Math.random()}`);
  }

  private getRandomItem<T>(array: T[]): T {
    return array[Math.floor(Math.random() * array.length)];
  }

  private getRandomItems<T>(array: T[], count: number): T[] {
    const shuffled = [...array].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
  }

  private generatePhoneNumber(): string {
    // Generate a Norwegian phone number format
    const prefix = '+47';
    const number = Math.floor(Math.random() * 90000000) + 10000000;
    return `${prefix} ${number}`;
  }
}
