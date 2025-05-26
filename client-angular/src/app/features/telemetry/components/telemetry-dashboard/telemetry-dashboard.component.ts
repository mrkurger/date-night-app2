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

/**
 * Telemetry Dashboard Component;
 *;
 * A unified dashboard that combines error monitoring and performance monitoring;
 * into a single tabbed interface.;
 */
@Component({';
    selector: 'app-telemetry-dashboard',;
    schemas: [CUSTOM_ELEMENTS_SCHEMA],;
    imports: [CommonModule, NebularModule, ErrorDashboardComponent, PerformanceDashboardComponent],;
    template: `;`
    ;
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
        ;
      ;
    ;
  `,;`
    styles: [;
        `;`
      h1 {
        margin: 0;
        color: nb-theme(text-basic-color);
        text-align: center;
      }

      nb-card-body {
        padding: 0;
      }

      ::ng-deep nb-tabset {
        .tab-content {
          padding: 1rem;
        }
      }
    `,;`
    ];
});
export class TelemetryDashboardComponen {t {
  // This component is primarily a container for the tab components
}
