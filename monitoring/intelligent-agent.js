#!/usr/bin/env node

/**
 * Intelligent Monitoring Agent
 * AI-powered system monitoring with automated response capabilities
 */

import SystemMonitor from './system-monitor.js';
import { exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs/promises';
import path from 'path';

const execAsync = promisify(exec);

class IntelligentMonitoringAgent {
  constructor() {
    this.systemMonitor = new SystemMonitor();
    this.learningData = [];
    this.patterns = new Map();
    this.responseActions = new Map();
    this.alertHistory = [];
    this.baselineData = {
      cpu: { normal: [], warning: [], critical: [] },
      memory: { normal: [], warning: [], critical: [] },
      disk: { normal: [], warning: [], critical: [] },
      network: { normal: [], anomaly: [] }
    };
    
    this.setupResponseActions();
    this.monitoringInterval = null;
    this.isLearning = true;
  }

  /**
   * Setup automated response actions
   */
  setupResponseActions() {
    // CPU-related responses
    this.responseActions.set('cpu_critical', [
      { action: 'kill_high_cpu_processes', priority: 1 },
      { action: 'reduce_process_priority', priority: 2 },
      { action: 'alert_admin', priority: 3 },
      { action: 'scale_resources', priority: 4 }
    ]);

    // Memory-related responses
    this.responseActions.set('memory_critical', [
      { action: 'clear_cache', priority: 1 },
      { action: 'kill_memory_hogs', priority: 2 },
      { action: 'restart_services', priority: 3 },
      { action: 'alert_admin', priority: 4 }
    ]);

    // Disk-related responses
    this.responseActions.set('disk_critical', [
      { action: 'cleanup_temp_files', priority: 1 },
      { action: 'compress_logs', priority: 2 },
      { action: 'archive_old_data', priority: 3 },
      { action: 'alert_admin', priority: 4 }
    ]);

    // Network-related responses
    this.responseActions.set('network_anomaly', [
      { action: 'block_suspicious_ips', priority: 1 },
      { action: 'rate_limit_connections', priority: 2 },
      { action: 'alert_security_team', priority: 3 }
    ]);

    // Security-related responses
    this.responseActions.set('security_threat', [
      { action: 'isolate_system', priority: 1 },
      { action: 'backup_critical_data', priority: 2 },
      { action: 'alert_security_team', priority: 3 },
      { action: 'enable_enhanced_monitoring', priority: 4 }
    ]);
  }

  /**
   * Analyze patterns and detect anomalies using simple ML techniques
   */
  analyzePatterns(currentMetrics) {
    const anomalies = [];
    const timestamp = Date.now();

    // CPU pattern analysis
    const cpuAnomaly = this.detectCPUAnomaly(currentMetrics.cpu);
    if (cpuAnomaly) anomalies.push(cpuAnomaly);

    // Memory pattern analysis
    const memoryAnomaly = this.detectMemoryAnomaly(currentMetrics.memory);
    if (memoryAnomaly) anomalies.push(memoryAnomaly);

    // Network pattern analysis
    const networkAnomaly = this.detectNetworkAnomaly(currentMetrics.network, currentMetrics.connections);
    if (networkAnomaly) anomalies.push(networkAnomaly);

    // Process pattern analysis
    const processAnomaly = this.detectProcessAnomaly(currentMetrics.processes);
    if (processAnomaly) anomalies.push(processAnomaly);

    return anomalies;
  }

  /**
   * Detect CPU usage anomalies
   */
  detectCPUAnomaly(cpuMetrics) {
    const usage = cpuMetrics.usage;
    const loadAvg = cpuMetrics.loadAverage[0]; // 1-minute load average

    // Sudden spike detection
    if (this.learningData.length > 5) {
      const recentCPU = this.learningData.slice(-5).map(d => d.metrics.cpu.usage);
      const avgRecent = recentCPU.reduce((a, b) => a + b, 0) / recentCPU.length;
      
      if (usage > avgRecent * 1.5 && usage > 70) {
        return {
          type: 'cpu_spike',
          severity: usage > 90 ? 'critical' : 'warning',
          message: `CPU spike detected: ${usage}% (avg: ${avgRecent.toFixed(1)}%)`,
          metrics: { current: usage, average: avgRecent, loadAvg }
        };
      }
    }

    // High load average
    if (loadAvg > cpuMetrics.cores * 2) {
      return {
        type: 'high_load',
        severity: 'warning',
        message: `High system load: ${loadAvg.toFixed(2)} (cores: ${cpuMetrics.cores})`,
        metrics: { loadAvg, cores: cpuMetrics.cores }
      };
    }

    return null;
  }

  /**
   * Detect memory usage anomalies
   */
  detectMemoryAnomaly(memoryMetrics) {
    const usage = memoryMetrics.usagePercent;

    // Memory leak detection
    if (this.learningData.length > 10) {
      const recentMemory = this.learningData.slice(-10).map(d => d.metrics.memory.usagePercent);
      const trend = this.calculateTrend(recentMemory);
      
      if (trend > 2 && usage > 80) { // Increasing trend > 2% per measurement
        return {
          type: 'memory_leak',
          severity: 'warning',
          message: `Potential memory leak detected: ${usage}% (trend: +${trend.toFixed(1)}%)`,
          metrics: { current: usage, trend }
        };
      }
    }

    return null;
  }

  /**
   * Detect network anomalies
   */
  detectNetworkAnomaly(networkMetrics, connectionMetrics) {
    const connectionCount = connectionMetrics.count;
    const uniqueIPs = connectionMetrics.uniqueRemoteIPs.length;

    // Unusual connection patterns
    if (this.learningData.length > 5) {
      const recentConnections = this.learningData.slice(-5).map(d => d.metrics.connections.count);
      const avgConnections = recentConnections.reduce((a, b) => a + b, 0) / recentConnections.length;
      
      if (connectionCount > avgConnections * 3 && connectionCount > 100) {
        return {
          type: 'connection_flood',
          severity: 'warning',
          message: `Unusual connection count: ${connectionCount} (avg: ${avgConnections.toFixed(0)})`,
          metrics: { current: connectionCount, average: avgConnections, uniqueIPs }
        };
      }
    }

    // Too many unique IPs (potential DDoS)
    if (uniqueIPs > 50 && connectionCount > uniqueIPs * 5) {
      return {
        type: 'potential_ddos',
        severity: 'critical',
        message: `Potential DDoS detected: ${uniqueIPs} unique IPs, ${connectionCount} connections`,
        metrics: { uniqueIPs, connectionCount }
      };
    }

    return null;
  }

  /**
   * Detect process anomalies
   */
  detectProcessAnomaly(processMetrics) {
    const topProcesses = processMetrics.topProcesses;
    
    // Check for processes consuming too much CPU
    const highCPUProcesses = topProcesses.filter(p => p.cpu > 50);
    if (highCPUProcesses.length > 0) {
      return {
        type: 'high_cpu_process',
        severity: 'warning',
        message: `High CPU processes detected: ${highCPUProcesses.map(p => `${p.command} (${p.cpu}%)`).join(', ')}`,
        metrics: { processes: highCPUProcesses }
      };
    }

    return null;
  }

  /**
   * Calculate trend from array of values
   */
  calculateTrend(values) {
    if (values.length < 2) return 0;
    
    const n = values.length;
    const sumX = (n * (n - 1)) / 2;
    const sumY = values.reduce((a, b) => a + b, 0);
    const sumXY = values.reduce((sum, y, x) => sum + x * y, 0);
    const sumX2 = values.reduce((sum, _, x) => sum + x * x, 0);
    
    const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
    return slope;
  }

  /**
   * Execute automated response actions
   */
  async executeResponse(anomaly) {
    const responseKey = this.getResponseKey(anomaly);
    const actions = this.responseActions.get(responseKey);
    
    if (!actions) {
      console.log(`⚠️  No response actions defined for: ${anomaly.type}`);
      return;
    }

    console.log(`🤖 Executing automated response for: ${anomaly.type}`);
    
    for (const actionConfig of actions.sort((a, b) => a.priority - b.priority)) {
      try {
        await this.executeAction(actionConfig.action, anomaly);
        console.log(`✅ Executed: ${actionConfig.action}`);
        
        // Wait a bit between actions to see if the issue resolves
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // Re-check if the issue is resolved
        const currentMetrics = await this.systemMonitor.getSystemMetrics();
        if (this.isIssueResolved(anomaly, currentMetrics)) {
          console.log(`✅ Issue resolved after: ${actionConfig.action}`);
          break;
        }
      } catch (error) {
        console.error(`❌ Failed to execute ${actionConfig.action}:`, error.message);
      }
    }
  }

  /**
   * Get response key for anomaly type
   */
  getResponseKey(anomaly) {
    const typeMap = {
      'cpu_spike': 'cpu_critical',
      'high_load': 'cpu_critical',
      'memory_leak': 'memory_critical',
      'connection_flood': 'network_anomaly',
      'potential_ddos': 'security_threat',
      'high_cpu_process': 'cpu_critical'
    };
    
    return typeMap[anomaly.type] || 'alert_admin';
  }

  /**
   * Execute specific action
   */
  async executeAction(action, anomaly) {
    switch (action) {
      case 'kill_high_cpu_processes':
        await this.killHighCPUProcesses();
        break;
      case 'clear_cache':
        await this.clearSystemCache();
        break;
      case 'cleanup_temp_files':
        await this.cleanupTempFiles();
        break;
      case 'block_suspicious_ips':
        await this.blockSuspiciousIPs(anomaly);
        break;
      case 'alert_admin':
        await this.alertAdmin(anomaly);
        break;
      case 'reduce_process_priority':
        await this.reduceProcessPriority();
        break;
      case 'restart_services':
        await this.restartServices();
        break;
      default:
        console.log(`⚠️  Unknown action: ${action}`);
    }
  }

  /**
   * Kill processes consuming too much CPU
   */
  async killHighCPUProcesses() {
    try {
      const { stdout } = await execAsync("ps aux --sort=-%cpu | awk 'NR>1 && $3>80 {print $2}' | head -3");
      const pids = stdout.trim().split('\n').filter(pid => pid);
      
      for (const pid of pids) {
        await execAsync(`kill -TERM ${pid}`);
        console.log(`🔪 Terminated high CPU process: ${pid}`);
      }
    } catch (error) {
      console.error('Error killing high CPU processes:', error.message);
    }
  }

  /**
   * Clear system cache
   */
  async clearSystemCache() {
    try {
      await execAsync('sync && echo 3 > /proc/sys/vm/drop_caches');
      console.log('🧹 System cache cleared');
    } catch (error) {
      console.error('Error clearing cache:', error.message);
    }
  }

  /**
   * Cleanup temporary files
   */
  async cleanupTempFiles() {
    try {
      await execAsync('find /tmp -type f -atime +7 -delete');
      await execAsync('find /var/tmp -type f -atime +7 -delete');
      console.log('🧹 Temporary files cleaned up');
    } catch (error) {
      console.error('Error cleaning temp files:', error.message);
    }
  }

  /**
   * Block suspicious IPs
   */
  async blockSuspiciousIPs(anomaly) {
    // This would integrate with firewall rules
    console.log('🛡️  Would block suspicious IPs (firewall integration needed)');
  }

  /**
   * Alert admin
   */
  async alertAdmin(anomaly) {
    const alert = {
      timestamp: new Date().toISOString(),
      type: anomaly.type,
      severity: anomaly.severity,
      message: anomaly.message,
      metrics: anomaly.metrics
    };
    
    // Save alert to file (could also send email, Slack, etc.)
    await this.saveAlert(alert);
    console.log('📧 Admin alert sent');
  }

  /**
   * Save alert to file
   */
  async saveAlert(alert) {
    const alertsDir = 'monitoring/alerts';
    await fs.mkdir(alertsDir, { recursive: true });
    
    const filename = `alert-${Date.now()}.json`;
    await fs.writeFile(path.join(alertsDir, filename), JSON.stringify(alert, null, 2));
  }

  /**
   * Check if issue is resolved
   */
  isIssueResolved(anomaly, currentMetrics) {
    switch (anomaly.type) {
      case 'cpu_spike':
        return currentMetrics.cpu.usage < 70;
      case 'memory_leak':
        return currentMetrics.memory.usagePercent < 80;
      case 'connection_flood':
        return currentMetrics.connections.count < 100;
      default:
        return false;
    }
  }

  /**
   * Start continuous monitoring
   */
  startMonitoring(intervalMs = 10000) {
    console.log(`🚀 Starting intelligent monitoring (interval: ${intervalMs}ms)`);
    
    this.monitoringInterval = setInterval(async () => {
      try {
        const metrics = await this.systemMonitor.getSystemMetrics();
        const anomalies = this.analyzePatterns(metrics);
        
        // Store data for learning
        this.learningData.push({
          timestamp: Date.now(),
          metrics,
          anomalies
        });
        
        // Keep only recent data (last 1000 measurements)
        if (this.learningData.length > 1000) {
          this.learningData = this.learningData.slice(-1000);
        }
        
        // Process anomalies
        for (const anomaly of anomalies) {
          console.log(`🚨 Anomaly detected: ${anomaly.message}`);
          await this.executeResponse(anomaly);
        }
        
        // Log status
        if (anomalies.length === 0) {
          console.log(`✅ System healthy - CPU: ${metrics.cpu.usage}%, Memory: ${metrics.memory.usagePercent}%, Connections: ${metrics.connections.count}`);
        }
        
      } catch (error) {
        console.error('❌ Monitoring error:', error.message);
      }
    }, intervalMs);
  }

  /**
   * Stop monitoring
   */
  stopMonitoring() {
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
      this.monitoringInterval = null;
      console.log('🛑 Monitoring stopped');
    }
  }
}

export default IntelligentMonitoringAgent;
