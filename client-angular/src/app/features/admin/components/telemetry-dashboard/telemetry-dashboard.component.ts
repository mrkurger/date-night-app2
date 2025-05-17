import { Component, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { NebularModule } from '../../../shared/nebular.module';

// ===================================================
// CUSTOMIZABLE SETTINGS IN THIS FILE
// ===================================================
// This file contains settings for component configuration (telemetry-dashboard.component)
//
// COMMON CUSTOMIZATIONS:
// - SETTING_NAME: Description of setting (default: value)
//   Related to: other_file.ts:OTHER_SETTING
// ===================================================
import { CommonModule } from '@angular/common';

import { ErrorDashboardComponent } from '../error-dashboard/error-dashboard.component';
import { PerformanceDashboardComponent } from '../performance-dashboard/performance-dashboard.component';

@Component({
  selector: 'app-telemetry-dashboard',
  standalone: true,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  imports: [CommonModule, NebularModule, ErrorDashboardComponent, PerformanceDashboardComponent],
  template: `
    <div class="telemetry-dashboard-container">
      <h1>Application Telemetry Dashboard</h1>

      <nb-tabset>
        <nb-tab tabTitle="Error Monitoring">
          <app-error-dashboard></app-error-dashboard>
        </nb-tab>
        <nb-tab tabTitle="Performance Monitoring">
          <app-performance-dashboard></app-performance-dashboard>
        </nb-tab>
      </nb-tabset>
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

      ::ng-deep nb-tabset {
        .tab-content {
          padding: 20px 0;
        }
      }
    `,
  ],
})
export class TelemetryDashboardComponent {
  constructor() {}
}
