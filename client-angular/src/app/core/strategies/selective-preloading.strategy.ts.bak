import { Injectable } from '@angular/core';
import { PreloadingStrategy, Route } from '@angular/router';
import { Observable, of } from 'rxjs';

/**
 * Custom preloading strategy that selectively preloads modules based on data in the route
 */
@Injectable({
  providedIn: 'root',
})
export class SelectivePreloadingStrategy implements PreloadingStrategy {
  preloadedModules: string[] = [];

  /**
   * Preload a module if the route has data.preload set to true
   */
  preload(route: Route, load: () => Observable<any>): Observable<any> {
    if (route.data?.preload && route.path) {
      // Add the route path to the preloaded modules list
      this.preloadedModules.push(route.path);

      // Log the preloaded module in development mode
      if (!environment.production) {
        console.log(`Preloaded: ${route.path}`);
      }

      return load();
    } else {
      return of(null);
    }
  }
}

// Import environment
import { environment } from '../../../environments/environment';
