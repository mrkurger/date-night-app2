// ===================================================
// CUSTOMIZABLE SETTINGS IN THIS FILE
// ===================================================
// This file contains settings for configuration settings (app.config)
//
// COMMON CUSTOMIZATIONS:
// - SETTING_NAME: Description of setting (default: value)
//   Related to: other_file.ts:OTHER_SETTING
// ===================================================
import { ApplicationConfig, provideZoneChangeDetection, importProvidersFrom } from '@angular/core';
import { provideRouter, withPreloading } from '@angular/router';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { provideAnimations } from '@angular/platform-browser/animations';
import { provideServiceWorker } from '@angular/service-worker';
import { routes, routingProviders } from './app.routes';
import { CoreModule } from './core/core.module';
import { SharedModule } from './shared/material.module';
import { SocketIoModule, SocketIoConfig } from 'ngx-socket-io';
import { environment } from '../environments/environment';
import { SelectivePreloadingStrategy } from './core/strategies/selective-preloading.strategy';

const socketConfig: SocketIoConfig = {
  url: environment.socketUrl || 'http://localhost:3000',
  options: {},
};

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes, withPreloading(SelectivePreloadingStrategy)),
    provideHttpClient(withInterceptorsFromDi()),
    provideAnimations(),
    provideServiceWorker('ngsw-worker.js', {
      enabled: environment.production,
      registrationStrategy: 'registerWhenStable:30000',
    }),
    routingProviders,
    importProvidersFrom(CoreModule, SharedModule, SocketIoModule.forRoot(socketConfig)),
  ],
};
