import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { RouterTestingModule } from '@angular/router/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { AuthResponse } from '../../../core/models/user.interface';

// Material Modules
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatRadioModule } from '@angular/material/radio';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { RegisterComponent } from './register.component';
import { UserService } from '../../../core/services/user.service';

describe('RegisterComponent', () => {
  let component: RegisterComponent;
  let fixture: ComponentFixture<RegisterComponent>;
  let userService: jasmine.SpyObj<UserService>;
  let router: Router;

  beforeEach(async () => {
    const userServiceSpy = jasmine.createSpyObj('UserService', ['register', 'isAuthenticated']);

    await TestBed.configureTestingModule({
      declarations: [RegisterComponent],
      imports: [
        ReactiveFormsModule,
        FormsModule,
        RouterTestingModule,
        HttpClientTestingModule,
        BrowserAnimationsModule,
        MatCardModule,
        MatFormFieldModule,
        MatInputModule,
        MatButtonModule,
        MatIconModule,
        MatCheckboxModule,
        MatRadioModule,
        MatProgressSpinnerModule
      ],
      providers: [
        { provide: UserService, useValue: userServiceSpy }
      ]
    }).compileComponents();

    userService = TestBed.inject(UserService) as jasmine.SpyObj<UserService>;
    router = TestBed.inject(Router);
  });

  beforeEach(() => {
    userService.isAuthenticated.and.returnValue(false);
    fixture = TestBed.createComponent(RegisterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize the form with required fields', () => {
    expect(component.registerForm).toBeDefined();
    expect(component.registerForm.get('username')).toBeDefined();
    expect(component.registerForm.get('email')).toBeDefined();
    expect(component.registerForm.get('password')).toBeDefined();
    expect(component.registerForm.get('confirmPassword')).toBeDefined();
    expect(component.registerForm.get('role')).toBeDefined();
    expect(component.registerForm.get('termsAccepted')).toBeDefined();
  });

  it('should redirect to dashboard if already authenticated', () => {
    spyOn(router, 'navigate');
    userService.isAuthenticated.and.returnValue(true);
    
    component.ngOnInit();
    
    expect(router.navigate).toHaveBeenCalledWith(['/dashboard']);
  });

  it('should validate form correctly', () => {
    const form = component.registerForm;
    
    // Form should be invalid initially
    expect(form.valid).toBeFalsy();
    
    // Fill in valid data
    form.patchValue({
      username: 'testuser',
      email: 'test@example.com',
      password: 'password123',
      confirmPassword: 'password123',
      role: 'user',
      termsAccepted: true
    });
    
    expect(form.valid).toBeTruthy();
    
    // Test password mismatch validation
    form.patchValue({
      confirmPassword: 'different'
    });
    
    expect(form.valid).toBeFalsy();
    expect(form.get('confirmPassword')?.hasError('passwordMismatch')).toBeTruthy();
  });

  it('should not submit if form is invalid', () => {
    spyOn(component, 'onSubmit').and.callThrough();
    
    const mockAuthResponse: AuthResponse = {
      token: 'mock-token',
      user: {
        _id: 'user123',
        username: 'testuser',
        email: 'test@example.com',
        role: 'user',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    };
    userService.register.and.returnValue(of(mockAuthResponse));
    
    // Trigger submit with invalid form
    component.onSubmit();
    
    expect(userService.register).not.toHaveBeenCalled();
  });

  it('should submit form and navigate to dashboard on success', () => {
    spyOn(router, 'navigate');
    
    const mockAuthResponse: AuthResponse = {
      token: 'mock-token',
      user: {
        _id: 'user123',
        username: 'testuser',
        email: 'test@example.com',
        role: 'user',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    };
    userService.register.and.returnValue(of(mockAuthResponse));
    
    // Fill in valid form data
    component.registerForm.patchValue({
      username: 'testuser',
      email: 'test@example.com',
      password: 'password123',
      confirmPassword: 'password123',
      role: 'user',
      termsAccepted: true
    });
    
    // Submit the form
    component.onSubmit();
    
    expect(userService.register).toHaveBeenCalledWith({
      username: 'testuser',
      email: 'test@example.com',
      password: 'password123',
      role: 'user'
    });
    
    expect(router.navigate).toHaveBeenCalledWith(['/dashboard']);
    expect(component.isLoading).toBeFalse();
  });

  it('should handle registration error', () => {
    const errorMessage = 'Registration failed';
    userService.register.and.returnValue(throwError(() => ({ message: errorMessage })));
    
    // Fill in valid form data
    component.registerForm.patchValue({
      username: 'testuser',
      email: 'test@example.com',
      password: 'password123',
      confirmPassword: 'password123',
      role: 'user',
      termsAccepted: true
    });
    
    // Submit the form
    component.onSubmit();
    
    expect(component.errorMessage).toBe(errorMessage);
    expect(component.isLoading).toBeFalse();
  });

  it('should toggle password visibility', () => {
    expect(component.hidePassword).toBeTrue();
    
    // Simulate clicking the password visibility toggle
    component.hidePassword = !component.hidePassword;
    
    expect(component.hidePassword).toBeFalse();
  });
});