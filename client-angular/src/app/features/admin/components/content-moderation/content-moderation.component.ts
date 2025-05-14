import { NbIconModule } from '@nebular/theme';
import { NbSelectModule } from '@nebular/theme';
import { NbTagModule } from '@nebular/theme';
import { NbBadgeModule } from '@nebular/theme';
import { NbCardModule } from '@nebular/theme';
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';


interface ReportedContent {
  id: string;
  type: 'ad' | 'user' | 'comment';
  content: string;
  reportedBy: string;
  reason: string;
  status: 'pending' | 'reviewed' | 'actioned';
  timestamp: Date;
  severity: 'low' | 'medium' | 'high';
}

@Component({
  selector: 'app-content-moderation',
  standalone: true,
  imports: [CommonModule, FormsModule, NbCardModule, NbButtonModule, NbIconModule, NbSelectModule, NbSpinnerModule, NbTabsetModule, NbTagModule, NbBadgeModule],
  template: `
    <div class="content-moderation">
      <nb-card>
        <nb-card-header class="d-flex justify-content-between align-items-center">
          <h5>Content Moderation</h5>
          <div>
            <nb-select [(ngModel)]="selectedFilter" (selectedChange)="filterReports()">
              <nb-option value="all">All Reports</nb-option>
              <nb-option value="pending">Pending</nb-option>
              <nb-option value="reviewed">Reviewed</nb-option>
              <nb-option value="actioned">Actioned</nb-option>
            </nb-select>
          </div>
        </nb-card-header>

        <nb-card-body>
          <table nbTable [nbTreeGrid]="false" [loading]="loading">
            <thead>
              <tr>
                <th>Type</th>
                <th>Content</th>
                <th>Reported By</th>
                <th>Reason</th>
                <th>Severity</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let report of filteredReports">
                <td>
                  <nb-badge [text]="report.type" [status]="getTypeStatus(report.type)"></nb-badge>
                </td>
                <td>{{ report.content }}</td>
                <td>{{ report.reportedBy }}</td>
                <td>{{ report.reason }}</td>
                <td>
                  <nb-tag [text]="report.severity" [status]="getSeverityStatus(report.severity)">
                  </nb-tag>
                </td>
                <td>
                  <nb-badge [text]="report.status" [status]="getStatusBadge(report.status)">
                  </nb-badge>
                </td>
                <td>
                  <div class="actions">
                    <button nbButton ghost size="small" (click)="reviewReport(report)">
                      <nb-icon icon="eye-outline"></nb-icon>
                    </button>
                    <button
                      nbButton
                      ghost
                      size="small"
                      status="danger"
                      (click)="takeAction(report)"
                    >
                      <nb-icon icon="slash-outline"></nb-icon>
                    </button>
                    <button nbButton ghost size="small" status="success" (click)="approve(report)">
                      <nb-icon icon="checkmark-outline"></nb-icon>
                    </button>
                  </div>
                </td>
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

      .content-moderation {
        padding: 1rem;
      }

      .actions {
        display: flex;
        gap: 0.5rem;
      }

      nb-card-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
      }

      table {
        width: 100%;
      }

      td {
        vertical-align: middle;
      }
    `,
  ],
})
export class ContentModerationComponent implements OnInit {
  loading = false;
  selectedFilter = 'all';
  reports: ReportedContent[] = [];
  filteredReports: ReportedContent[] = [];

  constructor(private toastrService: NbToastrService) {}

  ngOnInit() {
    this.loadReports();
  }

  loadReports() {
    this.loading = true;
    // TODO: Replace with actual API call
    setTimeout(() => {
      this.reports = [
        {
          id: '1',
          type: 'ad',
          content: 'Inappropriate advertisement content',
          reportedBy: 'user123',
          reason: 'Offensive content',
          status: 'pending',
          timestamp: new Date(),
          severity: 'high',
        },
        {
          id: '2',
          type: 'user',
          content: 'Suspicious user activity',
          reportedBy: 'user456',
          reason: 'Spam',
          status: 'reviewed',
          timestamp: new Date(),
          severity: 'medium',
        },
        // Add more mock data as needed
      ];
      this.filterReports();
      this.loading = false;
    }, 1000);
  }

  filterReports() {
    if (this.selectedFilter === 'all') {
      this.filteredReports = this.reports;
    } else {
      this.filteredReports = this.reports.filter((report) => report.status === this.selectedFilter);
    }
  }

  getTypeStatus(type: string): string {
    switch (type) {
      case 'ad':
        return 'info';
      case 'user':
        return 'warning';
      case 'comment':
        return 'basic';
      default:
        return 'basic';
    }
  }

  getSeverityStatus(severity: string): string {
    switch (severity) {
      case 'high':
        return 'danger';
      case 'medium':
        return 'warning';
      case 'low':
        return 'info';
      default:
        return 'basic';
    }
  }

  getStatusBadge(status: string): string {
    switch (status) {
      case 'pending':
        return 'warning';
      case 'reviewed':
        return 'info';
      case 'actioned':
        return 'success';
      default:
        return 'basic';
    }
  }

  reviewReport(report: ReportedContent) {
    // TODO: Implement review dialog
    this.toastrService.info('Opening review dialog...');
  }

  takeAction(report: ReportedContent) {
    // TODO: Implement action dialog
    this.toastrService.warning('Taking action on reported content...');
  }

  approve(report: ReportedContent) {
    // TODO: Implement approval
    this.toastrService.success('Content approved');
  }
}
