import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Panel } from 'primereact/panel';
import { Accordion, AccordionTab } from 'primereact/accordion';
import { Fieldset } from 'primereact/fieldset';
import { Card as PrimeCard } from 'primereact/card';
import { Toolbar } from 'primereact/toolbar';
import { Button } from 'primereact/button';
import { SplitButton } from 'primereact/splitbutton';
import { Divider } from 'primereact/divider';
import { ScrollPanel } from 'primereact/scrollpanel';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { telemetryService } from '@/lib/telemetry-service';
import { TimelineEvent } from '@/types/telemetry';

export function PanelsDashboard() {
  const [events] = useState<TimelineEvent[]>(telemetryService.getEvents());
  const [activeIndex, setActiveIndex] = useState<number | number[]>(0);

  const toolbarStartContent = (
    <div className="flex items-center gap-2">
      <Button icon="pi pi-plus" className="p-button-success" label="New" />
      <Button icon="pi pi-upload" className="p-button-info" label="Import" />
    </div>
  );

  const toolbarEndContent = (
    <div className="flex items-center gap-2">
      <SplitButton 
        label="Export" 
        icon="pi pi-download" 
        model={[
          { label: 'CSV', icon: 'pi pi-file', command: () => console.log('Export CSV') },
          { label: 'PDF', icon: 'pi pi-file-pdf', command: () => console.log('Export PDF') },
          { label: 'Excel', icon: 'pi pi-file-excel', command: () => console.log('Export Excel') }
        ]}
        className="p-button-outlined"
      />
      <Button icon="pi pi-refresh" className="p-button-outlined" />
    </div>
  );

  const systemMetricsHeader = (
    <div className="flex items-center gap-2">
      <i className="pi pi-desktop text-blue-600"></i>
      <span className="font-semibold">System Metrics</span>
      <Badge variant="secondary">Live</Badge>
    </div>
  );

  const securityEventsHeader = (
    <div className="flex items-center gap-2">
      <i className="pi pi-shield text-red-600"></i>
      <span className="font-semibold">Security Events</span>
      <Badge variant="destructive">3 Critical</Badge>
    </div>
  );

  const databaseStatusHeader = (
    <div className="flex items-center gap-2">
      <i className="pi pi-database text-green-600"></i>
      <span className="font-semibold">Database Status</span>
      <Badge variant="default">Healthy</Badge>
    </div>
  );

  const recentEvents = events.slice(0, 5);
  const criticalEvents = events.filter(e => e.severity === 'critical').slice(0, 3);
  const systemEvents = events.filter(e => e.type === 'system').slice(0, 3);

  const eventSeverityTemplate = (rowData: TimelineEvent) => {
    const variant = rowData.severity === 'critical' ? 'destructive' : 
                   rowData.severity === 'warning' ? 'secondary' : 'default';
    return <Badge variant={variant}>{rowData.severity.toUpperCase()}</Badge>;
  };

  const eventTypeTemplate = (rowData: TimelineEvent) => {
    return (
      <div className="flex items-center gap-2">
        <i className={rowData.icon} style={{ color: rowData.color }}></i>
        <span>{rowData.type.replace('_', ' ').toUpperCase()}</span>
      </div>
    );
  };

  const timestampTemplate = (rowData: TimelineEvent) => {
    return new Date(rowData.timestamp).toLocaleString();
  };

  return (
    <div className="space-y-6">
      {/* Toolbar */}
      <Card>
        <CardContent className="p-4">
          <Toolbar start={toolbarStartContent} end={toolbarEndContent} />
        </CardContent>
      </Card>

      {/* Main Panels Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* System Overview Panel */}
        <Panel 
          header={systemMetricsHeader}
          toggleable
          className="w-full"
        >
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <i className="pi pi-desktop text-2xl text-blue-600 mb-2"></i>
                <h4 className="font-semibold">CPU Usage</h4>
                <p className="text-2xl font-bold text-blue-600">34%</p>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <i className="pi pi-chart-bar text-2xl text-green-600 mb-2"></i>
                <h4 className="font-semibold">Memory</h4>
                <p className="text-2xl font-bold text-green-600">68%</p>
              </div>
            </div>
            
            <Divider />
            
            <div className="space-y-2">
              <h5 className="font-semibold">Recent System Events</h5>
              {systemEvents.map((event, index) => (
                <div key={index} className="flex items-center gap-3 p-2 border rounded">
                  <i className={event.icon} style={{ color: event.color }}></i>
                  <div className="flex-1">
                    <p className="text-sm font-medium">{event.title}</p>
                    <p className="text-xs text-muted-foreground">{event.description}</p>
                  </div>
                  <Badge variant="outline" className="text-xs">
                    {new Date(event.timestamp).toLocaleTimeString()}
                  </Badge>
                </div>
              ))}
            </div>
          </div>
        </Panel>

        {/* Security Panel */}
        <Panel 
          header={securityEventsHeader}
          toggleable
          className="w-full"
        >
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="p-3 bg-red-50 rounded-lg">
                <p className="text-2xl font-bold text-red-600">
                  {events.filter(e => e.severity === 'critical').length}
                </p>
                <p className="text-xs text-red-600">Critical</p>
              </div>
              <div className="p-3 bg-yellow-50 rounded-lg">
                <p className="text-2xl font-bold text-yellow-600">
                  {events.filter(e => e.severity === 'warning').length}
                </p>
                <p className="text-xs text-yellow-600">Warning</p>
              </div>
              <div className="p-3 bg-blue-50 rounded-lg">
                <p className="text-2xl font-bold text-blue-600">
                  {events.filter(e => e.severity === 'info').length}
                </p>
                <p className="text-xs text-blue-600">Info</p>
              </div>
            </div>

            <Divider />

            <div className="space-y-2">
              <h5 className="font-semibold">Critical Security Events</h5>
              <ScrollPanel style={{ width: '100%', height: '200px' }}>
                {criticalEvents.map((event, index) => (
                  <div key={index} className="flex items-start gap-3 p-2 border rounded mb-2">
                    <i className={`${event.icon} text-red-600`}></i>
                    <div className="flex-1">
                      <p className="text-sm font-medium">{event.title}</p>
                      <p className="text-xs text-muted-foreground">{event.description}</p>
                      <p className="text-xs text-red-600 mt-1">
                        {new Date(event.timestamp).toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))}
              </ScrollPanel>
            </div>
          </div>
        </Panel>
      </div>

      {/* Accordion Panels */}
      <Card>
        <CardHeader>
          <CardTitle>Detailed System Information</CardTitle>
        </CardHeader>
        <CardContent>
          <Accordion 
            activeIndex={activeIndex} 
            onTabChange={(e) => setActiveIndex(e.index)}
            multiple
          >
            <AccordionTab 
              header={
                <div className="flex items-center gap-2">
                  <i className="pi pi-chart-line text-blue-600"></i>
                  <span>Performance Metrics</span>
                </div>
              }
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Fieldset legend="CPU Performance" className="mb-4">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Current Usage:</span>
                      <span className="font-semibold">34%</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Average (24h):</span>
                      <span className="font-semibold">28%</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Peak (24h):</span>
                      <span className="font-semibold">87%</span>
                    </div>
                  </div>
                </Fieldset>

                <Fieldset legend="Memory Performance" className="mb-4">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Used Memory:</span>
                      <span className="font-semibold">10.8 GB</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Free Memory:</span>
                      <span className="font-semibold">5.2 GB</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Cache:</span>
                      <span className="font-semibold">2.1 GB</span>
                    </div>
                  </div>
                </Fieldset>
              </div>
            </AccordionTab>

            <AccordionTab 
              header={
                <div className="flex items-center gap-2">
                  <i className="pi pi-database text-green-600"></i>
                  <span>Database Information</span>
                </div>
              }
            >
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <PrimeCard title="Connections" className="text-center">
                  <p className="text-3xl font-bold text-green-600">45</p>
                  <p className="text-sm text-muted-foreground">Active connections</p>
                </PrimeCard>
                <PrimeCard title="Query Performance" className="text-center">
                  <p className="text-3xl font-bold text-blue-600">12ms</p>
                  <p className="text-sm text-muted-foreground">Average response time</p>
                </PrimeCard>
                <PrimeCard title="Storage" className="text-center">
                  <p className="text-3xl font-bold text-orange-600">2.4TB</p>
                  <p className="text-sm text-muted-foreground">Total database size</p>
                </PrimeCard>
              </div>
            </AccordionTab>

            <AccordionTab 
              header={
                <div className="flex items-center gap-2">
                  <i className="pi pi-list text-purple-600"></i>
                  <span>Recent Events Log</span>
                </div>
              }
            >
              <DataTable 
                value={recentEvents} 
                paginator 
                rows={10}
                className="p-datatable-sm"
                emptyMessage="No events found"
              >
                <Column field="type" header="Type" body={eventTypeTemplate} />
                <Column field="title" header="Event" />
                <Column field="severity" header="Severity" body={eventSeverityTemplate} />
                <Column field="timestamp" header="Time" body={timestampTemplate} />
              </DataTable>
            </AccordionTab>
          </Accordion>
        </CardContent>
      </Card>

      {/* Fieldset Examples */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Fieldset legend="System Health Check" toggleable>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-2 border rounded">
              <span className="flex items-center gap-2">
                <i className="pi pi-check-circle text-green-600"></i>
                CPU Temperature
              </span>
              <Badge variant="default">Normal</Badge>
            </div>
            <div className="flex items-center justify-between p-2 border rounded">
              <span className="flex items-center gap-2">
                <i className="pi pi-check-circle text-green-600"></i>
                Disk Space
              </span>
              <Badge variant="default">Healthy</Badge>
            </div>
            <div className="flex items-center justify-between p-2 border rounded">
              <span className="flex items-center gap-2">
                <i className="pi pi-exclamation-triangle text-yellow-600"></i>
                Network Latency
              </span>
              <Badge variant="secondary">Warning</Badge>
            </div>
          </div>
        </Fieldset>

        <Fieldset legend="Quick Actions" toggleable>
          <div className="space-y-2">
            <Button 
              label="Restart Services" 
              icon="pi pi-refresh" 
              className="w-full p-button-outlined"
            />
            <Button 
              label="Clear Cache" 
              icon="pi pi-trash" 
              className="w-full p-button-outlined"
            />
            <Button 
              label="Generate Report" 
              icon="pi pi-file" 
              className="w-full p-button-outlined"
            />
            <Button 
              label="Backup Database" 
              icon="pi pi-download" 
              className="w-full p-button-outlined"
            />
          </div>
        </Fieldset>
      </div>
    </div>
  );
}
