import {} from '../../../../shared/nebular.module';
import { NbProgressBarModule, NbToastrService } from '@nebular/theme';
import { Component, OnInit, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { NgxChartsModule } from '@swimlane/ngx-charts';

interface ErrorLog {
  id: string;
  timestamp: Date;
  level: 'error' | 'warning' | 'critical';
  message: string;
  stack?: string;
  component?: string;
  userId?: string;
  url?: string;
  userAgent?: string;
  count: number; // For aggregated errors
}

interface SecurityAlert {
  id: string;
  timestamp: Date;
  type: 'intrusion' | 'authentication' | 'vulnerability' | 'malware';
  severity: 'low' | 'medium' | 'high' | 'critical';
  source: string;
  description: string;
  status: 'new' | 'investigating' | 'resolved';
  ipAddress?: string;
  location?: string;
}

interface Vulnerability {
  id: string;
  package: string;
  currentVersion: string;
  vulnerableVersions: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  cveId?: string;
  fixedInVersion?: string;
  recommendation: string;
}

interface SecurityMetrics {
  failedLogins: number;
  activeUsers: number;
  blockedIPs: number;
  vulnerabilities: {
    critical: number;
    high: number;
    medium: number;
    low: number;
  };
}

@Component({
  selector: 'app-error-security-dashboard',
  standalone: true,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  imports: [CommonModule, FormsModule, NgxChartsModule, NbProgressBarModule],
  template: `
    <div class="error-security-dashboard">
      <!-- Security Metrics Overview -->
      <div class="metrics-grid">
        <nb-card>
          <nb-card-body>
            <div class="metric">
              <div class="metric-title">Failed Login Attempts (24h)</div>
              <div class="metric-value">{{ metrics.failedLogins }}</div>
              <nb-progress-bar
                [value]="(metrics.failedLogins / 1000) * 100"
                status="danger"
                size="tiny"
              ></nb-progress-bar>
            </div>
          </nb-card-body>
        </nb-card>

        <nb-card>
          <nb-card-body>
            <div class="metric">
              <div class="metric-title">Active Users</div>
              <div class="metric-value">{{ metrics.activeUsers }}</div>
              <nb-progress-bar
                [value]="(metrics.activeUsers / 5000) * 100"
                status="success"
                size="tiny"
              ></nb-progress-bar>
            </div>
          </nb-card-body>
        </nb-card>

        <nb-card>
          <nb-card-body>
            <div class="metric">
              <div class="metric-title">Blocked IPs</div>
              <div class="metric-value">{{ metrics.blockedIPs }}</div>
              <nb-progress-bar
                [value]="(metrics.blockedIPs / 500) * 100"
                status="warning"
                size="tiny"
              ></nb-progress-bar>
            </div>
          </nb-card-body>
        </nb-card>

        <nb-card>
          <nb-card-body>
            <div class="metric">
              <div class="metric-title">Critical Vulnerabilities</div>
              <div class="metric-value">{{ metrics.vulnerabilities.critical }}</div>
              <nb-progress-bar
                [value]="metrics.vulnerabilities.critical * 10"
                status="danger"
                size="tiny"
              ></nb-progress-bar>
            </div>
          </nb-card-body>
        </nb-card>
      </div>

      <nb-tabset>
        <!-- Error Logs Tab -->
        <nb-tab tabTitle="Error Logs">
          <nb-card>
            <nb-card-header class="d-flex justify-content-between align-items-center">
              <h6>Application Errors</h6>
              <div class="filters">
                <nb-select [(ngModel)]="selectedErrorLevel" (selectedChange)="filterErrors()">
                  <nb-option value="all">All Levels</nb-option>
                  <nb-option value="error">Errors</nb-option>
                  <nb-option value="warning">Warnings</nb-option>
                  <nb-option value="critical">Critical</nb-option>
                </nb-select>
              </div>
            </nb-card-header>
            <nb-card-body>
              <nb-list>
                <nb-list-item *ngFor="let error of filteredErrors">
                  <div class="error-item">
                    <div class="error-header">
                      <nb-badge [text]="error.level" [status]="getErrorStatus(error.level)">
                      </nb-badge>
                      <span class="timestamp">{{ error.timestamp | date: 'medium' }}</span>
                    </div>
                    <div class="error-message">{{ error.message }}</div>
                    <div class="error-details" *ngIf="error.component || error.url">
                      <small>
                        {{ error.component }}
                        <span *ngIf="error.url"> - {{ error.url }}</span>
                      </small>
                    </div>
                    <div class="error-count" *ngIf="error.count > 1">
                      Occurred {{ error.count }} times
                    </div>
                  </div>
                </nb-list-item>
              </nb-list>
            </nb-card-body>
          </nb-card>
        </nb-tab>

        <!-- Security Alerts Tab -->
        <nb-tab tabTitle="Security Alerts">
          <nb-card>
            <nb-card-header class="d-flex justify-content-between align-items-center">
              <h6>Security Incidents</h6>
              <div class="filters">
                <nb-select [(ngModel)]="selectedAlertType" (selectedChange)="filterAlerts()">
                  <nb-option value="all">All Types</nb-option>
                  <nb-option value="intrusion">Intrusion Attempts</nb-option>
                  <nb-option value="authentication">Authentication</nb-option>
                  <nb-option value="vulnerability">Vulnerabilities</nb-option>
                  <nb-option value="malware">Malware</nb-option>
                </nb-select>
              </div>
            </nb-card-header>
            <nb-card-body>
              <nb-list>
                <nb-list-item *ngFor="let alert of filteredAlerts">
                  <div class="alert-item">
                    <div class="alert-header">
                      <nb-badge
                        [text]="alert.severity"
                        [status]="getAlertSeverityStatus(alert.severity)"
                      >
                      </nb-badge>
                      <span class="alert-type">{{ alert.type }}</span>
                      <span class="timestamp">{{ alert.timestamp | date: 'medium' }}</span>
                    </div>
                    <div class="alert-description">{{ alert.description }}</div>
                    <div class="alert-details">
                      <small>
                        Source: {{ alert.source }}
                        <span *ngIf="alert.ipAddress">
                          | IP: {{ alert.ipAddress }}
                          <span *ngIf="alert.location">({{ alert.location }})</span>
                        </span>
                      </small>
                    </div>
                    <div class="alert-status">
                      <nb-badge [text]="alert.status" [status]="getAlertStatusBadge(alert.status)">
                      </nb-badge>
                    </div>
                  </div>
                </nb-list-item>
              </nb-list>
            </nb-card-body>
          </nb-card>
        </nb-tab>

        <!-- Vulnerabilities Tab -->
        <nb-tab tabTitle="Vulnerabilities">
          <nb-card>
            <nb-card-header class="d-flex justify-content-between align-items-center">
              <h6>Package Vulnerabilities</h6>
              <div class="filters">
                <nb-select
                  [(ngModel)]="selectedVulnSeverity"
                  (selectedChange)="filterVulnerabilities()"
                >
                  <nb-option value="all">All Severities</nb-option>
                  <nb-option value="critical">Critical</nb-option>
                  <nb-option value="high">High</nb-option>
                  <nb-option value="medium">Medium</nb-option>
                  <nb-option value="low">Low</nb-option>
                </nb-select>
              </div>
            </nb-card-header>
            <nb-card-body>
              <nb-list>
                <nb-list-item *ngFor="let vuln of filteredVulnerabilities">
                  <div class="vuln-item">
                    <div class="vuln-header">
                      <nb-badge
                        [text]="vuln.severity"
                        [status]="getVulnerabilitySeverityStatus(vuln.severity)"
                      >
                      </nb-badge>
                      <span class="package-name">{{ vuln.package }}</span>
                      <span class="version">v{{ vuln.currentVersion }}</span>
                    </div>
                    <div class="vuln-description">{{ vuln.description }}</div>
                    <div class="vuln-details">
                      <small>
                        Vulnerable versions: {{ vuln.vulnerableVersions }}
                        <span *ngIf="vuln.cveId"> | CVE: {{ vuln.cveId }}</span>
                      </small>
                    </div>
                    <div class="vuln-fix" *ngIf="vuln.fixedInVersion">
                      <nb-alert status="success" size="tiny">
                        Fixed in version {{ vuln.fixedInVersion }}
                      </nb-alert>
                    </div>
                    <div class="vuln-recommendation">
                      <strong>Recommendation:</strong> {{ vuln.recommendation }}
                    </div>
                  </div>
                </nb-list-item>
              </nb-list>
            </nb-card-body>
          </nb-card>
        </nb-tab>
      </nb-tabset>
    </div>
  `,
  styles: [
    `
      :host {
        display: block;
        max-width: 100%;
      }

      .error-security-dashboard {
        padding: 1rem;
      }

      .metrics-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
        gap: 1rem;
        margin-bottom: 1rem;
      }

      .metric {
        text-align: center;
      }

      .metric-title {
        font-size: 0.875rem;
        color: nb-theme(text-hint-color);
        margin-bottom: 0.5rem;
      }

      .metric-value {
        font-size: 2rem;
        font-weight: bold;
        margin-bottom: 0.5rem;
      }

      .filters {
        display: flex;
        gap: 1rem;
        align-items: center;
      }

      .error-item,
      .alert-item,
      .vuln-item {
        width: 100%;
      }

      .error-header,
      .alert-header,
      .vuln-header {
        display: flex;
        align-items: center;
        gap: 1rem;
        margin-bottom: 0.5rem;
      }

      .error-message,
      .alert-description,
      .vuln-description {
        margin-bottom: 0.5rem;
      }

      .error-details,
      .alert-details,
      .vuln-details {
        color: nb-theme(text-hint-color);
        margin-bottom: 0.5rem;
      }

      .timestamp {
        color: nb-theme(text-hint-color);
        font-size: 0.875rem;
      }

      .package-name {
        font-weight: bold;
      }

      .version {
        color: nb-theme(text-hint-color);
      }

      .vuln-fix {
        margin: 0.5rem 0;
      }

      .vuln-recommendation {
        margin-top: 0.5rem;
        padding: 0.5rem;
        background: nb-theme(background-basic-color-2);
        border-radius: nb-theme(border-radius);
      }
    `,
  ],
})
export class ErrorSecurityDashboardComponent implements OnInit {
  // Filters
  selectedErrorLevel = 'all';
  selectedAlertType = 'all';
  selectedVulnSeverity = 'all';

  // Data
  metrics: SecurityMetrics = {
    failedLogins: 0,
    activeUsers: 0,
    blockedIPs: 0,
    vulnerabilities: {
      critical: 0,
      high: 0,
      medium: 0,
      low: 0,
    },
  };

  errors: ErrorLog[] = [];
  filteredErrors: ErrorLog[] = [];
  alerts: SecurityAlert[] = [];
  filteredAlerts: SecurityAlert[] = [];
  vulnerabilities: Vulnerability[] = [];
  filteredVulnerabilities: Vulnerability[] = [];

  constructor(/* private toastrService: NbToastrService */) {}

  ngOnInit() {
    this.loadData();
  }

  loadData() {
    // TODO: Replace with actual API calls
    this.loadMetrics();
    this.loadErrors();
    this.loadSecurityAlerts();
    this.loadVulnerabilities();
  }

  loadMetrics() {
    this.metrics = {
      failedLogins: 247,
      activeUsers: 1532,
      blockedIPs: 43,
      vulnerabilities: {
        critical: 2,
        high: 5,
        medium: 12,
        low: 8,
      },
    };
  }

  loadErrors() {
    this.errors = [
      {
        id: '1',
        timestamp: new Date(),
        level: 'critical',
        message: 'Database connection timeout in user authentication service',
        component: 'AuthService',
        userId: 'system',
        url: '/api/auth',
        count: 3,
      },
      {
        id: '2',
        timestamp: new Date(Date.now() - 3600000),
        level: 'error',
        message: 'Failed to process payment transaction',
        component: 'PaymentService',
        userId: 'user123',
        url: '/api/payments',
        count: 1,
      },
      // Add more mock error data
    ];
    this.filterErrors();
  }

  loadSecurityAlerts() {
    this.alerts = [
      {
        id: '1',
        timestamp: new Date(),
        type: 'intrusion',
        severity: 'high',
        source: 'Firewall',
        description: 'Multiple failed SSH attempts detected',
        status: 'investigating',
        ipAddress: '192.168.1.100',
        location: 'Russia',
      },
      {
        id: '2',
        timestamp: new Date(Date.now() - 1800000),
        type: 'authentication',
        severity: 'medium',
        source: 'Auth Service',
        description: 'Unusual login pattern detected',
        status: 'new',
        ipAddress: '10.0.0.50',
        location: 'United States',
      },
      // Add more mock alert data
    ];
    this.filterAlerts();
  }

  loadVulnerabilities() {
    this.vulnerabilities = [
      {
        id: '1',
        package: 'lodash',
        currentVersion: '4.17.15',
        vulnerableVersions: '<4.17.21',
        severity: 'critical',
        description: 'Prototype Pollution in lodash',
        cveId: 'CVE-2021-23337',
        fixedInVersion: '4.17.21',
        recommendation: 'Update to version 4.17.21 or later',
      },
      {
        id: '2',
        package: 'node-fetch',
        currentVersion: '2.6.0',
        vulnerableVersions: '<2.6.1',
        severity: 'high',
        description: 'Denial of Service in node-fetch',
        cveId: 'CVE-2020-15168',
        fixedInVersion: '2.6.1',
        recommendation: 'Update to version 2.6.1 or later',
      },
      // Add more mock vulnerability data
    ];
    this.filterVulnerabilities();
  }

  filterErrors() {
    this.filteredErrors =
      this.selectedErrorLevel === 'all'
        ? this.errors
        : this.errors.filter((error) => error.level === this.selectedErrorLevel);
  }

  filterAlerts() {
    this.filteredAlerts =
      this.selectedAlertType === 'all'
        ? this.alerts
        : this.alerts.filter((alert) => alert.type === this.selectedAlertType);
  }

  filterVulnerabilities() {
    this.filteredVulnerabilities =
      this.selectedVulnSeverity === 'all'
        ? this.vulnerabilities
        : this.vulnerabilities.filter((vuln) => vuln.severity === this.selectedVulnSeverity);
  }

  getErrorStatus(level: string): string {
    switch (level) {
      case 'critical':
        return 'danger';
      case 'error':
        return 'warning';
      case 'warning':
        return 'basic';
      default:
        return 'basic';
    }
  }

  getAlertSeverityStatus(severity: string): string {
    switch (severity) {
      case 'critical':
        return 'danger';
      case 'high':
        return 'warning';
      case 'medium':
        return 'info';
      case 'low':
        return 'basic';
      default:
        return 'basic';
    }
  }

  getAlertStatusBadge(status: string): string {
    switch (status) {
      case 'new':
        return 'danger';
      case 'investigating':
        return 'warning';
      case 'resolved':
        return 'success';
      default:
        return 'basic';
    }
  }

  getVulnerabilitySeverityStatus(severity: string): string {
    switch (severity) {
      case 'critical':
        return 'danger';
      case 'high':
        return 'warning';
      case 'medium':
        return 'info';
      case 'low':
        return 'basic';
      default:
        return 'basic';
    }
  }
}
