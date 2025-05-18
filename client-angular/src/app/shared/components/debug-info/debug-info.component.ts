import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NebularModule } from '../../../../app/shared/nebular.module';
import { environment } from '../../../../environments/environment';
import {
  ,
  ,
  ,
  ,
  ,
} from '@nebular/theme';
// ===================================================
// CUSTOMIZABLE SETTINGS IN THIS FILE
// ===================================================
// This file contains settings for component configuration (debug-info.component)
//
// COMMON CUSTOMIZATIONS:
// - SETTING_NAME: Description of setting (default: value)
//   Related to: other_file.ts:OTHER_SETTING
// ===================================================

@Component({
  selector: 'app-debug-info',
  standalone: true,
  imports: [CommonModule,
    NebularModule],
  template: `
    <nb-card *ngIf="showDebugInfo" class="debug-info">
      <nb-card-header>
        Debug Information
        <button nbButton ghost size="tiny" (click)="toggleDebugInfo()">
          <nb-icon icon="minus-outline"></nb-icon>
        </button>
      </nb-card-header>
      <nb-card-body>
        <nb-list>
          <nb-list-item> <strong>Environment:</strong> {{ environment }} </nb-list-item>
          <nb-list-item> <strong>Version:</strong> {{ version }} </nb-list-item>
          <nb-list-item> <strong>Build:</strong> {{ buildNumber }} </nb-list-item>
          <nb-list-item> <strong>API URL:</strong> {{ apiUrl }} </nb-list-item>
          <nb-list-item> <strong>User Agent:</strong> {{ userAgent }} </nb-list-item>
          <nb-list-item> <strong>Screen Size:</strong> {{ screenSize }} </nb-list-item>
          <nb-list-item> <strong>Memory Usage:</strong> {{ memoryUsage }} </nb-list-item>
        </nb-list>
        <nb-accordion>
          <nb-accordion-item>
            <nb-accordion-item-header> Performance Metrics </nb-accordion-item-header>
            <nb-accordion-item-body>
              <nb-list>
                <nb-list-item *ngFor="let metric of performanceMetrics">
                  <strong>{{ metric.name }}:</strong> {{ metric.value }}
                </nb-list-item>
              </nb-list>
            </nb-accordion-item-body>
          </nb-accordion-item>
        </nb-accordion>
      </nb-card-body>
    </nb-card>
  `,
  styles: [
    `
      .debug-info {
        position: fixed;
        bottom: 20px;
        right: 20px;
        z-index: 1000;
        width: 400px;
        opacity: 0.9;
        backdrop-filter: blur(4px);

        nb-card-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        nb-list-item {
          display: flex;
          justify-content: space-between;
          padding: 8px;
          border-bottom: 1px solid nb-theme(border-basic-color-3);

          &:last-child {
            border-bottom: none;
          }
        }
      }
    `,
  ],
})
export class DebugInfoComponent implements OnInit {
  showDebugInfo = !environment.production;
  environment = environment.production ? 'Production' : 'Development';
  version = '1.0.0'; // Replace with actual version from package.json
  buildNumber = 'dev'; // Replace with actual build number
  apiUrl = environment.apiUrl;
  userAgent = navigator.userAgent;
  screenSize = `${window.innerWidth}x${window.innerHeight}`;
  memoryUsage = 'N/A';
  performanceMetrics: Array<{ name: string; value: string }> = [];

  ngOnInit() {
    this.updatePerformanceMetrics();
    this.updateMemoryUsage();

    // Update metrics periodically
    setInterval(() => {
      this.updatePerformanceMetrics();
      this.updateMemoryUsage();
    }, 5000);
  }

  toggleDebugInfo() {
    this.showDebugInfo = !this.showDebugInfo;
  }

  private updatePerformanceMetrics() {
    if (window.performance) {
      const navigation = performance.getEntriesByType(
        'navigation',
      )[0] as PerformanceNavigationTiming;
      const paint = performance.getEntriesByType('paint');

      this.performanceMetrics = [
        {
          name: 'Page Load',
          value: `${Math.round(navigation.loadEventEnd - navigation.startTime)}ms`,
        },
        {
          name: 'First Paint',
          value: `${Math.round(paint[0]?.startTime || 0)}ms`,
        },
        {
          name: 'First Contentful Paint',
          value: `${Math.round(paint[1]?.startTime || 0)}ms`,
        },
        {
          name: 'DOM Interactive',
          value: `${Math.round(navigation.domInteractive - navigation.startTime)}ms`,
        },
        {
          name: 'DOM Complete',
          value: `${Math.round(navigation.domComplete - navigation.startTime)}ms`,
        },
      ];
    }
  }

  private updateMemoryUsage() {
    if (window.performance && (performance as any).memory) {
      const memory = (performance as any).memory;
      this.memoryUsage = `${Math.round(memory.usedJSHeapSize / 1048576)} MB`;
    }
  }
}
