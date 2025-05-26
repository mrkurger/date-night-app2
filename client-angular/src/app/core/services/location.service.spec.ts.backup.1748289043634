// ===================================================
// CUSTOMIZABLE SETTINGS IN THIS FILE
// ===================================================
// This file contains tests for the location service
//
// COMMON CUSTOMIZATIONS:
// - MOCK_DATA: Mock location data for testing
//   Related to: client-angular/src/app/core/constants/norway-locations.ts
// - API_RESPONSES: Mock API responses for testing
//   Related to: client-angular/src/environments/environment.ts
// ===================================================

import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { LocationService } from './location.service';
import { environment } from '../../../environments/environment';
import {
  NORWAY_COUNTIES,
  getAllCounties,
  getCitiesByCounty,
  getCityCoordinates,
} from '../constants/norway-locations';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';

/**
 * Test suite for the LocationService
 *
 * Tests cover:
 * - Getting counties from API and fallback
 * - Getting cities by county from API and fallback
 * - Getting all cities from API and fallback
 * - Getting city coordinates from API and fallback
 * - Getting current location
 * - Finding nearest city
 * - Distance calculation
 */
describe('LocationService', () => {
  let service: LocationService;
  let httpMock: HttpTestingController;
  const apiUrl = environment.apiUrl + '/locations';

  beforeEach(() => {
    TestBed.configureTestingModule({
    imports: [],
    providers: [LocationService, provideHttpClient(withInterceptorsFromDi()), provideHttpClientTesting()]
});
    service = TestBed.inject(LocationService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getCounties', () => {
    it('should return counties from API when request succeeds', () => {
      const mockCounties = ['Oslo', 'Viken', 'Innlandet'];

      service.getCounties().subscribe((counties) => {
        expect(counties).toEqual(mockCounties);
      });

      const req = httpMock.expectOne(`${apiUrl}/counties`);
      expect(req.request.method).toBe('GET');
      req.flush(mockCounties);
    });

    it('should fall back to local data when API request fails', () => {
      const expectedCounties = getAllCounties();

      service.getCounties().subscribe((counties) => {
        expect(counties).toEqual(expectedCounties);
      });

      const req = httpMock.expectOne(`${apiUrl}/counties`);
      req.error(new ErrorEvent('Network error'));
    });
  });

  describe('getCitiesByCounty', () => {
    it('should return cities for a county from API when request succeeds', () => {
      const countyName = 'Oslo';
      const mockCities = [
        { name: 'Oslo', coordinates: [10.7522, 59.9139] as [number, number] },
        { name: 'Nordstrand', coordinates: [10.8007, 59.8651] as [number, number] },
      ];

      service.getCitiesByCounty(countyName).subscribe((cities) => {
        expect(cities).toEqual(mockCities);
      });

      const req = httpMock.expectOne(`${apiUrl}/counties/${countyName}/cities`);
      expect(req.request.method).toBe('GET');
      req.flush(mockCities);
    });

    it('should fall back to local data when API request fails', () => {
      const countyName = 'Oslo';
      const expectedCities = getCitiesByCounty(countyName);

      service.getCitiesByCounty(countyName).subscribe((cities) => {
        expect(cities).toEqual(expectedCities);
      });

      const req = httpMock.expectOne(`${apiUrl}/counties/${countyName}/cities`);
      req.error(new ErrorEvent('Network error'));
    });
  });

  describe('getAllCities', () => {
    it('should return all cities from API when request succeeds', () => {
      const mockCities = ['Oslo', 'Bergen', 'Trondheim'];

      service.getAllCities().subscribe((cities) => {
        expect(cities).toEqual(mockCities);
      });

      const req = httpMock.expectOne(`${apiUrl}/cities`);
      expect(req.request.method).toBe('GET');
      req.flush(mockCities);
    });

    it('should fall back to local data when API request fails', () => {
      service.getAllCities().subscribe((cities) => {
        // Just check that we get a non-empty array of strings
        expect(cities.length).toBeGreaterThan(0);
        expect(typeof cities[0]).toBe('string');
      });

      const req = httpMock.expectOne(`${apiUrl}/cities`);
      req.error(new ErrorEvent('Network error'));
    });
  });

  describe('getCityCoordinates', () => {
    it('should return coordinates for a city from API when request succeeds', () => {
      const cityName = 'Oslo';
      const mockCoordinates: [number, number] = [10.7522, 59.9139];

      service.getCityCoordinates(cityName).subscribe((coordinates) => {
        expect(coordinates).toEqual(mockCoordinates);
      });

      const req = httpMock.expectOne(`${apiUrl}/cities/${cityName}/coordinates`);
      expect(req.request.method).toBe('GET');
      req.flush({ coordinates: mockCoordinates });
    });

    it('should fall back to local data when API request fails', () => {
      const cityName = 'Oslo';
      const expectedCoordinates = getCityCoordinates(cityName);

      service.getCityCoordinates(cityName).subscribe((coordinates) => {
        expect(coordinates).toEqual(expectedCoordinates);
      });

      const req = httpMock.expectOne(`${apiUrl}/cities/${cityName}/coordinates`);
      req.error(new ErrorEvent('Network error'));
    });

    it('should return null for non-existent city', () => {
      const cityName = 'NonExistentCity';

      service.getCityCoordinates(cityName).subscribe((coordinates) => {
        expect(coordinates).toBeNull();
      });

      const req = httpMock.expectOne(`${apiUrl}/cities/${cityName}/coordinates`);
      req.error(new ErrorEvent('Network error'));
    });
  });

  describe('getCurrentLocation', () => {
    it('should return the current position when geolocation is available', (done) => {
      // Mock the navigator.geolocation
      const mockPosition = {
        coords: {
          latitude: 59.9139,
          longitude: 10.7522,
          accuracy: 10,
          altitude: null,
          altitudeAccuracy: null,
          heading: null,
          speed: null,
        },
        timestamp: Date.now(),
      } as GeolocationPosition;

      spyOn(navigator.geolocation, 'getCurrentPosition').and.callFake((success) => {
        success(mockPosition);
      });

      service.getCurrentLocation().subscribe((position) => {
        expect(position).toBe(mockPosition);
        done();
      });
    });

    it('should handle errors when geolocation fails', (done) => {
      // Mock the navigator.geolocation
      spyOn(navigator.geolocation, 'getCurrentPosition').and.callFake((success, error) => {
        error(new GeolocationPositionError());
      });

      service.getCurrentLocation().subscribe(
        () => {
          fail('Should have failed');
        },
        (error) => {
          expect(error).toBeTruthy();
          done();
        },
      );
    });
  });

  describe('findNearestCity', () => {
    it('should return the nearest city from API when request succeeds', () => {
      const latitude = 59.9139;
      const longitude = 10.7522;
      const mockResponse = {
        city: 'Oslo',
        county: 'Oslo',
        distance: 0.5,
      };

      service.findNearestCity(latitude, longitude).subscribe((result) => {
        expect(result).toEqual(mockResponse);
      });

      const req = httpMock.expectOne(
        `${apiUrl}/nearest-city?latitude=${latitude}&longitude=${longitude}`,
      );
      expect(req.request.method).toBe('GET');
      req.flush(mockResponse);
    });

    it('should fall back to local calculation when API request fails', () => {
      const latitude = 59.9139;
      const longitude = 10.7522;

      service.findNearestCity(latitude, longitude).subscribe((result) => {
        expect(result.city).toBeTruthy();
        expect(result.county).toBeTruthy();
        expect(typeof result.distance).toBe('number');
      });

      const req = httpMock.expectOne(
        `${apiUrl}/nearest-city?latitude=${latitude}&longitude=${longitude}`,
      );
      req.error(new ErrorEvent('Network error'));
    });
  });

  describe('calculateDistance', () => {
    it('should calculate the correct distance between two points', () => {
      // Oslo to Bergen is approximately 324 km
      const osloLat = 59.9139;
      const osloLon = 10.7522;
      const bergenLat = 60.3913;
      const bergenLon = 5.322;

      // Access the private method using type assertion
      const distance = (service as any).calculateDistance(osloLat, osloLon, bergenLat, bergenLon);

      // Allow for some margin of error in the calculation
      expect(distance).toBeGreaterThan(300);
      expect(distance).toBeLessThan(350);
    });

    it('should return zero for the same coordinates', () => {
      const lat = 59.9139;
      const lon = 10.7522;

      // Access the private method using type assertion
      const distance = (service as any).calculateDistance(lat, lon, lat, lon);

      expect(distance).toBe(0);
    });
  });

  describe('deg2rad', () => {
    it('should convert degrees to radians correctly', () => {
      // Access the private method using type assertion
      const rad = (service as any).deg2rad(180);

      expect(rad).toBeCloseTo(Math.PI, 5);
    });

    it('should return zero for zero degrees', () => {
      // Access the private method using type assertion
      const rad = (service as any).deg2rad(0);

      expect(rad).toBe(0);
    });
  });
});
