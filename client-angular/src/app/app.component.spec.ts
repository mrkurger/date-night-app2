import { OnDestroy } from '@angular/core';
import { OnInit } from '@angular/core';
import { Component } from '@angular/core';
// ===================================================
// CUSTOMIZABLE SETTINGS IN THIS FILE
// ===================================================
// This file contains tests for the app component
//
// COMMON CUSTOMIZATIONS:
// - MOCK_SERVICES: Mock service configurations
//   Related to: client-angular/src/app/core/services/*.ts
// ===================================================

import { TestBed, ComponentFixture } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { Router } from '@angular/router';
import { of, Subject } from 'rxjs';
import { AppComponent } from './app.component';
import { AuthService } from './core/services/auth.service';
import { NotificationService } from './core/services/notification.service';
import { ChatService } from './core/services/chat.service';
import { CsrfService } from './core/services/csrf.service';
import { PlatformService } from './core/services/platform.service';
import { PwaService } from './core/services/pwa.service';
import { ThemeService } from './core/services/theme.service';
import { Meta, Title } from '@angular/platform-browser';
import { NotificationComponent } from './shared/components/notification/notification.component';
import { DebugInfoComponent } from './shared/components/debug-info/debug-info.component';
// import { By } from '@angular/platform-browser'; // Unused import

/**
 * Test suite for the AppComponent
 *
 * Tests cover:
 * - Component creation
 * - Authentication state handling
 * - Initialization of services
 * - Logout functionality
 * - Meta tag and title setting
 * - User role handling
 */
describe('AppComponent', () => {
  let component: AppComponent;
  let fixture: ComponentFixture<AppComponent>;
  let mockAuthService: jasmine.SpyObj<AuthService>;
  let mockNotificationService: jasmine.SpyObj<NotificationService>;
  let mockChatService: jasmine.SpyObj<ChatService>;
  let mockCsrfService: jasmine.SpyObj<CsrfService>;
  let mockPlatformService: jasmine.SpyObj<PlatformService>;
  let mockPwaService: jasmine.SpyObj<PwaService>;
  let mockThemeService: jasmine.SpyObj<ThemeService>;
  let mockTitleService: jasmine.SpyObj<Title>;
  let mockMetaService: jasmine.SpyObj<Meta>;
  let router: Router;
  let userSubject: Subject<any>;

  beforeEach(async () => {
    // Create a subject to control the user observable
    userSubject = new Subject<any>();

    // Create mock services
    mockAuthService = jasmine.createSpyObj('AuthService', ['logout'], {
      currentUser$: userSubject.asObservable(),
    });
    mockNotificationService = jasmine.createSpyObj(
      'NotificationService',
      ['success', 'error', 'info', 'warning', 'removeToast'],
      {
        // Mock the toasts$ observable with empty array
        toasts$: of([]),
        // Mock the unreadCount$ observable
        unreadCount$: of(0),
      },
    );
    mockChatService = jasmine.createSpyObj('ChatService', ['getRooms', 'getUnreadCounts']);
    mockCsrfService = jasmine.createSpyObj('CsrfService', ['initializeCsrf']);
    mockPlatformService = jasmine.createSpyObj('PlatformService', ['runInBrowser', 'isBrowser']);
    mockPwaService = jasmine.createSpyObj('PwaService', ['checkForUpdate', 'installPwa']);
    mockThemeService = jasmine.createSpyObj('ThemeService', ['setTheme', 'toggleTheme'], {
      isDarkMode$: of(false),
      theme$: of('light'),
    });
    mockTitleService = jasmine.createSpyObj('Title', ['setTitle']);
    mockMetaService = jasmine.createSpyObj('Meta', ['addTags', 'updateTag']);

    // Configure mock behavior
    mockCsrfService.initializeCsrf.and.returnValue(of({}));
    mockChatService.getRooms.and.returnValue(of([]));
    mockChatService.getUnreadCounts.and.returnValue(
      of({
        total: 5,
        rooms: { room1: 3, room2: 2 },
      }),
    );
    mockPlatformService.runInBrowser.and.callFake((callback) => callback());
    mockPlatformService.isBrowser.and.returnValue(true);

    // Create a mock component for testing routes
    @Component({
      selector: 'app-mock-component',
      template: '<div>Mock Component</div>',
      standalone: true,
    })
    class MockComponent {}

    // Create a test component that extends AppComponent but overrides the template
    @Component({
      selector: 'app-root',
      template: '<div>Mock App Component</div>', // Simple template without aria-label attributes
      standalone: true,
    })
    class TestAppComponent extends AppComponent {
      // Inherit all functionality but use a simplified template
    }

    await TestBed.configureTestingModule({
      imports: [RouterTestingModule.withRoutes([
          { path: 'browse',
    { path: 'login',
    { path: 'dashboard']),
        TestAppComponent, // Use our test component instead of the real one
        NotificationComponent,
        DebugInfoComponent,
      ],
      providers: [
        { provide: AuthService, useValue: mockAuthService },
        { provide: NotificationService, useValue: mockNotificationService },
        { provide: ChatService, useValue: mockChatService },
        { provide: CsrfService, useValue: mockCsrfService },
        { provide: PlatformService, useValue: mockPlatformService },
        { provide: PwaService, useValue: mockPwaService },
        { provide: ThemeService, useValue: mockThemeService },
        { provide: Title, useValue: mockTitleService },
        { provide: Meta, useValue: mockMetaService },
        // Remove the Router provider since RouterTestingModule provides it
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(TestAppComponent);
    component = fixture.componentInstance;
    router = TestBed.inject(Router);
    spyOn(router, 'navigate');
  });

  it('should create the app', () => {
    expect(component).toBeTruthy();
  });

  it('should set page title and meta tags on initialization', () => {
    fixture.detectChanges();
    expect(mockTitleService.setTitle).toHaveBeenCalledWith(
      'Date Night App - Find Your Perfect Match',
    );
    expect(mockMetaService.addTags).toHaveBeenCalled();

    // Verify specific meta tags
    const metaTags = mockMetaService.addTags.calls.first().args[0];
    expect(metaTags).toContain(
      jasmine.objectContaining({
        name: 'description',
        content:
          'Date Night App helps you find your perfect match for a memorable date night experience.',
      }),
    );
    expect(metaTags).toContain(
      jasmine.objectContaining({
        property: 'og:title',
        content: 'Date Night App - Find Your Perfect Match',
      }),
    );
  });

  it('should initialize CSRF protection on init', () => {
    fixture.detectChanges();
    expect(mockCsrfService.initializeCsrf).toHaveBeenCalled();
  });

  it('should update authentication state when user changes', () => {
    fixture.detectChanges();

    // Initially not authenticated
    expect(component.isAuthenticated).toBeFalse();
    expect(component.isAdvertiser).toBeFalse();

    // Emit a user with advertiser role
    const mockUser = {
      username: 'testuser',
      role: 'advertiser',
      id: '123',
    };
    userSubject.next(mockUser);
    fixture.detectChanges();

    // Should update authentication state
    expect(component.isAuthenticated).toBeTrue();
    expect(component.isAdvertiser).toBeTrue();
    expect(component.username).toBe('testuser');

    // Should initialize chat
    expect(mockChatService.getRooms).toHaveBeenCalled();
  });

  it('should handle user with non-advertiser role correctly', () => {
    fixture.detectChanges();

    // Emit a user with regular role
    const mockUser = {
      username: 'regularuser',
      role: 'user',
      id: '456',
    };
    userSubject.next(mockUser);
    fixture.detectChanges();

    // Should update authentication state
    expect(component.isAuthenticated).toBeTrue();
    expect(component.isAdvertiser).toBeFalse();
    expect(component.username).toBe('regularuser');
  });

  it('should handle admin role as advertiser', () => {
    fixture.detectChanges();

    // Emit a user with admin role
    const mockUser = {
      username: 'adminuser',
      role: 'admin',
      id: '789',
    };
    userSubject.next(mockUser);
    fixture.detectChanges();

    // Admin should be treated as advertiser
    expect(component.isAuthenticated).toBeTrue();
    expect(component.isAdvertiser).toBeTrue();
  });

  it('should handle logout correctly', () => {
    // Setup authenticated state first
    userSubject.next({ username: 'testuser', role: 'user' });
    fixture.detectChanges();

    // Call logout method
    component.logout();

    // Verify service calls
    expect(mockAuthService.logout).toHaveBeenCalled();
    expect(router.navigate).toHaveBeenCalledWith(['/auth/login']);
    expect(mockNotificationService.success).toHaveBeenCalledWith(
      'You have been logged out successfully',
    );

    // Verify counters are reset
    expect(component.unreadMessages).toBe(0);
    expect(component.notificationCount).toBe(0);
  });

  it('should unsubscribe from all subscriptions on destroy', () => {
    // Setup spies on subscription unsubscribe methods
    const authSpy = spyOn(component['authSubscription'], 'unsubscribe');
    const chatSpy = spyOn(component['chatSubscription'], 'unsubscribe');
    const notificationSpy = spyOn(component['notificationSubscription'], 'unsubscribe');
    const themeSpy = spyOn(component['themeSubscription'], 'unsubscribe');

    // Trigger ngOnDestroy
    component.ngOnDestroy();

    // Verify all unsubscribe methods were called
    expect(authSpy).toHaveBeenCalled();
    expect(chatSpy).toHaveBeenCalled();
    expect(notificationSpy).toHaveBeenCalled();
    expect(themeSpy).toHaveBeenCalled();
  });

  it('should add theme-transition class to body on init', () => {
    // Create a spy on the renderer addClass method
    const addClassSpy = spyOn(component['renderer'], 'addClass');

    // Call ngOnInit
    component.ngOnInit();

    // Verify addClass was called with the body element and theme-transition class
    expect(addClassSpy).toHaveBeenCalledWith(component['document'].body, 'theme-transition');
  });
});
