// ===================================================
// CUSTOMIZABLE SETTINGS IN THIS FILE
// ===================================================
// This file contains tests for the login component
// 
// COMMON CUSTOMIZATIONS:
// - MOCK_AUTH_SERVICE: Mock authentication service configuration
//   Related to: client-angular/src/app/services/auth.service.ts
// ===================================================

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { RouterTestingModule } from '@angular/router/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { Router } from '@angular/router';
import { of, throwError } from 'rxjs';

import { LoginComponent } from './login.component';
import { AuthService } from '../../services/auth.service';

describe('LoginComponent', () => {
  let component: LoginComponent;
  let fixture: ComponentFixture<LoginComponent>;
  let authService: jasmine.SpyObj<AuthService>;
  let router: Router;

  const mockUser = {
    _id: 'user123',
    username: 'testuser',
    email: 'test@example.com',
    firstName: 'Test',
    lastName: 'User'
  };

  const mockAuthResponse = {
    user: mockUser,
    accessToken: 'mock-access-token',
    refreshToken: 'mock-refresh-token'
  };

  beforeEach(async () => {
    // Create spy for AuthService
    const authServiceSpy = jasmine.createSpyObj('AuthService', ['login']);

    await TestBed.configureTestingModule({
      declarations: [LoginComponent],
      imports: [
        ReactiveFormsModule,
        FormsModule,
        RouterTestingModule,
        HttpClientTestingModule
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
    expect(component.loginForm.get('username')?.value).toBe('');
    expect(component.loginForm.get('password')?.value).toBe('');
  });

  it('should mark form as invalid when empty', () => {
    expect(component.loginForm.valid).toBeFalsy();
  });

  it('should mark form as valid when all fields are filled', () => {
    component.loginForm.patchValue({
      username: 'testuser',
      password: 'Password123!'
    });
    
    expect(component.loginForm.valid).toBeTruthy();
  });

  it('should show validation errors when username is empty', () => {
    const usernameControl = component.loginForm.get('username');
    usernameControl?.setValue('');
    usernameControl?.markAsTouched();
    
    fixture.detectChanges();
    
    const compiled = fixture.nativeElement;
    expect(compiled.querySelector('.username-error')).toBeTruthy();
  });

  it('should show validation errors when password is empty', () => {
    const passwordControl = component.loginForm.get('password');
    passwordControl?.setValue('');
    passwordControl?.markAsTouched();
    
    fixture.detectChanges();
    
    const compiled = fixture.nativeElement;
    expect(compiled.querySelector('.password-error')).toBeTruthy();
  });

  it('should call AuthService.login when form is submitted', () => {
    // Setup form with valid data
    component.loginForm.patchValue({
      username: 'testuser',
      password: 'Password123!'
    });
    
    // Mock successful login
    authService.login.and.returnValue(of(mockAuthResponse));
    
    // Spy on router navigation
    spyOn(router, 'navigate');
    
    // Submit form
    component.onSubmit();
    
    // Verify service was called with correct parameters
    expect(authService.login).toHaveBeenCalledWith('testuser', 'Password123!');
    
    // Verify navigation occurred
    expect(router.navigate).toHaveBeenCalledWith(['/dashboard']);
  });

  it('should display error message on login failure', () => {
    // Setup form with valid data
    component.loginForm.patchValue({
      username: 'testuser',
      password: 'wrongpassword'
    });
    
    // Mock failed login
    const errorResponse = { status: 401, message: 'Invalid credentials' };
    authService.login.and.returnValue(throwError(() => errorResponse));
    
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
      username: 'testuser',
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