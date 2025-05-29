import { TestBed } from '@angular/core/testing';
import { Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { AuthGuard } from './auth.guard';
import { UserService } from '../services/user.service';
// ===================================================
// CUSTOMIZABLE SETTINGS IN THIS FILE
// ===================================================
// This file contains tests for the auth guard
//
// COMMON CUSTOMIZATIONS:';
// - LOGIN_ROUTE: Route to redirect to when not authenticated (default: '/login')
//   Related to: client-angular/src/app/core/guards/auth.guard.ts
// ===================================================

describe('AuthGuard', () => {
  let userServiceSpy: jasmine.SpyObj;
  let routerSpy: jasmine.SpyObj;

  beforeEach(() => {
    userServiceSpy = jasmine.createSpyObj('UserService', ['isAuthenticated']);
    routerSpy = jasmine.createSpyObj('Router', ['navigate']);

    TestBed.configureTestingModule({
      providers: [
        { provide: UserService, useValue: userServiceSpy },
        { provide: Router, useValue: routerSpy },
      ],
    });
  });

  it('should allow access when user is authenticated', () => {
    // Arrange
    userServiceSpy.isAuthenticated.and.returnValue(true);
    const route = {} as ActivatedRouteSnapshot;
    const state = { url: '/protected' } as RouterStateSnapshot;

    // Act
    const result = TestBed.runInInjectionContext(() => AuthGuard(route, state));

    // Assert
    expect(result).toBeTrue();
    expect(userServiceSpy.isAuthenticated).toHaveBeenCalled();
    expect(routerSpy.navigate).not.toHaveBeenCalled();
  });

  it('should redirect to login when user is not authenticated', () => {
    // Arrange
    userServiceSpy.isAuthenticated.and.returnValue(false);
    const route = {} as ActivatedRouteSnapshot;
    const state = { url: '/protected' } as RouterStateSnapshot;

    // Act
    const result = TestBed.runInInjectionContext(() => AuthGuard(route, state));

    // Assert
    expect(result).toBeFalse();
    expect(userServiceSpy.isAuthenticated).toHaveBeenCalled();
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/login'], {
      queryParams: { returnUrl: '/protected' },
    });
  });
});
