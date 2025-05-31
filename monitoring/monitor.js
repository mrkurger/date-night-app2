#!/usr/bin/env node

/**
 * Main Monitoring Script
 * Orchestrates system monitoring with intelligent responses
 */

import IntelligentMonitoringAgent from './intelligent-agent.js';
import SystemMonitor from './system-monitor.js';
import fs from 'fs/promises';
import path from 'path';

class MonitoringOrchestrator {
  constructor() {
    this.agent = new IntelligentMonitoringAgent();
    this.systemMonitor = new SystemMonitor();
    this.config = {
      monitoring: {
        interval: 10000, // 10 seconds
        fastInterval: 2000, // 2 seconds for critical situations
        reportInterval: 300000, // 5 minutes for status reports
      },
      thresholds: {
        cpu: { warning: 70, critical: 90 },
        memory: { warning: 80, critical: 95 },
        disk: { warning: 85, critical: 95 },
        connections: { warning: 200, critical: 500 }
      },
      alerts: {
        enabled: true,
        logToFile: true,
        logToConsole: true,
        webhookUrl: null // Set this for external notifications
      }
    };
    
    this.isRunning = false;
    this.currentMode = 'normal'; // normal, alert, critical
  }

  /**
   * Initialize monitoring system
   */
  async initialize() {
    console.log('🔧 Initializing monitoring system...');
    
    // Create necessary directories
    await this.createDirectories();
    
    // Load configuration if exists
    await this.loadConfiguration();
    
    // Setup signal handlers
    this.setupSignalHandlers();
    
    console.log('✅ Monitoring system initialized');
  }

  /**
   * Create necessary directories
   */
  async createDirectories() {
    const dirs = [
      'monitoring/logs',
      'monitoring/alerts',
      'monitoring/reports',
      'monitoring/config'
    ];
    
    for (const dir of dirs) {
      await fs.mkdir(dir, { recursive: true });
    }
  }

  /**
   * Load configuration from file
   */
  async loadConfiguration() {
    try {
      const configPath = 'monitoring/config/monitor-config.json';
      const configData = await fs.readFile(configPath, 'utf8');
      const loadedConfig = JSON.parse(configData);
      
      // Merge with default config
      this.config = { ...this.config, ...loadedConfig };
      console.log('📋 Configuration loaded from file');
    } catch (error) {
      // Create default config file
      await this.saveConfiguration();
      console.log('📋 Default configuration created');
    }
  }

  /**
   * Save configuration to file
   */
  async saveConfiguration() {
    const configPath = 'monitoring/config/monitor-config.json';
    await fs.writeFile(configPath, JSON.stringify(this.config, null, 2));
  }

  /**
   * Setup signal handlers for graceful shutdown
   */
  setupSignalHandlers() {
    process.on('SIGINT', () => this.shutdown('SIGINT'));
    process.on('SIGTERM', () => this.shutdown('SIGTERM'));
    process.on('uncaughtException', (error) => {
      console.error('❌ Uncaught exception:', error);
      this.logError(error);
    });
    process.on('unhandledRejection', (reason) => {
      console.error('❌ Unhandled rejection:', reason);
      this.logError(reason);
    });
  }

  /**
   * Start monitoring
   */
  async start() {
    if (this.isRunning) {
      console.log('⚠️  Monitoring is already running');
      return;
    }

    console.log('🚀 Starting comprehensive monitoring system...');
    this.isRunning = true;

    // Start the intelligent agent
    this.agent.startMonitoring(this.config.monitoring.interval);

    // Start periodic status reports
    this.startStatusReports();

    // Start health checks
    this.startHealthChecks();

    console.log('✅ Monitoring system is now active');
    console.log(`📊 Monitoring interval: ${this.config.monitoring.interval}ms`);
    console.log(`📈 Report interval: ${this.config.monitoring.reportInterval}ms`);
  }

  /**
   * Start periodic status reports
   */
  startStatusReports() {
    setInterval(async () => {
      try {
        const report = await this.generateStatusReport();
        await this.saveStatusReport(report);
        
        if (this.config.alerts.logToConsole) {
          this.logStatusSummary(report);
        }
      } catch (error) {
        console.error('❌ Error generating status report:', error.message);
      }
    }, this.config.monitoring.reportInterval);
  }

  /**
   * Start health checks
   */
  startHealthChecks() {
    setInterval(async () => {
      try {
        const health = await this.performHealthCheck();
        
        if (health.status === 'critical' && this.currentMode !== 'critical') {
          this.enterCriticalMode();
        } else if (health.status === 'normal' && this.currentMode !== 'normal') {
          this.enterNormalMode();
        }
      } catch (error) {
        console.error('❌ Health check error:', error.message);
      }
    }, 30000); // Every 30 seconds
  }

  /**
   * Generate comprehensive status report
   */
  async generateStatusReport() {
    const systemCheck = await this.systemMonitor.runSystemCheck();
    
    const report = {
      timestamp: new Date().toISOString(),
      mode: this.currentMode,
      system: systemCheck,
      performance: {
        cpu: {
          usage: systemCheck.metrics.cpu.usage,
          status: systemCheck.metrics.cpu.status,
          cores: systemCheck.metrics.cpu.cores
        },
        memory: {
          usage: systemCheck.metrics.memory.usagePercent,
          status: systemCheck.metrics.memory.status,
          total: systemCheck.metrics.memory.total
        },
        disk: systemCheck.metrics.disk.map(d => ({
          mountPoint: d.mountPoint,
          usage: d.usagePercent,
          status: d.status,
          available: d.available
        })),
        network: {
          openPorts: systemCheck.metrics.ports.count,
          activeConnections: systemCheck.metrics.connections.count,
          uniqueIPs: systemCheck.metrics.connections.uniqueRemoteIPs.length
        }
      },
      alerts: systemCheck.alerts,
      connectivity: systemCheck.connectivity,
      uptime: systemCheck.summary.uptime
    };

    return report;
  }

  /**
   * Save status report to file
   */
  async saveStatusReport(report) {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `status-report-${timestamp}.json`;
    const filepath = path.join('monitoring/reports', filename);
    
    await fs.writeFile(filepath, JSON.stringify(report, null, 2));
  }

  /**
   * Log status summary to console
   */
  logStatusSummary(report) {
    const { performance, alerts } = report;
    
    console.log('\n📊 === STATUS REPORT ===');
    console.log(`🕐 Time: ${new Date(report.timestamp).toLocaleString()}`);
    console.log(`🔄 Mode: ${report.mode.toUpperCase()}`);
    console.log(`⏱️  Uptime: ${report.uptime}`);
    console.log(`🖥️  CPU: ${performance.cpu.usage}% (${performance.cpu.status})`);
    console.log(`💾 Memory: ${performance.memory.usage}% (${performance.memory.status})`);
    console.log(`💿 Disk: ${performance.disk.map(d => `${d.mountPoint}: ${d.usage}%`).join(', ')}`);
    console.log(`🌐 Network: ${performance.network.activeConnections} connections, ${performance.network.uniqueIPs} unique IPs`);
    console.log(`🚨 Alerts: ${alerts.length} active`);
    
    if (alerts.length > 0) {
      console.log('⚠️  Active Alerts:');
      alerts.forEach(alert => {
        console.log(`   - ${alert.type}: ${alert.message}`);
      });
    }
    console.log('========================\n');
  }

  /**
   * Perform health check
   */
  async performHealthCheck() {
    const metrics = await this.systemMonitor.getSystemMetrics();
    
    let status = 'normal';
    const issues = [];

    // Check CPU
    if (metrics.cpu.usage > this.config.thresholds.cpu.critical) {
      status = 'critical';
      issues.push(`CPU usage critical: ${metrics.cpu.usage}%`);
    } else if (metrics.cpu.usage > this.config.thresholds.cpu.warning) {
      status = 'warning';
      issues.push(`CPU usage high: ${metrics.cpu.usage}%`);
    }

    // Check Memory
    if (metrics.memory.usagePercent > this.config.thresholds.memory.critical) {
      status = 'critical';
      issues.push(`Memory usage critical: ${metrics.memory.usagePercent}%`);
    } else if (metrics.memory.usagePercent > this.config.thresholds.memory.warning) {
      status = 'warning';
      issues.push(`Memory usage high: ${metrics.memory.usagePercent}%`);
    }

    // Check Disk
    for (const disk of metrics.disk) {
      if (disk.usagePercent > this.config.thresholds.disk.critical) {
        status = 'critical';
        issues.push(`Disk usage critical on ${disk.mountPoint}: ${disk.usagePercent}%`);
      }
    }

    return { status, issues, metrics };
  }

  /**
   * Enter critical monitoring mode
   */
  enterCriticalMode() {
    console.log('🚨 ENTERING CRITICAL MODE - Increasing monitoring frequency');
    this.currentMode = 'critical';
    
    // Stop current monitoring and restart with faster interval
    this.agent.stopMonitoring();
    this.agent.startMonitoring(this.config.monitoring.fastInterval);
  }

  /**
   * Enter normal monitoring mode
   */
  enterNormalMode() {
    console.log('✅ ENTERING NORMAL MODE - Resuming standard monitoring');
    this.currentMode = 'normal';
    
    // Stop current monitoring and restart with normal interval
    this.agent.stopMonitoring();
    this.agent.startMonitoring(this.config.monitoring.interval);
  }

  /**
   * Log error to file
   */
  async logError(error) {
    const timestamp = new Date().toISOString();
    const logEntry = {
      timestamp,
      error: error.message || error,
      stack: error.stack || 'No stack trace available'
    };
    
    const logFile = path.join('monitoring/logs', 'errors.log');
    const logLine = `${timestamp} - ${JSON.stringify(logEntry)}\n`;
    
    try {
      await fs.appendFile(logFile, logLine);
    } catch (writeError) {
      console.error('Failed to write error log:', writeError.message);
    }
  }

  /**
   * Graceful shutdown
   */
  async shutdown(signal) {
    console.log(`\n🛑 Received ${signal}, shutting down gracefully...`);
    
    this.isRunning = false;
    
    // Stop monitoring
    this.agent.stopMonitoring();
    
    // Generate final report
    try {
      const finalReport = await this.generateStatusReport();
      finalReport.shutdownReason = signal;
      await this.saveStatusReport(finalReport);
      console.log('📊 Final status report saved');
    } catch (error) {
      console.error('❌ Error saving final report:', error.message);
    }
    
    console.log('✅ Monitoring system shut down successfully');
    process.exit(0);
  }
}

// Main execution
async function main() {
  const orchestrator = new MonitoringOrchestrator();
  
  try {
    await orchestrator.initialize();
    await orchestrator.start();
    
    // Keep the process running
    console.log('🔄 Monitoring system is running. Press Ctrl+C to stop.');
    
  } catch (error) {
    console.error('❌ Failed to start monitoring system:', error.message);
    process.exit(1);
  }
}

// Run if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export default MonitoringOrchestrator;
