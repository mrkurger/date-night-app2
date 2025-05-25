import { Input } from '@angular/core';
import {
  NbCardModule,
  NbButtonModule,
  NbInputModule,
  NbFormFieldModule,
  NbIconModule,
  NbSpinnerModule,
  NbAlertModule,
  NbTooltipModule,
  NbLayoutModule,
  NbBadgeModule,
  NbTagModule,
  NbSelectModule
} from '@nebular/theme';

import { OnInit } from '@angular/core';
import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { Router } from '@angular/router';
import { of, throwError } from 'rxjs';

import { LoginComponent } from './login.component';
import { UserService } from '@core/services/user.service';
import { AuthResponse } from '@core/models/auth.model';
import { createSpyObject } from '../../../testing/test-utils';

describe('LoginComponent', () => {
  let component: LoginComponent;
  let fixture: ComponentFixture<LoginComponent>;
  let userService: jasmine.SpyObj<UserService>;
  let router: Router;

  const mockAuthResponse: AuthResponse = {
    token: 'mock-token',
    refreshToken: 'mock-refresh-token',
    expiresIn: 3600,
    user: {
      _id: '1',
      username: 'testuser',
      email: 'test@example.com',
      role: 'user',
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  };

  beforeEach(async () => {
    userService = createSpyObject({
      login: of(mockAuthResponse),
      isAuthenticated: false,
    });

    await TestBed.configureTestingModule({
      imports: [
        RouterTestingModule,
        ReactiveFormsModule,
        BrowserAnimationsModule,
        NbCardModule,
        NbFormFieldModule,
        NbInputModule,
        NbButtonModule,
        NbIconModule,
        NbSpinnerModule,
        NbTooltipModule,
      ],
      declarations: [],
      providers: [{ provide: UserService, useValue: userService }],
    }).compileComponents();

    router = TestBed.inject(Router);
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).not.toBeNull();
  });

  it('should initialize the form with empty email and password', () => {
    const emailControl = component.loginForm.get('email');
    const passwordControl = component.loginForm.get('password');
    expect(emailControl?.value).toBe('');
    expect(passwordControl?.value).toBe('');
  });

  it('should show validation errors when form is submitted with empty fields', () => {
    component.onSubmit();
    fixture.detectChanges();

    const emailField = fixture.nativeElement.querySelector('input[type="email"]');
    const passwordField = fixture.nativeElement.querySelector('input[type="password"]');

    expect(emailField.getAttribute('status')).toBe('danger');
    expect(passwordField.getAttribute('status')).toBe('danger');
  });

  it('should call login service and navigate on successful login', () => {
    const testCredentials = {
      email: 'test@example.com',
      password: 'password123',
    };

    userService.login.and.returnValue(of(mockAuthResponse));
    const navigateSpy = spyOn(router, 'navigate');

    component.loginForm.patchValue(testCredentials);
    component.onSubmit();

    expect(userService.login).toHaveBeenCalledWith(testCredentials);
    expect(navigateSpy).toHaveBeenCalledWith(['/dashboard']);
  });

  it('should show error message on login failure', () => {
    const errorMessage = 'Invalid credentials';
    userService.login.and.returnValue(throwError(() => new Error(errorMessage)));

    component.loginForm.patchValue({
      email: 'test@example.com',
      password: 'wrongpassword',
    });
    component.onSubmit();
    fixture.detectChanges();

    const errorElement = fixture.nativeElement.querySelector('.error-message');
    expect(errorElement.textContent).toContain(errorMessage);
  });

  it('should toggle password visibility', () => {
    const passwordField = fixture.nativeElement.querySelector('input[formControlName="password"]');
    const toggleButton = fixture.nativeElement.querySelector('nb-icon[nbPrefix]');

    expect(passwordField.type).toBe('password');
    toggleButton.click();
    fixture.detectChanges();
    expect(passwordField.type).toBe('text');
  });

  it('should redirect to dashboard if already authenticated', () => {
    userService.isAuthenticated.and.returnValue(true);
    const navigateSpy = spyOn(router, 'navigate');

    component.ngOnInit();

    expect(navigateSpy).toHaveBeenCalledWith(['/dashboard']);
  });

  it('should disable submit button while loading', () => {
    userService.login.and.returnValue(of(mockAuthResponse));

    component.loginForm.patchValue({
      email: 'test@example.com',
      password: 'password123',
    });

    component.onSubmit();
    fixture.detectChanges();

    const submitButton = fixture.nativeElement.querySelector('button[type="submit"]');
    expect(submitButton.disabled).toBe(true);
  });
});
