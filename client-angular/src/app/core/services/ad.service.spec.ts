// ===================================================
// CUSTOMIZABLE SETTINGS IN THIS FILE
// ===================================================
// This file contains tests for the ad service
//
// COMMON CUSTOMIZATIONS:
// - MOCK_ADS: Mock ad data for testing
//   Related to: client-angular/src/app/core/models/ad.interface.ts
// ===================================================

import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { AdService } from './ad.service';
import { environment } from '../../../environments/environment';
import { Ad } from '../models/ad.interface';
import { of } from 'rxjs';

describe('AdService', () => {
  let service: AdService;
  let httpMock: HttpTestingController;

  // Create complete mock ads that match the Ad interface
  const mockAds: Ad[] = [
    {
      _id: '1',
      title: 'Test Ad 1',
      description: 'Test description 1',
      category: 'Escort',
      price: 1000,
      location: 'Oslo',
      images: ['/assets/img/profile1.jpg'],
      media: [{ type: 'image', url: '/assets/img/profile1.jpg' }],
      advertiser: 'advertiser-1',
      userId: 'user1',
      isActive: true,
      isFeatured: false,
      isTrending: false,
      isTouring: false,
      viewCount: 100,
      clickCount: 50,
      inquiryCount: 10,
      createdAt: '2023-01-01T00:00:00.000Z',
      updatedAt: '2023-01-01T00:00:00.000Z',
      tags: ['Escort', 'Oslo'],
    },
    {
      _id: '2',
      title: 'Test Ad 2',
      description: 'Test description 2',
      category: 'Massage',
      price: 800,
      location: 'Bergen',
      images: ['/assets/img/profile2.jpg'],
      media: [{ type: 'image', url: '/assets/img/profile2.jpg' }],
      advertiser: 'advertiser-2',
      userId: 'user1',
      isActive: true,
      isFeatured: true,
      isTrending: true,
      isTouring: false,
      viewCount: 200,
      clickCount: 100,
      inquiryCount: 20,
      createdAt: '2023-01-02T00:00:00.000Z',
      updatedAt: '2023-01-02T00:00:00.000Z',
      tags: ['Massage', 'Bergen', 'Featured'],
    },
    {
      _id: '3',
      title: 'Test Ad 3',
      description: 'Test description 3',
      category: 'Striptease',
      price: 1200,
      location: 'Trondheim',
      images: ['/assets/img/profile3.jpg'],
      media: [{ type: 'image', url: '/assets/img/profile3.jpg' }],
      advertiser: 'advertiser-3',
      userId: 'user2',
      isActive: true,
      isFeatured: false,
      isTrending: false,
      isTouring: true,
      viewCount: 150,
      clickCount: 75,
      inquiryCount: 15,
      createdAt: '2023-01-03T00:00:00.000Z',
      updatedAt: '2023-01-03T00:00:00.000Z',
      tags: ['Striptease', 'Trondheim', 'Touring'],
    },
  ];

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [AdService],
    });

    service = TestBed.inject(AdService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('Basic CRUD Operations', () => {
    it('should fetch all ads', () => {
      service.getAds().subscribe(ads => {
        expect(ads).toEqual(mockAds);
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/ads`);
      expect(req.request.method).toBe('GET');
      req.flush(mockAds);
    });

    it('should fetch ads with filters', () => {
      const filters = { category: 'Escort', location: 'Oslo' };

      service.getAds(filters).subscribe(ads => {
        expect(ads).toEqual([mockAds[0]]);
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/ads?category=Escort&location=Oslo`);
      expect(req.request.method).toBe('GET');
      req.flush([mockAds[0]]);
    });

    it('should fetch user ads', () => {
      service.getUserAds('user1').subscribe(ads => {
        expect(ads).toEqual([mockAds[0], mockAds[1]]);
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/ads/user/user1`);
      expect(req.request.method).toBe('GET');
      req.flush([mockAds[0], mockAds[1]]);
    });

    it('should fetch ad by id', () => {
      const mockAd = mockAds[0];

      service.getAdById('1').subscribe(ad => {
        expect(ad).toEqual(mockAd);
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/ads/1`);
      expect(req.request.method).toBe('GET');
      req.flush(mockAd);
    });

    it('should create a new ad', () => {
      const newAd = {
        title: 'New Ad',
        description: 'New description',
        category: 'Escort',
        price: 1200,
        location: 'Oslo',
        isActive: true,
      };

      service.createAd(newAd).subscribe(ad => {
        expect(ad._id).toBeDefined();
        expect(ad.title).toBe(newAd.title);
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/ads`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(newAd);

      req.flush({
        ...newAd,
        _id: '4',
        userId: 'user1',
        advertiser: 'advertiser-4',
        images: [],
        media: [],
        isFeatured: false,
        isTrending: false,
        isTouring: false,
        viewCount: 0,
        clickCount: 0,
        inquiryCount: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        tags: ['Escort', 'Oslo'],
      });
    });

    it('should create a new ad with images', () => {
      const formData = new FormData();
      formData.append('title', 'New Ad With Images');
      formData.append('description', 'New description');
      formData.append('category', 'Escort');

      // Mock file
      const file = new File(['dummy content'], 'example.jpg', { type: 'image/jpeg' });
      formData.append('images', file);

      service.createAdWithImages(formData).subscribe(ad => {
        expect(ad._id).toBeDefined();
        expect(ad.title).toBe('New Ad With Images');
        expect(ad.images.length).toBeGreaterThan(0);
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/ads/with-images`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(formData);

      req.flush({
        _id: '5',
        title: 'New Ad With Images',
        description: 'New description',
        category: 'Escort',
        userId: 'user1',
        advertiser: 'advertiser-5',
        images: ['/uploads/example.jpg'],
        media: [{ type: 'image', url: '/uploads/example.jpg' }],
        isFeatured: false,
        isTrending: false,
        isTouring: false,
        viewCount: 0,
        clickCount: 0,
        inquiryCount: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        tags: ['Escort'],
      });
    });

    it('should update an existing ad', () => {
      const updateData = {
        title: 'Updated Title',
        price: 1500,
      };

      service.updateAd('1', updateData).subscribe(ad => {
        expect(ad.title).toBe(updateData.title);
        expect(ad.price).toBe(updateData.price);
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/ads/1`);
      expect(req.request.method).toBe('PUT');
      expect(req.request.body).toEqual(updateData);

      const updatedAd = {
        ...mockAds[0],
        ...updateData,
        updatedAt: new Date().toISOString(),
      };

      req.flush(updatedAd);
    });

    it('should update ad images', () => {
      const formData = new FormData();

      // Mock file
      const file = new File(['dummy content'], 'new-image.jpg', { type: 'image/jpeg' });
      formData.append('images', file);

      service.updateAdImages('1', formData).subscribe(ad => {
        expect(ad._id).toBe('1');
        expect(ad.images).toContain('/uploads/new-image.jpg');
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/ads/1/images`);
      expect(req.request.method).toBe('PUT');
      expect(req.request.body).toEqual(formData);

      const updatedAd = {
        ...mockAds[0],
        images: [...mockAds[0].images, '/uploads/new-image.jpg'],
        media: [...mockAds[0].media, { type: 'image', url: '/uploads/new-image.jpg' }],
        updatedAt: new Date().toISOString(),
      };

      req.flush(updatedAd);
    });

    it('should delete an ad', () => {
      service.deleteAd('1').subscribe(response => {
        // The API returns void/null, so we should expect undefined or null
        expect(response === undefined || response === null).toBeTrue();
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/ads/1`);
      expect(req.request.method).toBe('DELETE');
      req.flush(null);
    });

    it('should delete an ad image', () => {
      service.deleteAdImage('1', 'image1').subscribe(response => {
        expect(response === undefined || response === null).toBeTrue();
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/ads/1/images/image1`);
      expect(req.request.method).toBe('DELETE');
      req.flush(null);
    });
  });

  describe('Specialized Ad Operations', () => {
    it('should fetch swipe ads', () => {
      service.getSwipeAds().subscribe(ads => {
        expect(ads).toEqual(mockAds);
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/ads/swipe`);
      expect(req.request.method).toBe('GET');
      req.flush(mockAds);
    });

    it('should fetch swipe ads with filters', () => {
      const filters = {
        category: 'Escort',
        location: 'Oslo',
        touringOnly: true,
      };

      service.getSwipeAds(filters).subscribe(ads => {
        expect(ads).toEqual([mockAds[0]]);
      });

      const req = httpMock.expectOne(
        `${environment.apiUrl}/ads/swipe?category=Escort&location=Oslo&touringOnly=true`
      );
      expect(req.request.method).toBe('GET');
      req.flush([mockAds[0]]);
    });

    it('should record a swipe action', () => {
      service.recordSwipe('1', 'right').subscribe(response => {
        expect(response === undefined || response === null).toBeTrue();
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/ads/1/swipe`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual({ direction: 'right' });
      req.flush(null);
    });

    it('should fetch categories', () => {
      const categories = ['Escort', 'Massage', 'Striptease'];

      service.getCategories().subscribe(result => {
        expect(result).toEqual(categories);
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/ads/categories`);
      expect(req.request.method).toBe('GET');
      req.flush(categories);
    });

    it('should fetch ads by category', () => {
      service.getAdsByCategory('Massage').subscribe(ads => {
        expect(ads).toEqual([mockAds[1]]);
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/ads/category/Massage`);
      expect(req.request.method).toBe('GET');
      req.flush([mockAds[1]]);
    });

    it('should search nearby ads', () => {
      const longitude = 10.7522;
      const latitude = 59.9139;
      const radius = 10000;

      service.searchNearby(longitude, latitude, radius).subscribe(ads => {
        expect(ads).toEqual([mockAds[0]]);
      });

      const req = httpMock.expectOne(
        `${environment.apiUrl}/ads/nearby?longitude=10.7522&latitude=59.9139&radius=10000`
      );
      expect(req.request.method).toBe('GET');
      req.flush([mockAds[0]]);
    });

    it('should fetch trending ads', () => {
      service.getTrendingAds().subscribe(ads => {
        expect(ads).toEqual([mockAds[1]]);
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/ads/trending`);
      expect(req.request.method).toBe('GET');
      req.flush([mockAds[1]]);
    });

    it('should fetch featured ads', () => {
      service.getFeaturedAds().subscribe(ads => {
        expect(ads).toEqual([mockAds[1]]);
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/ads/featured`);
      expect(req.request.method).toBe('GET');
      req.flush([mockAds[1]]);
    });

    it('should search ads by query', () => {
      service.searchAds('massage').subscribe(ads => {
        expect(ads).toEqual([mockAds[1]]);
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/ads/search?q=massage`);
      expect(req.request.method).toBe('GET');
      req.flush([mockAds[1]]);
    });

    it('should report an ad', () => {
      service.reportAd('1', 'Inappropriate content').subscribe(response => {
        expect(response === undefined || response === null).toBeTrue();
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/ads/1/report`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual({ reason: 'Inappropriate content' });
      req.flush(null);
    });

    it('should toggle active status', () => {
      service.toggleActiveStatus('1', false).subscribe(response => {
        expect(response === undefined || response === null).toBeTrue();
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/ads/1/status`);
      expect(req.request.method).toBe('PATCH');
      expect(req.request.body).toEqual({ isActive: false });
      req.flush(null);
    });
  });

  describe('Error Handling', () => {
    it('should return mock ads when API fails', () => {
      // Spy on console.error to prevent it from cluttering the test output
      spyOn(console, 'error');

      service.getAds().subscribe(ads => {
        // Should return mock ads from the service
        expect(ads.length).toBeGreaterThan(0);
        expect(ads[0].title).toBeDefined();
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/ads`);
      req.error(new ErrorEvent('Network error'));
    });

    it('should handle API errors gracefully', () => {
      service.getAdById('999').subscribe({
        next: () => fail('Should have failed with 404'),
        error: error => {
          expect(error.status).toBe(404);
        },
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/ads/999`);
      req.flush('Not found', { status: 404, statusText: 'Not Found' });
    });
  });
});
