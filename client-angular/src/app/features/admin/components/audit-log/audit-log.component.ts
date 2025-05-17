import { Component, OnInit, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NebularModule } from '../../../shared/nebular.module';
import { NbToastrService } from '@nebular/theme';

interface AuditLogEntry {
  id: string;
  action: string;
  performedBy: string;
  targetType: 'user' | 'ad' | 'system' | 'payment';
  targetId: string;
  details: string;
  timestamp: Date;
  status: 'success' | 'failure' | 'pending';
  ipAddress?: string;
}

@Component({
  selector: 'app-audit-log',
  standalone: true,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  imports: [CommonModule, FormsModule, NebularModule],
  template: `
    <div class="audit-log">
      <nb-card>
        <nb-card-header class="d-flex justify-content-between align-items-center">
          <h5>Audit Log</h5>
          <div class="filters">
            <nb-select [(ngModel)]="selectedType" (selectedChange)="filterLogs()">
              <nb-option value="all">All Types</nb-option>
              <nb-option value="user">User</nb-option>
              <nb-option value="ad">Ad</nb-option>
              <nb-option value="system">System</nb-option>
              <nb-option value="payment">Payment</nb-option>
            </nb-select>
            <input
              nbInput
              [nbDatepicker]="datepicker"
              placeholder="Select Date"
              [(ngModel)]="selectedDate"
              (ngModelChange)="filterLogs()"
            />
            <nb-datepicker #datepicker></nb-datepicker>
          </div>
        </nb-card-header>

        <nb-card-body>
          <table nbTable>
            <thead>
              <tr>
                <th>Timestamp</th>
                <th>Action</th>
                <th>Performed By</th>
                <th>Target Type</th>
                <th>Target ID</th>
                <th>Status</th>
                <th>Details</th>
                <th>IP Address</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let entry of filteredLogs">
                <td>{{ entry.timestamp | date: 'medium' }}</td>
                <td>{{ entry.action }}</td>
                <td>{{ entry.performedBy }}</td>
                <td>
                  <nb-badge [text]="entry.targetType" [status]="getTypeStatus(entry.targetType)">
                  </nb-badge>
                </td>
                <td>{{ entry.targetId }}</td>
                <td>
                  <nb-badge [text]="entry.status" [status]="getStatusBadge(entry.status)">
                  </nb-badge>
                </td>
                <td>{{ entry.details }}</td>
                <td>{{ entry.ipAddress || 'N/A' }}</td>
              </tr>
            </tbody>
          </table>
        </nb-card-body>
      </nb-card>
    </div>
  `,
  styles: [
    `
      :host {
        display: block;
        max-width: 100%;
      }

      .audit-log {
        padding: 1rem;
      }

      .filters {
        display: flex;
        gap: 1rem;
        align-items: center;
      }

      table {
        width: 100%;
      }

      td {
        vertical-align: middle;
      }

      nb-badge {
        text-transform: capitalize;
      }
    `,
  ],
})
export class AuditLogComponent implements OnInit {
  loading = false;
  selectedType = 'all';
  selectedDate: Date | null = null;
  logs: AuditLogEntry[] = [];
  filteredLogs: AuditLogEntry[] = [];

  constructor(private toastrService: NbToastrService) {}

  ngOnInit() {
    this.loadLogs();
  }

  loadLogs() {
    this.loading = true;
    // TODO: Replace with actual API call
    setTimeout(() => {
      this.logs = [
        {
          id: '1',
          action: 'User Ban',
          performedBy: 'admin@example.com',
          targetType: 'user',
          targetId: 'user123',
          details: 'User banned for violating terms of service',
          timestamp: new Date(),
          status: 'success',
          ipAddress: '192.168.1.1',
        },
        {
          id: '2',
          action: 'Ad Removal',
          performedBy: 'moderator@example.com',
          targetType: 'ad',
          targetId: 'ad456',
          details: 'Advertisement removed due to inappropriate content',
          timestamp: new Date(Date.now() - 86400000), // 1 day ago
          status: 'success',
          ipAddress: '192.168.1.2',
        },
        // Add more mock data as needed
      ];
      this.filterLogs();
      this.loading = false;
    }, 1000);
  }

  filterLogs() {
    this.filteredLogs = this.logs.filter((log) => {
      const typeMatch = this.selectedType === 'all' || log.targetType === this.selectedType;
      const dateMatch = !this.selectedDate || this.isSameDay(log.timestamp, this.selectedDate);
      return typeMatch && dateMatch;
    });
  }

  isSameDay(date1: Date, date2: Date): boolean {
    return (
      date1.getFullYear() === date2.getFullYear() &&
      date1.getMonth() === date2.getMonth() &&
      date1.getDate() === date2.getDate()
    );
  }

  getTypeStatus(type: string): string {
    switch (type) {
      case 'user':
        return 'info';
      case 'ad':
        return 'warning';
      case 'system':
        return 'primary';
      case 'payment':
        return 'success';
      default:
        return 'basic';
    }
  }

  getStatusBadge(status: string): string {
    switch (status) {
      case 'success':
        return 'success';
      case 'failure':
        return 'danger';
      case 'pending':
        return 'warning';
      default:
        return 'basic';
    }
  }
}
