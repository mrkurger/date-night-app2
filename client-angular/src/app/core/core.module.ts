import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';
import { AuthService } from './services/auth.service';
import { HttpErrorInterceptor } from './interceptors/http-error.interceptor';
import { AuthInterceptor } from './interceptors/auth.interceptor';
import { CSPInterceptor } from './interceptors/csp.interceptor';
import { CsrfInterceptor } from './interceptors/csrf.interceptor';

@NgModule({
  imports: [
    CommonModule,
    HttpClientModule
  ],
  providers: [
    AuthService,
    // Order matters for interceptors - they are applied in the order listed
    { provide: HTTP_INTERCEPTORS, useClass: CSPInterceptor, multi: true },
    { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true },
    { provide: HTTP_INTERCEPTORS, useClass: CsrfInterceptor, multi: true },
    { provide: HTTP_INTERCEPTORS, useClass: HttpErrorInterceptor, multi: true }
  ]
})
export class CoreModule { }
