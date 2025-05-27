import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, of } from 'rxjs';

/**
 *
 */
@Injectable({
  providedIn: 'root',
})
export class AdminGuard {
  /**
   *
   */
  constructor(private readonly router: Router) {}

  /**
   *
   */
  canActivate(): Observable<boolean> {
    // Simplified guard - always allow for now
    return of(true);
  }
}
