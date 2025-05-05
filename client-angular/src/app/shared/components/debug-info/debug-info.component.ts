// ===================================================
// CUSTOMIZABLE SETTINGS IN THIS FILE
// ===================================================
// This file contains settings for component configuration (debug-info.component)
//
// COMMON CUSTOMIZATIONS:
// - SETTING_NAME: Description of setting (default: value)
//   Related to: other_file.ts:OTHER_SETTING
// ===================================================
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
// Define a local environment object to avoid import issues
const environment = {
  production: false,
};

@Component({
  selector: 'app-debug-info',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="debug-panel" *ngIf="showDebugInfo">
      <h3>Debug Information</h3>
      <div class="debug-content">
        <p><strong>Angular Version:</strong> 19.2.0</p>
        <p><strong>Environment:</strong> {{ environment }}</p>
        <p><strong>Browser:</strong> {{ browserInfo }}</p>
        <p><strong>Screen Size:</strong> {{ screenSize }}</p>
        <p><strong>User Agent:</strong> {{ userAgent }}</p>
        <p><strong>PWA Enabled:</strong> {{ isPwaEnabled }}</p>
        <p><strong>Service Worker:</strong> {{ hasServiceWorker }}</p>
        <p><strong>Online Status:</strong> {{ isOnline ? 'Online' : 'Offline' }}</p>
        <p><strong>Rendering Mode:</strong> {{ renderingMode }}</p>
        <div class="css-test">
          <p>
            <strong>CSS Test:</strong> <span class="bootstrap-test">Bootstrap</span> |
            <span class="fontawesome-test">FontAwesome</span> |
            <span class="material-test">Material</span>
          </p>
        </div>
      </div>
      <button (click)="toggleDebugInfo()" class="close-btn">Close</button>
    </div>
    <button (click)="toggleDebugInfo()" *ngIf="!showDebugInfo" class="debug-toggle">Debug</button>
  `,
  styles: [
    `
      .debug-panel {
        position: fixed;
        bottom: 20px;
        right: 20px;
        background-color: rgba(0, 0, 0, 0.8);
        color: white;
        padding: 15px;
        border-radius: 8px;
        z-index: 9999;
        max-width: 400px;
        max-height: 80vh;
        overflow-y: auto;
        box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
      }

      .debug-panel h3 {
        margin-top: 0;
        border-bottom: 1px solid rgba(255, 255, 255, 0.3);
        padding-bottom: 8px;
      }

      .debug-content {
        font-size: 12px;
      }

      .debug-content p {
        margin: 5px 0;
      }

      .close-btn {
        background-color: #ff4081;
        color: white;
        border: none;
        padding: 5px 10px;
        border-radius: 4px;
        cursor: pointer;
        margin-top: 10px;
      }

      .debug-toggle {
        position: fixed;
        bottom: 20px;
        right: 20px;
        background-color: rgba(0, 0, 0, 0.5);
        color: white;
        border: none;
        padding: 5px 10px;
        border-radius: 4px;
        cursor: pointer;
        z-index: 9999;
      }

      .bootstrap-test {
        padding: 2px 5px;
        background-color: #0d6efd;
        border-radius: 3px;
      }

      .fontawesome-test::before {
        content: '\\f005';
        font-family: 'Font Awesome 6 Free';
        font-weight: 900;
        margin-right: 5px;
      }

      .material-test {
        font-family: 'Material Icons';
        vertical-align: middle;
      }
    `,
  ],
})
export class DebugInfoComponent implements OnInit {
  showDebugInfo = false;
  environment = environment.production ? 'Production' : 'Development';
  browserInfo = '';
  screenSize = '';
  userAgent = '';
  isPwaEnabled = 'Checking...';
  hasServiceWorker = 'Checking...';
  isOnline = navigator.onLine;
  renderingMode = 'Checking...';

  ngOnInit() {
    this.getBrowserInfo();
    this.checkPwaStatus();
    this.checkRenderingMode();

    // Listen for online/offline events
    window.addEventListener('online', () => (this.isOnline = true));
    window.addEventListener('offline', () => (this.isOnline = false));

    // Listen for screen size changes
    window.addEventListener('resize', () => {
      this.screenSize = `${window.innerWidth}x${window.innerHeight}`;
    });
  }

  toggleDebugInfo() {
    this.showDebugInfo = !this.showDebugInfo;
  }

  private getBrowserInfo() {
    this.userAgent = navigator.userAgent;
    this.screenSize = `${window.innerWidth}x${window.innerHeight}`;

    // Detect browser
    const ua = navigator.userAgent;
    if (ua.includes('Firefox')) {
      this.browserInfo = 'Firefox';
    } else if (ua.includes('Chrome') && !ua.includes('Edg')) {
      this.browserInfo = 'Chrome';
    } else if (ua.includes('Safari') && !ua.includes('Chrome')) {
      this.browserInfo = 'Safari';
    } else if (ua.includes('Edg')) {
      this.browserInfo = 'Edge';
    } else {
      this.browserInfo = 'Unknown';
    }
  }

  private checkPwaStatus() {
    // Check if running as installed PWA
    if (window.matchMedia('(display-mode: standalone)').matches) {
      this.isPwaEnabled = 'Yes (Standalone)';
    } else if (window.navigator && (window.navigator as any).standalone === true) {
      this.isPwaEnabled = 'Yes (iOS Standalone)';
    } else {
      this.isPwaEnabled = 'No';
    }

    // Check for service worker support
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker
        .getRegistrations()
        .then((registrations) => {
          this.hasServiceWorker =
            registrations.length > 0 ? 'Yes (Active)' : 'Supported but not registered';
        })
        .catch(() => {
          this.hasServiceWorker = 'Error checking';
        });
    } else {
      this.hasServiceWorker = 'Not supported';
    }
  }

  private checkRenderingMode() {
    // Check if Angular is running in development mode
    setTimeout(() => {
      const appRoot = document.querySelector('app-root');
      if (appRoot && appRoot.hasAttribute('ng-version')) {
        this.renderingMode = 'Angular (Client-side)';
      } else {
        this.renderingMode = 'Unknown';
      }
    }, 0);
  }
}
