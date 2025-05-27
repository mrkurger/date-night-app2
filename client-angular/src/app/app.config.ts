import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { ApplicationConfig, importProvidersFrom } from '@angular/core';
import { provideAnimations } from '@angular/platform-browser/animations';
import { provideRouter, withPreloading } from '@angular/router';
import { provideServiceWorker } from '@angular/service-worker';
import Aura from '@primeng/themes/aura';
import { SocketIoModule } from 'ngx-socket-io';
import { providePrimeNG } from 'primeng/config';

import { routes } from './app.routes';
import { socketConfig } from './core/config/socket.config';
import { CoreModule } from './core/core.module';
import { authInterceptor } from './core/interceptors/auth.interceptor';
import { cspInterceptor } from './core/interceptors/csp.interceptor';
import { httpErrorInterceptor } from './core/interceptors/http-error.interceptor';
import { SelectivePreloadingStrategy } from './core/strategies/selective-preloading.strategy';
import { NebularModule } from './shared/nebular.module';
// ===================================================
// CUSTOMIZABLE SETTINGS IN THIS FILE
// ===================================================
// This file contains settings for configuration settings (app.config)
//
// COMMON CUSTOMIZATIONS:
// - SETTING_NAME: Description of setting (default: value)
//   Related to: other_file.ts:OTHER_SETTING
// ===================================================

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes, withPreloading(SelectivePreloadingStrategy)),
    provideHttpClient(withInterceptors([authInterceptor, cspInterceptor, httpErrorInterceptor])),
    provideAnimations(),
    provideServiceWorker('ngsw-worker.js', {
      enabled: false, // Disable in development mode to prevent 404 errors
      registrationStrategy: 'registerWhenStable:30000',
    }),
    providePrimeNG({
      theme: {
        preset: Aura,
        options: {
          darkMode: false, // Configure as needed
        },
      },
      ripple: true, // Enable ripple effect globally
    }),
    importProvidersFrom(CoreModule, NebularModule, SocketIoModule.forRoot(socketConfig)),
  ],
};
