// ===================================================
// CUSTOMIZABLE SETTINGS IN THIS FILE
// ===================================================
// This file contains settings for the geocoding service
//
// COMMON CUSTOMIZATIONS:
// - API_PROVIDER: The geocoding API provider (default: 'nominatim')
// - MAPBOX_ACCESS_TOKEN: Your Mapbox access token (if using Mapbox)
// - GOOGLE_MAPS_API_KEY: Your Google Maps API key (if using Google Maps)
// - CACHE_DURATION: How long to cache geocoding results (default: 24 hours)
// ===================================================

import { Injectable,  } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { LocationService } from './location.service';

// Define GeolocationPosition interface if not available
interface GeolocationCoordinates {
  readonly accuracy: number;
  readonly altitude: number | null;
  readonly altitudeAccuracy: number | null;
  readonly heading: number | null;
  readonly latitude: number;
  readonly longitude: number;
  readonly speed: number | null;
}

interface GeolocationPosition {
  readonly coords: GeolocationCoordinates;
  readonly timestamp: number;
}

// Constants
const API_PROVIDER: 'nominatim' | 'mapbox' | 'google' = 'nominatim'; // 'nominatim', 'mapbox', or 'google'
const MAPBOX_ACCESS_TOKEN = environment.mapboxToken || '';
const GOOGLE_MAPS_API_KEY = environment.googleMapsApiKey || '';
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

export interface GeocodingResult {
  type: 'Point';
  coordinates: [number, number]; // [longitude, latitude]
}

export interface EnhancedGeocodingResult {
  id?: string;
  name: string;
  formattedAddress: string;
  latitude: number;
  longitude: number;
  country?: string;
  countryCode?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  neighborhood?: string;
  provider: string;
  timestamp: number;
}

export interface GeocodingComponents {
  country?: string;
  countryCode?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  neighborhood?: string;
  street?: string;
  streetNumber?: string;
}

export interface ReverseGeocodingResult {
  formattedAddress: string;
  latitude: number;
  longitude: number;
  components: GeocodingComponents;
  provider: string;
  timestamp: number;
}

interface CachedResult {
  result: any;
  timestamp: number;
}

/**
 * Service for geocoding addresses and locations
 * Provides methods for converting addresses to coordinates and vice versa
 */
@Injectable({
  providedIn: 'root',
})
export class GeocodingService {
  private readonly apiUrl = environment.apiUrl + '/geocoding';

  // API key would typically be stored in environment variables
  private readonly nominatimUrl = 'https://nominatim.openstreetmap.org/search';
  private readonly reverseNominatimUrl = 'https://nominatim.openstreetmap.org/reverse';

  // Cache for geocoding results
  private cache: Map<string, CachedResult> = new Map();

  constructor(
    private http: HttpClient,
    private locationService: LocationService,
  ) {}

  /**
   * Geocode an address to get coordinates
   * @param address The address to geocode
   * @returns Observable with coordinates [longitude, latitude]
   */
  geocodeAddress(address: string): Observable<GeocodingResult | null> {
    // First try the backend API
    return this.http
      .get<GeocodingResult>(`${this.apiUrl}/forward?address=${encodeURIComponent(address)}`)
      .pipe(
        catchError(() =>
          // If backend fails, try Nominatim directly
          this.geocodeWithNominatim(address),
        ),
      );
  }

  /**
   * Geocode a location by city, county, and country
   * @param city City name
   * @param county County name
   * @param country Country name (default: Norway)
   * @returns Observable with coordinates [longitude, latitude]
   */
  geocodeLocation(
    city: string,
    county: string,
    country = 'Norway',
  ): Observable<GeocodingResult | null> {
    // First check if we have the coordinates in our local database
    return this.locationService.getCityCoordinates(city).pipe(
      map((coordinates) => {
        if (coordinates) {
          return {
            type: 'Point' as const,
            coordinates,
          };
        }
        return null;
      }),
      catchError(() => of(null)),
      // If not found locally, try the backend API
      catchError(() => {
        const address = `${city}, ${county}, ${country}`;
        return this.http
          .get<GeocodingResult>(
            `${this.apiUrl}/forward?city=${encodeURIComponent(city)}&county=${encodeURIComponent(
              county,
            )}&country=${encodeURIComponent(country)}`,
          )
          .pipe(
            catchError(() =>
              // If backend fails, try Nominatim directly
              this.geocodeWithNominatim(address),
            ),
          );
      }),
    );
  }

  /**
   * Reverse geocode coordinates to get an address
   * @param longitude Longitude
   * @param latitude Latitude
   * @returns Observable with address information
   */
  reverseGeocode(
    longitude: number,
    latitude: number,
  ): Observable<{
    city: string;
    county: string;
    country: string;
    address: string;
  } | null> {
    // First try the backend API
    return this.http
      .get<{
        city: string;
        county: string;
        country: string;
        address: string;
      }>(`${this.apiUrl}/reverse?longitude=${longitude}&latitude=${latitude}`)
      .pipe(
        catchError(() =>
          // If backend fails, try to find the nearest city from our local database
          this.locationService.findNearestCity(latitude, longitude).pipe(
            map((result) => {
              if (result) {
                return {
                  city: result.city,
                  county: result.county,
                  country: 'Norway',
                  address: `${result.city}, ${result.county}, Norway`,
                };
              }
              return null;
            }),
            catchError(() =>
              // If local database fails, try Nominatim directly
              this.reverseGeocodeWithNominatim(longitude, latitude),
            ),
          ),
        ),
      );
  }

  /**
   * Geocode an address using Nominatim directly
   * @param address The address to geocode
   * @returns Observable with coordinates [longitude, latitude]
   */
  private geocodeWithNominatim(address: string): Observable<GeocodingResult | null> {
    const params = {
      q: address,
      format: 'json',
      limit: '1',
    };

    const queryString = this.createQueryString(params);

    return this.http.get<any[]>(`${this.nominatimUrl}?${queryString}`).pipe(
      map((response) => {
        if (response && response.length > 0) {
          const result = response[0];
          const lon = parseFloat(result.lon);
          const lat = parseFloat(result.lat);
          return {
            type: 'Point' as const,
            coordinates: [lon, lat] as [number, number],
          };
        }
        return null;
      }),
      catchError(() => of(null)),
    );
  }

  /**
   * Reverse geocode coordinates using Nominatim directly
   * @param longitude Longitude
   * @param latitude Latitude
   * @returns Observable with address information
   */
  private reverseGeocodeWithNominatim(
    longitude: number,
    latitude: number,
  ): Observable<{
    city: string;
    county: string;
    country: string;
    address: string;
  } | null> {
    const params = {
      lat: latitude.toString(),
      lon: longitude.toString(),
      format: 'json',
      'accept-language': 'en',
    };

    const queryString = this.createQueryString(params);

    return this.http.get<any>(`${this.reverseNominatimUrl}?${queryString}`).pipe(
      map((response) => {
        if (response && response.address) {
          const address = response.address;
          return {
            city: address.city || address.town || address.village || address.hamlet || '',
            county: address.county || address.state || '',
            country: address.country || '',
            address: response.display_name || '',
          };
        }
        return null;
      }),
      catchError(() => of(null)),
    );
  }

  /**
   * Enhanced geocode method that returns more detailed information
   * @param address The address to geocode
   * @returns An observable with detailed geocoding result
   */
  enhancedGeocode(address: string): Observable<EnhancedGeocodingResult | null> {
    // Check cache first
    const cacheKey = `enhanced:${address}`;
    const cachedResult = this.getFromCache<EnhancedGeocodingResult>(cacheKey);
    if (cachedResult) {
      return of(cachedResult);
    }

    // Choose the appropriate geocoding provider
    switch (API_PROVIDER) {
      case 'nominatim':
        return this.enhancedNominatimGeocode(address).pipe(
          tap((result) => {
            if (result) {
              this.addToCache(cacheKey, result);
            }
          }),
        );
      case 'mapbox':
        return this.mapboxGeocode(address).pipe(
          tap((result) => {
            if (result) {
              this.addToCache(cacheKey, result);
            }
          }),
        );
      case 'google':
        return this.googleGeocode(address).pipe(
          tap((result) => {
            if (result) {
              this.addToCache(cacheKey, result);
            }
          }),
        );
      default:
        throw new Error(`Unsupported geocoding provider: ${API_PROVIDER}`);
    }
  }

  /**
   * Enhanced reverse geocode method that returns more detailed information
   * @param latitude The latitude
   * @param longitude The longitude
   * @returns An observable with detailed reverse geocoding result
   */
  enhancedReverseGeocode(
    latitude: number,
    longitude: number,
  ): Observable<ReverseGeocodingResult | null> {
    // Check cache first
    const cacheKey = `enhanced-reverse:${latitude},${longitude}`;
    const cachedResult = this.getFromCache<ReverseGeocodingResult>(cacheKey);
    if (cachedResult) {
      return of(cachedResult);
    }

    // Choose the appropriate geocoding provider
    switch (API_PROVIDER) {
      case 'nominatim':
        return this.enhancedNominatimReverseGeocode(latitude, longitude).pipe(
          tap((result) => {
            if (result) {
              this.addToCache(cacheKey, result);
            }
          }),
        );
      case 'mapbox':
        return this.mapboxReverseGeocode(latitude, longitude).pipe(
          tap((result) => {
            if (result) {
              this.addToCache(cacheKey, result);
            }
          }),
        );
      case 'google':
        return this.googleReverseGeocode(latitude, longitude).pipe(
          tap((result) => {
            if (result) {
              this.addToCache(cacheKey, result);
            }
          }),
        );
      default:
        throw new Error(`Unsupported geocoding provider: ${API_PROVIDER}`);
    }
  }

  /**
   * Get the distance between two coordinates in kilometers
   * @param lat1 Latitude of the first point
   * @param lon1 Longitude of the first point
   * @param lat2 Latitude of the second point
   * @param lon2 Longitude of the second point
   * @returns The distance in kilometers
   */
  getDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    // Haversine formula to calculate distance between two points on Earth
    const R = 6371; // Earth's radius in km
    const dLat = this.toRadians(lat2 - lat1);
    const dLon = this.toRadians(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRadians(lat1)) *
        Math.cos(this.toRadians(lat2)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;
    return distance;
  }

  /**
   * Get nearby places based on coordinates and radius
   * @param latitude The latitude
   * @param longitude The longitude
   * @param radius The radius in kilometers
   * @param type Optional type of place to search for
   * @returns An observable with the nearby places
   */
  getNearbyPlaces(
    latitude: number,
    longitude: number,
    radius: number,
    type?: string,
  ): Observable<EnhancedGeocodingResult[]> {
    // Check cache first
    const cacheKey = `nearby:${latitude},${longitude},${radius},${type || ''}`;
    const cachedResult = this.getFromCache<EnhancedGeocodingResult[]>(cacheKey);
    if (cachedResult) {
      return of(cachedResult);
    }

    // Choose the appropriate provider
    switch (API_PROVIDER) {
      case 'nominatim':
        return this.nominatimNearbyPlaces(latitude, longitude, radius, type).pipe(
          tap((results) => this.addToCache(cacheKey, results)),
        );
      case 'mapbox':
        return this.mapboxNearbyPlaces(latitude, longitude, radius, type).pipe(
          tap((results) => this.addToCache(cacheKey, results)),
        );
      case 'google':
        return this.googleNearbyPlaces(latitude, longitude, radius, type).pipe(
          tap((results) => this.addToCache(cacheKey, results)),
        );
      default:
        throw new Error(`Unsupported provider for nearby places: ${API_PROVIDER}`);
    }
  }

  /**
   * Get the user's current location
   * @returns A promise with the coordinates
   */
  getCurrentLocation(): Promise<{ latitude: number; longitude: number }> {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation is not supported by your browser'));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          });
        },
        (error) => {
          reject(error);
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 },
      );
    });
  }

  /**
   * Convert degrees to radians
   * @param degrees The angle in degrees
   * @returns The angle in radians
   */
  private toRadians(degrees: number): number {
    return (degrees * Math.PI) / 180;
  }

  /**
   * Create a query string from parameters
   * @param params The parameters to encode
   * @returns The encoded query string
   */
  private createQueryString(params: Record<string, any>): string {
    return Object.entries(params)
      .map(([key, value]) => `${key}=${encodeURIComponent(String(value))}`)
      .join('&');
  }

  /**
   * Add a result to the cache
   * @param key The cache key
   * @param result The result to cache
   */
  private addToCache<T>(key: string, result: T): void {
    this.cache.set(key, {
      result,
      timestamp: Date.now(),
    });
  }

  /**
   * Get a result from the cache if it's still valid
   * @param key The cache key
   * @returns The cached result or null if not found or expired
   */
  private getFromCache<T>(key: string): T | null {
    const cached = this.cache.get(key);
    if (!cached) {
      return null;
    }

    // Check if the cached result has expired
    if (Date.now() - cached.timestamp > CACHE_DURATION) {
      this.cache.delete(key);
      return null;
    }

    return cached.result as T;
  }

  /**
   * Enhanced geocode using Nominatim
   */
  private enhancedNominatimGeocode(address: string): Observable<EnhancedGeocodingResult | null> {
    const params = {
      q: address,
      format: 'json',
      limit: '1',
      addressdetails: '1',
    };

    const queryString = this.createQueryString(params);

    return this.http.get<any[]>(`${this.nominatimUrl}?${queryString}`).pipe(
      map((response) => {
        if (response && response.length > 0) {
          const result = response[0];
          const address = result.address || {};

          return {
            id: result.place_id,
            name: result.display_name.split(',')[0] || '',
            formattedAddress: result.display_name,
            latitude: parseFloat(result.lat),
            longitude: parseFloat(result.lon),
            country: address.country,
            countryCode: address.country_code,
            city: address.city || address.town || address.village || address.hamlet,
            state: address.state,
            postalCode: address.postcode,
            neighborhood: address.suburb || address.neighbourhood,
            provider: 'nominatim',
            timestamp: Date.now(),
          };
        }
        return null;
      }),
      catchError((error) => {
        console.error('Error geocoding with Nominatim:', error);
        return of(null);
      }),
    );
  }

  /**
   * Enhanced reverse geocode using Nominatim
   */
  private enhancedNominatimReverseGeocode(
    latitude: number,
    longitude: number,
  ): Observable<ReverseGeocodingResult | null> {
    const params = {
      lat: latitude.toString(),
      lon: longitude.toString(),
      format: 'json',
      'accept-language': 'en',
      addressdetails: '1',
    };

    const queryString = this.createQueryString(params);

    return this.http.get<any>(`${this.reverseNominatimUrl}?${queryString}`).pipe(
      map((response) => {
        if (response && response.address) {
          const address = response.address;

          return {
            formattedAddress: response.display_name,
            latitude,
            longitude,
            components: {
              country: address.country,
              countryCode: address.country_code,
              city: address.city || address.town || address.village || address.hamlet,
              state: address.state,
              postalCode: address.postcode,
              neighborhood: address.suburb || address.neighbourhood,
              street: address.road,
              streetNumber: address.house_number,
            },
            provider: 'nominatim',
            timestamp: Date.now(),
          };
        }
        return null;
      }),
      catchError((error) => {
        console.error('Error reverse geocoding with Nominatim:', error);
        return of(null);
      }),
    );
  }

  /**
   * Get nearby places using Nominatim
   */
  private nominatimNearbyPlaces(
    latitude: number,
    longitude: number,
    radius: number,
    type?: string,
  ): Observable<EnhancedGeocodingResult[]> {
    // Nominatim doesn't have a direct "nearby" API, so we'll use a bounding box approach
    // Convert radius to a bounding box (approximate)
    const kmInLat = 0.009; // ~1km in latitude degrees
    const kmInLon = 0.009 / Math.cos(this.toRadians(latitude)); // ~1km in longitude degrees

    const params: any = {
      format: 'json',
      addressdetails: '1',
      limit: '50',
      viewbox: [
        longitude - kmInLon * radius,
        latitude + kmInLat * radius,
        longitude + kmInLon * radius,
        latitude - kmInLat * radius,
      ].join(','),
      bounded: '1',
    };

    // Add category/type if provided
    if (type) {
      params.category = type;
    }

    const queryString = this.createQueryString(params);

    return this.http.get<any[]>(`${this.nominatimUrl}?${queryString}`).pipe(
      map((results) => {
        if (!results || !Array.isArray(results)) {
          return [];
        }

        return results
          .filter((result) => {
            // Filter by actual distance (not just bounding box)
            const resultLat = parseFloat(result.lat);
            const resultLon = parseFloat(result.lon);
            const distance = this.getDistance(latitude, longitude, resultLat, resultLon);
            return distance <= radius;
          })
          .map((result) => {
            const address = result.address || {};

            return {
              id: result.place_id,
              name: result.display_name.split(',')[0] || '',
              formattedAddress: result.display_name,
              latitude: parseFloat(result.lat),
              longitude: parseFloat(result.lon),
              country: address.country,
              countryCode: address.country_code,
              city: address.city || address.town || address.village || address.hamlet,
              state: address.state,
              postalCode: address.postcode,
              neighborhood: address.suburb || address.neighbourhood,
              provider: 'nominatim',
              timestamp: Date.now(),
            };
          });
      }),
      catchError((error) => {
        console.error('Error getting nearby places with Nominatim:', error);
        return of([]);
      }),
    );
  }

  /**
   * Geocode an address using Mapbox
   */
  private mapboxGeocode(address: string): Observable<EnhancedGeocodingResult | null> {
    if (!MAPBOX_ACCESS_TOKEN) {
      console.error('Mapbox access token not provided');
      return of(null);
    }

    const encodedAddress = encodeURIComponent(address);
    const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodedAddress}.json?access_token=${MAPBOX_ACCESS_TOKEN}&limit=1`;

    return this.http.get<any>(url).pipe(
      map((response) => {
        if (!response.features || response.features.length === 0) {
          return null;
        }

        const feature = response.features[0];
        const [longitude, latitude] = feature.center;
        const components = this.extractMapboxComponents(feature);

        return {
          id: feature.id,
          name: feature.text || '',
          formattedAddress: feature.place_name || '',
          latitude,
          longitude,
          country: components.country,
          countryCode: components.countryCode,
          city: components.city,
          state: components.state,
          postalCode: components.postalCode,
          neighborhood: components.neighborhood,
          provider: 'mapbox',
          timestamp: Date.now(),
        };
      }),
      catchError((error) => {
        console.error('Error geocoding with Mapbox:', error);
        return of(null);
      }),
    );
  }

  /**
   * Reverse geocode coordinates using Mapbox
   */
  private mapboxReverseGeocode(
    latitude: number,
    longitude: number,
  ): Observable<ReverseGeocodingResult | null> {
    if (!MAPBOX_ACCESS_TOKEN) {
      console.error('Mapbox access token not provided');
      return of(null);
    }

    const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${longitude},${latitude}.json?access_token=${MAPBOX_ACCESS_TOKEN}&limit=1`;

    return this.http.get<any>(url).pipe(
      map((response) => {
        if (!response.features || response.features.length === 0) {
          return null;
        }

        const feature = response.features[0];
        const components = this.extractMapboxComponents(feature);

        return {
          formattedAddress: feature.place_name || '',
          latitude,
          longitude,
          components,
          provider: 'mapbox',
          timestamp: Date.now(),
        };
      }),
      catchError((error) => {
        console.error('Error reverse geocoding with Mapbox:', error);
        return of(null);
      }),
    );
  }

  /**
   * Get nearby places using Mapbox
   */
  private mapboxNearbyPlaces(
    latitude: number,
    longitude: number,
    radius: number,
    type?: string,
  ): Observable<EnhancedGeocodingResult[]> {
    if (!MAPBOX_ACCESS_TOKEN) {
      console.error('Mapbox access token not provided');
      return of([]);
    }

    // Convert radius from km to meters for the proximity parameter
    const proximityRadius = radius * 1000;

    let url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${type || ''}.json?proximity=${longitude},${latitude}&access_token=${MAPBOX_ACCESS_TOKEN}`;

    // Add type-specific parameters if needed
    if (type) {
      url += `&types=${type}`;
    }

    return this.http.get<any>(url).pipe(
      map((response) => {
        if (!response.features) {
          return [];
        }

        return response.features
          .filter((feature: any) => {
            // Filter results by distance if radius is provided
            if (radius) {
              const [featureLon, featureLat] = feature.center;
              const distance = this.getDistance(latitude, longitude, featureLat, featureLon);
              return distance <= radius;
            }
            return true;
          })
          .map((feature: any) => {
            const [featureLon, featureLat] = feature.center;
            const components = this.extractMapboxComponents(feature);

            return {
              id: feature.id,
              name: feature.text || '',
              formattedAddress: feature.place_name || '',
              latitude: featureLat,
              longitude: featureLon,
              country: components.country,
              countryCode: components.countryCode,
              city: components.city,
              state: components.state,
              postalCode: components.postalCode,
              neighborhood: components.neighborhood,
              provider: 'mapbox',
              timestamp: Date.now(),
            };
          });
      }),
      catchError((error) => {
        console.error('Error getting nearby places with Mapbox:', error);
        return of([]);
      }),
    );
  }

  /**
   * Extract address components from a Mapbox feature
   */
  private extractMapboxComponents(feature: any): GeocodingComponents {
    const components: GeocodingComponents = {};

    if (!feature.context) {
      return components;
    }

    // Extract components from context
    feature.context.forEach((ctx: any) => {
      const id = ctx.id || '';
      const text = ctx.text || '';

      if (id.startsWith('country')) {
        components.country = text;
        // Extract country code from the ID (e.g., "country.123" -> "123")
        const parts = id.split('.');
        if (parts.length > 1) {
          components.countryCode = parts[1];
        }
      } else if (id.startsWith('region')) {
        components.state = text;
      } else if (id.startsWith('postcode')) {
        components.postalCode = text;
      } else if (id.startsWith('place')) {
        components.city = text;
      } else if (id.startsWith('neighborhood')) {
        components.neighborhood = text;
      } else if (id.startsWith('locality')) {
        if (!components.neighborhood) {
          components.neighborhood = text;
        }
      }
    });

    return components;
  }

  /**
   * Geocode an address using Google Maps
   */
  private googleGeocode(address: string): Observable<EnhancedGeocodingResult | null> {
    if (!GOOGLE_MAPS_API_KEY) {
      console.error('Google Maps API key not provided');
      return of(null);
    }

    const encodedAddress = encodeURIComponent(address);
    const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodedAddress}&key=${GOOGLE_MAPS_API_KEY}`;

    return this.http.get<any>(url).pipe(
      map((response) => {
        if (response.status !== 'OK' || !response.results || response.results.length === 0) {
          return null;
        }

        const result = response.results[0];
        const location = result.geometry.location;
        const components = this.extractGoogleComponents(result.address_components);

        return {
          id: result.place_id,
          name: result.formatted_address.split(',')[0] || '',
          formattedAddress: result.formatted_address,
          latitude: location.lat,
          longitude: location.lng,
          country: components.country,
          countryCode: components.countryCode,
          city: components.city,
          state: components.state,
          postalCode: components.postalCode,
          neighborhood: components.neighborhood,
          provider: 'google',
          timestamp: Date.now(),
        };
      }),
      catchError((error) => {
        console.error('Error geocoding with Google Maps:', error);
        return of(null);
      }),
    );
  }

  /**
   * Reverse geocode coordinates using Google Maps
   */
  private googleReverseGeocode(
    latitude: number,
    longitude: number,
  ): Observable<ReverseGeocodingResult | null> {
    if (!GOOGLE_MAPS_API_KEY) {
      console.error('Google Maps API key not provided');
      return of(null);
    }

    const url = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${GOOGLE_MAPS_API_KEY}`;

    return this.http.get<any>(url).pipe(
      map((response) => {
        if (response.status !== 'OK' || !response.results || response.results.length === 0) {
          return null;
        }

        const result = response.results[0];
        const components = this.extractGoogleComponents(result.address_components);

        return {
          formattedAddress: result.formatted_address,
          latitude,
          longitude,
          components,
          provider: 'google',
          timestamp: Date.now(),
        };
      }),
      catchError((error) => {
        console.error('Error reverse geocoding with Google Maps:', error);
        return of(null);
      }),
    );
  }

  /**
   * Get nearby places using Google Maps
   */
  private googleNearbyPlaces(
    latitude: number,
    longitude: number,
    radius: number,
    type?: string,
  ): Observable<EnhancedGeocodingResult[]> {
    if (!GOOGLE_MAPS_API_KEY) {
      console.error('Google Maps API key not provided');
      return of([]);
    }

    // Convert radius from km to meters for the API
    const radiusInMeters = radius * 1000;

    let url = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${latitude},${longitude}&radius=${radiusInMeters}&key=${GOOGLE_MAPS_API_KEY}`;

    // Add type if provided
    if (type) {
      url += `&type=${type}`;
    }

    return this.http.get<any>(url).pipe(
      map((response) => {
        if (response.status !== 'OK' || !response.results) {
          return [];
        }

        return response.results.map((place: any) => {
          const location = place.geometry.location;

          return {
            id: place.place_id,
            name: place.name,
            formattedAddress: place.vicinity,
            latitude: location.lat,
            longitude: location.lng,
            provider: 'google',
            timestamp: Date.now(),
          };
        });
      }),
      catchError((error) => {
        console.error('Error getting nearby places with Google Maps:', error);
        return of([]);
      }),
    );
  }

  /**
   * Extract address components from Google address_components
   */
  private extractGoogleComponents(addressComponents: any[]): GeocodingComponents {
    const components: GeocodingComponents = {};

    if (!addressComponents || !Array.isArray(addressComponents)) {
      return components;
    }

    // Map of Google address component types to our component names
    const componentMap: { [key: string]: keyof GeocodingComponents } = {
      country: 'country',
      administrative_area_level_1: 'state',
      locality: 'city',
      postal_code: 'postalCode',
      neighborhood: 'neighborhood',
      sublocality: 'neighborhood',
      route: 'street',
      street_number: 'streetNumber',
    };

    // Extract each component
    addressComponents.forEach((component) => {
      const types = component.types || [];

      types.forEach((type) => {
        if (componentMap[type]) {
          const key = componentMap[type];
          components[key] = component.long_name;

          // Special case for country code
          if (type === 'country') {
            components.countryCode = component.short_name;
          }
        }
      });
    });

    return components;
  }
}
