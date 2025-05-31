import React from 'react';
import {
  TimelineEvent,
  SystemMetrics,
  DatabaseStatus,
  CSPReport,
  FileAccessEvent,
  RateLimitEvent,
  DeviceFingerprint,
  BehaviorAnomaly,
} from '@/types/telemetry';
import { Badge } from '@/components/ui/badge';

interface EventDetailsProps {
  event: TimelineEvent;
}

export function EventDetails({ event }: EventDetailsProps) {
  const renderSystemMetrics = (data: SystemMetrics) => (
    <div className="grid grid-cols-2 gap-4 text-sm">
      <div>
        <span className="font-medium">CPU Usage:</span>
        <div className="flex items-center gap-2 mt-1">
          <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-blue-500 transition-all duration-300"
              style={{ width: `${Math.min(data.cpu.usage, 100)}%` }}
            />
          </div>
          <span className="text-xs">{data.cpu.usage.toFixed(1)}%</span>
        </div>
      </div>
      <div>
        <span className="font-medium">Memory:</span>
        <div className="flex items-center gap-2 mt-1">
          <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-green-500 transition-all duration-300"
              style={{ width: `${Math.min(data.memory.percentage, 100)}%` }}
            />
          </div>
          <span className="text-xs">{data.memory.percentage.toFixed(1)}%</span>
        </div>
      </div>
      <div>
        <span className="font-medium">Disk Usage:</span>
        <div className="flex items-center gap-2 mt-1">
          <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-orange-500 transition-all duration-300"
              style={{ width: `${Math.min(data.disk.percentage, 100)}%` }}
            />
          </div>
          <span className="text-xs">{data.disk.percentage.toFixed(1)}%</span>
        </div>
      </div>
      <div>
        <span className="font-medium">Temperature:</span>
        <span className="text-xs ml-2">{data.cpu.temperature?.toFixed(1)}°C</span>
      </div>
    </div>
  );

  const renderDatabaseStatus = (data: DatabaseStatus) => (
    <div className="grid grid-cols-2 gap-4 text-sm">
      <div>
        <span className="font-medium">Status:</span>
        <Badge variant={data.status === 'healthy' ? 'default' : 'destructive'} className="ml-2">
          {data.status.toUpperCase()}
        </Badge>
      </div>
      <div>
        <span className="font-medium">Connections:</span>
        <span className="ml-2">
          {data.connections.active}/{data.connections.max}
        </span>
      </div>
      <div>
        <span className="font-medium">Query Time:</span>
        <span className="ml-2">{data.performance.queryTime.toFixed(2)}ms</span>
      </div>
      <div>
        <span className="font-medium">Replication:</span>
        <Badge
          variant={data.replication.status === 'synced' ? 'default' : 'secondary'}
          className="ml-2"
        >
          {data.replication.status.toUpperCase()}
        </Badge>
      </div>
    </div>
  );

  const renderCSPReport = (data: CSPReport) => (
    <div className="space-y-2 text-sm">
      <div>
        <span className="font-medium">Violated Directive:</span>
        <code className="ml-2 px-2 py-1 bg-muted rounded text-xs">{data.violatedDirective}</code>
      </div>
      <div>
        <span className="font-medium">Blocked URI:</span>
        <code className="ml-2 px-2 py-1 bg-muted rounded text-xs break-all">{data.blockedURI}</code>
      </div>
      <div>
        <span className="font-medium">Document URI:</span>
        <code className="ml-2 px-2 py-1 bg-muted rounded text-xs break-all">
          {data.documentURI}
        </code>
      </div>
      <div>
        <span className="font-medium">User Agent:</span>
        <span className="ml-2 text-xs text-muted-foreground">
          {data.userAgent.substring(0, 50)}...
        </span>
      </div>
    </div>
  );

  const renderFileAccessEvent = (data: FileAccessEvent) => (
    <div className="grid grid-cols-2 gap-4 text-sm">
      <div>
        <span className="font-medium">Action:</span>
        <Badge variant="outline" className="ml-2">
          {data.action.toUpperCase()}
        </Badge>
      </div>
      <div>
        <span className="font-medium">Success:</span>
        <Badge variant={data.success ? 'default' : 'destructive'} className="ml-2">
          {data.success ? 'YES' : 'NO'}
        </Badge>
      </div>
      <div className="col-span-2">
        <span className="font-medium">File Path:</span>
        <code className="ml-2 px-2 py-1 bg-muted rounded text-xs break-all">{data.filePath}</code>
      </div>
      <div>
        <span className="font-medium">IP Address:</span>
        <span className="ml-2">{data.ipAddress}</span>
      </div>
      <div>
        <span className="font-medium">Risk Level:</span>
        <Badge
          variant={
            data.risk === 'high' ? 'destructive' : data.risk === 'medium' ? 'secondary' : 'default'
          }
          className="ml-2"
        >
          {data.risk.toUpperCase()}
        </Badge>
      </div>
    </div>
  );

  const renderRateLimitEvent = (data: RateLimitEvent) => (
    <div className="grid grid-cols-2 gap-4 text-sm">
      <div>
        <span className="font-medium">IP Address:</span>
        <span className="ml-2">{data.ipAddress}</span>
      </div>
      <div>
        <span className="font-medium">Endpoint:</span>
        <code className="ml-2 px-2 py-1 bg-muted rounded text-xs">{data.endpoint}</code>
      </div>
      <div>
        <span className="font-medium">Requests:</span>
        <span className="ml-2">
          {data.requestCount}/{data.limitThreshold}
        </span>
      </div>
      <div>
        <span className="font-medium">Blocked:</span>
        <Badge variant={data.blocked ? 'destructive' : 'default'} className="ml-2">
          {data.blocked ? 'YES' : 'NO'}
        </Badge>
      </div>
      <div className="col-span-2">
        <span className="font-medium">Window:</span>
        <span className="ml-2">{data.windowSize}s</span>
      </div>
    </div>
  );

  const renderDeviceFingerprint = (data: DeviceFingerprint) => (
    <div className="space-y-2 text-sm">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <span className="font-medium">IP Address:</span>
          <span className="ml-2">{data.ipAddress}</span>
        </div>
        <div>
          <span className="font-medium">Risk Score:</span>
          <span className="ml-2">{(data.riskScore * 100).toFixed(1)}%</span>
        </div>
        <div>
          <span className="font-medium">Is Bot:</span>
          <Badge variant={data.isBot ? 'destructive' : 'default'} className="ml-2">
            {data.isBot ? 'YES' : 'NO'}
          </Badge>
        </div>
        <div>
          <span className="font-medium">Suspicious:</span>
          <Badge variant={data.isSuspicious ? 'destructive' : 'default'} className="ml-2">
            {data.isSuspicious ? 'YES' : 'NO'}
          </Badge>
        </div>
      </div>
      <div>
        <span className="font-medium">Screen:</span>
        <span className="ml-2">{data.screenResolution}</span>
      </div>
      <div>
        <span className="font-medium">Timezone:</span>
        <span className="ml-2">{data.timezone}</span>
      </div>
      <div>
        <span className="font-medium">Fingerprint Hash:</span>
        <code className="ml-2 px-2 py-1 bg-muted rounded text-xs">{data.fingerprintHash}</code>
      </div>
    </div>
  );

  const renderBehaviorAnomaly = (data: BehaviorAnomaly) => (
    <div className="space-y-3 text-sm">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <span className="font-medium">Type:</span>
          <Badge variant="outline" className="ml-2">
            {data.anomalyType.replace('_', ' ').toUpperCase()}
          </Badge>
        </div>
        <div>
          <span className="font-medium">Confidence:</span>
          <span className="ml-2">{(data.confidence * 100).toFixed(1)}%</span>
        </div>
        <div>
          <span className="font-medium">Resolved:</span>
          <Badge variant={data.resolved ? 'default' : 'destructive'} className="ml-2">
            {data.resolved ? 'YES' : 'NO'}
          </Badge>
        </div>
        <div>
          <span className="font-medium">False Positive:</span>
          <Badge variant={data.falsePositive ? 'secondary' : 'default'} className="ml-2">
            {data.falsePositive ? 'YES' : 'NO'}
          </Badge>
        </div>
      </div>
      <div>
        <span className="font-medium">IP Address:</span>
        <span className="ml-2">{data.metadata.ipAddress}</span>
      </div>
      {data.metadata.requestPattern && (
        <div>
          <span className="font-medium">Request Pattern:</span>
          <div className="ml-2 mt-1 text-xs">
            <div>Frequency: {data.metadata.requestPattern.frequency} req/min</div>
            <div>Endpoints: {data.metadata.requestPattern.endpoints.join(', ')}</div>
          </div>
        </div>
      )}
      {data.metadata.location && (
        <div>
          <span className="font-medium">Location:</span>
          <span className="ml-2">
            {data.metadata.location.city}, {data.metadata.location.country}
          </span>
        </div>
      )}
    </div>
  );

  const renderEventData = () => {
    switch (event.type) {
      case 'system':
        return renderSystemMetrics(event.data as SystemMetrics);
      case 'database':
        return renderDatabaseStatus(event.data as DatabaseStatus);
      case 'security':
        return renderCSPReport(event.data as CSPReport);
      case 'access':
        return renderFileAccessEvent(event.data as FileAccessEvent);
      case 'rate_limit':
        return renderRateLimitEvent(event.data as RateLimitEvent);
      case 'fingerprint':
        return renderDeviceFingerprint(event.data as DeviceFingerprint);
      case 'anomaly':
        return renderBehaviorAnomaly(event.data as BehaviorAnomaly);
      default:
        return <div className="text-sm text-muted-foreground">No additional details available</div>;
    }
  };

  return <div className="space-y-3">{renderEventData()}</div>;
}
