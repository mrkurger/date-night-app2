// ===================================================
// CUSTOMIZABLE SETTINGS IN THIS FILE
// ===================================================
// This file contains tests for the app component
// 
// COMMON CUSTOMIZATIONS:
// - MOCK_SERVICES: Mock service configurations
//   Related to: client-angular/src/app/core/services/*.ts
// ===================================================

import { TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { of } from 'rxjs';
import { AppComponent } from './app.component';
import { AuthService } from './core/services/auth.service';
import { NotificationService } from './core/services/notification.service';
import { ChatService } from './core/services/chat.service';
import { CsrfService } from './core/services/csrf.service';
import { PlatformService } from './core/services/platform.service';
import { PwaService } from './core/services/pwa.service';
import { Meta, Title } from '@angular/platform-browser';
import { NotificationComponent } from './shared/components/notification/notification.component';
import { DebugInfoComponent } from './shared/components/debug-info/debug-info.component';

describe('AppComponent', () => {
  let mockAuthService: jasmine.SpyObj<AuthService>;
  let mockNotificationService: jasmine.SpyObj<NotificationService>;
  let mockChatService: jasmine.SpyObj<ChatService>;
  let mockCsrfService: jasmine.SpyObj<CsrfService>;
  let mockPlatformService: jasmine.SpyObj<PlatformService>;
  let mockPwaService: jasmine.SpyObj<PwaService>;
  let mockTitleService: jasmine.SpyObj<Title>;
  let mockMetaService: jasmine.SpyObj<Meta>;

  beforeEach(async () => {
    // Create mock services
    mockAuthService = jasmine.createSpyObj('AuthService', ['logout'], {
      currentUser$: of(null)
    });
    mockNotificationService = jasmine.createSpyObj('NotificationService', ['success']);
    mockChatService = jasmine.createSpyObj('ChatService', ['getRooms']);
    mockCsrfService = jasmine.createSpyObj('CsrfService', ['initializeCsrf']);
    mockPlatformService = jasmine.createSpyObj('PlatformService', ['runInBrowser']);
    mockPwaService = jasmine.createSpyObj('PwaService', ['checkForUpdate']);
    mockTitleService = jasmine.createSpyObj('Title', ['setTitle']);
    mockMetaService = jasmine.createSpyObj('Meta', ['addTags']);

    // Configure mock behavior
    mockCsrfService.initializeCsrf.and.returnValue(of({}));
    mockChatService.getRooms.and.returnValue(of([]));
    mockPlatformService.runInBrowser.and.callFake((callback) => callback());

    await TestBed.configureTestingModule({
      imports: [
        RouterTestingModule,
        AppComponent,
        NotificationComponent,
        DebugInfoComponent
      ],
      providers: [
        { provide: AuthService, useValue: mockAuthService },
        { provide: NotificationService, useValue: mockNotificationService },
        { provide: ChatService, useValue: mockChatService },
        { provide: CsrfService, useValue: mockCsrfService },
        { provide: PlatformService, useValue: mockPlatformService },
        { provide: PwaService, useValue: mockPwaService },
        { provide: Title, useValue: mockTitleService },
        { provide: Meta, useValue: mockMetaService }
      ]
    }).compileComponents();
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });

  it('should set page title and meta tags on initialization', () => {
    TestBed.createComponent(AppComponent);
    expect(mockTitleService.setTitle).toHaveBeenCalledWith('Date Night App - Find Your Perfect Match');
    expect(mockMetaService.addTags).toHaveBeenCalled();
  });

  it('should handle logout correctly', () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;
    
    // Call logout method
    app.logout();
    
    // Verify service calls
    expect(mockAuthService.logout).toHaveBeenCalled();
    expect(mockNotificationService.success).toHaveBeenCalledWith('You have been logged out successfully');
    
    // Verify counters are reset
    expect(app.unreadMessages).toBe(0);
    expect(app.notificationCount).toBe(0);
  });
});
