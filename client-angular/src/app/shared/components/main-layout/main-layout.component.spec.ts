import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { of, BehaviorSubject } from 'rxjs';
import { MainLayoutComponent } from './main-layout.component';
import { AuthService } from '../../../core/services/auth.service';
import { AdService } from '../../../core/services/ad.service';
import { ThemeService } from '../../../core/services/theme.service';
import { EmeraldToggleComponent } from '../../emerald/components/toggle/toggle.component';
import { ThemeToggleComponent } from '../theme-toggle/theme-toggle.component';

describe('MainLayoutComponent', () => {
  let component: MainLayoutComponent;
  let fixture: ComponentFixture<MainLayoutComponent>;
  let authServiceMock: jasmine.SpyObj<AuthService>;
  let adServiceMock: jasmine.SpyObj<AdService>;
  let themeServiceMock: jasmine.SpyObj<ThemeService>;
  let isDarkModeMock: BehaviorSubject<boolean>;
  let themeMock: BehaviorSubject<'light' | 'dark' | 'system'>;
  let localStorageSpy: jasmine.Spy;
  let matchMediaSpy: jasmine.Spy;

  beforeEach(async () => {
    // Create mock services
    authServiceMock = jasmine.createSpyObj('AuthService', [], {
      currentUser$: of(null),
    });

    adServiceMock = jasmine.createSpyObj('AdService', ['getFeaturedAds']);
    adServiceMock.getFeaturedAds.and.returnValue(of([]));

    // Create mock observables for ThemeService
    isDarkModeMock = new BehaviorSubject<boolean>(false);
    themeMock = new BehaviorSubject<'light' | 'dark' | 'system'>('light');

    // Create ThemeService mock
    themeServiceMock = jasmine.createSpyObj('ThemeService', ['setTheme', 'toggleTheme']);

    // Set up mock observables
    Object.defineProperty(themeServiceMock, 'isDarkMode$', {
      get: () => isDarkModeMock.asObservable(),
    });

    Object.defineProperty(themeServiceMock, 'theme$', {
      get: () => themeMock.asObservable(),
    });

    // Spy on localStorage
    localStorageSpy = spyOn(localStorage, 'getItem').and.returnValue(null);
    spyOn(localStorage, 'setItem');

    // Spy on matchMedia
    matchMediaSpy = spyOn(window, 'matchMedia').and.returnValue({
      matches: false,
      addEventListener: jasmine.createSpy(),
      removeEventListener: jasmine.createSpy(),
      dispatchEvent: jasmine.createSpy(),
      onchange: null,
      media: '',
      addListener: jasmine.createSpy(),
      removeListener: jasmine.createSpy(),
    } as any);

    await TestBed.configureTestingModule({
      imports: [
        RouterTestingModule,
        MainLayoutComponent,
        EmeraldToggleComponent,
        ThemeToggleComponent,
      ],
      providers: [
        { provide: AuthService, useValue: authServiceMock },
        { provide: AdService, useValue: adServiceMock },
        { provide: ThemeService, useValue: themeServiceMock },
      ],
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
      const mockAds = [
        { id: '1', title: 'Ad 1', media: [{ url: 'url1' }] },
        { id: '2', title: 'Ad 2', images: ['url2'] },
        { id: '3', title: 'Ad 3' },
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
      expect(component.getMediaUrl(adWithoutMedia as any)).toBe(
        '/assets/images/default-profile.jpg'
      );
    });
  });
});
