import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { BadgeModule } from 'primeng/badge';
import { expect, jest } from '@jest/globals';

import { AppCardComponent } from './app-card.component';
import { Ad } from '../../../../core/models/ad.interface';

describe('AppCardComponent', () => {
  let component: AppCardComponent;
  let fixture: ComponentFixture<AppCardComponent>;
  let debugElement: DebugElement;

  // Mock ad data for testing
  const mockAd: Ad = {
    _id: 'ad123',
    title: 'Test Ad',
    description:
      'This is a test ad description that is long enough to test truncation functionality in the component.',
    category: 'Test Category',
    price: 100,
    location: {
      city: 'Test City',
      county: 'Test County',
    },
    images: ['https://example.com/image1.jpg', 'https://example.com/image2.jpg'],
    media: [
      { type: 'image', url: 'https://example.com/media1.jpg' },
      { type: 'video', url: 'https://example.com/video1.mp4' },
    ],
    advertiser: 'Test Advertiser',
    userId: 'user123',
    isActive: true,
    isFeatured: true,
    isTrending: false,
    isTouring: false,
    viewCount: 100,
    clickCount: 50,
    inquiryCount: 10,
    createdAt: '2023-01-01T00:00:00.000Z',
    updatedAt: '2023-01-02T00:00:00.000Z',
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CommonModule, CardModule, ButtonModule, BadgeModule, AppCardComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(AppCardComponent);
    component = fixture.componentInstance;
    debugElement = fixture.debugElement;

    // Set the mock ad data
    component.ad = mockAd;

    fixture.detectChanges();
  });

  describe('Component Initialization', () => {
    it('should create', () => {
      expect(component).toBeDefined();
    });

    it('should initialize with default values', () => {
      expect(component.layout).toBe('netflix');
      expect(component.showActions).toBe(true);
      expect(component.showDescription).toBe(true);
      expect(component.isOnline).toBe(false);
      expect(component.currentMediaIndex).toBe(0);
    });

    it('should set background image on init', () => {
      expect(component.backgroundImageUrl).toBe(mockAd.images[0]);
    });
  });

  describe('PrimeNG Components', () => {
    it('should render p-card component', () => {
      const cardElement = debugElement.query(By.css('p-card'));
      expect(cardElement).toBeDefined();
    });

    it('should apply correct layout class to card', () => {
      const cardElement = debugElement.query(By.css('.p-card'));
      expect(cardElement.classes['p-card-netflix']).toBe(true);
    });

    it('should render status badge with correct severity', () => {
      component.isOnline = true;
      fixture.detectChanges();

      const badge = debugElement.query(By.css('p-badge'));
      expect(badge.attributes['ng-reflect-severity']).toBe('success');
      expect(badge.attributes['ng-reflect-value']).toBe('Online');
    });

    it('should render action buttons when showActions is true', () => {
      const buttons = debugElement.queryAll(By.css('p-button'));
      expect(buttons.length).toBeGreaterThan(0);
    });
  });

  describe('Event Handling', () => {
    it('should emit share event with ad ID', () => {
      const emitSpy = jest.spyOn(component.share, 'emit');
      component.onShare(new Event('click'));
      expect(emitSpy).toHaveBeenCalledWith(mockAd._id);
    });
  });

  describe('Helper Methods', () => {
    it('should format price correctly', () => {
      expect(component.formatPrice(1000)).toBe('$1,000.00');
    });

    it('should truncate description', () => {
      const longDesc = 'A'.repeat(150);
      component.ad = { ...mockAd, description: longDesc };
      const truncated = component.getTruncatedDescription();
      expect(truncated.length).toBeLessThanOrEqual(103); // 100 chars + ellipsis
    });

    it('should get correct media count', () => {
      expect(component.getMediaCount()).toBe(mockAd.images.length);
    });

    it('should get media dots array', () => {
      const dots = component.getMediaDots();
      expect(dots.length).toBe(mockAd.images.length);
    });
  });
});
