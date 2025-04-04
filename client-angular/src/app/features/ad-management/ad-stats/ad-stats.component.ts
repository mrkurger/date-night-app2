import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { MaterialModule } from '../../../shared/material.module';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';

@Component({
  selector: 'app-ad-stats',
  templateUrl: './ad-stats.component.html',
  styleUrls: ['./ad-stats.component.scss'],
  standalone: true,
  imports: [CommonModule, MaterialModule, DatePipe]
})
export class AdStatsComponent implements OnInit {
  loading = false;
  dataSource = new MatTableDataSource<any>([]);
  viewsData: any[] = [];
  clicksData: any[] = [];

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  getTotalViews(data: any[]): number {
    return data.reduce((sum, item) => sum + (item.views || 0), 0);
  }

  getTotalClicks(data: any[]): number {
    return data.reduce((sum, item) => sum + (item.clicks || 0), 0);
  }

  getTotalInquiries(data: any[]): number {
    return data.reduce((sum, item) => sum + (item.inquiries || 0), 0);
  }

  getConversionRate(data: any[]): number {
    const totalClicks = this.getTotalClicks(data);
    const totalInquiries = this.getTotalInquiries(data);
    return totalClicks ? Math.round((totalInquiries / totalClicks) * 100) : 0;
  }

  ngOnInit() {
    this.loadSampleData();
  }

  private loadSampleData() {
    const today = new Date();
    const sampleData = Array.from({length: 7}, (_, i) => ({
      date: new Date(today.getTime() - (6-i) * 24 * 60 * 60 * 1000),
      views: Math.floor(Math.random() * 100),
      clicks: Math.floor(Math.random() * 50),
      inquiries: Math.floor(Math.random() * 10),
      conversionRate: Math.random() * 100
    }));

    this.dataSource.data = sampleData;
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
    
    this.viewsData = sampleData.map(item => ({
      name: item.date,
      value: item.views
    }));
    this.clicksData = sampleData.map(item => ({
      name: item.date,
      value: item.clicks
    }));
  }
}