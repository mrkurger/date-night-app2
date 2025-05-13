import { Input } from '@angular/core';
import { OnInit } from '@angular/core';
import { Component } from '@angular/core';
// ===================================================
// CUSTOMIZABLE SETTINGS IN THIS FILE
// ===================================================
// This file contains settings for component configuration (tinder.component.spec)
//
// COMMON CUSTOMIZATIONS:
// - SETTING_NAME: Description of setting (default: value)
//   Related to: other_file.ts:OTHER_SETTING
// ===================================================
import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { of, throwError } from 'rxjs';

import { TinderComponent } from './tinder.component';
import { AdService } from '../../core/services/ad.service';
import { NotificationService } from '../../core/services/notification.service';
import { ChatService } from '../../core/services/chat.service';
import { AuthService } from '../../core/services/auth.service';

// Mock MainLayoutComponent
@Component({
  selector: 'app-main-layout',
  template: '<ng-content></ng-content>',,
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule]
})
class MockMainLayoutComponent {
  @Input() activeView: 'netflix' | 'tinder' | 'list' = 'tinder';
}

// Import Emerald components
import {
  TinderCardComponent,
  FloatingActionButtonComponent,
  SkeletonLoaderComponent,
  ToggleComponent,
  LabelComponent,
} from '../../shared/emerald';

describe('TinderComponent', () => {
  let component: TinderComponent;
  let fixture: ComponentFixture<TinderComponent>;
  let adService: AdService;
  let notificationService: NotificationService;
  let chatService: ChatService;
  let authService: AuthService;
  let router: Router;

  // Mock data
  const mockAds = [
    {
      _id: '1',
      title: 'Test Ad 1',
      description: 'Test description 1',
      price: 100,
      location: 'Oslo',
      category: 'Dinner',
      media: [{ url: '/assets/images/test-image-1.jpg', type: 'image' }],
      images: ['/assets/images/test-image-1.jpg'],
      advertiser: 'Test User 1',
      userId: 'user1',
      isActive: true,
      isFeatured: false,
      isTrending: false,
      isTouring: false,
      viewCount: 0,
      clickCount: 0,
      inquiryCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      tags: ['tag1', 'tag2'],
    },
    {
      _id: '2',
      title: 'Test Ad 2',
      description: 'Test description 2',
      price: 200,
      location: 'Bergen',
      category: 'Activity',
      media: [{ url: '/assets/images/test-image-2.jpg', type: 'image' }],
      images: ['/assets/images/test-image-2.jpg'],
      advertiser: 'Test User 2',
      userId: 'user2',
      isActive: true,
      isFeatured: false,
      isTrending: false,
      isTouring: false,
      viewCount: 0,
      clickCount: 0,
      inquiryCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      tags: ['tag3', 'tag4'],
    },
  ];

  // Mock services
  class MockAdService {
    getSwipeAds() {
      return of(mockAds);
    }
    recordSwipe() {
      return of({ success: true });
    }
  }

  class MockNotificationService {
    messages: { type: string; text: string }[] = [];

    success(message: string): void {
      // Mock success notification for tests
      this.messages.push({ type: 'success', text: message });
    }

    error(message: string): void {
      // Mock error notification for tests
      this.messages.push({ type: 'error', text: message });
    }
  }

  class MockChatService {
    createAdRoom() {
      return of({ _id: 'chat-room-1' });
    }
  }

  class MockAuthService {
    currentUser$ = of({ _id: 'user1', name: 'Test User' });
  }

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        RouterTestingModule,
        ReactiveFormsModule,
        TinderComponent,
        // Import Emerald components
        TinderCardComponent,
        FloatingActionButtonComponent,
        SkeletonLoaderComponent,
        ToggleComponent,
        LabelComponent,
      ],
      declarations: [MockMainLayoutComponent],
      providers: [
        { provide: AdService, useClass: MockAdService },
        { provide: NotificationService, useClass: MockNotificationService },
        { provide: ChatService, useClass: MockChatService },
        { provide: AuthService, useClass: MockAuthService },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(TinderComponent);
    component = fixture.componentInstance;
    adService = TestBed.inject(AdService);
    notificationService = TestBed.inject(NotificationService);
    chatService = TestBed.inject(ChatService);
    authService = TestBed.inject(AuthService);
    router = TestBed.inject(Router);

    // Spy on router navigation
    spyOn(router, 'navigateByUrl').and.stub();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('initialization', () => {
    it('should load ads on init', fakeAsync(() => {
      spyOn(adService, 'getSwipeAds').and.callThrough();

      component.ngOnInit();
      tick();

      expect(adService.getSwipeAds).toHaveBeenCalled();
      expect(component.ads.length).toBe(2);
      expect(component.currentAd).toBe(mockAds[0]);
      expect(component.nextAd).toBe(mockAds[1]);
      expect(component.loading).toBeFalse();
    }));

    it('should handle empty ads array', fakeAsync(() => {
      spyOn(adService, 'getSwipeAds').and.returnValue(of([]));

      component.ngOnInit();
      tick();

      expect(component.ads.length).toBe(0);
      expect(component.currentAd).toBeNull();
      expect(component.nextAd).toBeNull();
      expect(component.loading).toBeFalse();
    }));

    it('should handle error when loading ads', fakeAsync(() => {
      spyOn(adService, 'getSwipeAds').and.returnValue(
        throwError(() => new Error('Failed to load ads')),
      );
      spyOn(console, 'error').and.callThrough();

      component.ngOnInit();
      tick();

      expect(component.error).toBe('Failed to load ads. Please try again.');
      expect(component.loading).toBeFalse();
      expect(console.error).toHaveBeenCalled();
    }));

    it('should check authentication status', fakeAsync(() => {
      component.ngOnInit();
      tick();

      expect(component.isAuthenticated).toBeTrue();
    }));
  });

  describe('card interactions', () => {
    beforeEach(() => {
      component.ngOnInit();
      fixture.detectChanges();
    });

    it('should navigate to ad details when viewAdDetails is called', () => {
      component.currentAd = mockAds[0];
      component.viewAdDetails();

      // Check that router.navigateByUrl was called with the correct URL
      expect(router.navigateByUrl).toHaveBeenCalledWith('/ad-details/1');
    });

    it('should like an ad when onSwipe is called with right direction', fakeAsync(() => {
      spyOn(adService, 'recordSwipe').and.callThrough();
      spyOn(notificationService, 'success').and.callThrough();

      component.currentAd = mockAds[0];
      component.nextAd = mockAds[1];
      component.ads = [...mockAds];

      component.onSwipe({ direction: 'right', itemId: '1' });

      expect(adService.recordSwipe).toHaveBeenCalledWith('1', 'right');
      expect(notificationService.success).toHaveBeenCalledWith('Added to your favorites');
      expect(component.cardState).toBe('like');

      // Fast-forward time to simulate animation completion
      tick(500);

      expect(component.ads.length).toBe(1);
      expect(component.currentAd).toBe(mockAds[1]);
      expect(component.nextAd).toBeNull();
      expect(component.cardState).toBe('');
    }));

    it('should dislike an ad when onSwipe is called with left direction', fakeAsync(() => {
      spyOn(adService, 'recordSwipe').and.callThrough();

      component.currentAd = mockAds[0];
      component.nextAd = mockAds[1];
      component.ads = [...mockAds];

      component.onSwipe({ direction: 'left', itemId: '1' });

      expect(adService.recordSwipe).toHaveBeenCalledWith('1', 'left');
      expect(component.cardState).toBe('dislike');

      // Fast-forward time to simulate animation completion
      tick(500);

      expect(component.ads.length).toBe(1);
      expect(component.currentAd).toBe(mockAds[1]);
      expect(component.nextAd).toBeNull();
      expect(component.cardState).toBe('');
    }));

    it('should start chat when startChat is called', () => {
      spyOn(chatService, 'createAdRoom').and.callThrough();

      component.currentAd = mockAds[0];
      component.startChat();

      expect(chatService.createAdRoom).toHaveBeenCalledWith('1');
      expect(router.navigateByUrl).toHaveBeenCalledWith('/chat/chat-room-1');
    });

    it('should show error notification when starting chat without authentication', () => {
      component.isAuthenticated = false;
      spyOn(notificationService, 'error').and.callThrough();

      component.currentAd = mockAds[0];
      component.startChat();

      expect(notificationService.error).toHaveBeenCalledWith('Please log in to start a chat');
    });
  });

  describe('filter functionality', () => {
    it('should apply filters and reload ads', () => {
      spyOn(component, 'loadSwipeAds').and.callThrough();
      spyOn(component, 'closeFilters').and.callThrough();
      spyOn(notificationService, 'success').and.callThrough();

      component.applyFilters();

      expect(component.loadSwipeAds).toHaveBeenCalled();
      expect(component.closeFilters).toHaveBeenCalled();
      expect(notificationService.success).toHaveBeenCalledWith('Filters applied');
    });

    it('should reset filters to default values', () => {
      component.filterForm.setValue({
        category: 'Dinner',
        location: 'Oslo',
        touringOnly: true,
      });

      component.resetFilters();

      expect(component.filterForm.value).toEqual({
        category: '',
        location: '',
        touringOnly: false,
      });
    });
  });

  describe('utility methods', () => {
    it('should convert ad media to TinderCardMedia format', () => {
      const media = component.getCardMedia(mockAds[0]);

      expect(media.length).toBe(1);
      expect(media[0].url).toBe('/assets/images/test-image-1.jpg');
      expect(media[0].type).toBe('image');
    });

    it('should return default image when ad has no media', () => {
      const adWithoutMedia = { ...mockAds[0], media: [] };
      const media = component.getCardMedia(adWithoutMedia);

      expect(media.length).toBe(1);
      expect(media[0].url).toBe('/assets/images/default-profile.jpg');
      expect(media[0].type).toBe('image');
    });

    it('should handle null or undefined media', () => {
      const adWithNullMedia = { ...mockAds[0], media: null };
      const media = component.getCardMedia(adWithNullMedia);

      expect(media.length).toBe(1);
      expect(media[0].url).toBe('/assets/images/default-profile.jpg');
      expect(media[0].type).toBe('image');
    });

    it('should handle mixed media types', () => {
      const adWithMixedMedia = {
        ...mockAds[0],
        media: [
          { url: '/assets/images/test-image-1.jpg', type: 'image' },
          { url: '/assets/videos/test-video-1.mp4', type: 'video' },
          { url: '/assets/files/test-file-1.pdf', type: 'document' }, // Unsupported type
        ],
      };

      const media = component.getCardMedia(adWithMixedMedia);

      expect(media.length).toBe(3);
      expect(media[0].type).toBe('image');
      expect(media[1].type).toBe('video');
      expect(media[2].type).toBe('image'); // Should default to image for unsupported types
    });
  });

  describe('card action handling', () => {
    beforeEach(() => {
      component.ngOnInit();
      fixture.detectChanges();
      component.currentAd = mockAds[0];
    });

    it('should handle info action', () => {
      spyOn(component, 'viewAdDetails');

      component.onCardAction({ id: 'info', itemId: '1' });

      expect(component.viewAdDetails).toHaveBeenCalled();
    });

    it('should handle chat action', () => {
      spyOn(component, 'startChat');

      component.onCardAction({ id: 'chat', itemId: '1' });

      expect(component.startChat).toHaveBeenCalled();
    });

    it('should handle unknown action', () => {
      spyOn(console, 'warn');

      component.onCardAction({ id: 'unknown', itemId: '1' });

      expect(console.warn).toHaveBeenCalledWith('Unknown action:', 'unknown');
    });

    it('should do nothing if currentAd is null', () => {
      component.currentAd = null;
      spyOn(component, 'viewAdDetails');
      spyOn(component, 'startChat');

      component.onCardAction({ id: 'info', itemId: '1' });
      component.onCardAction({ id: 'chat', itemId: '1' });

      expect(component.viewAdDetails).not.toHaveBeenCalled();
      expect(component.startChat).not.toHaveBeenCalled();
    });
  });

  describe('modal handling', () => {
    let modalElement: HTMLElement;

    beforeEach(() => {
      // Create a mock modal element
      modalElement = document.createElement('div');
      modalElement.id = 'filtersModal';
      document.body.appendChild(modalElement);

      // Spy on console.error to prevent it from cluttering the test output
      spyOn(console, 'error');
    });

    afterEach(() => {
      // Clean up
      if (modalElement && modalElement.parentNode) {
        modalElement.parentNode.removeChild(modalElement);
      }
    });

    it('should open filters modal with fallback implementation', () => {
      component.openFilters();

      expect(modalElement.classList.contains('show')).toBeTrue();
      expect(modalElement.style.display).toBe('block');
      expect(document.body.classList.contains('modal-open')).toBeTrue();

      // Check if backdrop was created
      const backdrop = document.querySelector('.modal-backdrop');
      expect(backdrop).toBeTruthy();
    });

    it('should close filters modal with fallback implementation', () => {
      // First open the modal
      component.openFilters();

      // Then close it
      component.closeFilters();

      expect(modalElement.classList.contains('show')).toBeFalse();
      expect(modalElement.style.display).toBe('none');
      expect(document.body.classList.contains('modal-open')).toBeFalse();

      // Check if backdrop was removed
      const backdrop = document.querySelector('.modal-backdrop');
      expect(backdrop).toBeFalsy();
    });

    it('should handle errors when opening modal', () => {
      // Make the modal element throw an error when classList is accessed
      Object.defineProperty(modalElement, 'classList', {
        get: () => {
          throw new Error('Test error');
        },
      });

      component.openFilters();

      expect(console.error).toHaveBeenCalled();
      expect(modalElement.style.display).toBe('block');
    });

    it('should handle errors when closing modal', () => {
      // Make the modal element throw an error when classList is accessed
      Object.defineProperty(modalElement, 'classList', {
        get: () => {
          throw new Error('Test error');
        },
      });

      component.closeFilters();

      expect(console.error).toHaveBeenCalled();
      expect(modalElement.style.display).toBe('none');
    });
  });

  describe('error handling', () => {
    it('should handle error when recording swipe', fakeAsync(() => {
      spyOn(adService, 'recordSwipe').and.returnValue(
        throwError(() => new Error('Failed to record swipe')),
      );
      spyOn(console, 'error');

      component.currentAd = mockAds[0];
      component.nextAd = mockAds[1];
      component.ads = [...mockAds];

      component.onSwipe({ direction: 'right', itemId: '1' });

      expect(console.error).toHaveBeenCalled();

      // Fast-forward time to simulate animation completion
      tick(500);

      // Should still update the UI even if the API call fails
      expect(component.ads.length).toBe(1);
      expect(component.currentAd).toBe(mockAds[1]);
    }));

    it('should handle error when starting chat', () => {
      spyOn(chatService, 'createAdRoom').and.returnValue(
        throwError(() => new Error('Failed to create chat room')),
      );
      spyOn(notificationService, 'error');
      spyOn(console, 'error');

      component.currentAd = mockAds[0];
      component.startChat();

      expect(notificationService.error).toHaveBeenCalledWith('Failed to start chat');
      expect(console.error).toHaveBeenCalled();
    });
  });
});
