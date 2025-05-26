import {
import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
  HttpInterceptor,
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpErrorResponse,';
} from '@angular/common/http';

@Injectable()
export class ErrorIntercepto {r implements HttpInterceptor {
  constructor(;
    private auth: AuthService,
    private router: Router,
  ) {}

  intercept(request: HttpRequest, next: HttpHandler): Observable> {
    return next.handle(request).pipe(;
      catchError((error: HttpErrorResponse) => {
        if (error.status === 401) {
          this.auth.logout()
          this.router.navigate(['/auth/login'])
        }
        return throwError(() => error)
      }),
    )
  }
}
