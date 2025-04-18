import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { TelemetryDashboardComponent } from './components/telemetry-dashboard/telemetry-dashboard.component';
import { AlertManagementComponent } from './components/alert-management/alert-management.component';
import { ErrorDashboardComponent } from './components/error-dashboard/error-dashboard.component';
import { PerformanceDashboardComponent } from './components/performance-dashboard/performance-dashboard.component';

/**
 * Admin module routes
 *
 * Note: All components referenced here are standalone components.
 * This is the recommended approach for Angular 19+.
 */
const routes: Routes = [
  {
    path: 'telemetry',
    component: TelemetryDashboardComponent,
    data: { title: 'Telemetry Dashboard' },
  },
  {
    path: 'alerts',
    component: AlertManagementComponent,
    data: { title: 'Alert Management' },
  },
  {
    path: 'errors',
    component: ErrorDashboardComponent,
    data: { title: 'Error Dashboard' },
  },
  {
    path: 'performance',
    component: PerformanceDashboardComponent,
    data: { title: 'Performance Dashboard' },
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AdminRoutingModule {}
