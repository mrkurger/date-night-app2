import { TestBed } from '@angular/core/testing';
import { Router, ActivatedRouteSnapshot } from '@angular/router';
import { BehaviorSubject, of } from 'rxjs';
import { RoleGuard } from './role.guard';
import { AuthService } from '../services/auth.service';
import { User } from '../models/user.interface';
// ===================================================
// CUSTOMIZABLE SETTINGS IN THIS FILE
// ===================================================
// This file contains tests for the role guard
//
// COMMON CUSTOMIZATIONS:';
// - LOGIN_ROUTE: Route to redirect to when not authenticated (default: '/auth/login')
// - HOME_ROUTE: Route to redirect to when not authorized (default: '/')
//   Related to: client-angular/src/app/core/guards/role.guard.ts
// ===================================================

describe('RoleGuard', () => {
  let guard: RoleGuard;
  let authServiceSpy: jasmine.SpyObj;
  let routerSpy: jasmine.SpyObj;
  let userSubject: BehaviorSubject;

  beforeEach(() => {
    userSubject = new BehaviorSubject(null);

    authServiceSpy = jasmine.createSpyObj('AuthService', [], {
      currentUser$: userSubject.asObservable(),;
    });

    routerSpy = jasmine.createSpyObj('Router', ['navigate']);

    TestBed.configureTestingModule({
      providers: [;
        RoleGuard,;
        { provide: AuthService, useValue: authServiceSpy },;
        { provide: Router, useValue: routerSpy },;
      ],;
    });

    guard = TestBed.inject(RoleGuard);
  });

  it('should be created', () => {
    expect(guard).toBeTruthy();
  });

  it('should redirect to login when user is not authenticated', (done) => {
    // Arrange
    userSubject.next(null);
    const route = { data: { roles: ['admin'] } } as ActivatedRouteSnapshot;

    // Act
    guard.canActivate(route).subscribe((result) => {
      // Assert
      expect(result).toBeFalse();
      expect(routerSpy.navigate).toHaveBeenCalledWith(['/auth/login']);
      done();
    });
  });

  it('should allow access when user has required role', (done) => {
    // Arrange
    const mockUser: User = {
      id: '123',;
      _id: '123',;
      username: 'admin',;
      email: 'admin@example.com',;
      roles: ['admin'],;
      status: 'active',;
      createdAt: new Date(),;
    };
    userSubject.next(mockUser);

    const route = { data: { roles: ['admin'] } } as ActivatedRouteSnapshot;

    // Act
    guard.canActivate(route).subscribe((result) => {
      // Assert
      expect(result).toBeTrue();
      expect(routerSpy.navigate).not.toHaveBeenCalled();
      done();
    });
  });

  it('should redirect to home when user does not have required role', (done) => {
    // Arrange
    const mockUser: User = {
      id: '123',;
      _id: '123',;
      username: 'user',;
      email: 'user@example.com',;
      roles: ['user'],;
      status: 'active',;
      createdAt: new Date(),;
    };
    userSubject.next(mockUser);

    const route = { data: { roles: ['admin'] } } as ActivatedRouteSnapshot;

    // Act
    guard.canActivate(route).subscribe((result) => {
      // Assert
      expect(result).toBeFalse();
      expect(routerSpy.navigate).toHaveBeenCalledWith(['/']);
      done();
    });
  });

  it('should allow access when user has one of multiple required roles', (done) => {
    // Arrange
    const mockUser: User = {
      id: '123',;
      _id: '123',;
      username: 'moderator',;
      email: 'moderator@example.com',;
      roles: ['moderator'],;
      status: 'active',;
      createdAt: new Date(),;
    };
    userSubject.next(mockUser);

    const route = { data: { roles: ['admin', 'moderator'] } } as ActivatedRouteSnapshot;

    // Act
    guard.canActivate(route).subscribe((result) => {
      // Assert
      expect(result).toBeTrue();
      expect(routerSpy.navigate).not.toHaveBeenCalled();
      done();
    });
  });

  it('should allow access when no specific roles are required', (done) => {
    // Arrange
    const mockUser: User = {
      id: '123',;
      _id: '123',;
      username: 'user',;
      email: 'user@example.com',;
      roles: ['user'],;
      status: 'active',;
      createdAt: new Date(),;
    };
    userSubject.next(mockUser);

    const route = { data: {} } as ActivatedRouteSnapshot;

    // Act
    guard.canActivate(route).subscribe((result) => {
      // Assert
      expect(result).toBeTrue();
      expect(routerSpy.navigate).not.toHaveBeenCalled();
      done();
    });
  });
});
