#!/usr/bin/env node

/**
 * Test Script for Intelligent Monitoring System
 * Verifies all components are working correctly
 */

import SystemMonitor from './system-monitor.js';
import IntelligentMonitoringAgent from './intelligent-agent.js';
import { MLAnomalyDetector } from './ml-anomaly-detector.js';

class MonitoringSystemTest {
  constructor() {
    this.systemMonitor = new SystemMonitor();
    this.agent = new IntelligentMonitoringAgent();
    this.mlDetector = new MLAnomalyDetector();
    this.testResults = [];
  }

  /**
   * Run all tests
   */
  async runAllTests() {
    console.log('🧪 Starting Monitoring System Tests...\n');

    const tests = [
      { name: 'System Monitor Basic Functions', test: () => this.testSystemMonitor() },
      { name: 'CPU Metrics Collection', test: () => this.testCPUMetrics() },
      { name: 'Memory Metrics Collection', test: () => this.testMemoryMetrics() },
      { name: 'Disk Metrics Collection', test: () => this.testDiskMetrics() },
      { name: 'Network Metrics Collection', test: () => this.testNetworkMetrics() },
      { name: 'Process Information', test: () => this.testProcessInfo() },
      { name: 'Port Scanning', test: () => this.testPortScanning() },
      { name: 'Connectivity Tests', test: () => this.testConnectivity() },
      { name: 'ML Anomaly Detection', test: () => this.testMLDetection() },
      { name: 'Alert Generation', test: () => this.testAlertGeneration() },
      { name: 'Response Actions', test: () => this.testResponseActions() },
      { name: 'Configuration Loading', test: () => this.testConfiguration() }
    ];

    for (const test of tests) {
      try {
        console.log(`🔍 Testing: ${test.name}`);
        const result = await test.test();
        this.testResults.push({ name: test.name, status: 'PASS', result });
        console.log(`✅ PASS: ${test.name}\n`);
      } catch (error) {
        this.testResults.push({ name: test.name, status: 'FAIL', error: error.message });
        console.log(`❌ FAIL: ${test.name} - ${error.message}\n`);
      }
    }

    this.printTestSummary();
  }

  /**
   * Test basic system monitor functionality
   */
  async testSystemMonitor() {
    const metrics = await this.systemMonitor.getSystemMetrics();
    
    if (!metrics.timestamp) throw new Error('No timestamp in metrics');
    if (!metrics.hostname) throw new Error('No hostname in metrics');
    if (!metrics.cpu) throw new Error('No CPU metrics');
    if (!metrics.memory) throw new Error('No memory metrics');
    if (!metrics.disk) throw new Error('No disk metrics');
    if (!metrics.network) throw new Error('No network metrics');
    
    return { metricsCollected: Object.keys(metrics).length };
  }

  /**
   * Test CPU metrics collection
   */
  async testCPUMetrics() {
    const cpuMetrics = await this.systemMonitor.getCPUUsage();
    
    if (typeof cpuMetrics.usage !== 'number') throw new Error('CPU usage not a number');
    if (cpuMetrics.usage < 0 || cpuMetrics.usage > 100) throw new Error('CPU usage out of range');
    if (!cpuMetrics.cores || cpuMetrics.cores < 1) throw new Error('Invalid core count');
    if (!cpuMetrics.loadAverage || !Array.isArray(cpuMetrics.loadAverage)) throw new Error('Invalid load average');
    
    return { 
      usage: cpuMetrics.usage, 
      cores: cpuMetrics.cores, 
      status: cpuMetrics.status 
    };
  }

  /**
   * Test memory metrics collection
   */
  async testMemoryMetrics() {
    const memoryMetrics = this.systemMonitor.getMemoryUsage();
    
    if (!memoryMetrics.total) throw new Error('No total memory');
    if (!memoryMetrics.free) throw new Error('No free memory');
    if (!memoryMetrics.used) throw new Error('No used memory');
    if (typeof memoryMetrics.usagePercent !== 'number') throw new Error('Usage percent not a number');
    if (memoryMetrics.usagePercent < 0 || memoryMetrics.usagePercent > 100) throw new Error('Memory usage out of range');
    
    return { 
      usagePercent: memoryMetrics.usagePercent, 
      status: memoryMetrics.status 
    };
  }

  /**
   * Test disk metrics collection
   */
  async testDiskMetrics() {
    const diskMetrics = await this.systemMonitor.getDiskUsage();
    
    if (!Array.isArray(diskMetrics)) throw new Error('Disk metrics not an array');
    if (diskMetrics.length === 0) throw new Error('No disk metrics found');
    
    for (const disk of diskMetrics) {
      if (!disk.filesystem) throw new Error('Missing filesystem info');
      if (!disk.mountPoint) throw new Error('Missing mount point');
      if (typeof disk.usagePercent !== 'number') throw new Error('Usage percent not a number');
    }
    
    return { disksFound: diskMetrics.length };
  }

  /**
   * Test network metrics collection
   */
  async testNetworkMetrics() {
    const networkMetrics = await this.systemMonitor.getNetworkInfo();
    
    if (typeof networkMetrics !== 'object') throw new Error('Network metrics not an object');
    
    const interfaces = Object.keys(networkMetrics);
    if (interfaces.length === 0) throw new Error('No network interfaces found');
    
    return { interfacesFound: interfaces.length };
  }

  /**
   * Test process information collection
   */
  async testProcessInfo() {
    const processInfo = await this.systemMonitor.getProcessInfo();
    
    if (!processInfo.topProcesses || !Array.isArray(processInfo.topProcesses)) {
      throw new Error('Top processes not an array');
    }
    
    if (processInfo.topProcesses.length === 0) throw new Error('No processes found');
    
    for (const process of processInfo.topProcesses.slice(0, 3)) {
      if (!process.pid) throw new Error('Process missing PID');
      if (typeof process.cpu !== 'number') throw new Error('Process CPU not a number');
      if (typeof process.memory !== 'number') throw new Error('Process memory not a number');
    }
    
    return { processesFound: processInfo.topProcesses.length };
  }

  /**
   * Test port scanning functionality
   */
  async testPortScanning() {
    const portInfo = await this.systemMonitor.getOpenPorts();
    
    if (!portInfo.openPorts || !Array.isArray(portInfo.openPorts)) {
      throw new Error('Open ports not an array');
    }
    
    if (typeof portInfo.count !== 'number') throw new Error('Port count not a number');
    
    return { portsFound: portInfo.count };
  }

  /**
   * Test connectivity functionality
   */
  async testConnectivity() {
    const connectivity = await this.systemMonitor.testConnectivity(['8.8.8.8']);
    
    if (!Array.isArray(connectivity)) throw new Error('Connectivity results not an array');
    if (connectivity.length === 0) throw new Error('No connectivity results');
    
    const result = connectivity[0];
    if (!result.host) throw new Error('Missing host in connectivity result');
    if (!result.status) throw new Error('Missing status in connectivity result');
    
    return { testsRun: connectivity.length, firstResult: result.status };
  }

  /**
   * Test ML anomaly detection
   */
  async testMLDetection() {
    // Generate some test data
    const testMetrics = {
      cpu: { usage: 50 },
      memory: { usagePercent: 60 },
      connections: { count: 10 },
      disk: [{ usagePercent: 30 }]
    };

    // Train with normal data
    for (let i = 0; i < 50; i++) {
      this.mlDetector.train({
        cpu: { usage: 45 + Math.random() * 10 },
        memory: { usagePercent: 55 + Math.random() * 10 },
        connections: { count: 8 + Math.random() * 4 },
        disk: [{ usagePercent: 25 + Math.random() * 10 }]
      });
    }

    // Test with normal data
    const normalAnomalies = this.mlDetector.detectAnomalies(testMetrics);
    
    // Test with anomalous data
    const anomalousMetrics = {
      cpu: { usage: 95 }, // High CPU
      memory: { usagePercent: 98 }, // High memory
      connections: { count: 500 }, // Many connections
      disk: [{ usagePercent: 98 }] // High disk
    };
    
    const anomalies = this.mlDetector.detectAnomalies(anomalousMetrics);
    
    return { 
      normalAnomalies: normalAnomalies.length, 
      detectedAnomalies: anomalies.length,
      modelStats: this.mlDetector.getModelStats()
    };
  }

  /**
   * Test alert generation
   */
  async testAlertGeneration() {
    const testMetrics = {
      cpu: { usage: 95, status: 'critical' },
      memory: { usagePercent: 98, status: 'critical' },
      disk: [{ usagePercent: 98, status: 'critical', mountPoint: '/test' }]
    };

    const alerts = this.systemMonitor.generateAlerts(testMetrics);
    
    if (!Array.isArray(alerts)) throw new Error('Alerts not an array');
    if (alerts.length === 0) throw new Error('No alerts generated for critical metrics');
    
    for (const alert of alerts) {
      if (!alert.type) throw new Error('Alert missing type');
      if (!alert.message) throw new Error('Alert missing message');
      if (!alert.component) throw new Error('Alert missing component');
    }
    
    return { alertsGenerated: alerts.length };
  }

  /**
   * Test response actions (dry run)
   */
  async testResponseActions() {
    const testAnomaly = {
      type: 'cpu_spike',
      severity: 'critical',
      message: 'Test CPU spike',
      metrics: { current: 95, expected: 50 }
    };

    // Test that response actions are defined
    const responseKey = this.agent.getResponseKey(testAnomaly);
    const actions = this.agent.responseActions.get(responseKey);
    
    if (!actions) throw new Error('No response actions defined');
    if (!Array.isArray(actions)) throw new Error('Response actions not an array');
    if (actions.length === 0) throw new Error('No response actions available');
    
    return { 
      responseKey, 
      actionsAvailable: actions.length,
      actions: actions.map(a => a.action)
    };
  }

  /**
   * Test configuration loading
   */
  async testConfiguration() {
    // Test that the agent has proper configuration
    if (!this.agent.baseline) throw new Error('No baseline configuration');
    if (!this.agent.baseline.cpu) throw new Error('No CPU baseline');
    if (!this.agent.baseline.memory) throw new Error('No memory baseline');
    
    return { 
      hasBaseline: true,
      cpuThresholds: this.agent.baseline.cpu,
      memoryThresholds: this.agent.baseline.memory
    };
  }

  /**
   * Print test summary
   */
  printTestSummary() {
    console.log('\n📊 TEST SUMMARY');
    console.log('================');
    
    const passed = this.testResults.filter(r => r.status === 'PASS').length;
    const failed = this.testResults.filter(r => r.status === 'FAIL').length;
    const total = this.testResults.length;
    
    console.log(`Total Tests: ${total}`);
    console.log(`Passed: ${passed} ✅`);
    console.log(`Failed: ${failed} ❌`);
    console.log(`Success Rate: ${Math.round((passed / total) * 100)}%`);
    
    if (failed > 0) {
      console.log('\n❌ FAILED TESTS:');
      this.testResults
        .filter(r => r.status === 'FAIL')
        .forEach(r => console.log(`   - ${r.name}: ${r.error}`));
    }
    
    if (passed === total) {
      console.log('\n🎉 ALL TESTS PASSED! The monitoring system is ready to use.');
    } else {
      console.log('\n⚠️  Some tests failed. Please check the issues above.');
    }
    
    console.log('\n🚀 To start monitoring: node monitor.js');
    console.log('📖 For more info: cat README.md');
  }
}

// Run tests if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const tester = new MonitoringSystemTest();
  tester.runAllTests().catch(error => {
    console.error('❌ Test runner failed:', error);
    process.exit(1);
  });
}

export default MonitoringSystemTest;
