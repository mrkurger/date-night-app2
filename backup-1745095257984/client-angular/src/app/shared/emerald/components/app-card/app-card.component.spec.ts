// ===================================================
// CUSTOMIZABLE SETTINGS IN THIS FILE
// ===================================================
// This file contains tests for the Emerald AppCard component
//
// COMMON CUSTOMIZATIONS:
// - MOCK_AD: Mock ad data for testing
//   Related to: client-angular/src/app/core/models/ad.interface.ts
// ===================================================
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';
import { CommonModule } from '@angular/common';

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
    location: 'Test Location',
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
      imports: [CommonModule, AppCardComponent],
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
      expect(component).toBeTruthy();
    });

    it('should initialize with default values', () => {
      const newComponent = new AppCardComponent();
      expect(newComponent.layout).toBe('netflix');
      expect(newComponent.showActions).toBeTrue();
      expect(newComponent.showDescription).toBeTrue();
      expect(newComponent.isOnline).toBeFalse();
      expect(newComponent.currentMediaIndex).toBe(0);
    });

    it('should set background image on init', () => {
      expect(component.backgroundImageUrl).toBe(mockAd.images[0]);
    });
  });

  describe('Media Handling', () => {
    it('should get primary image from images array', () => {
      const testAd = { ...mockAd, media: [] };
      component.ad = testAd;

      expect(component.getPrimaryImage()).toBe(testAd.images[0]);
    });

    it('should get primary image from media array', () => {
      const testAd = { ...mockAd, images: [] };
      component.ad = testAd;

      expect(component.getPrimaryImage()).toBe(testAd.media[0].url);
    });

    it('should return default image when no images or media are available', () => {
      const testAd = { ...mockAd, images: [], media: [] };
      component.ad = testAd;

      expect(component.getPrimaryImage()).toBe('/assets/img/default-profile.jpg');
    });

    it('should get current media URL from media array', () => {
      component.currentMediaIndex = 1;
      component.ad = { ...mockAd, images: [] };

      expect(component.getCurrentMediaUrl()).toBe(mockAd.media[1].url);
    });

    it('should get current media URL from images array', () => {
      component.currentMediaIndex = 1;
      component.ad = { ...mockAd, media: [] };

      expect(component.getCurrentMediaUrl()).toBe(mockAd.images[1]);
    });

    it('should navigate to next media item', () => {
      const event = new Event('click');
      spyOn(event, 'stopPropagation');

      component.currentMediaIndex = 0;
      component.nextMedia(event);

      expect(event.stopPropagation).toHaveBeenCalled();
      expect(component.currentMediaIndex).toBe(1);
      expect(component.backgroundImageUrl).toBe(component.getCurrentMediaUrl());
    });

    it('should navigate to previous media item', () => {
      const event = new Event('click');
      spyOn(event, 'stopPropagation');

      component.currentMediaIndex = 1;
      component.prevMedia(event);

      expect(event.stopPropagation).toHaveBeenCalled();
      expect(component.currentMediaIndex).toBe(0);
      expect(component.backgroundImageUrl).toBe(component.getCurrentMediaUrl());
    });

    it('should wrap around when navigating past the last media item', () => {
      const event = new Event('click');

      component.currentMediaIndex = component.ad.media.length - 1;
      component.nextMedia(event);

      expect(component.currentMediaIndex).toBe(0);
    });

    it('should wrap around when navigating before the first media item', () => {
      const event = new Event('click');

      component.currentMediaIndex = 0;
      component.prevMedia(event);

      expect(component.currentMediaIndex).toBe(component.ad.media.length - 1);
    });

    it('should get correct media count', () => {
      expect(component.getMediaCount()).toBe(2);

      component.ad = { ...mockAd, media: [] };
      expect(component.getMediaCount()).toBe(2);

      component.ad = { ...mockAd, images: [], media: [] };
      expect(component.getMediaCount()).toBe(0);
    });

    it('should generate media dots array', () => {
      const dots = component.getMediaDots();
      expect(dots).toEqual([0, 1]);
    });

    it('should handle image loading error', () => {
      const mockEvent = { target: { src: 'invalid-url' } } as unknown as Event;
      component.onImageError(mockEvent);

      expect((mockEvent.target as HTMLImageElement).src).toBe('/assets/img/default-profile.jpg');
    });
  });

  describe('Content Formatting', () => {
    it('should format price correctly', () => {
      expect(component.formatPrice(100)).toBe('$100');
      expect(component.formatPrice(1000)).toBe('$1,000');
      expect(component.formatPrice(1234.56)).toBe('$1,235');
    });

    it('should truncate description', () => {
      const longDescription =
        'This is a very long description that should be truncated when displayed on the card.';
      component.ad = { ...mockAd, description: longDescription };

      expect(component.getTruncatedDescription(20)).toBe('This is a very long d...');
      expect(component.getTruncatedDescription(10)).toBe('This is a ...');
    });

    it('should not truncate short descriptions', () => {
      const shortDescription = 'Short description';
      component.ad = { ...mockAd, description: shortDescription };

      expect(component.getTruncatedDescription(20)).toBe(shortDescription);
    });

    it('should handle empty description', () => {
      component.ad = { ...mockAd, description: '' };

      expect(component.getTruncatedDescription()).toBe('');
    });
  });

  describe('Event Handling', () => {
    it('should emit viewDetails event', () => {
      spyOn(component.viewDetails, 'emit');

      component.onViewDetails();

      expect(component.viewDetails.emit).toHaveBeenCalledWith(mockAd._id);
    });

    it('should emit like event', () => {
      spyOn(component.like, 'emit');
      const event = new Event('click');
      spyOn(event, 'stopPropagation');

      component.onLike(event);

      expect(event.stopPropagation).toHaveBeenCalled();
      expect(component.like.emit).toHaveBeenCalledWith(mockAd._id);
    });

    it('should emit chat event', () => {
      spyOn(component.chat, 'emit');
      const event = new Event('click');
      spyOn(event, 'stopPropagation');

      component.onChat(event);

      expect(event.stopPropagation).toHaveBeenCalled();
      expect(component.chat.emit).toHaveBeenCalledWith(mockAd._id);
    });

    it('should emit share event', () => {
      spyOn(component.share, 'emit');
      const event = new Event('click');
      spyOn(event, 'stopPropagation');

      component.onShare(event);

      expect(event.stopPropagation).toHaveBeenCalled();
      expect(component.share.emit).toHaveBeenCalledWith(mockAd._id);
    });

    it('should emit swiped event', () => {
      spyOn(component.swiped, 'emit');
      const event = new Event('click');
      spyOn(event, 'stopPropagation');

      component.onSwipe('right', event);

      expect(event.stopPropagation).toHaveBeenCalled();
      expect(component.swiped.emit).toHaveBeenCalledWith({ direction: 'right', adId: mockAd._id });
    });
  });

  describe('UI Rendering', () => {
    it('should apply correct layout class', () => {
      // Default layout (netflix)
      let cardElement = debugElement.query(By.css('.emerald-app-card--netflix'));
      expect(cardElement).toBeTruthy();

      // Change to tinder layout
      component.layout = 'tinder';
      fixture.detectChanges();

      cardElement = debugElement.query(By.css('.emerald-app-card--tinder'));
      expect(cardElement).toBeTruthy();

      // Change to list layout
      component.layout = 'list';
      fixture.detectChanges();

      cardElement = debugElement.query(By.css('.emerald-app-card--list'));
      expect(cardElement).toBeTruthy();
    });

    it('should show online/offline status', () => {
      // Default (offline)
      let statusElement = debugElement.query(By.css('.emerald-app-card__status-label--offline'));
      expect(statusElement).toBeTruthy();

      // Change to online
      component.isOnline = true;
      fixture.detectChanges();

      statusElement = debugElement.query(By.css('.emerald-app-card__status-label--online'));
      expect(statusElement).toBeTruthy();
    });

    it('should show media navigation when multiple media items exist', () => {
      const navButtons = debugElement.queryAll(By.css('.emerald-app-card__media-nav'));
      expect(navButtons.length).toBe(2);

      const dots = debugElement.queryAll(By.css('.emerald-app-card__media-dot'));
      expect(dots.length).toBe(2);
    });

    it('should hide media navigation when only one media item exists', () => {
      component.ad = { ...mockAd, images: ['https://example.com/image1.jpg'], media: [] };
      fixture.detectChanges();

      const navButtons = debugElement.queryAll(By.css('.emerald-app-card__media-nav'));
      expect(navButtons.length).toBe(0);

      const dots = debugElement.queryAll(By.css('.emerald-app-card__media-dot'));
      expect(dots.length).toBe(0);
    });

    it('should show card title', () => {
      const titleElement = debugElement.query(By.css('.emerald-app-card__title'));
      expect(titleElement.nativeElement.textContent).toBe(mockAd.title);
    });

    it('should show location when available', () => {
      const locationElement = debugElement.query(By.css('.emerald-app-card__location'));
      expect(locationElement).toBeTruthy();
      expect(locationElement.nativeElement.textContent).toContain(mockAd.location);
    });

    it('should show price when available', () => {
      const priceElement = debugElement.query(By.css('.emerald-app-card__price'));
      expect(priceElement).toBeTruthy();
      expect(priceElement.nativeElement.textContent).toContain('$100');
    });

    it('should show description when showDescription is true', () => {
      component.showDescription = true;
      fixture.detectChanges();

      const descriptionElement = debugElement.query(By.css('.emerald-app-card__description'));
      expect(descriptionElement).toBeTruthy();
    });

    it('should hide description when showDescription is false', () => {
      component.showDescription = false;
      fixture.detectChanges();

      const descriptionElement = debugElement.query(By.css('.emerald-app-card__description'));
      expect(descriptionElement).toBeFalsy();
    });

    it('should show actions when showActions is true', () => {
      component.showActions = true;
      fixture.detectChanges();

      const actionsElement = debugElement.query(By.css('.emerald-app-card__actions'));
      expect(actionsElement).toBeTruthy();
    });

    it('should hide actions when showActions is false', () => {
      component.showActions = false;
      fixture.detectChanges();

      const actionsElement = debugElement.query(By.css('.emerald-app-card__actions'));
      expect(actionsElement).toBeFalsy();
    });

    it('should show swipe actions only in tinder layout', () => {
      // Netflix layout (default)
      let swipeActionsElement = debugElement.query(By.css('.emerald-app-card__swipe-actions'));
      expect(swipeActionsElement).toBeFalsy();

      // Tinder layout
      component.layout = 'tinder';
      fixture.detectChanges();

      swipeActionsElement = debugElement.query(By.css('.emerald-app-card__swipe-actions'));
      expect(swipeActionsElement).toBeTruthy();
    });
  });
});
