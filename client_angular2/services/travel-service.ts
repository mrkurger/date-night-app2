'use client';

import { TokenService } from '@/lib/token-service';

// Define types
export interface Destination {
  city: string;
  county: string;
  location: {
    coordinates: [number, number]; // [longitude, latitude]
  };
}

export interface Accommodation {
  name: string;
  address: string;
}

export interface Itinerary {
  id: string;
  destination: Destination;
  arrivalDate: string;
  departureDate: string;
  status: 'planned' | 'active' | 'completed' | 'cancelled';
  notes?: string;
  accommodation?: Accommodation;
}

export interface CreateItineraryDto {
  destination: Destination;
  arrivalDate: string;
  departureDate: string;
  notes?: string;
  accommodation?: Accommodation;
}

export class TravelService {
  private static BASE_URL = '/api/travel';

  /**
   * Get all itineraries for a specific ad
   */
  static async getItinerariesByAdId(adId: string): Promise<Itinerary[]> {
    try {
      const accessToken = TokenService.getAccessToken();

      const response = await fetch(`${this.BASE_URL}/ad/${adId}/itineraries`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch itineraries');
      }

      const data = await response.json();
      return data.data || [];
    } catch (error) {
      console.error('Error fetching itineraries:', error);
      throw error;
    }
  }

  /**
   * Get all itineraries for the current user across all ads
   */
  static async getAllItineraries(): Promise<Itinerary[]> {
    try {
      const accessToken = TokenService.getAccessToken();

      // In the actual API, we should have an endpoint that returns all user's itineraries
      // For now we'll use the base endpoint
      const response = await fetch(`${this.BASE_URL}/upcoming`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch itineraries');
      }

      const data = await response.json();
      return data.data || [];
    } catch (error) {
      console.error('Error fetching itineraries:', error);
      throw error;
    }
  }

  /**
   * Create a new itinerary for an ad
   */
  static async createItinerary(adId: string, itinerary: CreateItineraryDto): Promise<Itinerary> {
    try {
      const accessToken = TokenService.getAccessToken();

      const response = await fetch(`${this.BASE_URL}/ad/${adId}/itinerary`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(itinerary),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create itinerary');
      }

      const data = await response.json();
      return data.data;
    } catch (error) {
      console.error('Error creating itinerary:', error);
      throw error;
    }
  }

  /**
   * Get a specific itinerary by ID
   */
  static async getItineraryById(adId: string, itineraryId: string): Promise<Itinerary> {
    try {
      const accessToken = TokenService.getAccessToken();

      const response = await fetch(`${this.BASE_URL}/ad/${adId}/itinerary/${itineraryId}`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch itinerary');
      }

      const data = await response.json();
      return data.data;
    } catch (error) {
      console.error('Error fetching itinerary:', error);
      throw error;
    }
  }

  /**
   * Update an existing itinerary
   */
  static async updateItinerary(
    adId: string,
    itineraryId: string,
    itinerary: Partial<CreateItineraryDto>,
  ): Promise<Itinerary> {
    try {
      const accessToken = TokenService.getAccessToken();

      const response = await fetch(`${this.BASE_URL}/ad/${adId}/itinerary/${itineraryId}`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(itinerary),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update itinerary');
      }

      const data = await response.json();
      return data.data;
    } catch (error) {
      console.error('Error updating itinerary:', error);
      throw error;
    }
  }

  /**
   * Cancel an itinerary
   */
  static async cancelItinerary(adId: string, itineraryId: string): Promise<Itinerary> {
    try {
      const accessToken = TokenService.getAccessToken();

      // For cancelling, we use DELETE as per the backend API
      const response = await fetch(`${this.BASE_URL}/ad/${adId}/itinerary/${itineraryId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to cancel itinerary');
      }

      const data = await response.json();
      return data.data;
    } catch (error) {
      console.error('Error cancelling itinerary:', error);
      throw error;
    }
  }

  /**
   * Delete an itinerary - same as cancel in our implementation
   */
  static async deleteItinerary(adId: string, itineraryId: string): Promise<void> {
    try {
      // Call cancelItinerary which uses the DELETE method
      await this.cancelItinerary(adId, itineraryId);
    } catch (error) {
      console.error('Error deleting itinerary:', error);
      throw error;
    }
  }

  /**
   * Update current location
   */
  static async updateCurrentLocation(adId: string, location: [number, number]): Promise<void> {
    try {
      const accessToken = TokenService.getAccessToken();

      const response = await fetch(`${this.BASE_URL}/ad/${adId}/location`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          longitude: location[0],
          latitude: location[1],
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update location');
      }
    } catch (error) {
      console.error('Error updating location:', error);
      throw error;
    }
  }

  /**
   * Search for itineraries by location
   */
  static async searchItineraries(
    latitude: number,
    longitude: number,
    radius: number = 50,
  ): Promise<Itinerary[]> {
    try {
      const response = await fetch(
        `${this.BASE_URL}/itineraries/search?lat=${latitude}&lng=${longitude}&radius=${radius}`,
        {
          headers: {
            'Content-Type': 'application/json',
          },
        },
      );

      if (!response.ok) {
        throw new Error('Failed to search itineraries');
      }

      const data = await response.json();
      return data.data || [];
    } catch (error) {
      console.error('Error searching itineraries:', error);
      throw error;
    }
  }
}
