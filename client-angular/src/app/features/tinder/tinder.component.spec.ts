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
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { CommonModule } from '@angular/common';

// Import testing utilities
import { expect } from '@jest/globals';

import { TinderComponent } from './tinder.component';
import { AdService, GetAdsResponse } from '../../core/services/ad.service';
import { NotificationService } from '../../core/services/notification.service';
import { ChatService } from '../../core/services/chat.service';
import { AuthService } from '../../core/services/auth.service';
import { Ad } from '../../core/models/ad.interface';

// Import our Nebular-based components
import { TinderCardComponent } from '../../shared/components/tinder-card/tinder-card.component';
import { FloatingActionButtonComponent } from '../../shared/components/floating-action-button/floating-action-button.component';
import { SkeletonLoaderComponent } from '../../shared/components/skeleton-loader/skeleton-loader.component';
import { ToggleComponent } from '../../shared/components/toggle/toggle.component';

// Mock MainLayoutComponent
@Component({
  selector: 'app-main-layout',
  template: '<ng-content></ng-content>',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
})
class MockMainLayoutComponent {
  @Input() activeView: 'netflix' | 'tinder' | 'list' = 'tinder';
}

// Mock data
const mockAds: Ad[] = [
  {
    _id: 'ad1',
    title: 'Test Ad 1',
    description: 'Test description 1',
    price: 100,
    location: {
      city: 'Oslo',
      county: 'Oslo',
    },
    category: 'Dinner',
    media: [{ url: '/assets/images/test-image-1.jpg', type: 'image' }],
    images: ['/assets/images/test-image-1.jpg'],
    advertiser: {
      _id: 'user1',
      username: 'Test User 1',
      profileImage: '/assets/images/default-profile.jpg',
    },
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
    _id: 'ad2',
    title: 'Test Ad 2',
    description: 'Test description 2',
    price: 200,
    location: {
      city: 'Bergen',
      county: 'Vestland',
    },
    category: 'Activity',
    media: [{ url: '/assets/images/test-image-2.jpg', type: 'image' }],
    images: ['/assets/images/test-image-2.jpg'],
    advertiser: {
      _id: 'user2',
      username: 'Test User 2',
      profileImage: '/assets/images/default-profile.jpg',
    },
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
  getAds() {
    return of({ ads: mockAds, total: mockAds.length } as GetAdsResponse);
  }
  recordSwipe() {
    return of(undefined);
  }
  likeAd() {
    return of(undefined);
  }
  dislikeAd() {
    return of(undefined);
  }
  superlikeAd() {
    return of(undefined);
  }
  getCounties() {
    return of(['Oslo', 'Vestland']);
  }
}

class MockNotificationService {
  success() {}
  error() {}
}

class MockChatService {
  startChat() {
    return of(undefined);
  }
}

class MockAuthService {
  currentUser$ = of(null);
}

describe('TinderComponent', () => {
  let component: TinderComponent;
  let fixture: ComponentFixture<TinderComponent>;
  let adService: AdService;
  let notificationService: NotificationService;
  let chatService: ChatService;
  let authService: AuthService;
  let router: Router;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        RouterTestingModule,
        ReactiveFormsModule,
        FormsModule,
        TinderComponent,
        TinderCardComponent,
        FloatingActionButtonComponent,
        SkeletonLoaderComponent,
        ToggleComponent,
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

  it('should load ads on init', fakeAsync(() => {
    spyOn(adService, 'getAds').and.returnValue(of({ ads: mockAds, total: mockAds.length }));
    component.ngOnInit();
    tick();

    expect(component.ads).toEqual(mockAds);
    expect(component.currentAd).toEqual(mockAds[0]);
    expect(component.nextAd).toEqual(mockAds[1]);
    expect(component.loading).toBeFalsy();
  }));

  it('should handle like action', fakeAsync(() => {
    spyOn(adService, 'likeAd').and.returnValue(of(undefined));
    spyOn(notificationService, 'success');
    component.ads = [...mockAds];
    component.currentAd = mockAds[0];
    component.nextAd = mockAds[1];

    const adId = typeof mockAds[0]._id === 'string' ? mockAds[0]._id : mockAds[0]._id.city;
    component.onCardAction({ action: 'like', itemId: adId });
    tick(300);

    expect(adService.likeAd).toHaveBeenCalledWith(adId);
    expect(notificationService.success).toHaveBeenCalled();
    expect(component.currentAd).toEqual(mockAds[1]);
    expect(component.nextAd).toBeNull();
  }));

  // Add more tests as needed...
});
