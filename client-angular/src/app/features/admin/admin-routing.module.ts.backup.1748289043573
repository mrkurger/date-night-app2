// ===================================================
// CUSTOMIZABLE SETTINGS IN THIS FILE
// ===================================================
// This file contains settings for admin-routing.module settings
//
// COMMON CUSTOMIZATIONS:
// - SETTING_NAME: Description of setting (default: value)
//   Related to: other_file.ts:OTHER_SETTING
// ===================================================
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

// Component imports
import { AdminSettingsComponent } from './components/admin-settings/admin-settings.component';
import { AuditLogComponent } from './components/audit-log/audit-log.component';
import { ErrorDashboardComponent } from './components/error-dashboard/error-dashboard.component';
import { ErrorSecurityDashboardComponent } from './components/error-security-dashboard/error-security-dashboard.component';
import { PerformanceDashboardComponent } from './components/performance-dashboard/performance-dashboard.component';
import { RevenueAnalyticsComponent } from './components/revenue-analytics/revenue-analytics.component';
import { SystemHealthComponent } from './components/system-health/system-health.component';
import { TelemetryDashboardComponent } from './components/telemetry-dashboard/telemetry-dashboard.component';
import { UserManagementComponent } from './components/user-management/user-management.component';
import { ContentModerationComponent } from './content-moderation/content-moderation.component';
import { AdminGuard } from '../../core/guards/admin.guard';

/**
 * Admin module routes
 * All routes are protected by AdminGuard
 */
const routes: Routes = [
  {
    path: '',
    canActivate: [AdminGuard],
    children: [
      {
        path: 'telemetry',
        component: TelemetryDashboardComponent,
        data: { title: 'Telemetry Dashboard' },
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
      {
        path: 'users',
        component: UserManagementComponent,
        data: { title: 'User Management' },
      },
      {
        path: 'revenue',
        component: RevenueAnalyticsComponent,
        data: { title: 'Revenue Analytics' },
      },
      {
        path: 'moderation',
        component: ContentModerationComponent,
        data: { title: 'Content Moderation' },
      },
      {
        path: 'health',
        component: SystemHealthComponent,
        data: { title: 'System Health' },
      },
      {
        path: 'audit',
        component: AuditLogComponent,
        data: { title: 'Audit Log' },
      },
      {
        path: 'settings',
        component: AdminSettingsComponent,
        data: { title: 'Admin Settings' },
      },
      {
        path: 'error-security',
        component: ErrorSecurityDashboardComponent,
        data: { title: 'Error Security Dashboard' },
      },
      {
        path: '',
        redirectTo: 'telemetry',
        pathMatch: 'full',
      },
    ],
  },
];

/**
 *
 */
@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AdminRoutingModule {}
