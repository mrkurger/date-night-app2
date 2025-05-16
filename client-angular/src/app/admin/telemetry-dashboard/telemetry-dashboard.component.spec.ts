import { Input } from '@angular/core';
import { NebularModule } from '../../../shared/nebular.module';

import { Component } from '@angular/core';
// ===================================================
// CUSTOMIZABLE SETTINGS IN THIS FILE
// ===================================================
// This file contains settings for component configuration (telemetry-dashboard.component.spec)
//
// COMMON CUSTOMIZATIONS:
// - SETTING_NAME: Description of setting (default: value)
//   Related to: other_file.ts:OTHER_SETTING
// ===================================================
import { ComponentFixture, TestBed } from '@angular/core/testing';
import {
  /*DEPRECATED:NbPaginatorComponent*/,
  AppSortComponent as /*DEPRECATED:NbSortComponent*/,
  AppSortHeaderComponent as /*DEPRECATED:NbSortHeaderComponent*/,
} from '../../shared/components/custom-nebular-components';

import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { ReactiveFormsModule } from '@angular/forms';
import {
  NbTableModule,
  
} from '@nebular/theme';

import { TelemetryService } from '../../core/services/telemetry.service';
import { TelemetryDashboardComponent } from './telemetry-dashboard.component';
import { of } from 'rxjs';

describe('TelemetryDashboardComponent', () => {
  let component: TelemetryDashboardComponent;
  let fixture: ComponentFixture<TelemetryDashboardComponent>;
  let telemetryService: jasmine.SpyObj<TelemetryService>;

  const mockErrorStatistics = {
    totalErrors: 150,
    byErrorCode: {
      network_error: 45,
      server_error: 65,
      validation_error: 40,
    },
    byTimeRange: [
      { date: '2023-06-01', count: 25 },
      { date: '2023-06-02', count: 35 },
      { date: '2023-06-03', count: 90 },
    ],
    recentErrors: [
      {
        id: '1',
        errorCode: 'server_error',
        statusCode: 500,
        userMessage: 'Something went wrong on our end',
        technicalMessage: 'Internal server error',
        url: '/api/users',
        method: 'GET',
        timestamp: '2023-06-03T12:34:56Z',
      },
      {
        id: '2',
        errorCode: 'network_error',
        statusCode: 0,
        userMessage: 'Unable to connect to the server',
        technicalMessage: 'Network error or CORS issue',
        url: '/api/products',
        method: 'GET',
        timestamp: '2023-06-03T10:23:45Z',
      },
    ],
  };

  const mockPerformanceStatistics = {
    averageDuration: 320,
    p95Duration: 750,
    byEndpoint: [
      { url: '/api/users', method: 'GET', avgDuration: 150, p95Duration: 350, count: 1250 },
      { url: '/api/products', method: 'GET', avgDuration: 450, p95Duration: 950, count: 875 },
    ],
    byTimeRange: [
      { date: '2023-06-01', avgDuration: 280 },
      { date: '2023-06-02', avgDuration: 320 },
      { date: '2023-06-03', avgDuration: 360 },
    ],
  };

  beforeEach(async () => {
    const telemetryServiceSpy = jasmine.createSpyObj('TelemetryService', [
      'getErrorStatistics',
      'getPerformanceStatistics',
    ]);

    telemetryServiceSpy.getErrorStatistics.and.returnValue(of(mockErrorStatistics));
    telemetryServiceSpy.getPerformanceStatistics.and.returnValue(of(mockPerformanceStatistics));

    await TestBed.configureTestingModule({
      imports: [
        NoopAnimationsModule,
        ReactiveFormsModule,
        NbTabsetModule,
        NbCardModule,
        NbButtonModule,
        NbIconModule,
        NbTableModule,
        NbFormFieldModule,
        NbInputModule,
        NbSelectModule,
        NbDatepickerModule,
        NbSpinnerModule,
        TelemetryDashboardComponent,
      ],
      providers: [{ provide: TelemetryService, useValue: telemetryServiceSpy }],
    }).compileComponents();

    telemetryService = TestBed.inject(TelemetryService) as jasmine.SpyObj<TelemetryService>;
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TelemetryDashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load error statistics on init', () => {
    expect(telemetryService.getErrorStatistics).toHaveBeenCalled();
    expect(component.isLoadingErrors).toBeFalse();
    expect(component.errorDataSource).toEqual(mockErrorStatistics.recentErrors);
  });

  it('should load performance statistics on init', () => {
    expect(telemetryService.getPerformanceStatistics).toHaveBeenCalled();
    expect(component.isLoadingPerformance).toBeFalse();
    expect(component.performanceDataSource).toEqual(mockPerformanceStatistics.byEndpoint);
  });

  it('should apply filters when form is submitted', () => {
    // Reset spy call counts
    telemetryService.getErrorStatistics.calls.reset();
    telemetryService.getPerformanceStatistics.calls.reset();

    // Set filter values
    component.filterForm.patchValue({
      dateRange: 'last30days',
    });

    // Apply filters
    component.applyFilters();

    // Verify service calls with filters
    expect(telemetryService.getErrorStatistics).toHaveBeenCalledWith({ dateRange: 'last30days' });
    expect(telemetryService.getPerformanceStatistics).toHaveBeenCalledWith({
      dateRange: 'last30days',
    });
  });

  it('should handle custom date range filters', () => {
    // Reset spy call counts
    telemetryService.getErrorStatistics.calls.reset();
    telemetryService.getPerformanceStatistics.calls.reset();

    // Set custom date range
    const startDate = new Date('2023-06-01');
    const endDate = new Date('2023-06-30');

    component.filterForm.patchValue({
      dateRange: 'custom',
      startDate,
      endDate,
    });

    // Apply filters
    component.applyFilters();

    // Verify service calls with custom date range
    expect(telemetryService.getErrorStatistics).toHaveBeenCalledWith({
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
    });

    expect(telemetryService.getPerformanceStatistics).toHaveBeenCalledWith({
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
    });
  });
});
