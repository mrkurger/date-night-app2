// Telemetry and Monitoring Types for Admin Dashboard

export interface SystemMetrics {
  id: string;
  timestamp: Date;
  cpu: {
    usage: number;
    cores: number;
    temperature?: number;
  };
  memory: {
    used: number;
    total: number;
    percentage: number;
  };
  disk: {
    used: number;
    total: number;
    percentage: number;
  };
  network: {
    bytesIn: number;
    bytesOut: number;
    packetsIn: number;
    packetsOut: number;
  };
}

export interface DatabaseStatus {
  id: string;
  timestamp: Date;
  status: 'healthy' | 'warning' | 'critical' | 'offline';
  connections: {
    active: number;
    idle: number;
    total: number;
    max: number;
  };
  performance: {
    queryTime: number;
    slowQueries: number;
    deadlocks: number;
  };
  replication: {
    lag: number;
    status: 'synced' | 'lagging' | 'error';
  };
}

export interface CSPReport {
  id: string;
  timestamp: Date;
  violatedDirective: string;
  blockedURI: string;
  documentURI: string;
  sourceFile?: string;
  lineNumber?: number;
  columnNumber?: number;
  userAgent: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
}

export interface FileAccessEvent {
  id: string;
  timestamp: Date;
  userId?: string;
  sessionId: string;
  filePath: string;
  action: 'read' | 'write' | 'delete' | 'create' | 'modify';
  success: boolean;
  fileSize?: number;
  permissions: string;
  ipAddress: string;
  userAgent: string;
  risk: 'low' | 'medium' | 'high' | 'critical';
}

export interface RateLimitEvent {
  id: string;
  timestamp: Date;
  ipAddress: string;
  endpoint: string;
  method: string;
  requestCount: number;
  limitThreshold: number;
  windowSize: number;
  blocked: boolean;
  userAgent?: string;
  userId?: string;
  severity: 'info' | 'warning' | 'critical';
}

export interface DeviceFingerprint {
  id: string;
  timestamp: Date;
  fingerprintHash: string;
  ipAddress: string;
  userAgent: string;
  screenResolution: string;
  timezone: string;
  language: string;
  plugins: string[];
  canvas: string;
  webgl: string;
  fonts: string[];
  riskScore: number;
  isBot: boolean;
  isSuspicious: boolean;
  userId?: string;
  sessionId: string;
}

export interface BehaviorAnomaly {
  id: string;
  timestamp: Date;
  userId?: string;
  sessionId: string;
  anomalyType: 'unusual_location' | 'rapid_requests' | 'suspicious_pattern' | 'bot_behavior' | 'data_scraping' | 'account_takeover';
  severity: 'low' | 'medium' | 'high' | 'critical';
  confidence: number;
  description: string;
  metadata: {
    ipAddress: string;
    userAgent: string;
    location?: {
      country: string;
      city: string;
      coordinates: [number, number];
    };
    requestPattern?: {
      frequency: number;
      endpoints: string[];
      timeWindow: number;
    };
  };
  resolved: boolean;
  falsePositive: boolean;
}

export interface TimelineEvent {
  id: string;
  timestamp: Date;
  type: 'system' | 'database' | 'security' | 'access' | 'rate_limit' | 'fingerprint' | 'anomaly';
  severity: 'info' | 'warning' | 'critical' | 'error';
  title: string;
  description: string;
  icon: string;
  color: string;
  data: SystemMetrics | DatabaseStatus | CSPReport | FileAccessEvent | RateLimitEvent | DeviceFingerprint | BehaviorAnomaly;
}

export interface TelemetryFilters {
  dateRange: {
    start: Date;
    end: Date;
  };
  types: string[];
  severities: string[];
  search?: string;
}

export interface TelemetryStats {
  totalEvents: number;
  criticalEvents: number;
  warningEvents: number;
  infoEvents: number;
  systemHealth: 'healthy' | 'warning' | 'critical';
  uptime: number;
  lastUpdate: Date;
}
