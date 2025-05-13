import { Component } from '@angular/core';
// ===================================================
// CUSTOMIZABLE SETTINGS IN THIS FILE
// ===================================================
// This file contains tests for the geocoding service
//
// COMMON CUSTOMIZATIONS:
// - MOCK_RESPONSES: Test responses for geocoding API calls
// - API_ENDPOINTS: API endpoint configuration for tests
//   Related to: client-angular/src/environments/environment.ts
// ===================================================

import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import {
  GeocodingService,
  GeocodingResult,
  EnhancedGeocodingResult,
  ReverseGeocodingResult,
} from './geocoding.service';
import { LocationService } from './location.service';
import { environment } from '../../../environments/environment';
import { of, throwError } from 'rxjs';

describe('GeocodingService', () => {
  let service: GeocodingService;
  let httpMock: HttpTestingController;
  let locationServiceSpy: jasmine.SpyObj<LocationService>;

  const apiUrl = `${environment.apiUrl}/geocoding`;
  const nominatimUrl = 'https://nominatim.openstreetmap.org/search';
  const reverseNominatimUrl = 'https://nominatim.openstreetmap.org/reverse';

  // Mock data
  const mockCoordinates: [number, number] = [10.7522, 59.9139]; // Oslo coordinates
  const mockGeocodingResult: GeocodingResult = {
    type: 'Point',
    coordinates: mockCoordinates,
  };

  const mockNominatimResponse = [
    {
      place_id: 123456,
      licence: 'Data © OpenStreetMap contributors, ODbL 1.0.',
      osm_type: 'node',
      osm_id: 123456789,
      boundingbox: ['59.9', '59.95', '10.7', '10.8'],
      lat: '59.9139',
      lon: '10.7522',
      display_name: 'Oslo, Norway',
      class: 'place',
      type: 'city',
      importance: 0.7,
      icon: 'https://nominatim.openstreetmap.org/ui/mapicons/poi_place_city.p.20.png',
    },
  ];

  const mockReverseNominatimResponse = {
    place_id: 123456,
    licence: 'Data © OpenStreetMap contributors, ODbL 1.0.',
    osm_type: 'node',
    osm_id: 123456789,
    lat: '59.9139',
    lon: '10.7522',
    display_name: 'Oslo, Oslo, Norway',
    address: {
      city: 'Oslo',
      county: 'Oslo',
      country: 'Norway',
      country_code: 'no',
    },
  };

  const mockEnhancedGeocodingResult: EnhancedGeocodingResult = {
    name: 'Oslo',
    formattedAddress: 'Oslo, Norway',
    latitude: 59.9139,
    longitude: 10.7522,
    country: 'Norway',
    countryCode: 'NO',
    city: 'Oslo',
    provider: 'nominatim',
    timestamp: Date.now(),
  };

  const mockReverseGeocodingResult: ReverseGeocodingResult = {
    formattedAddress: 'Oslo, Oslo, Norway',
    latitude: 59.9139,
    longitude: 10.7522,
    components: {
      city: 'Oslo',
      state: 'Oslo',
      country: 'Norway',
      countryCode: 'no',
    },
    provider: 'nominatim',
    timestamp: Date.now(),
  };

  beforeEach(() => {
    // Create a spy for the LocationService
    const locationSpy = jasmine.createSpyObj('LocationService', [
      'getCityCoordinates',
      'findNearestCity',
      'getNorwegianCities',
    ]);

    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [GeocodingService, { provide: LocationService, useValue: locationSpy }],
    });

    service = TestBed.inject(GeocodingService);
    httpMock = TestBed.inject(HttpTestingController);
    locationServiceSpy = TestBed.inject(LocationService) as jasmine.SpyObj<LocationService>;

    // Clear any cached data
    (service as any).cache = new Map();
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('geocodeAddress', () => {
    it('should geocode an address using the backend API', () => {
      const address = 'Oslo, Norway';

      service.geocodeAddress(address).subscribe((result) => {
        expect(result).toEqual(mockGeocodingResult);
      });

      const req = httpMock.expectOne(`${apiUrl}/forward?address=${encodeURIComponent(address)}`);
      expect(req.request.method).toBe('GET');
      req.flush(mockGeocodingResult);
    });

    it('should fall back to Nominatim if backend API fails', () => {
      const address = 'Oslo, Norway';

      service.geocodeAddress(address).subscribe((result) => {
        expect(result).toEqual(mockGeocodingResult);
      });

      // First, the backend API request fails
      const backendReq = httpMock.expectOne(
        `${apiUrl}/forward?address=${encodeURIComponent(address)}`,
      );
      backendReq.error(new ErrorEvent('Network error'));

      // Then, the Nominatim request succeeds
      const nominatimReq = httpMock.expectOne((req) => req.url.startsWith(nominatimUrl));
      expect(nominatimReq.request.method).toBe('GET');
      expect(nominatimReq.request.params.get('q')).toBe(address);
      nominatimReq.flush(mockNominatimResponse);
    });

    it('should return null if both backend and Nominatim fail', () => {
      const address = 'Invalid Address';

      service.geocodeAddress(address).subscribe((result) => {
        expect(result).toBeNull();
      });

      // First, the backend API request fails
      const backendReq = httpMock.expectOne(
        `${apiUrl}/forward?address=${encodeURIComponent(address)}`,
      );
      backendReq.error(new ErrorEvent('Network error'));

      // Then, the Nominatim request also fails
      const nominatimReq = httpMock.expectOne((req) => req.url.startsWith(nominatimUrl));
      nominatimReq.error(new ErrorEvent('Network error'));
    });
  });

  describe('geocodeLocation', () => {
    it('should use local database if coordinates are available', () => {
      const city = 'Oslo';
      const county = 'Oslo';
      const country = 'Norway';

      locationServiceSpy.getCityCoordinates.and.returnValue(of(mockCoordinates));

      service.geocodeLocation(city, county, country).subscribe((result) => {
        expect(result).toEqual(mockGeocodingResult);
      });

      expect(locationServiceSpy.getCityCoordinates).toHaveBeenCalledWith(city);
      httpMock.expectNone(`${apiUrl}/forward`);
    });

    it('should use backend API if local database fails', () => {
      const city = 'Oslo';
      const county = 'Oslo';
      const country = 'Norway';

      locationServiceSpy.getCityCoordinates.and.returnValue(
        throwError(() => new Error('Not found')),
      );

      service.geocodeLocation(city, county, country).subscribe((result) => {
        expect(result).toEqual(mockGeocodingResult);
      });

      expect(locationServiceSpy.getCityCoordinates).toHaveBeenCalledWith(city);

      const req = httpMock.expectOne(
        `${apiUrl}/forward?city=${encodeURIComponent(city)}&county=${encodeURIComponent(county)}&country=${encodeURIComponent(country)}`,
      );
      expect(req.request.method).toBe('GET');
      req.flush(mockGeocodingResult);
    });

    it('should fall back to Nominatim if both local database and backend API fail', () => {
      const city = 'Oslo';
      const county = 'Oslo';
      const country = 'Norway';

      locationServiceSpy.getCityCoordinates.and.returnValue(
        throwError(() => new Error('Not found')),
      );

      service.geocodeLocation(city, county, country).subscribe((result) => {
        expect(result).toEqual(mockGeocodingResult);
      });

      // First, the local database fails
      expect(locationServiceSpy.getCityCoordinates).toHaveBeenCalledWith(city);

      // Then, the backend API request fails
      const backendReq = httpMock.expectOne(
        `${apiUrl}/forward?city=${encodeURIComponent(city)}&county=${encodeURIComponent(county)}&country=${encodeURIComponent(country)}`,
      );
      backendReq.error(new ErrorEvent('Network error'));

      // Finally, the Nominatim request succeeds
      const nominatimReq = httpMock.expectOne((req) => req.url.startsWith(nominatimUrl));
      expect(nominatimReq.request.method).toBe('GET');
      nominatimReq.flush(mockNominatimResponse);
    });
  });

  describe('reverseGeocode', () => {
    it('should reverse geocode coordinates using the backend API', () => {
      const [longitude, latitude] = mockCoordinates;
      const mockResponse = {
        city: 'Oslo',
        county: 'Oslo',
        country: 'Norway',
        address: 'Oslo, Oslo, Norway',
      };

      service.reverseGeocode(longitude, latitude).subscribe((result) => {
        expect(result).toEqual(mockResponse);
      });

      const req = httpMock.expectOne(
        `${apiUrl}/reverse?longitude=${longitude}&latitude=${latitude}`,
      );
      expect(req.request.method).toBe('GET');
      req.flush(mockResponse);
    });

    it('should fall back to local database if backend API fails', () => {
      const [longitude, latitude] = mockCoordinates;
      const mockCityResult = {
        city: 'Oslo',
        county: 'Oslo',
        distance: 0.5,
      };

      locationServiceSpy.findNearestCity.and.returnValue(of(mockCityResult));

      service.reverseGeocode(longitude, latitude).subscribe((result) => {
        expect(result).toEqual({
          city: 'Oslo',
          county: 'Oslo',
          country: 'Norway',
          address: 'Oslo, Oslo, Norway',
        });
      });

      // First, the backend API request fails
      const backendReq = httpMock.expectOne(
        `${apiUrl}/reverse?longitude=${longitude}&latitude=${latitude}`,
      );
      backendReq.error(new ErrorEvent('Network error'));

      // Then, the local database is used
      expect(locationServiceSpy.findNearestCity).toHaveBeenCalledWith(latitude, longitude);
    });

    it('should fall back to Nominatim if both backend API and local database fail', () => {
      const [longitude, latitude] = mockCoordinates;

      locationServiceSpy.findNearestCity.and.returnValue(throwError(() => new Error('Not found')));

      service.reverseGeocode(longitude, latitude).subscribe((result) => {
        expect(result).toEqual({
          city: 'Oslo',
          county: 'Oslo',
          country: 'Norway',
          address: 'Oslo, Oslo, Norway',
        });
      });

      // First, the backend API request fails
      const backendReq = httpMock.expectOne(
        `${apiUrl}/reverse?longitude=${longitude}&latitude=${latitude}`,
      );
      backendReq.error(new ErrorEvent('Network error'));

      // Then, the local database fails
      expect(locationServiceSpy.findNearestCity).toHaveBeenCalledWith(latitude, longitude);

      // Finally, the Nominatim request succeeds
      const nominatimReq = httpMock.expectOne((req) => req.url.startsWith(reverseNominatimUrl));
      expect(nominatimReq.request.method).toBe('GET');
      nominatimReq.flush(mockReverseNominatimResponse);
    });
  });

  describe('enhancedGeocode', () => {
    it('should return cached result if available', () => {
      const address = 'Oslo, Norway';

      // Add a result to the cache
      (service as any).addToCache(`enhanced:${address}`, mockEnhancedGeocodingResult);

      service.enhancedGeocode(address).subscribe((result) => {
        expect(result).toEqual(mockEnhancedGeocodingResult);
      });

      // No HTTP requests should be made
      httpMock.expectNone((req) => true);
    });

    it('should use Nominatim for enhanced geocoding if not cached', () => {
      const address = 'Oslo, Norway';

      service.enhancedGeocode(address).subscribe((result) => {
        expect(result).toBeTruthy();
        expect(result.city).toBe('Oslo');
        expect(result.country).toBe('Norway');
        expect(result.provider).toBe('nominatim');
      });

      const req = httpMock.expectOne((req) => req.url.startsWith(nominatimUrl));
      expect(req.request.method).toBe('GET');
      req.flush(mockNominatimResponse);
    });
  });

  describe('enhancedReverseGeocode', () => {
    it('should return cached result if available', () => {
      const [longitude, latitude] = mockCoordinates;

      // Add a result to the cache
      (service as any).addToCache(
        `enhanced-reverse:${latitude},${longitude}`,
        mockReverseGeocodingResult,
      );

      service.enhancedReverseGeocode(latitude, longitude).subscribe((result) => {
        expect(result).toEqual(mockReverseGeocodingResult);
      });

      // No HTTP requests should be made
      httpMock.expectNone((req) => true);
    });

    it('should use Nominatim for enhanced reverse geocoding if not cached', () => {
      const [longitude, latitude] = mockCoordinates;

      service.enhancedReverseGeocode(latitude, longitude).subscribe((result) => {
        expect(result).toBeTruthy();
        expect(result.components.city).toBe('Oslo');
        expect(result.components.country).toBe('Norway');
        expect(result.provider).toBe('nominatim');
      });

      const req = httpMock.expectOne((req) => req.url.startsWith(reverseNominatimUrl));
      expect(req.request.method).toBe('GET');
      req.flush(mockReverseNominatimResponse);
    });
  });

  describe('getDistance', () => {
    it('should calculate distance between two points correctly', () => {
      // Oslo to Bergen is approximately 324 km
      const osloLat = 59.9139;
      const osloLon = 10.7522;
      const bergenLat = 60.3913;
      const bergenLon = 5.3221;

      const distance = service.getDistance(osloLat, osloLon, bergenLat, bergenLon);

      // Allow for some margin of error in the calculation
      expect(distance).toBeGreaterThan(300);
      expect(distance).toBeLessThan(350);
    });

    it('should return 0 for the same coordinates', () => {
      const lat = 59.9139;
      const lon = 10.7522;

      const distance = service.getDistance(lat, lon, lat, lon);

      expect(distance).toBe(0);
    });
  });

  describe('getNearbyPlaces', () => {
    it('should return cached results if available', () => {
      const [longitude, latitude] = mockCoordinates;
      const radius = 5; // 5 km
      const mockPlaces = [mockEnhancedGeocodingResult];

      // Add results to the cache
      (service as any).addToCache(`nearby:${latitude},${longitude},${radius},`, mockPlaces);

      service.getNearbyPlaces(latitude, longitude, radius).subscribe((results) => {
        expect(results).toEqual(mockPlaces);
      });

      // No HTTP requests should be made
      httpMock.expectNone((req) => true);
    });

    it('should use Nominatim for nearby places if not cached', () => {
      const [longitude, latitude] = mockCoordinates;
      const radius = 5; // 5 km

      service.getNearbyPlaces(latitude, longitude, radius).subscribe((results) => {
        expect(results.length).toBe(1);
        expect(results[0].city).toBe('Oslo');
      });

      const req = httpMock.expectOne((req) => req.url.startsWith(nominatimUrl));
      expect(req.request.method).toBe('GET');
      req.flush(mockNominatimResponse);
    });

    it('should include type parameter if provided', () => {
      const [longitude, latitude] = mockCoordinates;
      const radius = 5; // 5 km
      const type = 'restaurant';

      service.getNearbyPlaces(latitude, longitude, radius, type).subscribe();

      const req = httpMock.expectOne(
        (req) =>
          req.url.startsWith(nominatimUrl) &&
          req.params.has('amenity') &&
          req.params.get('amenity') === type,
      );
      expect(req.request.method).toBe('GET');
      req.flush(mockNominatimResponse);
    });
  });

  // Test cache management
  describe('Cache Management', () => {
    it('should add and retrieve items from cache', () => {
      const key = 'test-key';
      const value = { test: 'value' };

      // Add to cache
      (service as any).addToCache(key, value);

      // Retrieve from cache
      const cachedValue = (service as any).getFromCache(key);

      expect(cachedValue).toEqual(value);
    });

    it('should not return expired cache items', () => {
      const key = 'test-key';
      const value = { test: 'value' };

      // Add to cache with an expired timestamp (24 hours ago + 1 minute)
      const expiredTimestamp = Date.now() - 24 * 60 * 60 * 1000 - 60 * 1000;
      (service as any).cache.set(key, { result: value, timestamp: expiredTimestamp });

      // Try to retrieve from cache
      const cachedValue = (service as any).getFromCache(key);

      expect(cachedValue).toBeNull();
    });
  });
});
