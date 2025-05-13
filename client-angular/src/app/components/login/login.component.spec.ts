import { Input } from '@angular/core';
import { Component } from '@angular/core';
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

import { LoginComponent } from '../../features/auth/login/login.component';
import { UserService } from '../../core/services/user.service';
import { User, AuthResponse } from '../../core/models/user.interface';

// Add custom matchers
declare global {
  namespace jasmine {
    interface Matchers<T> {
      toBeTruthy(): boolean;
      toBeFalsy(): boolean;
      toBeDefined(): boolean;
      toBe(expected: any): boolean;
      toHaveBeenCalledWith(...params: any[]): boolean;
    }
  }
}

describe('LoginComponent', () => {
  let component: LoginComponent;
  let fixture: ComponentFixture<LoginComponent>;
  let userService: jasmine.SpyObj<UserService>;
  let router: Router;

  const mockUser: User = {
    _id: 'user123',
    id: 'user123',
    username: 'testuser',
    email: 'test@example.com',
    role: 'user',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockAuthResponse: AuthResponse = {
    token: 'mock-token',
    refreshToken: 'mock-refresh-token',
    expiresIn: 86400,
    user: mockUser,
  };

  beforeEach(async () => {
    // Create spy for UserService
    const userServiceSpy = jasmine.createSpyObj<UserService>('UserService', [
      'login',
      'isAuthenticated',
    ]);
    userServiceSpy.isAuthenticated.and.returnValue(false); // Default to not authenticated

    await TestBed.configureTestingModule({
      imports: [
        ReactiveFormsModule,
        FormsModule,
        RouterTestingModule.withRoutes([
          { path: 'browse', component: LoginComponent },
          { path: 'dashboard', component: LoginComponent },
        ]),
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
        LoginComponent,
        CommonModule,
      ],
      providers: [{ provide: UserService, useValue: userServiceSpy }],
    }).compileComponents();

    userService = TestBed.inject(UserService) as jasmine.SpyObj<UserService>;
    router = TestBed.inject(Router);
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    (expect(component) as any).toBeTruthy();
  });

  it('should initialize the login form with empty fields', () => {
    (expect(component.loginForm) as any).toBeDefined();
    (expect(component.loginForm.get('email')?.value) as any).toBe('');
    (expect(component.loginForm.get('password')?.value) as any).toBe('');
  });

  it('should mark form as invalid when empty', () => {
    (expect(component.loginForm.valid) as any).toBeFalsy();
  });

  it('should mark form as valid when all fields are filled', () => {
    component.loginForm.patchValue({
      email: 'test@example.com',
      password: 'Password123!',
    });

    (expect(component.loginForm.valid) as any).toBeTruthy();
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
    (expect(userService.login) as any).toHaveBeenCalledWith(loginData);

    // Verify navigation occurred
    (expect(router.navigate) as any).toHaveBeenCalledWith(['/dashboard']);
  });

  it('should display error message on login failure', () => {
    // Setup form with valid data
    component.loginForm.patchValue({
      email: 'test@example.com',
      password: 'wrongpassword',
    });

    // Mock failed login
    const errorResponse = { message: 'Invalid credentials' };
    userService.login.and.returnValue(throwError(() => errorResponse));

    // Submit form
    component.onSubmit();

    // Verify error is displayed
    (expect(component.errorMessage) as any).toBe('Invalid credentials');

    fixture.detectChanges();

    const compiled = fixture.nativeElement;
    (expect(compiled.querySelector('.error-message')) as any).toBeTruthy();
  });
});
