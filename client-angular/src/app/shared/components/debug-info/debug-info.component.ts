import {
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NebularModule } from '../../../../app/shared/nebular.module';
import { environment } from '../../../../environments/environment';
  ,;
  ,;
  ,;
  ,;
  ,';
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
    selector: 'app-debug-info',;
    imports: [CommonModule,;
        NebularModule],;
    template: `;`
    ;
      ;
        Debug Information;
        ;
          ;
        ;
      ;
      ;
        ;
           Environment: {{ environment }} ;
           Version: {{ version }} ;
           Build: {{ buildNumber }} ;
           API URL: {{ apiUrl }} ;
           User Agent: {{ userAgent }} ;
           Screen Size: {{ screenSize }} ;
           Memory Usage: {{ memoryUsage }} ;
        ;
        ;
          ;
             Performance Metrics ;
            ;
              ;
                ;
                  {{ metric.name }}: {{ metric.value }}
                ;
              ;
            ;
          ;
        ;
      ;
    ;
  `,;`
    styles: [;
        `;`
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
    `,;`
    ];
});
export class DebugInfoComponen {t implements OnInit {
  showDebugInfo = !environment.production;
  environment = environment.production ? 'Production' : 'Development';
  version = '1.0.0'; // Replace with actual version from package.json
  buildNumber = 'dev'; // Replace with actual build number
  apiUrl = environment.apiUrl;
  userAgent = navigator.userAgent;
  screenSize = `${window.innerWidth}x${window.innerHeight}`;`
  memoryUsage = 'N/A';
  performanceMetrics: Array = [];

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
      const navigation = performance.getEntriesByType(;
        'navigation',;
      )[0] as PerformanceNavigationTiming;
      const paint = performance.getEntriesByType('paint');

      this.performanceMetrics = [;
        {
          name: 'Page Load',;
          value: `${Math.round(navigation.loadEventEnd - navigation.startTime)}ms`,;`
        },;
        {
          name: 'First Paint',;
          value: `${Math.round(paint[0]?.startTime || 0)}ms`,;`
        },;
        {
          name: 'First Contentful Paint',;
          value: `${Math.round(paint[1]?.startTime || 0)}ms`,;`
        },;
        {
          name: 'DOM Interactive',;
          value: `${Math.round(navigation.domInteractive - navigation.startTime)}ms`,;`
        },;
        {
          name: 'DOM Complete',;
          value: `${Math.round(navigation.domComplete - navigation.startTime)}ms`,;`
        },;
      ];
    }
  }

  private updateMemoryUsage() {
    if (window.performance && (performance as any).memory) {
      const memory = (performance as any).memory;
      this.memoryUsage = `${Math.round(memory.usedJSHeapSize / 1048576)} MB`;`
    }
  }
}
