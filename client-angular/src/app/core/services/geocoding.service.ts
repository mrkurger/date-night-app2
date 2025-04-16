import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { LocationService } from './location.service';

export interface GeocodingResult {
  type: 'Point';
  coordinates: [number, number]; // [longitude, latitude]
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

  constructor(
    private http: HttpClient,
    private locationService: LocationService
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
          this.geocodeWithNominatim(address)
        )
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
    country = 'Norway'
  ): Observable<GeocodingResult | null> {
    // First check if we have the coordinates in our local database
    return this.locationService.getCityCoordinates(city).pipe(
      map(coordinates => {
        if (coordinates) {
          return {
            type: 'Point',
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
              county
            )}&country=${encodeURIComponent(country)}`
          )
          .pipe(
            catchError(() =>
              // If backend fails, try Nominatim directly
              this.geocodeWithNominatim(address)
            )
          );
      })
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
    latitude: number
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
            map(result => {
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
              this.reverseGeocodeWithNominatim(longitude, latitude)
            )
          )
        )
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

    const queryString = Object.entries(params)
      .map(([key, value]) => `${key}=${encodeURIComponent(value)}`)
      .join('&');

    return this.http.get<any[]>(`${this.nominatimUrl}?${queryString}`).pipe(
      map(response => {
        if (response && response.length > 0) {
          const result = response[0];
          return {
            type: 'Point',
            coordinates: [parseFloat(result.lon), parseFloat(result.lat)],
          };
        }
        return null;
      }),
      catchError(() => of(null))
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
    latitude: number
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

    const queryString = Object.entries(params)
      .map(([key, value]) => `${key}=${encodeURIComponent(value)}`)
      .join('&');

    return this.http.get<any>(`${this.reverseNominatimUrl}?${queryString}`).pipe(
      map(response => {
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
      catchError(() => of(null))
    );
  }
}
