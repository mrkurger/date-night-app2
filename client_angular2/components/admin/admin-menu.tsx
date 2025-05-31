import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Menu } from 'primereact/menu';
import { PanelMenu } from 'primereact/panelmenu';
import { TieredMenu } from 'primereact/tieredmenu';
import { Menubar } from 'primereact/menubar';
import { ContextMenu } from 'primereact/contextmenu';
import { MegaMenu } from 'primereact/megamenu';
import { Button } from 'primereact/button';
import { Avatar } from 'primereact/avatar';
import { Divider } from 'primereact/divider';

interface AdminMenuProps {
  onMenuSelect: (section: string) => void;
  currentSection: string;
}

export function AdminMenu({ onMenuSelect, currentSection }: AdminMenuProps) {
  const [contextMenu, setContextMenu] = useState<any>(null);

  const menuItems = [
    {
      label: 'Dashboard',
      icon: 'pi pi-fw pi-home',
      command: () => onMenuSelect('overview')
    },
    {
      label: 'Monitoring',
      icon: 'pi pi-fw pi-chart-line',
      items: [
        {
          label: 'System Metrics',
          icon: 'pi pi-fw pi-desktop',
          command: () => onMenuSelect('metrics')
        },
        {
          label: 'Timeline View',
          icon: 'pi pi-fw pi-clock',
          command: () => onMenuSelect('timeline')
        },
        {
          label: 'Charts & Analytics',
          icon: 'pi pi-fw pi-chart-bar',
          command: () => onMenuSelect('charts')
        }
      ]
    },
    {
      label: 'Security',
      icon: 'pi pi-fw pi-shield',
      items: [
        {
          label: 'Security Events',
          icon: 'pi pi-fw pi-exclamation-triangle',
          command: () => onMenuSelect('security'),
          badge: '3'
        },
        {
          label: 'Access Control',
          icon: 'pi pi-fw pi-lock',
          command: () => onMenuSelect('access')
        },
        {
          label: 'Audit Logs',
          icon: 'pi pi-fw pi-file-text',
          command: () => onMenuSelect('audit')
        }
      ]
    },
    {
      label: 'System',
      icon: 'pi pi-fw pi-cog',
      items: [
        {
          label: 'Database',
          icon: 'pi pi-fw pi-database',
          command: () => onMenuSelect('database')
        },
        {
          label: 'Performance',
          icon: 'pi pi-fw pi-bolt',
          command: () => onMenuSelect('performance')
        },
        {
          label: 'Alerts',
          icon: 'pi pi-fw pi-bell',
          command: () => onMenuSelect('alerts'),
          badge: '2'
        }
      ]
    },
    {
      separator: true
    },
    {
      label: 'Settings',
      icon: 'pi pi-fw pi-wrench',
      command: () => onMenuSelect('settings')
    },
    {
      label: 'Help',
      icon: 'pi pi-fw pi-question-circle',
      items: [
        {
          label: 'Documentation',
          icon: 'pi pi-fw pi-book',
          command: () => window.open('/docs', '_blank')
        },
        {
          label: 'Support',
          icon: 'pi pi-fw pi-envelope',
          command: () => window.open('mailto:support@example.com')
        }
      ]
    }
  ];

  const userMenuItems = [
    {
      label: 'Profile',
      icon: 'pi pi-fw pi-user',
      command: () => onMenuSelect('profile')
    },
    {
      label: 'Preferences',
      icon: 'pi pi-fw pi-cog',
      command: () => onMenuSelect('preferences')
    },
    {
      separator: true
    },
    {
      label: 'Logout',
      icon: 'pi pi-fw pi-sign-out',
      command: () => console.log('Logout')
    }
  ];

  const contextMenuItems = [
    {
      label: 'Refresh',
      icon: 'pi pi-refresh',
      command: () => window.location.reload()
    },
    {
      label: 'Export Data',
      icon: 'pi pi-download',
      command: () => console.log('Export data')
    },
    {
      separator: true
    },
    {
      label: 'Settings',
      icon: 'pi pi-cog',
      command: () => onMenuSelect('settings')
    }
  ];

  const breadcrumbItems = [
    { label: 'Admin' },
    { label: 'Dashboard' },
    { label: currentSection.charAt(0).toUpperCase() + currentSection.slice(1) }
  ];

  const megaMenuItems = [
    {
      label: 'Monitoring',
      icon: 'pi pi-fw pi-chart-line',
      items: [
        [
          {
            label: 'Real-time',
            items: [
              { label: 'System Metrics', command: () => onMenuSelect('metrics') },
              { label: 'Live Timeline', command: () => onMenuSelect('timeline') },
              { label: 'Performance', command: () => onMenuSelect('performance') }
            ]
          }
        ],
        [
          {
            label: 'Analytics',
            items: [
              { label: 'Charts', command: () => onMenuSelect('charts') },
              { label: 'Reports', command: () => onMenuSelect('reports') },
              { label: 'Trends', command: () => onMenuSelect('trends') }
            ]
          }
        ]
      ]
    },
    {
      label: 'Security',
      icon: 'pi pi-fw pi-shield',
      items: [
        [
          {
            label: 'Events',
            items: [
              { label: 'Security Alerts', command: () => onMenuSelect('security') },
              { label: 'Access Logs', command: () => onMenuSelect('access') },
              { label: 'Audit Trail', command: () => onMenuSelect('audit') }
            ]
          }
        ]
      ]
    }
  ];

  return (
    <div className="space-y-6">
      {/* Top Navigation Bar */}
      <Card>
        <CardContent className="p-4">
          <Menubar 
            model={megaMenuItems}
            start={
              <div className="flex items-center gap-2">
                <i className="pi pi-shield text-2xl text-blue-600"></i>
                <span className="font-bold text-lg">Admin Console</span>
              </div>
            }
            end={
              <div className="flex items-center gap-4">
                <Badge variant="destructive" className="animate-pulse">
                  3 Alerts
                </Badge>
                <Button 
                  icon="pi pi-bell" 
                  className="p-button-rounded p-button-text"
                  onClick={() => onMenuSelect('alerts')}
                />
                <Avatar 
                  image="/placeholder-user.jpg" 
                  shape="circle" 
                  size="normal"
                  onClick={(e) => setContextMenu(e.currentTarget)}
                />
              </div>
            }
          />
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar Navigation */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <i className="pi pi-bars"></i>
                Navigation
              </CardTitle>
            </CardHeader>
            <CardContent>
              <PanelMenu 
                model={menuItems}
                className="w-full"
              />
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card className="mt-4">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <i className="pi pi-bolt"></i>
                Quick Actions
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button 
                label="System Health Check" 
                icon="pi pi-heart" 
                className="w-full p-button-outlined"
                onClick={() => onMenuSelect('health')}
              />
              <Button 
                label="Export Logs" 
                icon="pi pi-download" 
                className="w-full p-button-outlined"
                onClick={() => console.log('Export logs')}
              />
              <Button 
                label="Clear Cache" 
                icon="pi pi-trash" 
                className="w-full p-button-outlined"
                onClick={() => console.log('Clear cache')}
              />
            </CardContent>
          </Card>
        </div>

        {/* Main Content Area */}
        <div className="lg:col-span-3">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <i className="pi pi-desktop"></i>
                  System Status Overview
                </CardTitle>
                <div className="flex items-center gap-2">
                  <Button 
                    icon="pi pi-refresh" 
                    className="p-button-rounded p-button-text"
                    onClick={() => window.location.reload()}
                  />
                  <Button 
                    icon="pi pi-ellipsis-v" 
                    className="p-button-rounded p-button-text"
                    onClick={(e) => setContextMenu(e.currentTarget)}
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 border rounded-lg">
                  <i className="pi pi-check-circle text-3xl text-green-500 mb-2"></i>
                  <h3 className="font-semibold">System Health</h3>
                  <p className="text-sm text-muted-foreground">All systems operational</p>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <i className="pi pi-exclamation-triangle text-3xl text-yellow-500 mb-2"></i>
                  <h3 className="font-semibold">Warnings</h3>
                  <p className="text-sm text-muted-foreground">2 items need attention</p>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <i className="pi pi-shield text-3xl text-blue-500 mb-2"></i>
                  <h3 className="font-semibold">Security</h3>
                  <p className="text-sm text-muted-foreground">No threats detected</p>
                </div>
              </div>

              <Divider />

              <div className="space-y-4">
                <h4 className="font-semibold">Recent Activity</h4>
                <div className="space-y-2">
                  <div className="flex items-center gap-3 p-2 border rounded">
                    <i className="pi pi-info-circle text-blue-500"></i>
                    <div className="flex-1">
                      <p className="text-sm font-medium">System backup completed</p>
                      <p className="text-xs text-muted-foreground">2 minutes ago</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-2 border rounded">
                    <i className="pi pi-exclamation-triangle text-yellow-500"></i>
                    <div className="flex-1">
                      <p className="text-sm font-medium">High memory usage detected</p>
                      <p className="text-xs text-muted-foreground">5 minutes ago</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-2 border rounded">
                    <i className="pi pi-user text-green-500"></i>
                    <div className="flex-1">
                      <p className="text-sm font-medium">New admin user logged in</p>
                      <p className="text-xs text-muted-foreground">10 minutes ago</p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Context Menu */}
      <ContextMenu 
        model={contextMenuItems} 
        ref={(el) => setContextMenu(el)} 
      />

      {/* User Menu */}
      <Menu 
        model={userMenuItems} 
        popup 
        ref={(el) => setContextMenu(el)} 
      />
    </div>
  );
}
