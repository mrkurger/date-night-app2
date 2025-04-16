import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTabsModule } from '@angular/material/tabs';
import { ErrorDashboardComponent } from '../error-dashboard/error-dashboard.component';
import { PerformanceDashboardComponent } from '../performance-dashboard/performance-dashboard.component';

@Component({
  selector: 'app-telemetry-dashboard',
  standalone: true,
  imports: [CommonModule, MatTabsModule, ErrorDashboardComponent, PerformanceDashboardComponent],
  template: `
    <div class="telemetry-dashboard-container">
      <h1>Application Telemetry Dashboard</h1>

      <mat-tab-group animationDuration="0ms">
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
      }

      ::ng-deep .mat-tab-body-content {
        padding: 20px 0;
      }
    `,
  ],
})
export class TelemetryDashboardComponent {
  constructor() {}
}
