// ===================================================
// CUSTOMIZABLE SETTINGS IN THIS FILE
// ===================================================
// This file contains tests for the admin guard
//
// COMMON CUSTOMIZATIONS:
// - LOGIN_ROUTE: Route to redirect to when not an admin (default: '/login')
//   Related to: client-angular/src/app/core/guards/admin.guard.ts
// ===================================================

import { TestBed } from '@angular/core/testing';
import { Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { BehaviorSubject } from 'rxjs';
import { AdminGuard } from './admin.guard';
import { AuthService } from '../services/auth.service';
import { User } from '../models/user.interface';

describe('AdminGuard', () => {
  let guard: AdminGuard;
  let authServiceSpy: jasmine.SpyObj<AuthService>;
  let routerSpy: jasmine.SpyObj<Router>;
  let userSubject: BehaviorSubject<User | null>;

  beforeEach(() => {
    userSubject = new BehaviorSubject<User | null>(null);

    authServiceSpy = jasmine.createSpyObj('AuthService', [], {
      currentUser$: userSubject.asObservable(),
    });

    routerSpy = jasmine.createSpyObj('Router', ['navigate']);

    TestBed.configureTestingModule({
      providers: [
        AdminGuard,
        { provide: AuthService, useValue: authServiceSpy },
        { provide: Router, useValue: routerSpy },
      ],
    });

    guard = TestBed.inject(AdminGuard);
  });

  it('should be created', () => {
    expect(guard).toBeTruthy();
  });

  it('should redirect to login when user is not authenticated', (done) => {
    // Arrange
    userSubject.next(null);
    const route = {} as ActivatedRouteSnapshot;
    const state = { url: '/admin/dashboard' } as RouterStateSnapshot;

    // Act
    guard.canActivate(route, state).subscribe((result) => {
      // Assert
      expect(result).toBeFalse();
      expect(routerSpy.navigate).toHaveBeenCalledWith(['/login'], {
        queryParams: { returnUrl: '/admin/dashboard' },
      });
      done();
    });
  });

  it('should allow access when user is an admin', (done) => {
    // Arrange
    const mockUser: User = {
      id: '123',
      _id: '123',
      username: 'admin',
      email: 'admin@example.com',
      roles: ['admin'],
      status: 'active',
      createdAt: new Date(),
    };
    userSubject.next(mockUser);

    const route = {} as ActivatedRouteSnapshot;
    const state = { url: '/admin/dashboard' } as RouterStateSnapshot;

    // Act
    guard.canActivate(route, state).subscribe((result) => {
      // Assert
      expect(result).toBeTrue();
      expect(routerSpy.navigate).not.toHaveBeenCalled();
      done();
    });
  });

  it('should redirect to login when user is not an admin', (done) => {
    // Arrange
    const mockUser: User = {
      id: '123',
      _id: '123',
      username: 'user',
      email: 'user@example.com',
      roles: ['user'],
      status: 'active',
      createdAt: new Date(),
    };
    userSubject.next(mockUser);

    const route = {} as ActivatedRouteSnapshot;
    const state = { url: '/admin/dashboard' } as RouterStateSnapshot;

    // Act
    guard.canActivate(route, state).subscribe((result) => {
      // Assert
      expect(result).toBeFalse();
      expect(routerSpy.navigate).toHaveBeenCalledWith(['/login'], {
        queryParams: { returnUrl: '/admin/dashboard' },
      });
      done();
    });
  });

  it('should handle user with no roles property', (done) => {
    // Arrange
    const mockUser = {
      id: '123',
      _id: '123',
      username: 'user',
      email: 'user@example.com',
      status: 'active',
      createdAt: new Date(),
    } as User;
    userSubject.next(mockUser);

    const route = {} as ActivatedRouteSnapshot;
    const state = { url: '/admin/dashboard' } as RouterStateSnapshot;

    // Act
    guard.canActivate(route, state).subscribe((result) => {
      // Assert
      expect(result).toBeFalse();
      expect(routerSpy.navigate).toHaveBeenCalledWith(['/login'], {
        queryParams: { returnUrl: '/admin/dashboard' },
      });
      done();
    });
  });
});
