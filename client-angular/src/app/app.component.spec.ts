/// <reference types="jasmine" />
import 'jasmine-core';
import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterModule } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { AvatarModule } from 'primeng/avatar';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { MenuModule } from 'primeng/menu';
import { PanelModule } from 'primeng/panel';
import { PanelMenuModule } from 'primeng/panelmenu';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { SidebarModule } from 'primeng/sidebar';
import { ToolbarModule } from 'primeng/toolbar';
import { BehaviorSubject } from 'rxjs';

// Services & Components
import { AppComponent } from './app.component';
import { ThemeService } from './core/services/theme.service';
import { type ThemeName } from './core/services/theme.service';
import { WebSocketFallbackService } from './core/services/websocket-fallback.service';

interface WebSocketFallbackServiceMethods {
  initialize: () => void;
  restoreOriginalWebSocket: () => void;
}

// Mock Navigation Component
@Component({
  selector: 'app-navigation',
  standalone: true,
  template: ''
})
class MockNavigationComponent {}

describe('AppComponent', () => {
  let component: AppComponent;
  let fixture: ComponentFixture<AppComponent>;
  let mockThemeService: jasmine.SpyObj<Partial<ThemeService>>;
  let mockWebSocketFallbackService: jasmine.SpyObj<WebSocketFallbackServiceMethods>;
  let themeSubject: BehaviorSubject<ThemeName>;

  beforeEach(async () => {
    themeSubject = new BehaviorSubject<ThemeName>('lara-light-blue');

    mockThemeService = {
      setTheme: jasmine.createSpy('setTheme'),
      getCurrentTheme: jasmine.createSpy('getCurrentTheme'),
      getDarkMode: jasmine.createSpy('getDarkMode'),
      theme$: themeSubject.asObservable(),
      isDarkMode$: new BehaviorSubject(false).asObservable(),
    };

    mockWebSocketFallbackService = {
      initialize: jasmine.createSpy('initialize'),
      restoreOriginalWebSocket: jasmine.createSpy('restoreOriginalWebSocket'),
    };

    await TestBed.configureTestingModule({
      imports: [
        RouterTestingModule,
        CommonModule,
        AvatarModule,
        ButtonModule,
        CardModule,
        MenuModule,
        PanelModule,
        PanelMenuModule,
        ProgressSpinnerModule,
        SidebarModule,
        ToolbarModule,
        MockNavigationComponent,
      ],
      providers: [
        { provide: ThemeService, useValue: mockThemeService },
        { provide: WebSocketFallbackService, useValue: mockWebSocketFallbackService },
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(AppComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the app', () => {
    expect(component).toBeDefined();
  });

  describe('initialization', () => {
    it('should initialize WebSocket fallback service', () => {
      component.ngOnInit();
      expect(mockWebSocketFallbackService.initialize).toHaveBeenCalled();
    });

    it('should initialize theme from saved preference', () => {
      (mockThemeService.getCurrentTheme as jasmine.Spy).and.returnValue('lara-dark-blue');
      component.ngOnInit();
      expect(mockThemeService.setTheme).toHaveBeenCalledWith('lara-dark-blue');
    });

    it('should handle system theme preference', () => {
      (mockThemeService.getCurrentTheme as jasmine.Spy).and.returnValue('system');
      // Mock matchMedia to simulate dark mode preference
      spyOn(window, 'matchMedia').and.returnValue({
        matches: true,
        addEventListener: jasmine.createSpy('addEventListener'),
        removeEventListener: jasmine.createSpy('removeEventListener'),
        dispatchEvent: jasmine.createSpy('dispatchEvent'),
        onchange: null,
        media: '',
        addListener: jasmine.createSpy('addListener'),
        removeListener: jasmine.createSpy('removeListener'),
      } as any);

      component.ngOnInit();
      expect(mockThemeService.setTheme).toHaveBeenCalledWith('lara-dark-blue');
    });
  });

  describe('cleanup', () => {
    it('should restore WebSocket on destroy', () => {
      component.ngOnDestroy();
      expect(mockWebSocketFallbackService.restoreOriginalWebSocket).toHaveBeenCalled();
    });
  });
});
