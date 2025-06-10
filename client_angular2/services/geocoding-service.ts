'use client';

/**
 * Geocoding Service
 * Responsible for converting addresses to coordinates and vice versa
 */

export interface GeocodeResult {
  coordinates: [number, number]; // [longitude, latitude]
  formattedAddress?: string;
  city?: string;
  county?: string;
  country?: string;
  postalCode?: string;
}

export class GeocodingService {
  private static API_KEY = process.env.NEXT_PUBLIC_GEOCODING_API_KEY;
  private static CACHE: Record<string, GeocodeResult> = {};

  /**
   * Convert an address string to coordinates
   * @param address The address to geocode
   * @returns Promise with geocoding result
   */
  static async geocode(address: string): Promise<GeocodeResult> {
    // Check cache first
    if (this.CACHE[address]) {
      return this.CACHE[address];
    }

    try {
      // For production, we would use a real geocoding service
      // like Google Maps, Mapbox, or OpenStreetMap Nominatim

      // Example with OpenStreetMap Nominatim (free but rate-limited)
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(
          address,
        )}&format=json&limit=1`,
        {
          headers: {
            'Accept-Language': 'en-US,en;q=0.9',
            'User-Agent': 'DateNightApp/1.0',
          },
        },
      );

      if (!response.ok) {
        throw new Error('Geocoding request failed');
      }

      const data = await response.json();

      if (!data || data.length === 0) {
        throw new Error('No results found for this address');
      }

      const result: GeocodeResult = {
        coordinates: [parseFloat(data[0].lon), parseFloat(data[0].lat)],
        formattedAddress: data[0].display_name,
        city: data[0].address?.city || data[0].address?.town || data[0].address?.village,
        county: data[0].address?.county,
        country: data[0].address?.country,
        postalCode: data[0].address?.postcode,
      };

      // Cache the result
      this.CACHE[address] = result;

      return result;
    } catch (error) {
      console.error('Geocoding error:', error);
      throw new Error('Failed to geocode address');
    }
  }

  /**
   * Convert coordinates to an address (reverse geocoding)
   * @param lng Longitude
   * @param lat Latitude
   * @returns Promise with geocoding result
   */
  static async reverseGeocode(lng: number, lat: number): Promise<GeocodeResult> {
    const cacheKey = `${lng},${lat}`;

    // Check cache first
    if (this.CACHE[cacheKey]) {
      return this.CACHE[cacheKey];
    }

    try {
      // Example with OpenStreetMap Nominatim
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lon=${lng}&lat=${lat}&zoom=18&addressdetails=1`,
        {
          headers: {
            'Accept-Language': 'en-US,en;q=0.9',
            'User-Agent': 'DateNightApp/1.0',
          },
        },
      );

      if (!response.ok) {
        throw new Error('Reverse geocoding request failed');
      }

      const data = await response.json();

      if (!data) {
        throw new Error('No results found for these coordinates');
      }

      const result: GeocodeResult = {
        coordinates: [lng, lat],
        formattedAddress: data.display_name,
        city: data.address?.city || data.address?.town || data.address?.village,
        county: data.address?.county,
        country: data.address?.country,
        postalCode: data.address?.postcode,
      };

      // Cache the result
      this.CACHE[cacheKey] = result;

      return result;
    } catch (error) {
      console.error('Reverse geocoding error:', error);
      throw new Error('Failed to reverse geocode coordinates');
    }
  }

  /**
   * Clear the geocoding cache
   */
  static clearCache(): void {
    this.CACHE = {};
  }
}
