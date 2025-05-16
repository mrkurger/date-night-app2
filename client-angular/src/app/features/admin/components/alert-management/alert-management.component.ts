import { Component, OnDestroy, OnInit, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import {
  NbCardModule,
  NbButtonModule,
  NbInputModule,
  NbFormFieldModule,
  NbIconModule,
  NbSpinnerModule,
  NbAlertModule,
  NbTooltipModule,
  NbBadgeModule,
  NbTagModule,
  NbSelectModule,
  NbTableModule,
  NbDialogModule,
  NbDialogService,
  NbTabsetModule,
  NbPaginatorModule,
} from '@nebular/theme';

import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';

import {
  AppSortComponent,
  AppSortHeaderComponent,
} from '../../../../shared/components/custom-nebular-components/nb-sort/nb-sort.component';
import { AlertService } from '../../../../core/services/alert.service';
import {
  Alert,
  AlertEvent,
  AlertSeverity,
  AlertConditionType,
  AlertTimeWindow,
  AlertChannel,
} from '../../../../core/models/alert.model';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { AlertFormDialogComponent } from '../alert-form-dialog/alert-form-dialog.component';

@Component({
  selector: 'app-alert-management',
  standalone: true,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  imports: [CommonModule, ReactiveFormsModule, NbCardModule, NbButtonModule, NbTableModule, NbFormFieldModule, NbInputModule, NbSelectModule, NbToggleModule, NbIconModule, NbDialogModule, NbTagModule, NbBadgeModule, NbTooltipModule, NbTabsetModule, AppSortComponent, AppSortHeaderComponent
    NbPaginatorModule],
  template: `
    <div class="alert-management-container">
      <h1>Alert Management</h1>

      <div class="alert-header">
        <div class="alert-actions">
          <button nbButton status="primary" (click)="openAlertDialog()">
            <nb-icon icon="plus-outline"></nb-icon> Create Alert
          </button>
        </div>

        <div class="active-alerts-badge" *ngIf="unacknowledgedCount > 0">
          <button
            nbButton
            status="danger"
            [nbBadge]="unacknowledgedCount"
            nbBadgePosition="top right"
            (click)="selectedTabIndex = 1"
          >
            Active Alerts
          </button>
        </div>
      </div>

      <nb-tabset [(selectedIndex)]="selectedTabIndex">
        <nb-tab tabTitle="Alert Definitions">
          <div class="alert-definitions-container">
            <nb-card>
              <nb-card-body>
                <app-sort
                  [active]="sortColumn"
                  [direction]="sortDirection"
                  (sortChange)="sortAlerts($event)"
                >
                  <table>
                    <tr>
                      <th><app-sort-header appSortHeaderId="name">Name</app-sort-header></th>
                      <th>
                        <app-sort-header appSortHeaderId="severity">Severity</app-sort-header>
                      </th>
                      <th>Condition</th>
                      <th>Notifications</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                    <tr *ngFor="let alert of alerts">
                      <td>{{ alert.name }}</td>
                      <td>
                        <nb-tag [status]="getSeverityStatus(alert.severity)">
                          {{ getSeverityLabel(alert.severity) }}
                        </nb-tag>
                      </td>
                      <td>{{ getConditionDescription(alert.condition) }}</td>
                      <td>
                        <div class="notification-channels">
                          <nb-icon
                            *ngIf="hasChannel(alert, 'ui')"
                            icon="bell-outline"
                            nbTooltip="UI Notification"
                          ></nb-icon>
                          <nb-icon
                            *ngIf="hasChannel(alert, 'email')"
                            icon="email-outline"
                            nbTooltip="Email Notification"
                          ></nb-icon>
                          <nb-icon
                            *ngIf="hasChannel(alert, 'slack')"
                            icon="message-square-outline"
                            nbTooltip="Slack Notification"
                          ></nb-icon>
                          <nb-icon
                            *ngIf="hasChannel(alert, 'webhook')"
                            icon="link-2-outline"
                            nbTooltip="Webhook Notification"
                          ></nb-icon>
                        </div>
                      </td>
                      <td>
                        <nb-toggle
                          [checked]="alert.enabled"
                          (checkedChange)="toggleAlert(alert, $event)"
                        ></nb-toggle>
                      </td>
                      <td>
                        <button
                          nbButton
                          ghost
                          status="primary"
                          (click)="editAlert(alert)"
                          nbTooltip="Edit"
                        >
                          <nb-icon icon="edit-outline"></nb-icon>
                        </button>
                        <button
                          nbButton
                          ghost
                          status="primary"
                          (click)="testAlert(alert)"
                          nbTooltip="Test"
                        >
                          <nb-icon icon="play-circle-outline"></nb-icon>
                        </button>
                        <button
                          nbButton
                          ghost
                          status="danger"
                          (click)="deleteAlert(alert)"
                          nbTooltip="Delete"
                        >
                          <nb-icon icon="trash-2-outline"></nb-icon>
                        </button>
                      </td>
                    </tr>
                  </table>
                </app-sort>

                <nb-paginator
                  [pageSize]="pageSize"
                  [pageSizeOptions]="[5, 10, 25, 50]"
                  [total]="totalAlerts"
                  [page]="pageIndex + 1"
                  (pageChange)="onPageChange($event)"
                  (pageSizeChange)="onPageSizeChange($event)"
                ></nb-paginator>
              </nb-card-body>
            </nb-card>
          </div>
        </nb-tab>

        <nb-tab tabTitle="Active Alerts">
          <div class="active-alerts-container">
            <nb-card>
              <nb-card-body>
                <app-sort
                  [active]="activeSortColumn"
                  [direction]="activeSortDirection"
                  (sortChange)="sortActiveAlerts($event)"
                >
                  <table>
                    <tr>
                      <th><app-sort-header appSortHeaderId="timestamp">Time</app-sort-header></th>
                      <th><app-sort-header appSortHeaderId="alertName">Alert</app-sort-header></th>
                      <th>
                        <app-sort-header appSortHeaderId="severity">Severity</app-sort-header>
                      </th>
                      <th>Message</th>
                      <th><app-sort-header appSortHeaderId="status">Status</app-sort-header></th>
                      <th>Actions</th>
                    </tr>
                    <tr *ngFor="let event of activeAlerts">
                      <td>{{ event.timestamp | date: 'medium' }}</td>
                      <td>{{ event.alertName }}</td>
                      <td>
                        <nb-tag [status]="getSeverityStatus(event.severity)">
                          {{ getSeverityLabel(event.severity) }}
                        </nb-tag>
                      </td>
                      <td>{{ event.message }}</td>
                      <td>
                        <nb-badge
                          [text]="event.acknowledged ? 'Acknowledged' : 'Unacknowledged'"
                          [status]="event.acknowledged ? 'success' : 'danger'"
                        ></nb-badge>
                      </td>
                      <td>
                        <button
                          nbButton
                          ghost
                          status="primary"
                          (click)="acknowledgeAlert(event)"
                          [disabled]="event.acknowledged"
                          nbTooltip="Acknowledge"
                        >
                          <nb-icon icon="checkmark-circle-2-outline"></nb-icon>
                        </button>
                        <button
                          nbButton
                          ghost
                          status="primary"
                          (click)="viewAlertDetails(event)"
                          nbTooltip="View Details"
                        >
                          <nb-icon icon="info-outline"></nb-icon>
                        </button>
                      </td>
                    </tr>
                  </table>
                </app-sort>
              </nb-card-body>
            </nb-card>
          </div>
        </nb-tab>
      </nb-tabset>
    </div>
  `,
  styles: [
    `
      .alert-management-container {
        padding: 20px;
      }

      .alert-header {
        display: flex;
        justify-content: space-between;
        margin-bottom: 20px;
      }

      .alert-definitions-container,
      .active-alerts-container {
        margin-top: 20px;
      }

      table {
        width: 100%;
        border-collapse: collapse;
      }

      th,
      td {
        padding: 1rem;
        text-align: left;
        border-bottom: 1px solid var(--border-basic-color-3);
      }

      th {
        background-color: var(--background-basic-color-2);
        font-weight: 600;
      }

      .notification-channels {
        display: flex;
        gap: 8px;
      }

      nb-icon {
        font-size: 1.25rem;
      }

      button[nbButton] {
        margin-right: 0.5rem;
      }
    `,
  ],
})
export class AlertManagementComponent implements OnInit, OnDestroy {
  // Alert definitions
  alerts: Alert[] = [];
  pageSize = 10;
  pageIndex = 0;
  totalAlerts = 0;

  // Active alerts
  activeAlerts: AlertEvent[] = [];
  unacknowledgedCount = 0;

  // Tab selection
  selectedTabIndex = 0;

  // Sorting
  sortColumn: string | null = null;
  sortDirection: string = 'asc';
  activeSortColumn: string | null = null;
  activeSortDirection: string = 'asc';

  private destroy$ = new Subject<void>();

  constructor(
    private alertService: AlertService,
    private dialog: NbDialogService,
  ) {}

  ngOnInit(): void {
    this.loadAlerts();
    this.loadActiveAlerts();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadAlerts(): void {
    this.alertService
      .getAlerts(this.pageIndex, this.pageSize)
      .pipe(takeUntil(this.destroy$))
      .subscribe((response) => {
        this.alerts = response.alerts;
        this.totalAlerts = response.total;
      });
  }

  loadActiveAlerts(): void {
    this.alertService
      .getActiveAlerts()
      .pipe(takeUntil(this.destroy$))
      .subscribe((alerts) => {
        this.activeAlerts = alerts;
        this.unacknowledgedCount = alerts.filter((a) => !a.acknowledged).length;
      });
  }

  onPageChange(page: number): void {
    this.pageIndex = page - 1;
    this.loadAlerts();
  }

  onPageSizeChange(pageSize: number): void {
    this.pageSize = pageSize;
    this.pageIndex = 0;
    this.loadAlerts();
  }

  sortAlerts(sort: { column: string; direction: string }): void {
    if (!sort.column || !sort.direction) {
      return;
    }

    this.alerts = this.alerts.slice().sort((a, b) => {
      const isAsc = sort.direction === 'asc';
      switch (sort.column) {
        case 'name':
          return this.compare(a.name, b.name, isAsc);
        case 'severity':
          return this.compare(a.severity, b.severity, isAsc);
        default:
          return 0;
      }
    });
  }

  sortActiveAlerts(sort: { column: string; direction: string }): void {
    if (!sort.column || !sort.direction) {
      return;
    }

    this.activeAlerts = this.activeAlerts.slice().sort((a, b) => {
      const isAsc = sort.direction === 'asc';
      switch (sort.column) {
        case 'timestamp':
          return this.compare(a.timestamp, b.timestamp, isAsc);
        case 'alertName':
          return this.compare(a.alertName, b.alertName, isAsc);
        case 'severity':
          return this.compare(a.severity, b.severity, isAsc);
        case 'status':
          return this.compare(a.acknowledged, b.acknowledged, isAsc);
        default:
          return 0;
      }
    });
  }

  private compare(a: any, b: any, isAsc: boolean): number {
    return (a < b ? -1 : 1) * (isAsc ? 1 : -1);
  }

  getSeverityLabel(severity: AlertSeverity): string {
    return AlertSeverity[severity];
  }

  getSeverityStatus(severity: AlertSeverity): string {
    switch (severity) {
      case AlertSeverity.INFO:
        return 'info';
      case AlertSeverity.WARNING:
        return 'warning';
      case AlertSeverity.ERROR:
        return 'danger';
      case AlertSeverity.CRITICAL:
        return 'danger';
      default:
        return 'basic';
    }
  }

  getConditionDescription(condition: AlertConditionType): string {
    return AlertConditionType[condition];
  }

  hasChannel(alert: Alert, channel: AlertChannel): boolean {
    return alert.channels.includes(channel);
  }

  toggleAlert(alert: Alert, enabled: boolean): void {
    this.alertService
      .updateAlert(alert.id, { enabled })
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        alert.enabled = enabled;
      });
  }

  openAlertDialog(alert?: Alert): void {
    const dialogRef = this.dialog.open(AlertFormDialogComponent, {
      context: { alert },
    });

    dialogRef.onClose.subscribe((result) => {
      if (result) {
        this.loadAlerts();
      }
    });
  }

  editAlert(alert: Alert): void {
    this.openAlertDialog(alert);
  }

  testAlert(alert: Alert): void {
    this.alertService.testAlert(alert.id).pipe(takeUntil(this.destroy$)).subscribe();
  }

  deleteAlert(alert: Alert): void {
    this.alertService
      .deleteAlert(alert.id)
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.loadAlerts();
      });
  }

  acknowledgeAlert(event: AlertEvent): void {
    this.alertService
      .acknowledgeAlert(event.id)
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        event.acknowledged = true;
        this.unacknowledgedCount--;
      });
  }

  viewAlertDetails(event: AlertEvent): void {
    // TODO: Implement alert details dialog
  }
}
