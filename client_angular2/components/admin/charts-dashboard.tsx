import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Chart } from 'primereact/chart';
import { Dropdown } from 'primereact/dropdown';
import { Button } from 'primereact/button';
import { Knob } from 'primereact/knob';
import { ProgressBar } from 'primereact/progressbar';
import { telemetryService } from '@/lib/telemetry-service';
import { TimelineEvent } from '@/types/telemetry';

export function ChartsDashboard() {
  const [events, setEvents] = useState<TimelineEvent[]>([]);
  const [chartData, setChartData] = useState<any>({});
  const [chartOptions, setChartOptions] = useState<any>({});
  const [timeRange, setTimeRange] = useState('24h');
  const [cpuUsage, setCpuUsage] = useState(0);
  const [memoryUsage, setMemoryUsage] = useState(0);
  const [diskUsage, setDiskUsage] = useState(0);

  const timeRangeOptions = [
    { label: 'Last 24 Hours', value: '24h' },
    { label: 'Last 7 Days', value: '7d' },
    { label: 'Last 30 Days', value: '30d' }
  ];

  useEffect(() => {
    const unsubscribe = telemetryService.subscribe((newEvents) => {
      setEvents(newEvents);
      updateChartData(newEvents);
      updateSystemMetrics(newEvents);
    });

    return unsubscribe;
  }, []);

  const updateSystemMetrics = (events: TimelineEvent[]) => {
    const systemEvents = events.filter(e => e.type === 'system');
    if (systemEvents.length > 0) {
      const latest = systemEvents[0];
      if (latest?.data && 'cpu' in latest.data) {
        const data = latest.data as any;
        setCpuUsage(Math.round(data.cpu.usage));
        setMemoryUsage(Math.round(data.memory.percentage));
        setDiskUsage(Math.round(data.disk.percentage));
      }
    }
  };

  const updateChartData = (events: TimelineEvent[]) => {
    // Event Types Distribution (Doughnut Chart)
    const eventTypeCounts = events.reduce((acc, event) => {
      acc[event.type] = (acc[event.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const doughnutData = {
      labels: Object.keys(eventTypeCounts).map(key => key.replace('_', ' ').toUpperCase()),
      datasets: [
        {
          data: Object.values(eventTypeCounts),
          backgroundColor: [
            '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', 
            '#9966FF', '#FF9F40', '#FF6384', '#C9CBCF'
          ],
          hoverBackgroundColor: [
            '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', 
            '#9966FF', '#FF9F40', '#FF6384', '#C9CBCF'
          ]
        }
      ]
    };

    // Severity Trends (Line Chart)
    const last24Hours = events.filter(e => 
      new Date().getTime() - e.timestamp.getTime() < 24 * 60 * 60 * 1000
    );

    const hourlyData = Array.from({ length: 24 }, (_, i) => {
      const hour = new Date().getHours() - i;
      const hourEvents = last24Hours.filter(e => {
        const eventHour = e.timestamp.getHours();
        return eventHour === (hour >= 0 ? hour : 24 + hour);
      });
      
      return {
        hour: hour >= 0 ? hour : 24 + hour,
        critical: hourEvents.filter(e => e.severity === 'critical').length,
        warning: hourEvents.filter(e => e.severity === 'warning').length,
        info: hourEvents.filter(e => e.severity === 'info').length
      };
    }).reverse();

    const lineData = {
      labels: hourlyData.map(d => `${d.hour}:00`),
      datasets: [
        {
          label: 'Critical',
          data: hourlyData.map(d => d.critical),
          fill: false,
          borderColor: '#ef4444',
          backgroundColor: '#ef4444',
          tension: 0.4
        },
        {
          label: 'Warning',
          data: hourlyData.map(d => d.warning),
          fill: false,
          borderColor: '#f59e0b',
          backgroundColor: '#f59e0b',
          tension: 0.4
        },
        {
          label: 'Info',
          data: hourlyData.map(d => d.info),
          fill: false,
          borderColor: '#10b981',
          backgroundColor: '#10b981',
          tension: 0.4
        }
      ]
    };

    // System Performance (Bar Chart)
    const systemEvents = events.filter(e => e.type === 'system').slice(0, 10);
    const barData = {
      labels: systemEvents.map((_, i) => `T-${i * 5}m`),
      datasets: [
        {
          label: 'CPU %',
          data: systemEvents.map(e => {
            const data = e.data as any;
            return data.cpu ? Math.round(data.cpu.usage) : 0;
          }),
          backgroundColor: '#36A2EB',
          borderColor: '#36A2EB',
          borderWidth: 1
        },
        {
          label: 'Memory %',
          data: systemEvents.map(e => {
            const data = e.data as any;
            return data.memory ? Math.round(data.memory.percentage) : 0;
          }),
          backgroundColor: '#4BC0C0',
          borderColor: '#4BC0C0',
          borderWidth: 1
        }
      ]
    };

    setChartData({
      doughnut: doughnutData,
      line: lineData,
      bar: barData
    });

    const options = {
      plugins: {
        legend: {
          position: 'bottom' as const
        }
      },
      responsive: true,
      maintainAspectRatio: false
    };

    setChartOptions(options);
  };

  return (
    <div className="space-y-6">
      {/* Controls */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Analytics Dashboard</CardTitle>
            <div className="flex items-center gap-4">
              <Dropdown
                value={timeRange}
                options={timeRangeOptions}
                onChange={(e) => setTimeRange(e.value)}
                placeholder="Select Time Range"
                className="w-48"
              />
              <Button 
                icon="pi pi-refresh" 
                label="Refresh"
                onClick={() => window.location.reload()}
                className="p-button-outlined"
              />
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* System Metrics Knobs */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-center">CPU Usage</CardTitle>
          </CardHeader>
          <CardContent className="flex justify-center">
            <Knob
              value={cpuUsage}
              size={120}
              strokeWidth={8}
              valueColor={cpuUsage > 80 ? '#ef4444' : cpuUsage > 60 ? '#f59e0b' : '#10b981'}
              rangeColor="#e5e7eb"
              textColor="#374151"
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-center">Memory Usage</CardTitle>
          </CardHeader>
          <CardContent className="flex justify-center">
            <Knob
              value={memoryUsage}
              size={120}
              strokeWidth={8}
              valueColor={memoryUsage > 80 ? '#ef4444' : memoryUsage > 60 ? '#f59e0b' : '#10b981'}
              rangeColor="#e5e7eb"
              textColor="#374151"
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-center">Disk Usage</CardTitle>
          </CardHeader>
          <CardContent className="flex justify-center">
            <Knob
              value={diskUsage}
              size={120}
              strokeWidth={8}
              valueColor={diskUsage > 80 ? '#ef4444' : diskUsage > 60 ? '#f59e0b' : '#10b981'}
              rangeColor="#e5e7eb"
              textColor="#374151"
            />
          </CardContent>
        </Card>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Event Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Event Type Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div style={{ height: '300px' }}>
              {chartData.doughnut && (
                <Chart 
                  type="doughnut" 
                  data={chartData.doughnut} 
                  options={chartOptions}
                  style={{ height: '100%' }}
                />
              )}
            </div>
          </CardContent>
        </Card>

        {/* Severity Trends */}
        <Card>
          <CardHeader>
            <CardTitle>Severity Trends (24h)</CardTitle>
          </CardHeader>
          <CardContent>
            <div style={{ height: '300px' }}>
              {chartData.line && (
                <Chart 
                  type="line" 
                  data={chartData.line} 
                  options={chartOptions}
                  style={{ height: '100%' }}
                />
              )}
            </div>
          </CardContent>
        </Card>

        {/* System Performance */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>System Performance History</CardTitle>
          </CardHeader>
          <CardContent>
            <div style={{ height: '300px' }}>
              {chartData.bar && (
                <Chart 
                  type="bar" 
                  data={chartData.bar} 
                  options={chartOptions}
                  style={{ height: '100%' }}
                />
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Progress Indicators */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>System Health Indicators</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-sm font-medium">CPU Load</span>
                <span className="text-sm">{cpuUsage}%</span>
              </div>
              <ProgressBar 
                value={cpuUsage} 
                color={cpuUsage > 80 ? '#ef4444' : cpuUsage > 60 ? '#f59e0b' : '#10b981'}
              />
            </div>
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-sm font-medium">Memory Usage</span>
                <span className="text-sm">{memoryUsage}%</span>
              </div>
              <ProgressBar 
                value={memoryUsage} 
                color={memoryUsage > 80 ? '#ef4444' : memoryUsage > 60 ? '#f59e0b' : '#10b981'}
              />
            </div>
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-sm font-medium">Disk Space</span>
                <span className="text-sm">{diskUsage}%</span>
              </div>
              <ProgressBar 
                value={diskUsage} 
                color={diskUsage > 80 ? '#ef4444' : diskUsage > 60 ? '#f59e0b' : '#10b981'}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Event Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Total Events</span>
              <span className="text-2xl font-bold">{events.length}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Critical Events</span>
              <span className="text-2xl font-bold text-red-600">
                {events.filter(e => e.severity === 'critical').length}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Warning Events</span>
              <span className="text-2xl font-bold text-yellow-600">
                {events.filter(e => e.severity === 'warning').length}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Info Events</span>
              <span className="text-2xl font-bold text-green-600">
                {events.filter(e => e.severity === 'info').length}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
