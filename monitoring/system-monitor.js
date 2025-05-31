#!/usr/bin/env node

/**
 * Comprehensive System Monitoring Agent
 * Monitors system health, network status, and resource usage
 */

import os from 'os';
import fs from 'fs/promises';
import { exec } from 'child_process';
import { promisify } from 'util';
import net from 'net';
import dns from 'dns';

const execAsync = promisify(exec);

class SystemMonitor {
  constructor() {
    this.baseline = {
      cpu: { warning: 80, critical: 95 },
      memory: { warning: 85, critical: 95 },
      disk: { warning: 85, critical: 95 },
      network: { timeout: 5000 },
      ports: { maxOpen: 1000 },
    };

    this.alerts = [];
    this.metrics = {
      timestamp: Date.now(),
      system: {},
      network: {},
      processes: {},
      security: {},
    };
  }

  /**
   * Get comprehensive system metrics
   */
  async getSystemMetrics() {
    const metrics = {
      timestamp: Date.now(),
      hostname: os.hostname(),
      platform: os.platform(),
      arch: os.arch(),
      uptime: os.uptime(),
      loadavg: os.loadavg(),
      cpu: await this.getCPUUsage(),
      memory: this.getMemoryUsage(),
      disk: await this.getDiskUsage(),
      network: await this.getNetworkInfo(),
      processes: await this.getProcessInfo(),
      ports: await this.getOpenPorts(),
      connections: await this.getNetworkConnections(),
    };

    return metrics;
  }

  /**
   * Get CPU usage percentage
   */
  async getCPUUsage() {
    const cpus = os.cpus();
    let totalIdle = 0;
    let totalTick = 0;

    cpus.forEach(cpu => {
      for (const type in cpu.times) {
        totalTick += cpu.times[type];
      }
      totalIdle += cpu.times.idle;
    });

    const idle = totalIdle / cpus.length;
    const total = totalTick / cpus.length;
    const usage = 100 - ~~((100 * idle) / total);

    return {
      cores: cpus.length,
      model: cpus[0].model,
      speed: cpus[0].speed,
      usage: usage,
      loadAverage: os.loadavg(),
      status: this.getStatus(usage, this.baseline.cpu),
    };
  }

  /**
   * Get memory usage
   */
  getMemoryUsage() {
    const total = os.totalmem();
    const free = os.freemem();
    const used = total - free;
    const usagePercent = (used / total) * 100;

    return {
      total: this.formatBytes(total),
      free: this.formatBytes(free),
      used: this.formatBytes(used),
      usagePercent: Math.round(usagePercent * 100) / 100,
      status: this.getStatus(usagePercent, this.baseline.memory),
    };
  }

  /**
   * Get disk usage for all mounted drives
   */
  async getDiskUsage() {
    try {
      const { stdout } = await execAsync('df -h');
      const lines = stdout.split('\n').slice(1);
      const disks = [];

      for (const line of lines) {
        if (line.trim()) {
          const parts = line.split(/\s+/);
          if (parts.length >= 6) {
            const usagePercent = parseInt(parts[4].replace('%', ''));
            disks.push({
              filesystem: parts[0],
              size: parts[1],
              used: parts[2],
              available: parts[3],
              usagePercent: usagePercent,
              mountPoint: parts[5],
              status: this.getStatus(usagePercent, this.baseline.disk),
            });
          }
        }
      }

      return disks;
    } catch (error) {
      console.error('Error getting disk usage:', error);
      return [];
    }
  }

  /**
   * Get network interface information
   */
  async getNetworkInfo() {
    const interfaces = os.networkInterfaces();
    const networkInfo = {};

    for (const [name, addresses] of Object.entries(interfaces)) {
      networkInfo[name] = addresses.map(addr => ({
        address: addr.address,
        family: addr.family,
        internal: addr.internal,
        mac: addr.mac,
      }));
    }

    return networkInfo;
  }

  /**
   * Get running processes information
   */
  async getProcessInfo() {
    try {
      const { stdout } = await execAsync('ps aux | sort -nr -k 3 | head -20');
      const lines = stdout.split('\n').slice(1);
      const processes = [];

      for (const line of lines) {
        if (line.trim()) {
          const parts = line.split(/\s+/);
          if (parts.length >= 11) {
            processes.push({
              user: parts[0],
              pid: parts[1],
              cpu: parseFloat(parts[2]),
              memory: parseFloat(parts[3]),
              command: parts.slice(10).join(' '),
            });
          }
        }
      }

      return {
        topProcesses: processes,
        totalProcesses: processes.length,
      };
    } catch (error) {
      console.error('Error getting process info:', error);
      return { topProcesses: [], totalProcesses: 0 };
    }
  }

  /**
   * Get open ports and listening services
   */
  async getOpenPorts() {
    try {
      const { stdout } = await execAsync('netstat -an | grep LISTEN || lsof -i -P | grep LISTEN');
      const lines = stdout.split('\n').slice(1);
      const ports = [];

      for (const line of lines) {
        if (line.includes('LISTEN') || line.includes('State')) {
          const parts = line.split(/\s+/);
          if (parts.length >= 4) {
            const localAddress = parts[3] || parts[4];
            if (localAddress && localAddress.includes(':')) {
              const port = localAddress.split(':').pop();
              ports.push({
                port: port,
                address: localAddress,
                protocol: parts[0],
                process: parts[6] || 'unknown',
              });
            }
          }
        }
      }

      return {
        openPorts: ports,
        count: ports.length,
        status: this.getStatus(ports.length, this.baseline.ports, 'maxOpen'),
      };
    } catch (error) {
      console.error('Error getting open ports:', error);
      return { openPorts: [], count: 0, status: 'unknown' };
    }
  }

  /**
   * Get active network connections
   */
  async getNetworkConnections() {
    try {
      const { stdout } = await execAsync('netstat -tn 2>/dev/null || ss -tn');
      const lines = stdout.split('\n').slice(1);
      const connections = [];

      for (const line of lines) {
        if (line.includes('ESTABLISHED')) {
          const parts = line.split(/\s+/);
          if (parts.length >= 5) {
            const localAddr = parts[3] || parts[4];
            const remoteAddr = parts[4] || parts[5];

            connections.push({
              local: localAddr,
              remote: remoteAddr,
              state: 'ESTABLISHED',
            });
          }
        }
      }

      return {
        activeConnections: connections,
        count: connections.length,
        uniqueRemoteIPs: [...new Set(connections.map(c => c.remote.split(':')[0]))],
      };
    } catch (error) {
      console.error('Error getting network connections:', error);
      return { activeConnections: [], count: 0, uniqueRemoteIPs: [] };
    }
  }

  /**
   * Test connectivity to external services
   */
  async testConnectivity(hosts = ['8.8.8.8', 'google.com', 'github.com']) {
    const results = [];

    for (const host of hosts) {
      try {
        const start = Date.now();
        await dns.promises.lookup(host);
        const latency = Date.now() - start;

        results.push({
          host,
          status: 'reachable',
          latency: latency,
        });
      } catch (error) {
        results.push({
          host,
          status: 'unreachable',
          error: error.message,
        });
      }
    }

    return results;
  }

  /**
   * Determine status based on thresholds
   */
  getStatus(value, thresholds, key = 'warning') {
    const warning = thresholds[key] || thresholds.warning;
    const critical = thresholds.critical;

    if (value >= critical) return 'critical';
    if (value >= warning) return 'warning';
    return 'normal';
  }

  /**
   * Format bytes to human readable format
   */
  formatBytes(bytes) {
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    if (bytes === 0) return '0 Bytes';
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round((bytes / Math.pow(1024, i)) * 100) / 100 + ' ' + sizes[i];
  }

  /**
   * Generate alerts based on current metrics
   */
  generateAlerts(metrics) {
    const alerts = [];

    // CPU alerts
    if (metrics.cpu.status === 'critical') {
      alerts.push({
        type: 'critical',
        component: 'cpu',
        message: `CPU usage critical: ${metrics.cpu.usage}%`,
        value: metrics.cpu.usage,
        threshold: this.baseline.cpu.critical,
      });
    }

    // Memory alerts
    if (metrics.memory.status === 'critical') {
      alerts.push({
        type: 'critical',
        component: 'memory',
        message: `Memory usage critical: ${metrics.memory.usagePercent}%`,
        value: metrics.memory.usagePercent,
        threshold: this.baseline.memory.critical,
      });
    }

    // Disk alerts
    metrics.disk.forEach(disk => {
      if (disk.status === 'critical') {
        alerts.push({
          type: 'critical',
          component: 'disk',
          message: `Disk usage critical on ${disk.mountPoint}: ${disk.usagePercent}%`,
          value: disk.usagePercent,
          threshold: this.baseline.disk.critical,
        });
      }
    });

    return alerts;
  }

  /**
   * Run comprehensive system check
   */
  async runSystemCheck() {
    console.log('🔍 Running comprehensive system check...');

    const metrics = await this.getSystemMetrics();
    const connectivity = await this.testConnectivity();
    const alerts = this.generateAlerts(metrics);

    const report = {
      timestamp: new Date().toISOString(),
      metrics,
      connectivity,
      alerts,
      summary: {
        status: alerts.some(a => a.type === 'critical')
          ? 'critical'
          : alerts.some(a => a.type === 'warning')
          ? 'warning'
          : 'healthy',
        alertCount: alerts.length,
        uptime: this.formatUptime(metrics.uptime),
      },
    };

    return report;
  }

  /**
   * Format uptime to human readable
   */
  formatUptime(seconds) {
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);

    return `${days}d ${hours}h ${minutes}m`;
  }
}

export default SystemMonitor;
