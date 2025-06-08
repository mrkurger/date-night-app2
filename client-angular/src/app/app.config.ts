// ===================================================
// CUSTOMIZABLE SETTINGS IN THIS FILE
// ===================================================
// This file contains settings for configuration settings (app.config)
//
// COMMON CUSTOMIZATIONS:
// - SETTING_NAME: Description of setting (default: value)
//   Related to: other_file.ts:OTHER_SETTING
// ===================================================
import { ApplicationConfig, importProvidersFrom } from '@angular/core';
import { provideRouter, withPreloading } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideAnimations } from '@angular/platform-browser/animations';
import { provideServiceWorker } from '@angular/service-worker';
import { providePrimeNG } from 'primeng/config';
import Aura from '@primeng/themes/aura';
import { routes } from './app.routes';
import { SelectivePreloadingStrategy } from './core/strategies/selective-preloading.strategy';
import { authInterceptor } from './core/interceptors/auth.interceptor';
import { cspInterceptor } from './core/interceptors/csp.interceptor';
import { httpErrorInterceptor } from './core/interceptors/http-error.interceptor';
import { CoreModule } from './core/core.module';
import { PrimeNGModule } from './shared/primeng.module';
import { SocketIoModule } from 'ngx-socket-io';
import { socketConfig } from './core/config/socket.config';

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
      ripple: true, // Optional: enable ripple effect globally
    }),
    importProvidersFrom(
      CoreModule,
      PrimeNGModule,
      SocketIoModule.forRoot(socketConfig),
    ),
  ],
};
