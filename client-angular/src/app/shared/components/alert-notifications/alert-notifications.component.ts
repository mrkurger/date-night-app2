import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatBadgeModule } from '@angular/material/badge';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatDividerModule } from '@angular/material/divider';
import { MatTooltipModule } from '@angular/material/tooltip';
import { RouterModule } from '@angular/router';
import { AlertService } from '../../../core/services/alert.service';
import { AlertEvent, AlertSeverity } from '../../../core/models/alert.model';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-alert-notifications',
  standalone: true,
  imports: [
    CommonModule,
    MatBadgeModule,
    MatButtonModule,
    MatIconModule,
    MatMenuModule,
    MatDividerModule,
    MatTooltipModule,
    RouterModule,
  ],
  template: `
    <button
      mat-icon-button
      [matBadge]="unacknowledgedCount"
      [matBadgeHidden]="unacknowledgedCount === 0"
      matBadgeColor="warn"
      [matMenuTriggerFor]="alertMenu"
      aria-label="Show alerts"
      matTooltip="Alerts"
    >
      <mat-icon>notifications</mat-icon>
    </button>

    <mat-menu #alertMenu="matMenu" class="alert-menu">
      <div class="alert-menu-header">
        <h3 class="alert-menu-title">Alerts</h3>
        <button
          mat-button
          color="primary"
          [routerLink]="['/admin/alerts']"
          (click)="$event.stopPropagation()"
        >
          View All
        </button>
      </div>

      <mat-divider></mat-divider>

      <div class="alert-list-container">
        <ng-container *ngIf="activeAlerts.length > 0; else noAlerts">
          <div
            *ngFor="let alert of activeAlerts"
            class="alert-item"
            [ngClass]="getSeverityClass(alert.severity)"
          >
            <div class="alert-content">
              <div class="alert-header">
                <span class="alert-name">{{ alert.alertName }}</span>
                <span class="alert-time">{{ alert.timestamp | date: 'short' }}</span>
              </div>
              <div class="alert-message">{{ alert.message }}</div>
            </div>
            <div class="alert-actions">
              <button
                mat-icon-button
                (click)="acknowledgeAlert(alert, $event)"
                [disabled]="alert.acknowledged"
                matTooltip="Acknowledge"
              >
                <mat-icon>check_circle</mat-icon>
              </button>
            </div>
          </div>
        </ng-container>

        <ng-template #noAlerts>
          <div class="no-alerts">
            <mat-icon>check_circle</mat-icon>
            <p>No active alerts</p>
          </div>
        </ng-template>
      </div>
    </mat-menu>
  `,
  styles: [
    `
      .alert-menu {
        max-width: none;
        width: 400px;
      }

      .alert-menu-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 8px 16px;
      }

      .alert-menu-title {
        margin: 0;
        font-size: 16px;
      }

      .alert-list-container {
        max-height: 400px;
        overflow-y: auto;
        padding: 8px 0;
      }

      .alert-item {
        display: flex;
        padding: 12px 16px;
        border-bottom: 1px solid #f0f0f0;
      }

      .alert-content {
        flex: 1;
      }

      .alert-header {
        display: flex;
        justify-content: space-between;
        margin-bottom: 4px;
      }

      .alert-name {
        font-weight: 500;
      }

      .alert-time {
        font-size: 12px;
        color: rgba(0, 0, 0, 0.54);
      }

      .alert-message {
        font-size: 14px;
      }

      .alert-actions {
        display: flex;
        align-items: center;
      }

      .no-alerts {
        display: flex;
        flex-direction: column;
        align-items: center;
        padding: 24px;
        color: rgba(0, 0, 0, 0.54);
      }

      .no-alerts mat-icon {
        font-size: 48px;
        height: 48px;
        width: 48px;
        margin-bottom: 8px;
      }

      .severity-info {
        border-left: 4px solid #2196f3;
      }

      .severity-warning {
        border-left: 4px solid #ff9800;
      }

      .severity-error {
        border-left: 4px solid #f44336;
      }

      .severity-critical {
        border-left: 4px solid #9c27b0;
      }
    `,
  ],
})
export class AlertNotificationsComponent implements OnInit, OnDestroy {
  activeAlerts: AlertEvent[] = [];
  unacknowledgedCount = 0;
  private destroy$ = new Subject<void>();

  constructor(private alertService: AlertService) {}

  ngOnInit(): void {
    // Subscribe to active alerts
    this.alertService.activeAlerts$.pipe(takeUntil(this.destroy$)).subscribe(alerts => {
      this.activeAlerts = alerts.slice(0, 5); // Show only the 5 most recent alerts
    });

    // Subscribe to unacknowledged count
    this.alertService.unacknowledgedCount$.pipe(takeUntil(this.destroy$)).subscribe(count => {
      this.unacknowledgedCount = count;
    });

    // Load active alerts
    this.alertService.getActiveAlertEvents().subscribe();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Acknowledge an alert
   * @param alert Alert to acknowledge
   * @param event Click event
   */
  acknowledgeAlert(alert: AlertEvent, event: MouseEvent): void {
    event.stopPropagation();
    this.alertService.acknowledgeAlertEvent(alert.id).subscribe();
  }

  /**
   * Get severity CSS class
   * @param severity Alert severity
   */
  getSeverityClass(severity: AlertSeverity): string {
    switch (severity) {
      case AlertSeverity.INFO:
        return 'severity-info';
      case AlertSeverity.WARNING:
        return 'severity-warning';
      case AlertSeverity.ERROR:
        return 'severity-error';
      case AlertSeverity.CRITICAL:
        return 'severity-critical';
      default:
        return '';
    }
  }
}
