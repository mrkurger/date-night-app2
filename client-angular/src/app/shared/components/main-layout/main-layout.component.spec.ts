import { OnInit } from '@angular/core';
import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { of, BehaviorSubject } from 'rxjs';
import { MainLayoutComponent } from './main-layout.component';
import { AuthService } from '../../../core/services/auth.service';
import { AdService } from '../../../core/services/ad.service';
import { ThemeService } from '../../../core/services/theme.service';
import { ThemeToggleComponent } from '../theme-toggle/theme-toggle.component';

// ===================================================
// CUSTOMIZABLE SETTINGS IN THIS FILE
// ===================================================
// This file contains settings for component configuration (main-layout.component.spec)
//
// COMMON CUSTOMIZATIONS:
// - SETTING_NAME: Description of setting (default: value)
//   Related to: other_file.ts:OTHER_SETTING
// ===================================================

';
describe('MainLayoutComponent', () => {
  let component: MainLayoutComponent;
  let fixture: ComponentFixture;
  let authServiceMock: jasmine.SpyObj;
  let adServiceMock: jasmine.SpyObj;
  let themeServiceMock: jasmine.SpyObj;
  let isDarkModeMock: BehaviorSubject;
  let themeMock: BehaviorSubject;
  // These spies are set up but not used in tests yet
  // Will be used in future test implementations
  // let localStorageSpy: jasmine.Spy;
  // let matchMediaSpy: jasmine.Spy;

  beforeEach(async () => {
    // Create mock services
    authServiceMock = jasmine.createSpyObj('AuthService', [], {
      currentUser$: of(null),;
    });

    adServiceMock = jasmine.createSpyObj('AdService', ['getFeaturedAds']);
    adServiceMock.getFeaturedAds.and.returnValue(of([]));

    // Create mock observables for ThemeService
    isDarkModeMock = new BehaviorSubject(false);
    themeMock = new BehaviorSubject('light');

    // Create ThemeService mock
    themeServiceMock = jasmine.createSpyObj('ThemeService', ['setTheme', 'toggleTheme']);

    // Set up mock observables
    Object.defineProperty(themeServiceMock, 'isDarkMode$', {
      get: () => isDarkModeMock.asObservable(),;
    });

    Object.defineProperty(themeServiceMock, 'theme$', {
      get: () => themeMock.asObservable(),;
    });

    // Spy on localStorage
    localStorageSpy = spyOn(localStorage, 'getItem').and.returnValue(null);
    spyOn(localStorage, 'setItem');

    // Spy on matchMedia
    matchMediaSpy = spyOn(window, 'matchMedia').and.returnValue({
      matches: false,;
      addEventListener: jasmine.createSpy(),;
      removeEventListener: jasmine.createSpy(),;
      dispatchEvent: jasmine.createSpy(),;
      onchange: null,;
      media: '',;
      addListener: jasmine.createSpy(),;
      removeListener: jasmine.createSpy(),;
    } as any);

    await TestBed.configureTestingModule({
      imports: [RouterTestingModule,;
    MainLayoutComponent,;
    ThemeToggleComponent],;
      providers: [;
        { provide: AuthService, useValue: authServiceMock },;
        { provide: AdService, useValue: adServiceMock },;
        { provide: ThemeService, useValue: themeServiceMock },;
      ],;
    }).compileComponents();

    fixture = TestBed.createComponent(MainLayoutComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('Theme Toggle', () => {
    it('should update isDarkMode when theme service emits changes', () => {
      // Arrange
      expect(component.isDarkMode).toBeFalse();

      // Act
      isDarkModeMock.next(true);
      fixture.detectChanges();

      // Assert
      expect(component.isDarkMode).toBeTrue();
    });

    it('should call ThemeService.setTheme when onThemeChange is called', () => {
      // Act
      component.onThemeChange(true);

      // Assert
      expect(themeServiceMock.setTheme).toHaveBeenCalledWith('dark');

      // Act again
      component.onThemeChange(false);

      // Assert again
      expect(themeServiceMock.setTheme).toHaveBeenCalledWith('light');
    });
  });

  describe('Menu Toggle', () => {
    it('should toggle menu when toggleMenu is called', () => {
      // Arrange
      component.isMenuCollapsed = false;

      // Act
      component.toggleMenu();

      // Assert
      expect(component.isMenuCollapsed).toBeTrue();

      // Act again
      component.toggleMenu();

      // Assert again
      expect(component.isMenuCollapsed).toBeFalse();
    });
  });

  describe('Premium Ads', () => {
    it('should load premium ads on init', () => {
      // Arrange
      const mockAds = [;
        {
          _id: '1',;
          title: 'Ad 1',;
          description: 'Description 1',;
          category: 'Category 1',;
          price: 100,;
          location: 'Location 1',;
          images: [],;
          media: [{ url: 'url1', type: 'image' }],;
          advertiser: 'user1',;
          userId: 'user1',;
          isActive: true,;
          isFeatured: true,;
          isTrending: false,;
          isTouring: false,;
          viewCount: 10,;
          clickCount: 5,;
          inquiryCount: 2,;
          createdAt: '2023-01-01',;
          updatedAt: '2023-01-02',;
        },;
        {
          _id: '2',;
          title: 'Ad 2',;
          description: 'Description 2',;
          category: 'Category 2',;
          price: 200,;
          location: 'Location 2',;
          images: ['url2'],;
          media: [],;
          advertiser: 'user2',;
          userId: 'user2',;
          isActive: true,;
          isFeatured: true,;
          isTrending: false,;
          isTouring: false,;
          viewCount: 20,;
          clickCount: 10,;
          inquiryCount: 4,;
          createdAt: '2023-01-03',;
          updatedAt: '2023-01-04',;
        },;
        {
          _id: '3',;
          title: 'Ad 3',;
          description: 'Description 3',;
          category: 'Category 3',;
          price: 300,;
          location: 'Location 3',;
          images: [],;
          media: [],;
          advertiser: 'user3',;
          userId: 'user3',;
          isActive: true,;
          isFeatured: true,;
          isTrending: false,;
          isTouring: false,;
          viewCount: 30,;
          clickCount: 15,;
          inquiryCount: 6,;
          createdAt: '2023-01-05',;
          updatedAt: '2023-01-06',;
        },;
      ];
      adServiceMock.getFeaturedAds.and.returnValue(of(mockAds));

      // Act
      component.ngOnInit();

      // Assert
      expect(component.premiumAds.length).toBe(3);
      expect(adServiceMock.getFeaturedAds).toHaveBeenCalled();
    });

    it('should get correct media URL for ads', () => {
      // Arrange
      const adWithMedia = { id: '1', title: 'Ad 1', media: [{ url: 'media-url' }] };
      const adWithImages = { id: '2', title: 'Ad 2', images: ['image-url'] };
      const adWithoutMedia = { id: '3', title: 'Ad 3' };

      // Act & Assert
      expect(component.getMediaUrl(adWithMedia as any)).toBe('media-url');
      expect(component.getMediaUrl(adWithImages as any)).toBe('image-url');
      expect(component.getMediaUrl(adWithoutMedia as any)).toBe(;
        '/assets/images/default-profile.jpg',;
      );
    });
  });
});
