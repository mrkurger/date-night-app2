// ===================================================
// CUSTOMIZABLE SETTINGS IN THIS FILE
// ===================================================
// This file contains settings for service configuration (travel.service.spec)
//
// COMMON CUSTOMIZATIONS:
// - SETTING_NAME: Description of setting (default: value)
//   Related to: other_file.ts:OTHER_SETTING
// ===================================================
import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TravelService, TravelItinerary, TouringAd } from './travel.service';
import { environment } from '../../../environments/environment';

describe('TravelService', () => {
  let service: TravelService;
  let httpMock: HttpTestingController;
  const apiUrl = `${environment.apiUrl}/travel`;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [TravelService],
    });

    service = TestBed.inject(TravelService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getItineraries', () => {
    it('should return travel itineraries for an ad', () => {
      const adId = '123';
      const mockItineraries: TravelItinerary[] = [
        {
          _id: 'itin1',
          destination: {
            city: 'Oslo',
            county: 'Oslo',
            location: {
              type: 'Point',
              coordinates: [10.7522, 59.9139],
            },
          },
          arrivalDate: new Date('2023-06-01'),
          departureDate: new Date('2023-06-07'),
          status: 'planned',
        },
      ];

      service.getItineraries(adId).subscribe((itineraries) => {
        expect(itineraries).toEqual(mockItineraries);
      });

      const req = httpMock.expectOne(`${apiUrl}/ad/${adId}`);
      expect(req.request.method).toBe('GET');
      req.flush(mockItineraries);
    });
  });

  describe('addItinerary', () => {
    it('should add a travel itinerary to an ad', () => {
      const adId = '123';
      const newItinerary: TravelItinerary = {
        destination: {
          city: 'Bergen',
          county: 'Vestland',
          location: {
            type: 'Point',
            coordinates: [5.3221, 60.3913],
          },
        },
        arrivalDate: new Date('2023-07-01'),
        departureDate: new Date('2023-07-07'),
        status: 'planned',
      };

      const mockResponse: TravelItinerary[] = [
        {
          _id: 'itin2',
          ...newItinerary,
        },
      ];

      service.addItinerary(adId, newItinerary).subscribe((itineraries) => {
        expect(itineraries).toEqual(mockResponse);
      });

      const req = httpMock.expectOne(`${apiUrl}/ad/${adId}`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(newItinerary);
      req.flush(mockResponse);
    });
  });

  describe('updateItinerary', () => {
    it('should update a travel itinerary', () => {
      const adId = '123';
      const itineraryId = 'itin1';
      const updates: Partial<TravelItinerary> = {
        status: 'active',
        notes: 'Updated notes',
      };

      const mockResponse: TravelItinerary = {
        _id: itineraryId,
        destination: {
          city: 'Oslo',
          county: 'Oslo',
          location: {
            type: 'Point',
            coordinates: [10.7522, 59.9139],
          },
        },
        arrivalDate: new Date('2023-06-01'),
        departureDate: new Date('2023-06-07'),
        status: 'active',
        notes: 'Updated notes',
      };

      service.updateItinerary(adId, itineraryId, updates).subscribe((itinerary) => {
        expect(itinerary).toEqual(mockResponse);
      });

      const req = httpMock.expectOne(`${apiUrl}/ad/${adId}/itinerary/${itineraryId}`);
      expect(req.request.method).toBe('PUT');
      expect(req.request.body).toEqual(updates);
      req.flush(mockResponse);
    });
  });

  describe('cancelItinerary', () => {
    it('should cancel a travel itinerary', () => {
      const adId = '123';
      const itineraryId = 'itin1';
      const mockResponse = { success: true, message: 'Itinerary cancelled successfully' };

      service.cancelItinerary(adId, itineraryId).subscribe((response) => {
        expect(response).toEqual(mockResponse);
      });

      const req = httpMock.expectOne(`${apiUrl}/ad/${adId}/itinerary/${itineraryId}`);
      expect(req.request.method).toBe('DELETE');
      req.flush(mockResponse);
    });
  });

  describe('updateLocation', () => {
    it('should update advertiser location', () => {
      const adId = '123';
      const longitude = 10.7522;
      const latitude = 59.9139;

      const mockResponse = {
        success: true,
        data: {
          currentLocation: {
            type: 'Point',
            coordinates: [longitude, latitude] as [number, number],
          },
          isTouring: true,
        },
      };

      service.updateLocation(adId, longitude, latitude).subscribe((response) => {
        expect(response).toEqual(
          jasmine.objectContaining({
            success: true,
            data: jasmine.objectContaining({
              isTouring: true,
            }),
          }),
        );
      });

      const req = httpMock.expectOne(`${apiUrl}/ad/${adId}/location`);
      expect(req.request.method).toBe('PUT');
      expect(req.request.body).toEqual({ longitude, latitude });
      req.flush(mockResponse);
    });
  });

  describe('getTouringAdvertisers', () => {
    it('should get touring advertisers', () => {
      const mockResponse = {
        success: true,
        count: 1,
        data: [
          {
            _id: 'ad1',
            title: 'Test Ad',
            advertiser: {
              _id: 'user1',
              username: 'testuser',
            },
            category: 'escort',
            county: 'Oslo',
            city: 'Oslo',
            profileImage: 'image.jpg',
            travelItinerary: [],
            isTouring: true,
            currentLocation: {
              type: 'Point',
              coordinates: [10.7522, 59.9139] as [number, number],
            },
          },
        ],
      };

      service.getTouringAdvertisers().subscribe((response) => {
        expect(response.success).toBe(true);
        expect(response.count).toBe(1);
        expect(response.data.length).toBe(1);
        expect(response.data[0]._id).toBe('ad1');
      });

      const req = httpMock.expectOne(`${apiUrl}/touring`);
      expect(req.request.method).toBe('GET');
      req.flush(mockResponse);
    });
  });

  describe('getUpcomingTours', () => {
    it('should get upcoming tours with filters', () => {
      const city = 'Oslo';
      const county = 'Oslo';
      const days = 30;

      const mockResponse = {
        success: true,
        count: 1,
        data: [
          {
            _id: 'ad1',
            title: 'Test Ad',
            advertiser: {
              _id: 'user1',
              username: 'testuser',
            },
            category: 'escort',
            county: 'Oslo',
            city: 'Oslo',
            profileImage: 'image.jpg',
            travelItinerary: [],
            isTouring: false,
          },
        ],
      };

      service.getUpcomingTours(city, county, days).subscribe((response) => {
        expect(response).toEqual(mockResponse);
      });

      const req = httpMock.expectOne(`${apiUrl}/upcoming?city=Oslo&county=Oslo&days=30`);
      expect(req.request.method).toBe('GET');
      req.flush(mockResponse);
    });
  });

  describe('getAdsByLocation', () => {
    it('should get ads by location', () => {
      const longitude = 10.7522;
      const latitude = 59.9139;
      const distance = 5000;

      const mockResponse = {
        success: true,
        count: 1,
        data: [
          {
            _id: 'ad1',
            title: 'Test Ad',
            advertiser: {
              _id: 'user1',
              username: 'testuser',
            },
            category: 'escort',
            county: 'Oslo',
            city: 'Oslo',
            profileImage: 'image.jpg',
            travelItinerary: [],
            isTouring: true,
            currentLocation: {
              type: 'Point',
              coordinates: [longitude, latitude] as [number, number],
            },
          },
        ],
      };

      service.getAdsByLocation(longitude, latitude, distance).subscribe((response) => {
        expect(response.success).toBe(true);
        expect(response.count).toBe(1);
        expect(response.data.length).toBe(1);
        expect(response.data[0]._id).toBe('ad1');
      });

      const req = httpMock.expectOne(
        `${apiUrl}/location?longitude=10.7522&latitude=59.9139&distance=5000`,
      );
      expect(req.request.method).toBe('GET');
      req.flush(mockResponse);
    });
  });

  // Error handling tests
  describe('Error Handling', () => {
    it('should handle HTTP errors when getting itineraries', () => {
      const adId = '123';
      const errorResponse = { status: 404, statusText: 'Not Found' };
      const errorSpy = jasmine.createSpy('error');

      service.getItineraries(adId).subscribe({
        next: () => fail('should have failed with a 404 error'),
        error: (error) => {
          errorSpy(error);
        },
      });

      const req = httpMock.expectOne(`${apiUrl}/ad/${adId}`);
      req.error(new ErrorEvent('Not Found'), errorResponse);

      expect(errorSpy).toHaveBeenCalled();
      const errorArg = errorSpy.calls.mostRecent().args[0];
      expect(errorArg.status).toBe(404);
    });

    it('should handle HTTP errors when adding itinerary', () => {
      const adId = '123';
      const newItinerary: TravelItinerary = {
        destination: {
          city: 'Bergen',
          county: 'Vestland',
          location: {
            type: 'Point',
            coordinates: [5.3221, 60.3913],
          },
        },
        arrivalDate: new Date('2023-07-01'),
        departureDate: new Date('2023-07-07'),
        status: 'planned',
      };

      const errorResponse = { status: 400, statusText: 'Bad Request' };
      const errorSpy = jasmine.createSpy('error');

      service.addItinerary(adId, newItinerary).subscribe({
        next: () => fail('should have failed with a 400 error'),
        error: (error) => {
          errorSpy(error);
        },
      });

      const req = httpMock.expectOne(`${apiUrl}/ad/${adId}`);
      req.error(new ErrorEvent('Bad Request'), errorResponse);

      expect(errorSpy).toHaveBeenCalled();
      const errorArg = errorSpy.calls.mostRecent().args[0];
      expect(errorArg.status).toBe(400);
    });

    it('should handle HTTP errors when updating location', () => {
      const adId = '123';
      const longitude = 10.7522;
      const latitude = 59.9139;

      const errorResponse = { status: 500, statusText: 'Server Error' };
      const errorSpy = jasmine.createSpy('error');

      service.updateLocation(adId, longitude, latitude).subscribe({
        next: () => fail('should have failed with a 500 error'),
        error: (error) => {
          errorSpy(error);
        },
      });

      const req = httpMock.expectOne(`${apiUrl}/ad/${adId}/location`);
      req.error(new ErrorEvent('Server Error'), errorResponse);

      expect(errorSpy).toHaveBeenCalled();
      const errorArg = errorSpy.calls.mostRecent().args[0];
      expect(errorArg.status).toBe(500);
    });
  });
});
