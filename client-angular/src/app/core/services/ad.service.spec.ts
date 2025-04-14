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
      updatedAt: '2023-01-01T00:00:00.000Z'
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
      updatedAt: '2023-01-02T00:00:00.000Z'
    }
  ];

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [AdService]
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

  it('should fetch user ads', () => {
    service.getUserAds('user1').subscribe(ads => {
      expect(ads).toEqual(mockAds);
    });

    const req = httpMock.expectOne(`${environment.apiUrl}/ads/user/user1`);
    expect(req.request.method).toBe('GET');
    req.flush(mockAds);
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
      isActive: true
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
      _id: '3',
      userId: 'user1',
      advertiser: 'advertiser-3',
      images: [],
      media: [],
      isFeatured: false,
      isTrending: false,
      isTouring: false,
      viewCount: 0,
      clickCount: 0,
      inquiryCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
  });

  it('should update an existing ad', () => {
    const updateData = {
      title: 'Updated Title',
      price: 1500
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
      updatedAt: new Date().toISOString()
    };
    
    req.flush(updatedAd);
  });

  it('should delete an ad', () => {
    service.deleteAd('1').subscribe(response => {
      expect(response).toBeUndefined();
    });

    const req = httpMock.expectOne(`${environment.apiUrl}/ads/1`);
    expect(req.request.method).toBe('DELETE');
    req.flush(null);
  });
});
