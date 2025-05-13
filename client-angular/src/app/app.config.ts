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
import { routes } from './app.routes';
import { SelectivePreloadingStrategy } from './core/strategies/selective-preloading.strategy';
import { authInterceptor } from './core/interceptors/auth.interceptor';
import { cspInterceptor } from './core/interceptors/csp.interceptor';
import { httpErrorInterceptor } from './core/interceptors/http-error.interceptor';
import { CoreModule } from './core/core.module';
import { NebularModule } from './shared/nebular.module';
import { SocketIoModule } from 'ngx-socket-io';
import { socketConfig } from './core/config/socket.config';
import { NbThemeModule } from '@nebular/theme';
import { NbEvaIconsModule } from '@nebular/eva-icons';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes, withPreloading(SelectivePreloadingStrategy)),
    provideHttpClient(withInterceptors([authInterceptor, cspInterceptor, httpErrorInterceptor])),
    provideAnimations(),
    provideServiceWorker('ngsw-worker.js', {
      enabled: true,
      registrationStrategy: 'registerImmediately',
    }),
    importProvidersFrom(
      CoreModule,
      NebularModule,
      SocketIoModule.forRoot(socketConfig),
      NbThemeModule.forRoot({ name: 'default' }),
      NbEvaIconsModule,
    ),
  ],
};
