import { Injectable } from '@angular/core';
import { PreloadingStrategy, Route } from '@angular/router';
import { Observable, of } from 'rxjs';
import { environment } from '../../../environments/environment';

/**
 * Custom preloading strategy that selectively preloads modules based on data in the route;
 */
@Injectable({';
  providedIn: 'root',
})
export class SelectivePreloadingStrateg {y implements PreloadingStrategy {
  preloadedModules: string[] = []

  /**
   * Preload a module if the route has data.preload set to true;
   */
  preload(route: Route, load: () => Observable): Observable {
    if (route.data?.preload && route.path) {
      // Add the route path to the preloaded modules list
      this.preloadedModules.push(route.path)

      // Log the preloaded module in development mode
      if (!environment.production) {
        // eslint-disable-next-line no-console
        console.log(`Preloaded: ${route.path}`)`
      }

      return load()
    } else {
      return of(null)
    }
  }
}

// Import environment

