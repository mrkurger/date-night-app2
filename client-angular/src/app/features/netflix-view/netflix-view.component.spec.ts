import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { of, throwError } from 'rxjs';

import { NetflixViewComponent } from './netflix-view.component';
import { AdService } from '../../core/services/ad.service';
import { NotificationService } from '../../core/services/notification.service';
import { ChatService } from '../../core/services/chat.service';
import { AuthService } from '../../core/services/auth.service';
import { MainLayoutComponent } from '../../shared/components/main-layout/main-layout.component';

// Import Emerald components
import { 
  AppCardComponent, 
  CardGridComponent, 
  PageHeaderComponent,
  SkeletonLoaderComponent,
  LabelComponent,
  FloatingActionButtonComponent,
  ToggleComponent
} from '../../shared/emerald';

// Mock data
const mockAds = [
  {
    _id: '1',
    title: 'Test Ad 1',
    description: 'This is a test ad description',
    shortDescription: 'Short description',
    location: 'Oslo',
    advertiserName: 'Test Advertiser',
    advertiserImage: '/assets/images/default-profile.jpg',
    isAdvertiserOnline: true,
    images: ['/assets/images/test-image-1.jpg'],
    tags: ['Tag1', 'Tag2', 'Tag3'],
    createdAt: new Date().toISOString(),
    isTouring: false
  },
  {
    _id: '2',
    title: 'Test Ad 2',
    description: 'This is another test ad description',
    location: 'Bergen',
    advertiserName: 'Test Advertiser 2',
    advertiserImage: '/assets/images/default-profile.jpg',
    isAdvertiserOnline: false,
    images: ['/assets/images/test-image-2.jpg'],
    tags: ['Tag4', 'Tag5'],
    createdAt: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
    isTouring: true
  }
];

// Mock services
class MockAdService {
  getFeaturedAds() {
    return of(mockAds.slice(0, 1));
  }
  
  getTrendingAds() {
    return of(mockAds);
  }
  
  getAds() {
    return of(mockAds);
  }
  
  recordSwipe(adId: string, direction: string) {
    return of({ success: true });
  }
}

class MockNotificationService {
  success(message: string) {}
  error(message: string) {}
}

class MockChatService {
  createAdRoom(adId: string) {
    return of({ _id: 'chat-room-1' });
  }
}

class MockAuthService {
  currentUser$ = of({ _id: 'user-1', name: 'Test User' });
}

describe('NetflixViewComponent', () => {
  let component: NetflixViewComponent;
  let fixture: ComponentFixture<NetflixViewComponent>;
  let adService: AdService;
  let notificationService: NotificationService;
  let chatService: ChatService;
  let authService: AuthService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        RouterTestingModule,
        ReactiveFormsModule,
        NetflixViewComponent
      ],
      providers: [
        { provide: AdService, useClass: MockAdService },
        { provide: NotificationService, useClass: MockNotificationService },
        { provide: ChatService, useClass: MockChatService },
        { provide: AuthService, useClass: MockAuthService }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(NetflixViewComponent);
    component = fixture.componentInstance;
    adService = TestBed.inject(AdService);
    notificationService = TestBed.inject(NotificationService);
    chatService = TestBed.inject(ChatService);
    authService = TestBed.inject(AuthService);
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('Initialization', () => {
    it('should load ads on init', fakeAsync(() => {
      spyOn(adService, 'getFeaturedAds').and.callThrough();
      spyOn(adService, 'getTrendingAds').and.callThrough();
      spyOn(adService, 'getAds').and.callThrough();
      
      component.ngOnInit();
      tick();
      
      expect(adService.getFeaturedAds).toHaveBeenCalled();
      expect(adService.getTrendingAds).toHaveBeenCalled();
      expect(adService.getAds).toHaveBeenCalled();
      expect(component.loading).toBeFalse();
      expect(component.error).toBeNull();
      expect(component.featuredAd).toBeTruthy();
      expect(component.adsByCategory['Featured']).toBeTruthy();
      expect(component.adsByCategory['Most Popular']).toBeTruthy();
      expect(component.adsByCategory['New Arrivals']).toBeTruthy();
      expect(component.adsByCategory['Nearby']).toBeTruthy();
      expect(component.adsByCategory['Touring']).toBeTruthy();
    }));

    it('should check authentication status on init', fakeAsync(() => {
      spyOn(authService.currentUser$, 'subscribe').and.callThrough();
      
      component.ngOnInit();
      tick();
      
      expect(authService.currentUser$.subscribe).toHaveBeenCalled();
      expect(component.isAuthenticated).toBeTrue();
    }));

    it('should handle error when loading featured ads fails', fakeAsync(() => {
      spyOn(adService, 'getFeaturedAds').and.returnValue(throwError(() => new Error('Failed to load featured ads')));
      spyOn(adService, 'getTrendingAds').and.callThrough();
      spyOn(adService, 'getAds').and.callThrough();
      spyOn(console, 'error').and.callThrough();
      
      component.ngOnInit();
      tick();
      
      expect(adService.getFeaturedAds).toHaveBeenCalled();
      expect(console.error).toHaveBeenCalledWith('Error loading featured ads:', jasmine.any(Error));
      expect(adService.getTrendingAds).toHaveBeenCalled();
      expect(component.adsByCategory['Featured']).toEqual([]);
    }));
  });

  describe('User Interactions', () => {
    beforeEach(() => {
      component.ngOnInit();
      fixture.detectChanges();
    });

    it('should navigate to ad details when viewAdDetails is called', () => {
      spyOn(window.location, 'href', 'set');
      
      component.viewAdDetails('1');
      
      expect(window.location.href).toBe('/ad-details/1');
    });

    it('should like an ad when likeAd is called', () => {
      spyOn(adService, 'recordSwipe').and.callThrough();
      spyOn(notificationService, 'success').and.callThrough();
      
      component.likeAd('1');
      
      expect(adService.recordSwipe).toHaveBeenCalledWith('1', 'right');
      expect(notificationService.success).toHaveBeenCalledWith('Added to your favorites');
    });

    it('should show error notification when liking ad without authentication', () => {
      component.isAuthenticated = false;
      spyOn(notificationService, 'error').and.callThrough();
      
      component.likeAd('1');
      
      expect(notificationService.error).toHaveBeenCalledWith('Please log in to like ads');
    });

    it('should start chat when startChat is called', () => {
      spyOn(chatService, 'createAdRoom').and.callThrough();
      spyOn(window.location, 'href', 'set');
      
      component.startChat('1');
      
      expect(chatService.createAdRoom).toHaveBeenCalledWith('1');
      expect(window.location.href).toBe('/chat/chat-room-1');
    });

    it('should show error notification when starting chat without authentication', () => {
      component.isAuthenticated = false;
      spyOn(notificationService, 'error').and.callThrough();
      
      component.startChat('1');
      
      expect(notificationService.error).toHaveBeenCalledWith('Please log in to start a chat');
    });

    it('should handle hero actions correctly', () => {
      spyOn(component, 'viewAdDetails').and.callThrough();
      spyOn(component, 'likeAd').and.callThrough();
      spyOn(component, 'startChat').and.callThrough();
      
      component.onHeroAction({ id: 'view' }, '1');
      expect(component.viewAdDetails).toHaveBeenCalledWith('1');
      
      component.onHeroAction({ id: 'favorite' }, '1');
      expect(component.likeAd).toHaveBeenCalledWith('1');
      
      component.onHeroAction({ id: 'chat' }, '1');
      expect(component.startChat).toHaveBeenCalledWith('1');
    });

    it('should handle card actions correctly', () => {
      spyOn(component, 'viewAdDetails').and.callThrough();
      spyOn(component, 'likeAd').and.callThrough();
      spyOn(component, 'startChat').and.callThrough();
      
      component.onCardAction({ id: 'view' }, '1');
      expect(component.viewAdDetails).toHaveBeenCalledWith('1');
      
      component.onCardAction({ id: 'favorite' }, '1');
      expect(component.likeAd).toHaveBeenCalledWith('1');
      
      component.onCardAction({ id: 'chat' }, '1');
      expect(component.startChat).toHaveBeenCalledWith('1');
    });

    it('should use itemId from event if available', () => {
      spyOn(component, 'viewAdDetails').and.callThrough();
      
      component.onCardAction({ id: 'view', itemId: '2' }, '1');
      expect(component.viewAdDetails).toHaveBeenCalledWith('2');
    });
  });

  describe('Filter Functionality', () => {
    beforeEach(() => {
      component.ngOnInit();
      fixture.detectChanges();
    });

    it('should apply filters when applyFilters is called', () => {
      spyOn(component, 'loadAds').and.callThrough();
      spyOn(notificationService, 'success').and.callThrough();
      
      component.applyFilters();
      
      expect(component.loadAds).toHaveBeenCalled();
      expect(notificationService.success).toHaveBeenCalledWith('Filters applied');
    });

    it('should reset filters when resetFilters is called', () => {
      component.filterForm.setValue({
        category: 'Escort',
        location: 'Oslo',
        touringOnly: true
      });
      
      spyOn(component, 'applyFilters').and.callThrough();
      
      component.resetFilters();
      
      expect(component.filterForm.value).toEqual({
        category: '',
        location: '',
        touringOnly: false
      });
      expect(component.applyFilters).toHaveBeenCalled();
    });
  });

  describe('Helper Methods', () => {
    it('should return correct media URL', () => {
      const ad = mockAds[0];
      expect(component.getMediaUrl(ad)).toBe('/assets/images/test-image-1.jpg');
      
      const adWithoutImages = { ...ad, images: [] };
      expect(component.getMediaUrl(adWithoutImages)).toBe('/assets/images/default-profile.jpg');
    });

    it('should shuffle array correctly', () => {
      // This is a bit tricky to test since shuffling is random
      // We'll just check that the array length remains the same
      const original = [1, 2, 3, 4, 5];
      const shuffled = component['shuffleArray'](original);
      
      expect(shuffled.length).toBe(original.length);
      expect(shuffled).not.toEqual(original); // This might occasionally fail due to randomness
      expect(shuffled.sort()).toEqual(original.sort());
    });
  });
});