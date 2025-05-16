import { Component, OnInit } from '@angular/core';
import { NebularModule } from "../../../shared/nebular.module";

import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { NgxChartsModule } from '@swimlane/ngx-charts';

interface RevenueData {
  name: string;
  value: number;
}

interface TimeSeriesData {
  name: string;
  series: {
    name: string;
    value: number;
  }[];
}

@Component({
  selector: 'app-revenue-analytics',
  standalone: true,
  imports: [CommonModule, FormsModule, NebularModule, NgxChartsModule],
  templateUrl: './revenue-analytics.component.html',
  styleUrls: ['./revenue-analytics.component.scss'],
})
export class RevenueAnalyticsComponent implements OnInit {
  selectedPeriod = 'month';
  loading = false;

  // Summary metrics
  totalRevenue = 0;
  revenueDelta = 0;
  activeSubscriptions = 0;
  subscriptionDelta = 0;
  arpu = 0;
  arpuDelta = 0;

  // Chart data
  revenueTrend: TimeSeriesData[] = [];
  revenueByPlan: RevenueData[] = [];
  churnRate: RevenueData[] = [];

  constructor() {}

  ngOnInit() {
    this.loadData();
  }

  onPeriodChange() {
    this.loadData();
  }

  private loadData() {
    this.loading = true;

    // TODO: Replace with actual API calls
    // This is mock data for demonstration
    setTimeout(() => {
      this.totalRevenue = 125000;
      this.revenueDelta = 15.4;
      this.activeSubscriptions = 1250;
      this.subscriptionDelta = 45;
      this.arpu = 100;
      this.arpuDelta = 5.2;

      this.revenueTrend = [
        {
          name: 'Revenue',
          series: [
            { name: 'Jan', value: 85000 },
            { name: 'Feb', value: 92000 },
            { name: 'Mar', value: 98000 },
            { name: 'Apr', value: 105000 },
            { name: 'May', value: 115000 },
            { name: 'Jun', value: 125000 },
          ],
        },
      ];

      this.revenueByPlan = [
        { name: 'Basic', value: 45000 },
        { name: 'Premium', value: 55000 },
        { name: 'Enterprise', value: 25000 },
      ];

      this.churnRate = [
        { name: 'Jan', value: 2.1 },
        { name: 'Feb', value: 1.9 },
        { name: 'Mar', value: 1.7 },
        { name: 'Apr', value: 1.5 },
        { name: 'May', value: 1.3 },
        { name: 'Jun', value: 1.2 },
      ];

      this.loading = false;
    }, 1000);
  }
}
