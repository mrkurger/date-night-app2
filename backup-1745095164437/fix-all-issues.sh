#!/bin/bash

# ANSI color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
BLUE='\033[0;34m'
MAGENTA='\033[0;35m'
CYAN='\033[0;36m'
RESET='\033[0m'

PROJECT_ROOT="/Users/oivindlund/date-night-app"
SERVER_DIR="$PROJECT_ROOT/server"
CLIENT_DIR="$PROJECT_ROOT/client-angular"

echo -e "${CYAN}===== Date Night App - Fix All Issues =====${RESET}"
echo -e "${CYAN}This script will fix all known issues in the project.${RESET}"
echo ""

# Function to check if a command was successful
check_success() {
  if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Success: $1${RESET}"
  else
    echo -e "${RED}❌ Failed: $1${RESET}"
    echo -e "${YELLOW}Continuing with the next step...${RESET}"
  fi
  echo ""
}

# Step 1: Install missing server dependencies
echo -e "${MAGENTA}Step 1: Installing missing server dependencies...${RESET}"
cd $SERVER_DIR
npm install sharp@0.33.3 --save
check_success "Installing sharp package"

# Step 2: Fix client dependencies
echo -e "${MAGENTA}Step 2: Installing missing client dependencies...${RESET}"
cd $CLIENT_DIR
npm install @angular/service-worker@19.2.0 bootstrap@5.3.2 @fortawesome/fontawesome-free@6.5.1 --save
check_success "Installing client dependencies"

# Step 3: Fix package.json scripts
echo -e "${MAGENTA}Step 3: Fixing package.json scripts...${RESET}"
cd $CLIENT_DIR
# Use sed to fix the scripts
sed -i '' 's/"ng": "ngode src\/csp-config.js && ng serve client-angular"/"ng": "ng"/g' package.json
sed -i '' 's/"start": "ng serve client-an client-angular"/"start": "ng serve client-angular"/g' package.json
check_success "Fixing package.json scripts"

# Step 4: Create missing files
echo -e "${MAGENTA}Step 4: Creating missing files...${RESET}"

# Create HTTP error interceptor if it doesn't exist
if [ ! -f "$CLIENT_DIR/src/app/core/interceptors/http-error.interceptor.ts" ]; then
  mkdir -p "$CLIENT_DIR/src/app/core/interceptors"
  cat > "$CLIENT_DIR/src/app/core/interceptors/http-error.interceptor.ts" << 'EOF'
import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
  HttpErrorResponse
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Router } from '@angular/router';

@Injectable()
export class HttpErrorInterceptor implements HttpInterceptor {
  constructor(private router: Router) {}

  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    return next.handle(request).pipe(
      catchError((error: HttpErrorResponse) => {
        let errorMessage = 'An unknown error occurred';
        
        if (error.error instanceof ErrorEvent) {
          // Client-side error
          errorMessage = `Error: ${error.error.message}`;
        } else {
          // Server-side error
          switch (error.status) {
            case 401:
              errorMessage = 'Unauthorized: Please log in to continue';
              this.router.navigate(['/auth/login']);
              break;
            case 403:
              errorMessage = 'Forbidden: You do not have permission to access this resource';
              break;
            case 404:
              errorMessage = 'Not Found: The requested resource does not exist';
              break;
            case 500:
              errorMessage = 'Server Error: Something went wrong on our end';
              break;
            default:
              errorMessage = `Error ${error.status}: ${error.error?.message || error.statusText}`;
          }
        }
        
        // Log the error
        console.error('HTTP Error:', error);
        console.error('Error Message:', errorMessage);
        
        // Return the error for further handling
        return throwError(() => new Error(errorMessage));
      })
    );
  }
}
EOF
  echo -e "${GREEN}Created HTTP error interceptor${RESET}"
else
  echo -e "${YELLOW}HTTP error interceptor already exists${RESET}"
fi

# Step 5: Fix environment files
echo -e "${MAGENTA}Step 5: Ensuring environment files exist...${RESET}"
if [ ! -d "$CLIENT_DIR/src/environments" ]; then
  mkdir -p "$CLIENT_DIR/src/environments"
fi

# Create environment.prod.ts if it doesn't exist
if [ ! -f "$CLIENT_DIR/src/environments/environment.prod.ts" ]; then
  cat > "$CLIENT_DIR/src/environments/environment.prod.ts" << 'EOF'
export const environment = {
  production: true,
  apiUrl: '/api/v1',
  chatWsUrl: '',
  socketUrl: '',
  defaultImageUrl: '/assets/images/default-ad.jpg',
  maxUploadSize: 5 * 1024 * 1024, // 5MB
  supportedImageTypes: ['image/jpeg', 'image/png', 'image/webp'],
  mapboxToken: 'your_mapbox_token', // Replace with actual token
  stripePublicKey: 'pk_live_your_stripe_key', // Replace with actual Stripe public key
  cdnUrl: 'https://cdn.datenight.io', // Set to your CDN URL in production
  imageSizes: [320, 640, 960, 1280, 1920], // Common responsive image sizes
};
EOF
  echo -e "${GREEN}Created environment.prod.ts${RESET}"
else
  echo -e "${YELLOW}environment.prod.ts already exists${RESET}"
fi

# Step 6: Fix PWA service
echo -e "${MAGENTA}Step 6: Fixing PWA service...${RESET}"
cat > "$CLIENT_DIR/src/app/core/services/pwa.service.ts" << 'EOF'
import { Injectable, inject } from '@angular/core';
import { SwUpdate, VersionEvent } from '@angular/service-worker';
import { filter } from 'rxjs/operators';
import { NotificationService } from './notification.service';

@Injectable({
  providedIn: 'root'
})
export class PwaService {
  private swUpdate = inject(SwUpdate);
  private notificationService = inject(NotificationService);

  constructor() {
    // Check for service worker updates
    if (this.swUpdate.isEnabled) {
      this.swUpdate.versionUpdates
        .pipe(filter((evt: VersionEvent) => evt.type === 'VERSION_READY'))
        .subscribe(() => {
          this.showUpdateNotification();
        });
    }
  }

  /**
   * Show update notification with reload option
   */
  private showUpdateNotification() {
    const notification = this.notificationService.info(
      'A new version of the app is available. Reload the page to update.'
    );
    
    // If the notification service supports actions, subscribe to them
    if (notification && typeof notification.onAction === 'function') {
      notification.onAction().subscribe(() => {
        window.location.reload();
      });
    }
  }

  /**
   * Check for updates manually
   */
  checkForUpdates(): Promise<boolean> {
    if (!this.swUpdate.isEnabled) {
      return Promise.resolve(false);
    }
    
    return this.swUpdate.checkForUpdate()
      .then(hasUpdate => {
        if (hasUpdate) {
          this.showUpdateNotification();
        }
        return hasUpdate;
      })
      .catch(err => {
        console.error('Failed to check for updates:', err);
        return false;
      });
  }

  /**
   * Register for push notifications
   */
  registerForPush() {
    // This is a placeholder for push notification registration
    // Implementation will depend on your backend push notification service
    if ('Notification' in window && Notification.permission !== 'granted') {
      Notification.requestPermission().then(permission => {
        if (permission === 'granted') {
          this.notificationService.success('Push notifications enabled!');
          // Here you would register the push subscription with your server
        }
      });
    }
  }
}
EOF
check_success "Fixing PWA service"

# Step 7: Update notification service
echo -e "${MAGENTA}Step 7: Updating notification service...${RESET}"
# This is a complex update, so we'll use a temporary file
cat > "$CLIENT_DIR/src/app/core/services/notification.service.new.ts" << 'EOF'
import { Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { BehaviorSubject, Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

export enum NotificationType {
  SUCCESS = 'success',
  ERROR = 'error',
  WARNING = 'warning',
  INFO = 'info'
}

export interface ToastNotification {
  id: string;
  message: string;
  type: NotificationType;
  timestamp: Date;
  autoClose?: boolean;
  duration?: number;
}

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private readonly apiUrl = environment.apiUrl + '/notifications';

  // Add unreadCount$ BehaviorSubject
  private unreadCountSubject = new BehaviorSubject<number>(0);
  public unreadCount$ = this.unreadCountSubject.asObservable();

  // Add toasts$ BehaviorSubject for notification component
  private toastsSubject = new BehaviorSubject<ToastNotification[]>([]);
  public toasts$ = this.toastsSubject.asObservable();

  private toasts: ToastNotification[] = [];

  constructor(
    private snackBar: MatSnackBar,
    private http: HttpClient
  ) {
    // Initialize with 0 unread notifications
    this.unreadCountSubject.next(0);
  }

  success(message: string, action = 'Close', options = {}) {
    const snackBarRef = this.snackBar.open(message, action, {
      duration: 3000,
      horizontalPosition: 'end',
      verticalPosition: 'top',
      panelClass: ['success-snackbar'],
      ...options
    });

    // Also add to toasts
    this.addToast({
      id: this.generateId(),
      message,
      type: NotificationType.SUCCESS,
      timestamp: new Date(),
      autoClose: true,
      duration: 3000
    });

    return snackBarRef;
  }

  error(message: string, action = 'Close', options = {}) {
    const snackBarRef = this.snackBar.open(message, action, {
      duration: 5000,
      horizontalPosition: 'end',
      verticalPosition: 'top',
      panelClass: ['error-snackbar'],
      ...options
    });

    // Also add to toasts
    this.addToast({
      id: this.generateId(),
      message,
      type: NotificationType.ERROR,
      timestamp: new Date(),
      autoClose: true,
      duration: 5000
    });

    return snackBarRef;
  }

  warning(message: string, action = 'Close', options = {}) {
    const snackBarRef = this.snackBar.open(message, action, {
      duration: 4000,
      horizontalPosition: 'end',
      verticalPosition: 'top',
      panelClass: ['warning-snackbar'],
      ...options
    });

    // Also add to toasts
    this.addToast({
      id: this.generateId(),
      message,
      type: NotificationType.WARNING,
      timestamp: new Date(),
      autoClose: true,
      duration: 4000
    });

    return snackBarRef;
  }

  info(message: string, action = 'Close', options = {}) {
    const snackBarRef = this.snackBar.open(message, action, {
      duration: 3000,
      horizontalPosition: 'end',
      verticalPosition: 'top',
      panelClass: ['info-snackbar'],
      ...options
    });

    // Also add to toasts
    this.addToast({
      id: this.generateId(),
      message,
      type: NotificationType.INFO,
      timestamp: new Date(),
      autoClose: true,
      duration: 3000
    });

    return snackBarRef;
  }

  // Add a toast notification
  private addToast(toast: ToastNotification): void {
    this.toasts.push(toast);
    this.toastsSubject.next([...this.toasts]);

    if (toast.autoClose) {
      setTimeout(() => {
        this.removeToast(toast.id);
      }, toast.duration || 3000);
    }
  }

  // Remove a toast notification
  removeToast(id: string): void {
    this.toasts = this.toasts.filter(t => t.id !== id);
    this.toastsSubject.next([...this.toasts]);
  }

  // Generate a unique ID for toasts
  private generateId(): string {
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
  }

  // Get unread notifications count from the server
  getUnreadNotificationsCount(): Observable<number> {
    return this.http.get<number>(`${this.apiUrl}/unread-count`);
  }

  // Update the unread count
  updateUnreadCount(count: number): void {
    this.unreadCountSubject.next(count);
  }
}
EOF

# Replace the original file
mv "$CLIENT_DIR/src/app/core/services/notification.service.new.ts" "$CLIENT_DIR/src/app/core/services/notification.service.ts"
check_success "Updating notification service"

# Step 8: Update app.module.ts to include service worker
echo -e "${MAGENTA}Step 8: Updating app.config.ts to include service worker...${RESET}"
cat > "$CLIENT_DIR/src/app/app.config.ts.new" << 'EOF'
import { ApplicationConfig, provideZoneChangeDetection, importProvidersFrom } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { provideAnimations } from '@angular/platform-browser/animations';
import { provideServiceWorker } from '@angular/service-worker';
import { routes } from './app.routes';
import { CoreModule } from './core/core.module';
import { SharedModule } from './shared/material.module';
import { SocketIoModule, SocketIoConfig } from 'ngx-socket-io';
import { environment } from '../environments/environment';

const socketConfig: SocketIoConfig = { url: environment.socketUrl || 'http://localhost:3000', options: {} };

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideHttpClient(withInterceptorsFromDi()),
    provideAnimations(),
    provideServiceWorker('ngsw-worker.js', {
      enabled: environment.production,
      registrationStrategy: 'registerWhenStable:30000'
    }),
    importProvidersFrom(
      CoreModule,
      SharedModule,
      SocketIoModule.forRoot(socketConfig)
    )
  ]
};
EOF

# Replace the original file
mv "$CLIENT_DIR/src/app/app.config.ts.new" "$CLIENT_DIR/src/app/app.config.ts"
check_success "Updating app.config.ts"

# Final message
echo -e "${GREEN}===== All issues fixed! =====${RESET}"
echo -e "${GREEN}You can now start the application with:${RESET}"
echo -e "${CYAN}cd $PROJECT_ROOT && npm run dev${RESET}"
echo ""
echo -e "${YELLOW}Note: You may need to run 'npm install' in both server and client directories to ensure all dependencies are installed.${RESET}"
echo -e "${YELLOW}      cd $SERVER_DIR && npm install${RESET}"
echo -e "${YELLOW}      cd $CLIENT_DIR && npm install${RESET}"