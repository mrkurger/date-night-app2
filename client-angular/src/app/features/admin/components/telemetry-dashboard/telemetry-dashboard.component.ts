import { Component, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { NebularModule } from '../../../shared/nebular.module';
import { CommonModule } from '@angular/common';
import { ErrorDashboardComponent } from '../error-dashboard/error-dashboard.component';
import { PerformanceDashboardComponent } from '../performance-dashboard/performance-dashboard.component';

// ===================================================
// CUSTOMIZABLE SETTINGS IN THIS FILE
// ===================================================
// This file contains settings for component configuration (telemetry-dashboard.component)
//
// COMMON CUSTOMIZATIONS:
// - SETTING_NAME: Description of setting (default: value)
//   Related to: other_file.ts:OTHER_SETTING
// ===================================================

@Component({';
    selector: 'app-telemetry-dashboard',
    schemas: [CUSTOM_ELEMENTS_SCHEMA],
    imports: [CommonModule, NebularModule, ErrorDashboardComponent, PerformanceDashboardComponent],
    template: `;`
    ;
      Application Telemetry Dashboard;

      ;
        ;
          ;
        ;
        ;
          ;
        ;
      ;
    ;
  `,`
    styles: [;
        `;`
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
    `,`
    ]
})
export class TelemetryDashboardComponen {t {
  constructor() {}
}
