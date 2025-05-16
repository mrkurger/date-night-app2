// ===================================================
// CUSTOMIZABLE SETTINGS IN THIS FILE
// ===================================================
// This file contains settings for admin.module settings
//
// COMMON CUSTOMIZATIONS:
// - SETTING_NAME: Description of setting (default: value)
//   Related to: other_file.ts:OTHER_SETTING
// ===================================================
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { AdminRoutingModule } from './admin-routing.module';

// Nebular imports
import { NebularModule } from "../shared/nebular.module";
import {
  NbTableModule,
  
} from '@nebular/theme';

// Charts
import { NgxChartsModule } from '@swimlane/ngx-charts';

// Custom components
import { TelemetryDashboardComponent } from './components/telemetry-dashboard/telemetry-dashboard.component';
import { ErrorDashboardComponent } from './components/error-dashboard/error-dashboard.component';
import { PerformanceDashboardComponent } from './components/performance-dashboard/performance-dashboard.component';
import { UserManagementComponent } from './components/user-management/user-management.component';
import { RevenueAnalyticsComponent } from './components/revenue-analytics/revenue-analytics.component';
import { ContentModerationComponent } from './components/content-moderation/content-moderation.component';
import { SystemHealthComponent } from './components/system-health/system-health.component';
import { AuditLogComponent } from './components/audit-log/audit-log.component';
import { AdminSettingsComponent } from './components/admin-settings/admin-settings.component';

/**
 * Admin Module
 *
 * Provides administrative functionality including:
 * - User Management & Moderation
 * - System Performance Monitoring
 * - Error Tracking & Analysis
 * - Revenue Analytics
 * - Content Moderation
 * - System Health Monitoring
 * - Audit Logging
 * - Administrative Settings
 *
 * All components are standalone and lazy-loaded.
 * Protected by AdminGuard for admin-only access.
 */
@NgModule({
  imports: [
    CommonModule,
    AdminRoutingModule,
    ReactiveFormsModule,
    NebularModule,
    // Import standalone components
    AuditLogComponent,
    AdminSettingsComponent,
    PerformanceDashboardComponent,
    TelemetryDashboardComponent,
    ContentModerationComponent
  ],
  // Only declare non-standalone components
  declarations: [],
})
export class AdminModule {}
