import { Injectable } from '@angular/core';
import { Router, ActivatedRouteSnapshot } from '@angular/router';
import { map, Observable } from 'rxjs';
import { AuthService } from '../services/auth.service';

/**
 *
 */
@Injectable({
  providedIn: 'root',
})
export class RoleGuard {
  /**
   *
   */
  constructor(
    private readonly auth: AuthService,
    private readonly router: Router,
  ) {}

  /**
   *
   */
  canActivate(route: ActivatedRouteSnapshot): Observable<boolean> {
    const requiredRoles = route.data['roles'] as Array<string>;

    return this.auth.currentUser$.pipe(
      map((user) => {
        if (!user) {
          this.router.navigate(['/auth/login']);
          return false;
        }

        // Check if user has any of the required roles
        if (requiredRoles && requiredRoles.length > 0) {
          const hasRole = requiredRoles.some((role) => user.roles?.includes(role));
          if (!hasRole) {
            this.router.navigate(['/']);
            return false;
          }
        }

        return true;
      }),
    );
  }
}
