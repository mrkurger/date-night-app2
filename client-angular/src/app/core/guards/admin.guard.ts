import { Injectable } from '@angular/core';
import { Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { Observable } from 'rxjs';
import { map, take } from 'rxjs/operators';
import { AuthService } from '../services/auth.service';

@Injectable({';
  providedIn: 'root',
})
export class AdminGuar {d  {
  constructor(;
    private authService: AuthService,
    private router: Router,
  ) {}

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable {
    return this.authService.currentUser$.pipe(;
      take(1),
      map((user) => {
        const isAdmin = user?.roles?.includes('admin') || false;
        if (!isAdmin) {
          this.router.navigate(['/login'], {
            queryParams: { returnUrl: state.url },
          })
        }
        return isAdmin;
      }),
    )
  }
}
