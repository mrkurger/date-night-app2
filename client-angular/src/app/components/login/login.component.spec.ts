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

import { LoginComponent } from '../../features/auth/login/login.component';
import { AuthService } from '../../core/services/auth.service';
import { User, AuthResponse } from '../../core/models/user.interface';

describe('LoginComponent', () => {
  let component: LoginComponent;
  let fixture: ComponentFixture<LoginComponent>;
  let authService: jasmine.SpyObj<AuthService>;
  let router: Router;

  const mockUser: User = {
    _id: 'user123',
    id: 'user123',
    username: 'testuser',
    email: 'test@example.com',
    role: 'user',
    createdAt: new Date(),
    updatedAt: new Date()
  };

  const mockAuthResponse: AuthResponse = {
    token: 'mock-token',
    refreshToken: 'mock-refresh-token',
    expiresIn: 86400,
    user: mockUser
  };

  beforeEach(async () => {
    // Create spy for AuthService
    const authServiceSpy = jasmine.createSpyObj('AuthService', ['login']);

    await TestBed.configureTestingModule({
      imports: [
        ReactiveFormsModule,
        FormsModule,
        RouterTestingModule,
        HttpClientTestingModule,
        LoginComponent
      ],
      providers: [
        { provide: AuthService, useValue: authServiceSpy }
      ]
    }).compileComponents();

    authService = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
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
      password: 'Password123!'
    });
    
    expect(component.loginForm.valid).toBeTruthy();
  });

  it('should call AuthService.login when form is submitted', () => {
    // Setup form with valid data
    const loginData = {
      email: 'test@example.com',
      password: 'Password123!'
    };
    
    component.loginForm.patchValue(loginData);
    
    // Mock successful login
    authService.login.and.returnValue(of(mockAuthResponse));
    
    // Spy on router navigation
    spyOn(router, 'navigate');
    
    // Submit form
    component.onSubmit();
    
    // Verify service was called with correct parameters
    expect(authService.login).toHaveBeenCalledWith(loginData);
    
    // Verify navigation occurred
    expect(router.navigate).toHaveBeenCalledWith(['/browse']);
  });

  it('should display error message on login failure', () => {
    // Setup form with valid data
    component.loginForm.patchValue({
      email: 'test@example.com',
      password: 'wrongpassword'
    });
    
    // Mock failed login
    const errorResponse = { message: 'Invalid credentials' };
    authService.login.and.returnValue(throwError(() => errorResponse));
    
    // Submit form
    component.onSubmit();
    
    // Verify error is displayed
    expect(component.errorMessage).toBe('Invalid credentials');
    
    fixture.detectChanges();
    
    const compiled = fixture.nativeElement;
    expect(compiled.querySelector('.alert-danger')).toBeTruthy();
  });

  it('should disable submit button while loading', () => {
    // Setup form with valid data
    component.loginForm.patchValue({
      email: 'test@example.com',
      password: 'Password123!'
    });
    
    // Create a delayed observable to simulate network request
    authService.login.and.returnValue(new Observable(observer => {
      // This will be resolved after a delay
      setTimeout(() => {
        observer.next(mockAuthResponse);
        observer.complete();
      }, 100);
    }));
    
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