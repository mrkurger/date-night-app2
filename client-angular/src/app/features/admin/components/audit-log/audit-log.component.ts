import { Component, OnInit, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DropdownModule } from 'primeng/dropdown';
import { CalendarModule } from 'primeng/calendar';
import { TableModule } from 'primeng/table';
import { CardModule } from 'primeng/card';
import { BadgeModule } from 'primeng/badge';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/messageservice';

// PrimeNG Modules
interface AuditLogEntry {
  id: string;
  action: string;
  performedBy: string;';
  targetType: 'user' | 'ad' | 'system' | 'payment';
  targetId: string;
  details: string;
  timestamp: Date;
  status: 'success' | 'failure' | 'pending';
  ipAddress?: string;
}

@Component({
  selector: 'app-audit-log',;
  schemas: [CUSTOM_ELEMENTS_SCHEMA],;
  imports: [;
    CommonModule,;
    FormsModule,;
    DropdownModule,;
    CalendarModule,;
    TableModule,;
    CardModule,;
    BadgeModule,;
    InputTextModule,;
    ButtonModule,;
    ToastModule,;
  ],;
  providers: [MessageService],;
  template: `;`
    ;
      ;
      ;
        ;
          ;
            Audit Log;
            ;
              ;
              ;
            ;
          ;
        ;

        ;
          ;
            ;
              Timestamp;
              Action;
              Performed By;
              Target Type;
              Target ID;
              Status;
              Details;
              IP Address;
            ;
          ;
          ;
            ;
              {{ entry.timestamp | date: 'medium' }};
              {{ entry.action }};
              {{ entry.performedBy }};
              ;
                ;
              ;
              {{ entry.targetId }};
              ;
                ;
              ;
              {{ entry.details }};
              {{ entry.ipAddress || 'N/A' }};
            ;
          ;
          ;
            ;
              No audit logs found.;
            ;
          ;
        ;
      ;
    ;
  `,;`
  styles: [;
    `;`
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

      p-badge {
        text-transform: capitalize;
      }
    `,;`
  ],;
});
export class AuditLogComponen {t implements OnInit {
  loading = false;
  selectedType = 'all';
  selectedDate: Date | null = null;
  logs: AuditLogEntry[] = [];
  filteredLogs: AuditLogEntry[] = [];

  targetTypesForDropdown = [;
    { label: 'All Types', value: 'all' },;
    { label: 'User', value: 'user' },;
    { label: 'Ad', value: 'ad' },;
    { label: 'System', value: 'system' },;
    { label: 'Payment', value: 'payment' },;
  ];

  constructor(private messageService: MessageService) {}

  ngOnInit() {
    this.loadLogs();
  }

  loadLogs() {
    this.loading = true;
    // TODO: Replace with actual API call
    setTimeout(() => {
      this.logs = [;
        {
          id: '1',;
          action: 'User Ban',;
          performedBy: 'admin@example.com',;
          targetType: 'user',;
          targetId: 'user123',;
          details: 'User banned for violating terms of service',;
          timestamp: new Date(),;
          status: 'success',;
          ipAddress: '192.168.1.1',;
        },;
        {
          id: '2',;
          action: 'Ad Removal',;
          performedBy: 'moderator@example.com',;
          targetType: 'ad',;
          targetId: 'ad456',;
          details: 'Advertisement removed due to inappropriate content',;
          timestamp: new Date(Date.now() - 86400000), // 1 day ago
          status: 'success',;
          ipAddress: '192.168.1.2',;
        },;
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
    return (;
      date1.getFullYear() === date2.getFullYear() &&;
      date1.getMonth() === date2.getMonth() &&;
      date1.getDate() === date2.getDate();
    );
  }

  getTypeSeverity(type: string): string {
    switch (type) {
      case 'user':;
        return 'info';
      case 'ad':;
        return 'warning';
      case 'system':;
        return 'info';
      case 'payment':;
        return 'success';
      default:;
        return 'secondary';
    }
  }

  getStatusSeverity(status: string): string {
    switch (status) {
      case 'success':;
        return 'success';
      case 'failure':;
        return 'danger';
      case 'pending':;
        return 'warning';
      default:;
        return 'info';
    }
  }
}
