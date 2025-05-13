// ===================================================
// CUSTOMIZABLE SETTINGS IN THIS FILE
// ===================================================
// This file contains tests for the login component
//
// COMMON CUSTOMIZATIONS:
// - MOCK_AUTH_SERVICE: Mock authentication service configuration
//   Related to: client-angular/src/app/core/services/auth.service.ts
// ===================================================

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { RouterTestingModule } from '@angular/router/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { CommonModule } from '@angular/common';

// Nebular imports
import {
  NbThemeModule,
  NbCardModule,
  NbFormFieldModule,
  NbInputModule,
  NbButtonModule,
  NbIconModule,
  NbSpinnerModule,
  NbTooltipModule,
} from '@nebular/theme';
import { NbEvaIconsModule } from '@nebular/eva-icons';
import { NbAuthService, NbAuthResult } from '@nebular/auth';

import { LoginComponent } from '../../features/auth/login/login.component';
import { UserService } from '../../core/services/user.service';
import { AuthService } from '../../core/services/auth.service';
import { User } from '../../core/models/user.interface';

describe('LoginComponent', () => {
  let component: LoginComponent;
  let fixture: ComponentFixture<LoginComponent>;
  let userService: jasmine.SpyObj<UserService>;
  let authService: jasmine.SpyObj<AuthService>;
  let nbAuthService: jasmine.SpyObj<NbAuthService>;
  let router: Router;

  const mockUser: User = {
    _id: 'user123',
    id: 'user123',
    username: 'testuser',
    email: 'test@example.com',
    roles: ['user'],
    status: 'active',
    createdAt: new Date(),
  };

  const mockAuthResponse = {
    token: 'mock-token',
    refreshToken: 'mock-refresh-token',
    expiresIn: 86400,
    user: mockUser,
  };

  beforeEach(async () => {
    // Create spies for services
    const userServiceSpy = jasmine.createSpyObj<UserService>('UserService', [
      'login',
      'isAuthenticated',
    ]);
    userServiceSpy.isAuthenticated.and.returnValue(false); // Default to not authenticated

    const authServiceSpy = jasmine.createSpyObj<AuthService>('AuthService', [
      'login',
      'isAuthenticated',
    ]);
    authServiceSpy.isAuthenticated.and.returnValue(false);

    const nbAuthServiceSpy = jasmine.createSpyObj<NbAuthService>('NbAuthService', ['authenticate']);

    await TestBed.configureTestingModule({
      imports: [ReactiveFormsModule,
    FormsModule,
    RouterTestingModule.withRoutes([
          { path: 'browse',
    { path: 'dashboard']),
        HttpClientTestingModule,
        BrowserAnimationsModule,
        NbThemeModule.forRoot(),
        NbCardModule,
        NbFormFieldModule,
        NbInputModule,
        NbButtonModule,
        NbIconModule,
        NbSpinnerModule,
        NbTooltipModule,
        NbEvaIconsModule,
        CommonModule,
      ],
      providers: [
        { provide: UserService, useValue: userServiceSpy },
        { provide: AuthService, useValue: authServiceSpy },
        { provide: NbAuthService, useValue: nbAuthServiceSpy },
        LoginComponent,
      ],
    }).compileComponents();

    userService = TestBed.inject(UserService) as jasmine.SpyObj<UserService>;
    authService = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
    nbAuthService = TestBed.inject(NbAuthService) as jasmine.SpyObj<NbAuthService>;
    router = TestBed.inject(Router);
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize the login form with empty fields', () => {
    expect(component.loginForm).toBeDefined();
    expect(component.loginForm.get('email')?.value).toBe('');
    expect(component.loginForm.get('password')?.value).toBe('');
  });

  it('should mark form as invalid when empty', () => {
    expect(component.loginForm.valid).toBeFalsy();
  });

  it('should mark form as valid when all fields are filled', () => {
    component.loginForm.patchValue({
      email: 'test@example.com',
      password: 'Password123!',
    });

    expect(component.loginForm.valid).toBeTruthy();
  });

  it('should call UserService.login when form is submitted', () => {
    // Setup form with valid data
    const loginData = {
      email: 'test@example.com',
      password: 'Password123!',
    };

    component.loginForm.patchValue(loginData);

    // Mock successful login
    userService.login.and.returnValue(of(mockAuthResponse));

    // Spy on router navigation
    spyOn(router, 'navigate');

    // Submit form
    component.onSubmit();

    // Verify service was called with correct parameters
    expect(userService.login).toHaveBeenCalledWith(loginData);

    // Verify navigation occurred
    expect(router.navigate).toHaveBeenCalledWith(['/dashboard']);
  });

  it('should display error message on login failure', () => {
    // Setup form with valid data
    component.loginForm.patchValue({
      email: 'test@example.com',
      password: 'wrongpassword',
    });

    // Mock failed login
    const errorResponse = new Error('Invalid credentials');
    userService.login.and.returnValue(throwError(() => errorResponse));

    // Submit form
    component.onSubmit();

    // Verify error is displayed
    expect(component.errorMessage).toBe('Invalid credentials');

    fixture.detectChanges();

    const compiled = fixture.nativeElement;
    expect(compiled.querySelector('.error-message')).toBeTruthy();
  });

  it('should handle social login', () => {
    // Mock successful social login
    const mockAuthResult = {
      isSuccess: () => true,
      getRedirect: () => '/dashboard',
      getErrors: () => [],
    } as NbAuthResult;

    nbAuthService.authenticate.and.returnValue(of(mockAuthResult));

    // Spy on router navigation
    spyOn(router, 'navigateByUrl');

    // Call social login
    component.socialLogin('google');

    // Verify service was called
    expect(nbAuthService.authenticate).toHaveBeenCalledWith('google');

    // Verify navigation occurred
    expect(router.navigateByUrl).toHaveBeenCalledWith('/dashboard');
    expect(component.isLoading).toBeFalse();
  });

  it('should handle social login failure', () => {
    // Mock failed social login
    const mockAuthResult = {
      isSuccess: () => false,
      getRedirect: () => null,
      getErrors: () => ['Authentication failed'],
    } as NbAuthResult;

    nbAuthService.authenticate.and.returnValue(of(mockAuthResult));

    // Call social login
    component.socialLogin('facebook');

    // Verify service was called
    expect(nbAuthService.authenticate).toHaveBeenCalledWith('facebook');

    // Verify error message is set
    expect(component.errorMessage).toBe('Authentication failed');
    expect(component.isLoading).toBeFalse();
  });
});
