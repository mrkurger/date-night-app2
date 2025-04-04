import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';

interface AdStats {
  date: string;
  views: number;
  clicks: number;
  inquiries: number;
  conversionRate: number;
}

@Component({
  selector: 'app-ad-stats',
  templateUrl: './ad-stats.component.html',
  styleUrls: ['./ad-stats.component.scss']
})
export class AdStatsComponent implements OnInit {
  adId: string | null = null;
  loading = true;
  adTitle = '';
  
  // Table data
  displayedColumns: string[] = ['date', 'views', 'clicks', 'inquiries', 'conversionRate'];
  dataSource = new MatTableDataSource<AdStats>();
  
  // Charts data
  viewsData: any[] = [];
  clicksData: any[] = [];
  
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(private route: ActivatedRoute) {}

  ngOnInit(): void {
    this.adId = this.route.snapshot.paramMap.get('id');
    this.loadAdStats();
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  loadAdStats(): void {
    // In a real app, you would fetch this data from a service
    // this.adService.getAdStats(this.adId).subscribe(data => {...});
    
    // Simulating API call
    setTimeout(() => {
      this.adTitle = 'Sample Advertisement';
      
      // Generate mock data for the last 30 days
      const mockData: AdStats[] = [];
      const today = new Date();
      
      for (let i = 0; i < 30; i++) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);
        
        const views = Math.floor(Math.random() * 100) + 10;
        const clicks = Math.floor(views * (Math.random() * 0.5 + 0.1));
        const inquiries = Math.floor(clicks * (Math.random() * 0.3 + 0.05));
        
        mockData.push({
          date: date.toISOString().split('T')[0],
          views,
          clicks,
          inquiries,
          conversionRate: parseFloat(((inquiries / views) * 100).toFixed(2))
        });
      }
      
      this.dataSource.data = mockData;
      
      // Prepare chart data
      this.prepareChartData(mockData);
      
      this.loading = false;
    }, 1000);
  }

  prepareChartData(data: AdStats[]): void {
    // In a real app, you would prepare data for charts here
    // This is just a placeholder for the chart data preparation
    this.viewsData = data.slice(0, 7).reverse().map(item => ({
      name: item.date,
      value: item.views
    }));
    
    this.clicksData = data.slice(0, 7).reverse().map(item => ({
      name: item.date,
      value: item.clicks
    }));
  }

  applyFilter(event: Event): void {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  // Helper methods for template calculations
  getMaxValue(data: any[]): number {
    return Math.max(...data.map(d => d.value));
  }

  calculatePercentage(value: number, max: number): number {
    return (value / max) * 100;
  }

  getBarHeight(item: any, data: any[]): string {
    const maxValue = this.getMaxValue(data);
    const percentage = this.calculatePercentage(item.value, maxValue);
    return `${percentage}%`;
  }
}