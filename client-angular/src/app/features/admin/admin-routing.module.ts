import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { TelemetryDashboardComponent } from './components/telemetry-dashboard/telemetry-dashboard.component';
import { AlertManagementComponent } from './components/alert-management/alert-management.component';

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
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AdminRoutingModule {}
