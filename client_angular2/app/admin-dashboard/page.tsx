'use client';

import React, { useState, useEffect } from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { telemetryService } from '@/lib/telemetry-service';
import { TimelineEvent, TelemetryStats, TelemetryFilters } from '@/types/telemetry';
import { EventDetails } from '@/components/admin/event-details';
import { ChartsDashboard } from '@/components/admin/charts-dashboard';
import { AdminMenu } from '@/components/admin/admin-menu';
import { PanelsDashboard } from '@/components/admin/panels-dashboard';
import { MiscDashboard } from '@/components/admin/misc-dashboard';
import { Timeline } from 'primereact/timeline';
import { Chip } from 'primereact/chip';
import { ProgressBar } from 'primereact/progressbar';
import { Divider } from 'primereact/divider';
import { Button } from 'primereact/button';
import { Sidebar } from 'primereact/sidebar';
import { Toast } from 'primereact/toast';
// PrimeReact CSS imports - commented out to avoid TypeScript errors
// import 'primereact/resources/themes/lara-light-blue/theme.css';
// import 'primereact/resources/primereact.min.css';
// import 'primeicons/primeicons.css';

export default function AdminDashboardPage() {
  const [tab, setTab] = useState('overview');
  const [stats, setStats] = useState<TelemetryStats | null>(null);
  const [sidebarVisible, setSidebarVisible] = useState(false);
  const [currentSection, setCurrentSection] = useState('overview');
  const [filters] = useState<TelemetryFilters>({
    dateRange: {
      start: new Date(Date.now() - 24 * 60 * 60 * 1000), // Last 24 hours
      end: new Date(),
    },
    types: [],
    severities: [],
    search: '',
  });
  const toastRef = React.useRef<any>(null);

  const handleMenuSelect = (section: string) => {
    setCurrentSection(section);
    setTab(section);
    setSidebarVisible(false);

    // Show notification
    if (toastRef.current) {
      toastRef.current.show({
        severity: 'info',
        summary: 'Navigation',
        detail: `Switched to ${section.charAt(0).toUpperCase() + section.slice(1)} section`,
        life: 3000,
      });
    }
  };

  const eventTypes = [
    { label: 'System', value: 'system' },
    { label: 'Database', value: 'database' },
    { label: 'Security', value: 'security' },
    { label: 'Access', value: 'access' },
    { label: 'Rate Limit', value: 'rate_limit' },
    { label: 'Fingerprint', value: 'fingerprint' },
    { label: 'Anomaly', value: 'anomaly' },
  ];

  const severityTypes = [
    { label: 'Info', value: 'info' },
    { label: 'Warning', value: 'warning' },
    { label: 'Critical', value: 'critical' },
    { label: 'Error', value: 'error' },
  ];

  useEffect(() => {
    const unsubscribeEvents = telemetryService.subscribe(() => {
      // Events are accessed via telemetryService.getEvents(filters) when needed
    });

    const unsubscribeStats = telemetryService.subscribeToStats(newStats => {
      setStats(newStats);
    });

    return () => {
      unsubscribeEvents();
      unsubscribeStats();
    };
  }, []);

  const filteredEvents = telemetryService.getEvents(filters);

  const getSeverityBadgeVariant = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'destructive';
      case 'error':
        return 'destructive';
      case 'warning':
        return 'secondary';
      case 'info':
        return 'default';
      default:
        return 'outline';
    }
  };

  const formatTimestamp = (timestamp: Date) => {
    return timestamp.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };

  const customizedMarker = (item: TimelineEvent) => {
    return (
      <span
        className="flex w-8 h-8 items-center justify-center text-white rounded-full z-10 shadow-lg"
        style={{ backgroundColor: item.color }}
      >
        <i className={`${item.icon} text-sm`}></i>
      </span>
    );
  };

  const customizedContent = (item: TimelineEvent) => {
    return (
      <Card className="ml-4 mb-4 shadow-sm hover:shadow-md transition-shadow">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">{item.title}</CardTitle>
            <div className="flex items-center gap-2">
              <Badge variant={getSeverityBadgeVariant(item.severity)}>
                {item.severity.toUpperCase()}
              </Badge>
              <Chip
                label={item.type.replace('_', ' ').toUpperCase()}
                className="text-xs"
                style={{ backgroundColor: item.color, color: 'white' }}
              />
            </div>
          </div>
          <p className="text-sm text-muted-foreground">{formatTimestamp(item.timestamp)}</p>
        </CardHeader>
        <CardContent>
          <p className="text-sm mb-3">{item.description}</p>
          <Divider />
          <div className="mt-3">
            <EventDetails event={item} />
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="min-h-screen p-8 bg-background space-y-6">
      {/* Toast Notifications */}
      <Toast ref={toastRef} />

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <i className="pi pi-shield text-blue-600"></i>
            Admin Dashboard
          </h1>
          <Button
            icon="pi pi-refresh"
            className="p-button-rounded p-button-outlined"
            onClick={() => {
              window.location.reload();
              if (toastRef.current) {
                toastRef.current.show({
                  severity: 'success',
                  summary: 'Refreshed',
                  detail: 'Dashboard data refreshed',
                  life: 2000,
                });
              }
            }}
            tooltip="Refresh Dashboard"
          />
        </div>
        {stats && (
          <div className="flex items-center gap-4">
            <Badge
              variant={
                stats.systemHealth === 'healthy'
                  ? 'default'
                  : stats.systemHealth === 'warning'
                  ? 'secondary'
                  : 'destructive'
              }
              className="text-sm px-3 py-1"
            >
              System: {stats.systemHealth.toUpperCase()}
            </Badge>
            <span className="text-sm text-muted-foreground">Uptime: {stats.uptime}%</span>
            <Button
              icon="pi pi-bell"
              className="p-button-rounded p-button-text"
              badge={stats.criticalEvents > 0 ? stats.criticalEvents.toString() : undefined}
              badgeClassName="p-badge-danger"
              onClick={() => {
                setTab('security');
                if (toastRef.current) {
                  toastRef.current.show({
                    severity: 'warn',
                    summary: 'Alerts',
                    detail: `${stats.criticalEvents} critical events require attention`,
                    life: 4000,
                  });
                }
              }}
              tooltip="View Alerts"
            />
          </div>
        )}
      </div>

      {/* Mobile Menu Button */}
      <div className="lg:hidden mb-4">
        <Button
          icon="pi pi-bars"
          label="Menu"
          onClick={() => setSidebarVisible(true)}
          className="p-button-outlined"
        />
      </div>

      {/* Mobile Sidebar */}
      <Sidebar visible={sidebarVisible} onHide={() => setSidebarVisible(false)} className="w-80">
        <AdminMenu onMenuSelect={handleMenuSelect} currentSection={currentSection} />
      </Sidebar>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList className="grid w-full grid-cols-2 lg:grid-cols-7">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="timeline">Timeline</TabsTrigger>
          <TabsTrigger value="charts">Charts</TabsTrigger>
          <TabsTrigger value="panels">Panels</TabsTrigger>
          <TabsTrigger value="menu">Menu</TabsTrigger>
          <TabsTrigger value="misc">Misc</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          {stats && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
              <Card className="p-4">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">Total Events</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold">{stats.totalEvents}</p>
                  <p className="text-sm text-muted-foreground">Last 24 hours</p>
                </CardContent>
              </Card>

              <Card className="p-4">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">Critical Events</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold text-red-600">{stats.criticalEvents}</p>
                  <p className="text-sm text-muted-foreground">Requires attention</p>
                </CardContent>
              </Card>

              <Card className="p-4">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">System Health</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold">
                    <Badge
                      variant={
                        stats.systemHealth === 'healthy'
                          ? 'default'
                          : stats.systemHealth === 'warning'
                          ? 'secondary'
                          : 'destructive'
                      }
                    >
                      {stats.systemHealth.toUpperCase()}
                    </Badge>
                  </p>
                  <p className="text-sm text-muted-foreground">Overall status</p>
                </CardContent>
              </Card>

              <Card className="p-4">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">Uptime</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold text-green-600">{stats.uptime}%</p>
                  <p className="text-sm text-muted-foreground">Last 30 days</p>
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>

        <TabsContent value="timeline">
          <div className="space-y-4">
            <Card className="p-4">
              <CardHeader>
                <CardTitle>System Timeline</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Real-time monitoring events and system activities
                </p>
              </CardHeader>
              <CardContent>
                <Timeline
                  value={filteredEvents.slice(0, 20)}
                  marker={customizedMarker}
                  content={customizedContent}
                  className="customized-timeline"
                />
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="charts">
          <ChartsDashboard />
        </TabsContent>

        <TabsContent value="panels">
          <PanelsDashboard />
        </TabsContent>

        <TabsContent value="menu">
          <AdminMenu onMenuSelect={handleMenuSelect} currentSection={currentSection} />
        </TabsContent>

        <TabsContent value="misc">
          <MiscDashboard />
        </TabsContent>

        <TabsContent value="metrics">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
            <Card className="p-4">
              <CardHeader>
                <CardTitle>Event Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {eventTypes.map(type => {
                    const count = filteredEvents.filter(e => e.type === type.value).length;
                    const percentage =
                      filteredEvents.length > 0 ? (count / filteredEvents.length) * 100 : 0;
                    return (
                      <div key={type.value} className="flex items-center justify-between">
                        <span className="text-sm">{type.label}</span>
                        <div className="flex items-center gap-2">
                          <ProgressBar value={percentage} className="w-24 h-2" showValue={false} />
                          <span className="text-sm font-medium w-8">{count}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            <Card className="p-4">
              <CardHeader>
                <CardTitle>Severity Breakdown</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {severityTypes.map(severity => {
                    const count = filteredEvents.filter(e => e.severity === severity.value).length;
                    const percentage =
                      filteredEvents.length > 0 ? (count / filteredEvents.length) * 100 : 0;
                    return (
                      <div key={severity.value} className="flex items-center justify-between">
                        <span className="text-sm">{severity.label}</span>
                        <div className="flex items-center gap-2">
                          <ProgressBar value={percentage} className="w-24 h-2" showValue={false} />
                          <span className="text-sm font-medium w-8">{count}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="security">
          <div className="space-y-6">
            <Card className="p-4">
              <CardHeader>
                <CardTitle>Security Events</CardTitle>
                <p className="text-sm text-muted-foreground">
                  CSP violations, rate limiting, and behavior anomalies
                </p>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {filteredEvents
                    .filter(e => ['security', 'rate_limit', 'anomaly'].includes(e.type))
                    .slice(0, 10)
                    .map(event => (
                      <div key={event.id} className="flex items-start gap-4 p-4 border rounded-lg">
                        <span
                          className="flex w-6 h-6 items-center justify-center text-white rounded-full text-xs"
                          style={{ backgroundColor: event.color }}
                        >
                          <i className={event.icon}></i>
                        </span>
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <h4 className="font-medium">{event.title}</h4>
                            <Badge variant={getSeverityBadgeVariant(event.severity)}>
                              {event.severity.toUpperCase()}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mt-1">{event.description}</p>
                          <p className="text-xs text-muted-foreground mt-2">
                            {formatTimestamp(event.timestamp)}
                          </p>
                        </div>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
