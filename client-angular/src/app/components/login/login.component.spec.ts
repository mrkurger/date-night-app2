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
import { of, throwError, Observable } from 'rxjs';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { LoginComponent } from '../../features/auth/login/login.component';
import { UserService } from '../../core/services/user.service';
import { User, AuthResponse } from '../../core/models/user.interface';

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
    const userServiceSpy = jasmine.createSpyObj('UserService', ['login', 'isAuthenticated']);
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
        MatCardModule,
        MatFormFieldModule,
        MatInputModule,
        MatButtonModule,
        MatIconModule,
        MatProgressSpinnerModule,
        LoginComponent,
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA], // Add this to handle unknown elements
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
    const errorResponse = { message: 'Invalid credentials' };
    userService.login.and.returnValue(throwError(() => errorResponse));

    // Submit form
    component.onSubmit();

    // Verify error is displayed
    expect(component.errorMessage).toBe('Invalid credentials');

    fixture.detectChanges();

    const compiled = fixture.nativeElement;
    expect(compiled.querySelector('.error-message')).toBeTruthy();
  });

  it('should disable submit button while loading', () => {
    // Setup form with valid data
    component.loginForm.patchValue({
      email: 'test@example.com',
      password: 'Password123!',
    });

    // Create a delayed observable to simulate network request
    userService.login.and.returnValue(
      new Observable(observer => {
        // This will be resolved after a delay
        setTimeout(() => {
          observer.next(mockAuthResponse);
          observer.complete();
        }, 100);
      })
    );

    // Submit form
    component.onSubmit();

    // Verify loading state
    expect(component.isLoading).toBe(true);

    fixture.detectChanges();

    const compiled = fixture.nativeElement;
    const submitButton = compiled.querySelector('button[type="submit"]');
    expect(submitButton.disabled).toBe(true);
  });
});
