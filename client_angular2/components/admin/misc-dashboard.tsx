import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar } from 'primereact/avatar';
import { AvatarGroup } from 'primereact/avatargroup';
import { Chip } from 'primereact/chip';
import { Tag } from 'primereact/tag';
import { ProgressBar } from 'primereact/progressbar';
import { ProgressSpinner } from 'primereact/progressspinner';
import { Skeleton } from 'primereact/skeleton';
import { BlockUI } from 'primereact/blockui';
import { Button } from 'primereact/button';
import { Inplace, InplaceDisplay, InplaceContent } from 'primereact/inplace';
import { InputText } from 'primereact/inputtext';
import { ScrollTop } from 'primereact/scrolltop';
import { Terminal } from 'primereact/terminal';
import { TerminalService } from 'primereact/terminalservice';
import { Divider } from 'primereact/divider';

export function MiscDashboard() {
  const [blocked, setBlocked] = useState(false);
  const [loading, setLoading] = useState(false);

  // Terminal command handler
  const commandHandler = (text: string) => {
    let response;
    let argsIndex = text.indexOf(' ');
    let command = argsIndex !== -1 ? text.substring(0, argsIndex) : text;

    switch (command) {
      case 'date':
        response = 'Today is ' + new Date().toDateString();
        break;
      case 'greet':
        response = 'Hello Admin!';
        break;
      case 'status':
        response = 'System Status: All services running normally';
        break;
      case 'help':
        response = 'Available commands: date, greet, status, clear, help';
        break;
      case 'clear':
        response = null;
        break;
      default:
        response = 'Unknown command: ' + command;
    }

    if (response) {
      TerminalService.emit('response', response);
    } else {
      TerminalService.emit('clear');
    }
  };

  React.useEffect(() => {
    TerminalService.on('command', commandHandler);
    return () => TerminalService.off('command', commandHandler);
  }, []);

  const adminUsers = [
    { name: 'John Doe', image: '/placeholder-user.jpg', status: 'online' },
    { name: 'Jane Smith', image: '/placeholder-user.jpg', status: 'away' },
    { name: 'Mike Johnson', image: '/placeholder-user.jpg', status: 'busy' },
    { name: 'Sarah Wilson', image: '/placeholder-user.jpg', status: 'offline' }
  ];

  const systemTags = [
    { label: 'Production', severity: 'success' },
    { label: 'High Priority', severity: 'danger' },
    { label: 'Monitoring', severity: 'info' },
    { label: 'Automated', severity: 'warning' }
  ];

  const performanceData = [
    { label: 'CPU Usage', value: 34, color: '#3B82F6' },
    { label: 'Memory Usage', value: 68, color: '#10B981' },
    { label: 'Disk Usage', value: 45, color: '#F59E0B' },
    { label: 'Network I/O', value: 23, color: '#8B5CF6' }
  ];

  return (
    <div className="space-y-6">
      {/* User Management Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <i className="pi pi-users text-blue-600"></i>
              Admin Users
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-center">
                <AvatarGroup>
                  {adminUsers.slice(0, 4).map((user, index) => (
                    <Avatar
                      key={index}
                      image={user.image}
                      size="large"
                      shape="circle"
                      className="border-2 border-white"
                    />
                  ))}
                  <Avatar
                    label="+3"
                    size="large"
                    shape="circle"
                    className="bg-gray-500 text-white border-2 border-white"
                  />
                </AvatarGroup>
              </div>

              <Divider />

              <div className="space-y-3">
                {adminUsers.map((user, index) => (
                  <div key={index} className="flex items-center justify-between p-2 border rounded">
                    <div className="flex items-center gap-3">
                      <Avatar image={user.image} size="normal" shape="circle" />
                      <span className="font-medium">{user.name}</span>
                    </div>
                    <Chip
                      label={user.status.toUpperCase()}
                      className={`text-xs ${
                        user.status === 'online' ? 'bg-green-100 text-green-800' :
                        user.status === 'away' ? 'bg-yellow-100 text-yellow-800' :
                        user.status === 'busy' ? 'bg-red-100 text-red-800' :
                        'bg-gray-100 text-gray-800'
                      }`}
                    />
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <i className="pi pi-tags text-purple-600"></i>
              System Tags
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex flex-wrap gap-2">
                {systemTags.map((tag, index) => (
                  <Tag
                    key={index}
                    value={tag.label}
                    severity={tag.severity as any}
                    className="text-sm"
                  />
                ))}
              </div>

              <Divider />

              <div className="space-y-3">
                <h4 className="font-semibold">Performance Indicators</h4>
                {performanceData.map((item, index) => (
                  <div key={index} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">{item.label}</span>
                      <span className="text-sm font-bold">{item.value}%</span>
                    </div>
                    <ProgressBar
                      value={item.value}
                      color={item.color}
                      className="h-2"
                    />
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Interactive Elements */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <i className="pi pi-cog text-orange-600"></i>
              System Controls
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span>Block UI Demo</span>
                <Button
                  label={blocked ? 'Unblock' : 'Block'}
                  onClick={() => setBlocked(!blocked)}
                  className={blocked ? 'p-button-success' : 'p-button-danger'}
                />
              </div>

              <BlockUI blocked={blocked}>
                <div className="p-4 border rounded bg-gray-50">
                  <h4 className="font-semibold mb-2">System Configuration</h4>
                  <p className="text-sm text-muted-foreground">
                    This panel can be blocked during system operations.
                  </p>
                  <div className="mt-3 space-y-2">
                    <Inplace>
                      <InplaceDisplay>
                        <span className="text-blue-600 cursor-pointer">
                          Click to edit server name: production-server-01
                        </span>
                      </InplaceDisplay>
                      <InplaceContent>
                        <InputText defaultValue="production-server-01" />
                      </InplaceContent>
                    </Inplace>
                  </div>
                </div>
              </BlockUI>

              <Divider />

              <div className="flex items-center justify-between">
                <span>Loading Demo</span>
                <Button
                  label={loading ? 'Stop' : 'Start'}
                  onClick={() => setLoading(!loading)}
                  className={loading ? 'p-button-danger' : 'p-button-success'}
                />
              </div>

              {loading && (
                <div className="flex items-center justify-center p-4 border rounded">
                  <ProgressSpinner style={{ width: '50px', height: '50px' }} />
                  <span className="ml-3">Processing system updates...</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <i className="pi pi-terminal text-green-600"></i>
              Admin Terminal
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-black rounded p-4">
              <Terminal
                welcomeMessage="Welcome to Admin Console Terminal. Type 'help' for available commands."
                prompt="admin@console:~$ "
                className="bg-black text-green-400"
                style={{ height: '300px' }}
              />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Skeleton Loading Demo */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <i className="pi pi-spinner text-gray-600"></i>
            Loading States Demo
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h4 className="font-semibold">Content Loading</h4>
              <div className="space-y-3">
                <Skeleton width="100%" height="2rem" />
                <Skeleton width="80%" height="1.5rem" />
                <Skeleton width="60%" height="1.5rem" />
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="font-semibold">Card Loading</h4>
              <div className="border rounded p-4 space-y-3">
                <div className="flex items-center gap-3">
                  <Skeleton shape="circle" size="3rem" />
                  <div className="flex-1 space-y-2">
                    <Skeleton width="100%" height="1rem" />
                    <Skeleton width="75%" height="1rem" />
                  </div>
                </div>
                <Skeleton width="100%" height="8rem" />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Status Indicators */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <i className="pi pi-info-circle text-blue-600"></i>
            System Status Indicators
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center p-4 border rounded">
              <Avatar
                icon="pi pi-server"
                size="large"
                shape="circle"
                className="bg-green-500 text-white mb-3"
              />
              <h4 className="font-semibold">Server Status</h4>
              <Badge variant="default" className="mt-2">Online</Badge>
            </div>

            <div className="text-center p-4 border rounded">
              <Avatar
                icon="pi pi-database"
                size="large"
                shape="circle"
                className="bg-blue-500 text-white mb-3"
              />
              <h4 className="font-semibold">Database</h4>
              <Badge variant="default" className="mt-2">Connected</Badge>
            </div>

            <div className="text-center p-4 border rounded">
              <Avatar
                icon="pi pi-shield"
                size="large"
                shape="circle"
                className="bg-yellow-500 text-white mb-3"
              />
              <h4 className="font-semibold">Security</h4>
              <Badge variant="secondary" className="mt-2">Warning</Badge>
            </div>

            <div className="text-center p-4 border rounded">
              <Avatar
                icon="pi pi-chart-line"
                size="large"
                shape="circle"
                className="bg-purple-500 text-white mb-3"
              />
              <h4 className="font-semibold">Performance</h4>
              <Badge variant="default" className="mt-2">Optimal</Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Scroll to Top */}
      <ScrollTop />
    </div>
  );
}
