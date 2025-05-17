import { Input } from '@angular/core';
import { OnInit } from '@angular/core';
import { Component } from '@angular/core';
// ===================================================
// CUSTOMIZABLE SETTINGS IN THIS FILE
// ===================================================
// This file contains settings for component configuration (advertiser-profile.component.spec)
//
// COMMON CUSTOMIZATIONS:
// - SETTING_NAME: Description of setting (default: value)
//   Related to: other_file.ts:OTHER_SETTING
// ===================================================
import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router, convertToParamMap } from '@angular/router';
import { of, throwError } from 'rxjs';

import { AdvertiserProfileComponent } from './advertiser-profile.component';
import { AdService } from '../../core/services/ad.service';
import { AuthService } from '../../core/services/auth.service';
import { NotificationService } from '../../core/services/notification.service';

// Mock MainLayoutComponent
@Component({
  selector: 'app-main-layout',
  template: '<ng-content></ng-content>',
  standalone: true,
  imports: [ReactiveFormsModule],
})
class MockMainLayoutComponent {
  @Input() activeView: 'netflix' | 'tinder' | 'list' = 'netflix';
}

describe('AdvertiserProfileComponent', () => {
  let component: AdvertiserProfileComponent;
  let fixture: ComponentFixture<AdvertiserProfileComponent>;
  let adService: AdService;
  let authService: AuthService;
  let notificationService: NotificationService;
  let router: Router;

  // Mock data
  const mockAd = {
    _id: 'ad1',
    title: 'Test Ad',
    description: 'Test description',
    location: { city: 'Oslo', county: 'Oslo' },
    price: 100,
    category: 'Dinner',
    isTouring: false,
    tags: ['tag1', 'tag2'],
    userId: 'user1',
    advertiser: 'Test User',
    isActive: true,
    isFeatured: false,
    isTrending: false,
    viewCount: 0,
    clickCount: 0,
    inquiryCount: 0,
    media: [{ url: '/assets/images/test-image-1.jpg', type: 'image' }],
    images: ['/assets/images/test-image-1.jpg'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const mockUser = {
    _id: 'user1',
    name: 'Test User',
  };

  // Mock services
  class MockAdService {
    getAdById() {
      return of(mockAd);
    }

    updateAd() {
      return of(mockAd);
    }

    deleteAd() {
      return of({ success: true });
    }
  }

  class MockAuthService {
    currentUser$ = of(mockUser);
  }

  class MockNotificationService {
    success(message: string): void {
      // Mock success notification
      console.log('Success:', message);
    }

    error(message: string): void {
      // Mock error notification
      console.error('Error:', message);
    }
  }

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RouterTestingModule,
    ReactiveFormsModule,
    AdvertiserProfileComponent],
      declarations: [MockMainLayoutComponent],
      providers: [
        {
          provide: ActivatedRoute,
          useValue: {
            paramMap: of(convertToParamMap({ id: 'ad1' })),
          },
        },
        { provide: AdService, useClass: MockAdService },
        { provide: AuthService, useClass: MockAuthService },
        { provide: NotificationService, useClass: MockNotificationService },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(AdvertiserProfileComponent);
    component = fixture.componentInstance;
    adService = TestBed.inject(AdService);
    authService = TestBed.inject(AuthService);
    notificationService = TestBed.inject(NotificationService);
    router = TestBed.inject(Router);

    // Spy on router navigation
    spyOn(router, 'navigateByUrl').and.stub();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('initialization', () => {
    it('should load ad on init', fakeAsync(() => {
      spyOn(adService, 'getAdById').and.callThrough();

      component.ngOnInit();
      tick();

      expect(adService.getAdById).toHaveBeenCalledWith('ad1');
      expect(component.ad).toEqual(mockAd);
      expect(component.isOwner).toBeTrue();
      expect(component.loading).toBeFalse();

      // Check form values
      expect(component.adForm.value).toEqual({
        title: 'Test Ad',
        description: 'Test description',
        location: { city: 'Oslo', county: 'Oslo' },
        price: 100,
        category: 'Dinner',
        isTouring: false,
        tags: 'tag1, tag2',
      });
    }));

    it('should handle error when loading ad', fakeAsync(() => {
      spyOn(adService, 'getAdById').and.returnValue(
        throwError(() => new Error('Failed to load ad')),
      );
      spyOn(console, 'error').and.callThrough();

      component.ngOnInit();
      tick();

      expect(component.error).toBe('Failed to load ad details');
      expect(component.loading).toBeFalse();
      expect(console.error).toHaveBeenCalled();
    }));
  });

  describe('ad operations', () => {
    beforeEach(fakeAsync(() => {
      component.ngOnInit();
      tick();
    }));

    it('should toggle edit mode', () => {
      expect(component.editMode).toBeFalse();

      component.toggleEditMode();
      expect(component.editMode).toBeTrue();

      component.toggleEditMode();
      expect(component.editMode).toBeFalse();
    });

    it('should save changes when form is valid', () => {
      spyOn(adService, 'updateAd').and.callThrough();
      spyOn(notificationService, 'success').and.callThrough();

      component.toggleEditMode();
      component.adForm.patchValue({
        title: 'Updated Title',
        description: 'Updated description',
      });

      component.saveChanges();

      expect(adService.updateAd).toHaveBeenCalled();
      expect(notificationService.success).toHaveBeenCalledWith('Ad updated successfully');
      expect(component.editMode).toBeFalse();
      expect(component.loading).toBeFalse();
    });

    it('should show error when form is invalid', () => {
      spyOn(notificationService, 'error').and.callThrough();

      component.toggleEditMode();
      component.adForm.patchValue({
        title: '', // Invalid - required field
        description: 'Updated description',
      });

      component.saveChanges();

      expect(notificationService.error).toHaveBeenCalledWith(
        'Please fix the form errors before submitting',
      );
    });

    it('should cancel edit and reset form', () => {
      component.toggleEditMode();
      component.adForm.patchValue({
        title: 'Changed Title',
        description: 'Changed description',
      });

      component.cancelEdit();

      expect(component.editMode).toBeFalse();
      expect(component.adForm.value).toEqual({
        title: 'Test Ad',
        description: 'Test description',
        location: 'Oslo',
        price: 100,
        category: 'Dinner',
        isTouring: false,
        tags: 'tag1, tag2',
      });
    });

    it('should delete ad and navigate to my ads page', fakeAsync(() => {
      spyOn(window, 'confirm').and.returnValue(true);
      spyOn(adService, 'deleteAd').and.callThrough();
      spyOn(notificationService, 'success').and.callThrough();

      component.deleteAd();
      tick();

      expect(adService.deleteAd).toHaveBeenCalledWith('ad1');
      expect(notificationService.success).toHaveBeenCalledWith('Ad deleted successfully');
      expect(router.navigateByUrl).toHaveBeenCalledWith('/my-ads');
    }));

    it('should not delete ad when user cancels confirmation', () => {
      spyOn(window, 'confirm').and.returnValue(false);
      spyOn(adService, 'deleteAd').and.callThrough();

      component.deleteAd();

      expect(adService.deleteAd).not.toHaveBeenCalled();
    });

    it('should navigate to upgrade page', () => {
      component.upgradeToFeatured();

      expect(router.navigateByUrl).toHaveBeenCalledWith('/upgrade?adId=ad1');
    });
  });

  describe('utility methods', () => {
    it('should get media URL from media array', () => {
      component.ad = mockAd;

      const url = component.getMediaUrl(0);

      expect(url).toBe('/assets/images/test-image-1.jpg');
    });

    it('should get media URL from images array when media is not available', () => {
      component.ad = { ...mockAd, media: [] };

      const url = component.getMediaUrl(0);

      expect(url).toBe('/assets/images/test-image-1.jpg');
    });

    it('should return default image when no media is available', () => {
      component.ad = { ...mockAd, media: [], images: [] };

      const url = component.getMediaUrl(0);

      expect(url).toBe('/assets/images/default-profile.jpg');
    });

    it('should return default image when ad is null', () => {
      component.ad = null;

      const url = component.getMediaUrl(0);

      expect(url).toBe('/assets/images/default-profile.jpg');
    });
  });
});
