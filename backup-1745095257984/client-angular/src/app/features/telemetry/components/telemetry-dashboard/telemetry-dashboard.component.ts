// ===================================================
// CUSTOMIZABLE SETTINGS IN THIS FILE
// ===================================================
// This file contains settings for component configuration (telemetry-dashboard.component)
//
// COMMON CUSTOMIZATIONS:
// - SETTING_NAME: Description of setting (default: value)
//   Related to: other_file.ts:OTHER_SETTING
// ===================================================
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTabsModule } from '@angular/material/tabs';
import { ErrorDashboardComponent } from '../error-dashboard/error-dashboard.component';
import { PerformanceDashboardComponent } from '../performance-dashboard/performance-dashboard.component';

/**
 * Telemetry Dashboard Component
 *
 * A unified dashboard that combines error monitoring and performance monitoring
 * into a single tabbed interface.
 */
@Component({
  selector: 'app-telemetry-dashboard',
  standalone: true,
  imports: [CommonModule, MatTabsModule, ErrorDashboardComponent, PerformanceDashboardComponent],
  template: `
    <div class="telemetry-dashboard-container">
      <h1>Application Telemetry Dashboard</h1>

      <mat-tab-group>
        <mat-tab label="Error Monitoring">
          <app-error-dashboard></app-error-dashboard>
        </mat-tab>
        <mat-tab label="Performance Monitoring">
          <app-performance-dashboard></app-performance-dashboard>
        </mat-tab>
      </mat-tab-group>
    </div>
  `,
  styles: [
    `
      .telemetry-dashboard-container {
        padding: 20px;
      }

      h1 {
        margin-bottom: 20px;
        color: #333;
        text-align: center;
      }

      ::ng-deep .mat-tab-body-content {
        padding: 0 !important;
      }
    `,
  ],
})
export class TelemetryDashboardComponent {
  // This component is primarily a container for the tab components
}
