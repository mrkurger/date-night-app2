import {
  SystemMetrics,
  DatabaseStatus,
  CSPReport,
  FileAccessEvent,
  RateLimitEvent,
  DeviceFingerprint,
  BehaviorAnomaly,
  TimelineEvent,
  TelemetryFilters,
  TelemetryStats
} from '@/types/telemetry';

class TelemetryService {
  private events: TimelineEvent[] = [];
  private subscribers: ((events: TimelineEvent[]) => void)[] = [];
  private statsSubscribers: ((stats: TelemetryStats) => void)[] = [];

  constructor() {
    this.initializeMockData();
    this.startRealTimeUpdates();
  }

  // Subscribe to timeline events
  subscribe(callback: (events: TimelineEvent[]) => void): () => void {
    this.subscribers.push(callback);
    callback(this.events);
    
    return () => {
      const index = this.subscribers.indexOf(callback);
      if (index > -1) {
        this.subscribers.splice(index, 1);
      }
    };
  }

  // Subscribe to stats updates
  subscribeToStats(callback: (stats: TelemetryStats) => void): () => void {
    this.statsSubscribers.push(callback);
    callback(this.getStats());
    
    return () => {
      const index = this.statsSubscribers.indexOf(callback);
      if (index > -1) {
        this.statsSubscribers.splice(index, 1);
      }
    };
  }

  // Get filtered events
  getEvents(filters?: TelemetryFilters): TimelineEvent[] {
    let filteredEvents = [...this.events];

    if (filters) {
      if (filters.dateRange) {
        filteredEvents = filteredEvents.filter(event => 
          event.timestamp >= filters.dateRange.start && 
          event.timestamp <= filters.dateRange.end
        );
      }

      if (filters.types.length > 0) {
        filteredEvents = filteredEvents.filter(event => 
          filters.types.includes(event.type)
        );
      }

      if (filters.severities.length > 0) {
        filteredEvents = filteredEvents.filter(event => 
          filters.severities.includes(event.severity)
        );
      }

      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        filteredEvents = filteredEvents.filter(event => 
          event.title.toLowerCase().includes(searchLower) ||
          event.description.toLowerCase().includes(searchLower)
        );
      }
    }

    return filteredEvents.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }

  // Get telemetry statistics
  getStats(): TelemetryStats {
    const now = new Date();
    const criticalEvents = this.events.filter(e => e.severity === 'critical').length;
    const warningEvents = this.events.filter(e => e.severity === 'warning').length;
    const infoEvents = this.events.filter(e => e.severity === 'info').length;

    let systemHealth: 'healthy' | 'warning' | 'critical' = 'healthy';
    if (criticalEvents > 0) systemHealth = 'critical';
    else if (warningEvents > 5) systemHealth = 'warning';

    return {
      totalEvents: this.events.length,
      criticalEvents,
      warningEvents,
      infoEvents,
      systemHealth,
      uptime: 99.8,
      lastUpdate: now
    };
  }

  // Add new event
  addEvent(event: TimelineEvent): void {
    this.events.unshift(event);
    
    // Keep only last 1000 events
    if (this.events.length > 1000) {
      this.events = this.events.slice(0, 1000);
    }

    this.notifySubscribers();
  }

  // Initialize with mock data
  private initializeMockData(): void {
    const now = new Date();
    
    // System metrics events
    for (let i = 0; i < 10; i++) {
      const timestamp = new Date(now.getTime() - i * 5 * 60 * 1000); // Every 5 minutes
      this.addSystemMetricsEvent(timestamp);
    }

    // Database status events
    for (let i = 0; i < 5; i++) {
      const timestamp = new Date(now.getTime() - i * 10 * 60 * 1000); // Every 10 minutes
      this.addDatabaseStatusEvent(timestamp);
    }

    // Security events
    this.addCSPReportEvent(new Date(now.getTime() - 15 * 60 * 1000));
    this.addRateLimitEvent(new Date(now.getTime() - 8 * 60 * 1000));
    this.addBehaviorAnomalyEvent(new Date(now.getTime() - 3 * 60 * 1000));
    this.addFileAccessEvent(new Date(now.getTime() - 12 * 60 * 1000));
    this.addDeviceFingerprintEvent(new Date(now.getTime() - 6 * 60 * 1000));
  }

  private addSystemMetricsEvent(timestamp: Date): void {
    const metrics: SystemMetrics = {
      id: `sys_${Date.now()}_${Math.random()}`,
      timestamp,
      cpu: {
        usage: Math.random() * 100,
        cores: 8,
        temperature: 45 + Math.random() * 20
      },
      memory: {
        used: 4 + Math.random() * 4,
        total: 16,
        percentage: 25 + Math.random() * 50
      },
      disk: {
        used: 100 + Math.random() * 400,
        total: 1000,
        percentage: 10 + Math.random() * 40
      },
      network: {
        bytesIn: Math.random() * 1000000,
        bytesOut: Math.random() * 1000000,
        packetsIn: Math.random() * 10000,
        packetsOut: Math.random() * 10000
      }
    };

    const severity = metrics.cpu.usage > 80 ? 'critical' : 
                    metrics.cpu.usage > 60 ? 'warning' : 'info';

    const event: TimelineEvent = {
      id: metrics.id,
      timestamp,
      type: 'system',
      severity,
      title: 'System Metrics Update',
      description: `CPU: ${metrics.cpu.usage.toFixed(1)}%, Memory: ${metrics.memory.percentage.toFixed(1)}%`,
      icon: 'pi pi-desktop',
      color: severity === 'critical' ? '#ef4444' : severity === 'warning' ? '#f59e0b' : '#10b981',
      data: metrics
    };

    this.events.push(event);
  }

  private addDatabaseStatusEvent(timestamp: Date): void {
    const status: DatabaseStatus = {
      id: `db_${Date.now()}_${Math.random()}`,
      timestamp,
      status: Math.random() > 0.9 ? 'warning' : 'healthy',
      connections: {
        active: Math.floor(Math.random() * 50),
        idle: Math.floor(Math.random() * 20),
        total: 0,
        max: 100
      },
      performance: {
        queryTime: Math.random() * 100,
        slowQueries: Math.floor(Math.random() * 5),
        deadlocks: Math.floor(Math.random() * 2)
      },
      replication: {
        lag: Math.random() * 1000,
        status: Math.random() > 0.95 ? 'lagging' : 'synced'
      }
    };

    status.connections.total = status.connections.active + status.connections.idle;

    const event: TimelineEvent = {
      id: status.id,
      timestamp,
      type: 'database',
      severity: status.status === 'warning' ? 'warning' : 'info',
      title: 'Database Health Check',
      description: `Status: ${status.status}, Connections: ${status.connections.active}/${status.connections.max}`,
      icon: 'pi pi-database',
      color: status.status === 'warning' ? '#f59e0b' : '#10b981',
      data: status
    };

    this.events.push(event);
  }

  private addCSPReportEvent(timestamp: Date): void {
    const report: CSPReport = {
      id: `csp_${Date.now()}_${Math.random()}`,
      timestamp,
      violatedDirective: 'script-src',
      blockedURI: 'https://malicious-site.com/script.js',
      documentURI: 'https://yoursite.com/login',
      sourceFile: 'https://yoursite.com/login',
      lineNumber: 42,
      columnNumber: 15,
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      severity: 'high'
    };

    const event: TimelineEvent = {
      id: report.id,
      timestamp,
      type: 'security',
      severity: 'warning',
      title: 'CSP Violation Detected',
      description: `Blocked ${report.violatedDirective} from ${report.blockedURI}`,
      icon: 'pi pi-shield',
      color: '#f59e0b',
      data: report
    };

    this.events.push(event);
  }

  private addRateLimitEvent(timestamp: Date): void {
    const rateLimitEvent: RateLimitEvent = {
      id: `rate_${Date.now()}_${Math.random()}`,
      timestamp,
      ipAddress: '192.168.1.100',
      endpoint: '/api/login',
      method: 'POST',
      requestCount: 25,
      limitThreshold: 20,
      windowSize: 300,
      blocked: true,
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      severity: 'warning'
    };

    const event: TimelineEvent = {
      id: rateLimitEvent.id,
      timestamp,
      type: 'rate_limit',
      severity: 'warning',
      title: 'Rate Limit Exceeded',
      description: `IP ${rateLimitEvent.ipAddress} exceeded ${rateLimitEvent.limitThreshold} requests to ${rateLimitEvent.endpoint}`,
      icon: 'pi pi-ban',
      color: '#f59e0b',
      data: rateLimitEvent
    };

    this.events.push(event);
  }

  private addBehaviorAnomalyEvent(timestamp: Date): void {
    const anomaly: BehaviorAnomaly = {
      id: `anomaly_${Date.now()}_${Math.random()}`,
      timestamp,
      sessionId: 'sess_' + Math.random().toString(36).substr(2, 9),
      anomalyType: 'rapid_requests',
      severity: 'high',
      confidence: 0.85,
      description: 'Detected unusually rapid API requests suggesting automated behavior',
      metadata: {
        ipAddress: '203.0.113.42',
        userAgent: 'Python/3.9 requests/2.25.1',
        requestPattern: {
          frequency: 50,
          endpoints: ['/api/users', '/api/profiles', '/api/search'],
          timeWindow: 60
        }
      },
      resolved: false,
      falsePositive: false
    };

    const event: TimelineEvent = {
      id: anomaly.id,
      timestamp,
      type: 'anomaly',
      severity: 'critical',
      title: 'Behavior Anomaly Detected',
      description: anomaly.description,
      icon: 'pi pi-exclamation-triangle',
      color: '#ef4444',
      data: anomaly
    };

    this.events.push(event);
  }

  private addFileAccessEvent(timestamp: Date): void {
    const fileEvent: FileAccessEvent = {
      id: `file_${Date.now()}_${Math.random()}`,
      timestamp,
      sessionId: 'sess_' + Math.random().toString(36).substr(2, 9),
      filePath: '/var/log/application.log',
      action: 'read',
      success: true,
      fileSize: 1024000,
      permissions: 'rw-r--r--',
      ipAddress: '10.0.0.15',
      userAgent: 'curl/7.68.0',
      risk: 'medium'
    };

    const event: TimelineEvent = {
      id: fileEvent.id,
      timestamp,
      type: 'access',
      severity: 'info',
      title: 'File Access Event',
      description: `${fileEvent.action.toUpperCase()} access to ${fileEvent.filePath}`,
      icon: 'pi pi-file',
      color: '#6366f1',
      data: fileEvent
    };

    this.events.push(event);
  }

  private addDeviceFingerprintEvent(timestamp: Date): void {
    const fingerprint: DeviceFingerprint = {
      id: `fp_${Date.now()}_${Math.random()}`,
      timestamp,
      fingerprintHash: 'a1b2c3d4e5f6g7h8i9j0',
      ipAddress: '198.51.100.25',
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      screenResolution: '1920x1080',
      timezone: 'America/New_York',
      language: 'en-US',
      plugins: ['Chrome PDF Plugin', 'Shockwave Flash'],
      canvas: 'canvas_hash_123',
      webgl: 'webgl_hash_456',
      fonts: ['Arial', 'Times New Roman', 'Helvetica'],
      riskScore: 0.3,
      isBot: false,
      isSuspicious: false,
      sessionId: 'sess_' + Math.random().toString(36).substr(2, 9)
    };

    const event: TimelineEvent = {
      id: fingerprint.id,
      timestamp,
      type: 'fingerprint',
      severity: 'info',
      title: 'Device Fingerprint Captured',
      description: `New device fingerprint from ${fingerprint.ipAddress} (Risk: ${fingerprint.riskScore})`,
      icon: 'pi pi-mobile',
      color: '#8b5cf6',
      data: fingerprint
    };

    this.events.push(event);
  }

  // Start real-time updates simulation
  private startRealTimeUpdates(): void {
    setInterval(() => {
      const now = new Date();
      
      // Add system metrics every 5 minutes
      if (Math.random() > 0.7) {
        this.addSystemMetricsEvent(now);
        this.notifySubscribers();
      }

      // Add random events occasionally
      if (Math.random() > 0.95) {
        const eventTypes = ['csp', 'rate_limit', 'anomaly', 'file_access', 'fingerprint'];
        const randomType = eventTypes[Math.floor(Math.random() * eventTypes.length)];
        
        switch (randomType) {
          case 'csp':
            this.addCSPReportEvent(now);
            break;
          case 'rate_limit':
            this.addRateLimitEvent(now);
            break;
          case 'anomaly':
            this.addBehaviorAnomalyEvent(now);
            break;
          case 'file_access':
            this.addFileAccessEvent(now);
            break;
          case 'fingerprint':
            this.addDeviceFingerprintEvent(now);
            break;
        }
        
        this.notifySubscribers();
      }
    }, 30000); // Check every 30 seconds
  }

  private notifySubscribers(): void {
    this.subscribers.forEach(callback => callback(this.events));
    this.statsSubscribers.forEach(callback => callback(this.getStats()));
  }
}

// Export singleton instance
export const telemetryService = new TelemetryService();
