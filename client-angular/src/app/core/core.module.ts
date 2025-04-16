// ===================================================
// CUSTOMIZABLE SETTINGS IN THIS FILE
// ===================================================
// This file contains settings for core.module settings
//
// COMMON CUSTOMIZATIONS:
// - SETTING_NAME: Description of setting (default: value)
//   Related to: other_file.ts:OTHER_SETTING
// ===================================================
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';
import { AuthService } from './services/auth.service';
import { HttpErrorInterceptor } from './interceptors/http-error.interceptor';
import { AuthInterceptor } from './interceptors/auth.interceptor';
import { CSPInterceptor } from './interceptors/csp.interceptor';
import { CsrfInterceptor } from './interceptors/csrf.interceptor';
import { Router } from '@angular/router';
import { UserService } from './services/user.service';
import { CsrfService } from './services/csrf.service';
import { NotificationService } from './services/notification.service';

// Factory functions to avoid circular dependencies
export function cspInterceptorFactory() {
  return new CSPInterceptor();
}

export function authInterceptorFactory(
  authService: AuthService,
  userService: UserService,
  router: Router
) {
  return new AuthInterceptor(authService, userService, router);
}

export function csrfInterceptorFactory(csrfService: CsrfService) {
  return new CsrfInterceptor(csrfService);
}

export function httpErrorInterceptorFactory(
  router: Router,
  notificationService: NotificationService
) {
  return new HttpErrorInterceptor(router, notificationService);
}

@NgModule({
  imports: [CommonModule, HttpClientModule],
  providers: [
    AuthService,
    // Order matters for interceptors - they are applied in the order listed
    { provide: HTTP_INTERCEPTORS, useFactory: cspInterceptorFactory, multi: true },
    {
      provide: HTTP_INTERCEPTORS,
      useFactory: authInterceptorFactory,
      deps: [AuthService, UserService, Router],
      multi: true,
    },
    {
      provide: HTTP_INTERCEPTORS,
      useFactory: csrfInterceptorFactory,
      deps: [CsrfService],
      multi: true,
    },
    {
      provide: HTTP_INTERCEPTORS,
      useFactory: httpErrorInterceptorFactory,
      deps: [Router, NotificationService],
      multi: true,
    },
  ],
})
export class CoreModule {}
