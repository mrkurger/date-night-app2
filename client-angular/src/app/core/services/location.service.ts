import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { 
  NORWAY_COUNTIES, 
  NorwayCounty, 
  NorwayCity, 
  getAllCounties, 
  getCitiesByCounty,
  getCityCoordinates
} from '../constants/norway-locations';
import { environment } from '../../../environments/environment';

/**
 * Service for handling location-related functionality
 * Provides methods for retrieving counties, cities, and coordinates
 */
@Injectable({
  providedIn: 'root'
})
export class LocationService {
  private readonly apiUrl = environment.apiUrl + '/locations';

  constructor(private http: HttpClient) {}

  /**
   * Get all Norwegian counties
   */
  getCounties(): Observable<string[]> {
    // First try to get from API, fall back to local constants if API fails
    return this.http.get<string[]>(`${this.apiUrl}/counties`).pipe(
      catchError(() => of(getAllCounties()))
    );
  }

  /**
   * Get all cities for a specific county
   * @param countyName The name of the county
   */
  getCitiesByCounty(countyName: string): Observable<NorwayCity[]> {
    return this.http.get<NorwayCity[]>(`${this.apiUrl}/counties/${countyName}/cities`).pipe(
      catchError(() => of(getCitiesByCounty(countyName)))
    );
  }

  /**
   * Get all cities as a flat list
   */
  getAllCities(): Observable<string[]> {
    return this.http.get<string[]>(`${this.apiUrl}/cities`).pipe(
      catchError(() => {
        const cities = NORWAY_COUNTIES.flatMap(county => 
          county.cities.map(city => city.name)
        );
        return of(cities);
      })
    );
  }

  /**
   * Get coordinates for a specific city
   * @param cityName The name of the city
   */
  getCityCoordinates(cityName: string): Observable<[number, number] | null> {
    return this.http.get<{coordinates: [number, number]}>(`${this.apiUrl}/cities/${cityName}/coordinates`).pipe(
      map(response => response.coordinates),
      catchError(() => of(getCityCoordinates(cityName)))
    );
  }

  /**
   * Get the user's current location using the browser's geolocation API
   */
  getCurrentLocation(): Observable<GeolocationPosition> {
    return new Observable(observer => {
      if (!navigator.geolocation) {
        observer.error('Geolocation is not supported by your browser');
      } else {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            observer.next(position);
            observer.complete();
          },
          (error) => {
            observer.error(error);
          },
          { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
        );
      }
    });
  }

  /**
   * Find the nearest city to the given coordinates
   * @param latitude The latitude
   * @param longitude The longitude
   */
  findNearestCity(latitude: number, longitude: number): Observable<{city: string, county: string, distance: number}> {
    return this.http.get<{city: string, county: string, distance: number}>(
      `${this.apiUrl}/nearest-city?latitude=${latitude}&longitude=${longitude}`
    ).pipe(
      catchError(() => {
        // Calculate nearest city locally if API fails
        let nearestCity = '';
        let nearestCounty = '';
        let minDistance = Number.MAX_VALUE;

        NORWAY_COUNTIES.forEach(county => {
          county.cities.forEach(city => {
            if (city.coordinates) {
              const [cityLong, cityLat] = city.coordinates;
              const distance = this.calculateDistance(latitude, longitude, cityLat, cityLong);
              
              if (distance < minDistance) {
                minDistance = distance;
                nearestCity = city.name;
                nearestCounty = county.name;
              }
            }
          });
        });

        return of({
          city: nearestCity,
          county: nearestCounty,
          distance: minDistance
        });
      })
    );
  }

  /**
   * Calculate the distance between two points using the Haversine formula
   * @param lat1 Latitude of point 1
   * @param lon1 Longitude of point 1
   * @param lat2 Latitude of point 2
   * @param lon2 Longitude of point 2
   * @returns Distance in kilometers
   */
  private calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371; // Radius of the earth in km
    const dLat = this.deg2rad(lat2 - lat1);
    const dLon = this.deg2rad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.deg2rad(lat1)) * Math.cos(this.deg2rad(lat2)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c; // Distance in km
    return distance;
  }

  /**
   * Convert degrees to radians
   * @param deg Degrees
   * @returns Radians
   */
  private deg2rad(deg: number): number {
    return deg * (Math.PI / 180);
  }
}