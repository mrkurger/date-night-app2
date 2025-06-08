#!/usr/bin/env node

/**
 * MCP Services Startup Orchestrator
 * 
 * This script orchestrates the startup and management of all MCP services
 * for the Date Night App project. It handles:
 * - Memory MCP server startup and health monitoring
 * - Initial knowledge graph synchronization  
 * - Service dependency management
 * - Environment detection (local vs CI)
 * - Graceful shutdown handling
 * 
 * This script is designed to be used both locally for development and
 * in CI environments for automated workflows.
 * 
 * @author MCP Integration System
 * @version 1.0.0
 */

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { spawn } from 'child_process';
import { promisify } from 'util';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Configuration for MCP services orchestration
 */
const ORCHESTRATOR_CONFIG = {
  // Environment detection
  environment: {
    isCI: process.env.CI === 'true',
    isLocal: !process.env.CI,
    nodeEnv: process.env.NODE_ENV || 'development'
  },
  
  // Service definitions
  services: [
    {
      name: 'memory-mcp-server',
      script: 'mcp-memory-server.js',
      required: true,
      startupTimeout: 30000,
      healthCheckInterval: 10000,
      dependencies: []
    }
  ],
  
  // Startup configuration
  startup: {
    maxRetries: 3,
    retryDelay: 5000,
    initialSyncTimeout: 60000,
    healthCheckTimeout: 10000
  },
  
  // Logging configuration
  logging: {
    logDir: path.resolve(__dirname, '../logs'),
    logFile: 'mcp-orchestrator.log',
    enableConsole: true,
    enableFile: true
  },
  
  // Paths
  paths: {
    rootDir: path.resolve(__dirname, '..'),
    scriptsDir: __dirname,
    logsDir: path.resolve(__dirname, '../logs'),
    pidFile: path.resolve(__dirname, '../.mcp-orchestrator.pid')
  }
};

/**
 * Enhanced logging utility for orchestrator operations
 */
class OrchestratorLogger {
  static async initialize() {
    try {
      await fs.mkdir(ORCHESTRATOR_CONFIG.logging.logDir, { recursive: true });
    } catch (error) {
      // Directory might already exist
    }
  }
  
  static async log(level, message, service = null) {
    const timestamp = new Date().toISOString();
    const servicePrefix = service ? `[${service}] ` : '';
    const logMessage = `[${level}] ${timestamp} ${servicePrefix}- ${message}`;
    
    // Console output
    if (ORCHESTRATOR_CONFIG.logging.enableConsole) {
      const colorCode = this.getColorCode(level);
      console.log(`${colorCode}${logMessage}\u001b[0m`);
    }
    
    // File output
    if (ORCHESTRATOR_CONFIG.logging.enableFile) {
      try {
        const logPath = path.join(
          ORCHESTRATOR_CONFIG.logging.logDir,
          ORCHESTRATOR_CONFIG.logging.logFile
        );
        await fs.appendFile(logPath, logMessage + '\n');
      } catch (error) {
        // Ignore file logging errors to prevent recursion
      }
    }
  }
  
  static getColorCode(level) {
    const colors = {
      'INFO': '\u001b[32m',  // Green
      'WARN': '\u001b[33m',  // Yellow
      'ERROR': '\u001b[31m', // Red
      'DEBUG': '\u001b[36m', // Cyan
      'SUCCESS': '\u001b[35m' // Magenta
    };
    return colors[level] || '';
  }
  
  static async info(message, service = null) { await this.log('INFO', message, service); }
  static async warn(message, service = null) { await this.log('WARN', message, service); }
  static async error(message, service = null) { await this.log('ERROR', message, service); }
  static async success(message, service = null) { await this.log('SUCCESS', message, service); }
  static async debug(message, service = null) {
    if (process.env.DEBUG === 'true') {
      await this.log('DEBUG', message, service);
    }
  }
}

/**
 * Service manager for individual MCP services
 */
class ServiceManager {
  constructor(serviceConfig) {
    this.config = serviceConfig;
    this.process = null;
    this.healthCheckInterval = null;
    this.isRunning = false;
    this.startAttempts = 0;
  }
  
  /**
   * Start the service
   */
  async start() {
    if (this.isRunning) {
      await OrchestratorLogger.warn(`Service ${this.config.name} is already running`, this.config.name);
      return true;
    }
    
    await OrchestratorLogger.info(`Starting service: ${this.config.name}`, this.config.name);
    this.startAttempts++;
    
    try {
      // Check dependencies first
      const dependenciesReady = await this.checkDependencies();
      if (!dependenciesReady) {
        throw new Error('Service dependencies not ready');
      }
      
      // Start the service process
      const scriptPath = path.join(ORCHESTRATOR_CONFIG.paths.scriptsDir, this.config.script);
      
      await OrchestratorLogger.debug(`Executing: node ${scriptPath} start`, this.config.name);
      
      this.process = spawn('node', [scriptPath, 'start'], {
        detached: false,
        stdio: ['ignore', 'pipe', 'pipe'],
        cwd: ORCHESTRATOR_CONFIG.paths.rootDir
      });
      
      // Set up process event handlers
      this.setupProcessHandlers();
      
      // Wait for service to be ready
      const isReady = await this.waitForStartup();
      
      if (isReady) {
        this.isRunning = true;
        this.startHealthChecks();
        await OrchestratorLogger.success(`Service ${this.config.name} started successfully`, this.config.name);
        return true;
      } else {
        throw new Error('Service failed to start within timeout');
      }
      
    } catch (error) {
      await OrchestratorLogger.error(`Failed to start service ${this.config.name}: ${error.message}`, this.config.name);
      
      if (this.startAttempts < ORCHESTRATOR_CONFIG.startup.maxRetries) {
        await OrchestratorLogger.info(`Retrying startup in ${ORCHESTRATOR_CONFIG.startup.retryDelay}ms...`, this.config.name);
        await this.delay(ORCHESTRATOR_CONFIG.startup.retryDelay);
        return await this.start();
      }
      
      return false;
    }
  }
  
  /**
   * Stop the service
   */
  async stop() {
    if (!this.isRunning || !this.process) {
      await OrchestratorLogger.info(`Service ${this.config.name} is not running`, this.config.name);
      return true;
    }
    
    await OrchestratorLogger.info(`Stopping service: ${this.config.name}`, this.config.name);
    
    try {
      // Stop health checks
      if (this.healthCheckInterval) {
        clearInterval(this.healthCheckInterval);
        this.healthCheckInterval = null;
      }
      
      // Graceful shutdown
      const scriptPath = path.join(ORCHESTRATOR_CONFIG.paths.scriptsDir, this.config.script);
      const stopProcess = spawn('node', [scriptPath, 'stop'], {
        stdio: 'inherit',
        cwd: ORCHESTRATOR_CONFIG.paths.rootDir
      });
      
      // Wait for graceful shutdown
      const stopped = await new Promise((resolve) => {
        const timeout = setTimeout(() => {
          stopProcess.kill('SIGKILL');
          resolve(false);
        }, 10000);
        
        stopProcess.on('exit', () => {
          clearTimeout(timeout);
          resolve(true);
        });
      });
      
      this.isRunning = false;
      this.process = null;
      
      if (stopped) {
        await OrchestratorLogger.success(`Service ${this.config.name} stopped successfully`, this.config.name);
      } else {
        await OrchestratorLogger.warn(`Service ${this.config.name} force stopped`, this.config.name);
      }
      
      return true;
      
    } catch (error) {
      await OrchestratorLogger.error(`Error stopping service ${this.config.name}: ${error.message}`, this.config.name);
      return false;
    }
  }
  
  /**
   * Check if service dependencies are ready
   */
  async checkDependencies() {
    // TODO: Implement dependency checking logic
    // For now, return true as we only have one service
    return true;
  }
  
  /**
   * Set up process event handlers
   */
  setupProcessHandlers() {
    if (!this.process) return;
    
    this.process.stdout.on('data', (data) => {
      const message = data.toString().trim();
      if (message) {
        OrchestratorLogger.debug(`STDOUT: ${message}`, this.config.name);
      }
    });
    
    this.process.stderr.on('data', (data) => {
      const message = data.toString().trim();
      if (message) {
        OrchestratorLogger.warn(`STDERR: ${message}`, this.config.name);
      }
    });
    
    this.process.on('exit', (code, signal) => {
      OrchestratorLogger.info(`Process exited with code ${code}, signal ${signal}`, this.config.name);
      this.isRunning = false;
      this.process = null;
      
      if (this.healthCheckInterval) {
        clearInterval(this.healthCheckInterval);
        this.healthCheckInterval = null;
      }
    });
    
    this.process.on('error', (error) => {
      OrchestratorLogger.error(`Process error: ${error.message}`, this.config.name);
      this.isRunning = false;
      this.process = null;
    });
  }
  
  /**
   * Wait for service to be ready after startup
   */
  async waitForStartup() {
    const maxWait = this.config.startupTimeout || ORCHESTRATOR_CONFIG.startup.healthCheckTimeout;
    const checkInterval = 2000;
    let elapsed = 0;
    
    while (elapsed < maxWait) {
      try {
        const isHealthy = await this.performHealthCheck();
        if (isHealthy) {
          return true;
        }
      } catch (error) {
        await OrchestratorLogger.debug(`Health check failed: ${error.message}`, this.config.name);
      }
      
      await this.delay(checkInterval);
      elapsed += checkInterval;
    }
    
    return false;
  }
  
  /**
   * Perform health check on the service
   */
  async performHealthCheck() {
    try {
      // Use the service's status command to check health
      const scriptPath = path.join(ORCHESTRATOR_CONFIG.paths.scriptsDir, this.config.script);
      
      const statusProcess = spawn('node', [scriptPath, 'status'], {
        stdio: 'pipe',
        cwd: ORCHESTRATOR_CONFIG.paths.rootDir
      });
      
      return new Promise((resolve, reject) => {
        const timeout = setTimeout(() => {
          statusProcess.kill('SIGKILL');
          reject(new Error('Health check timeout'));
        }, 5000);
        
        statusProcess.on('exit', (code) => {
          clearTimeout(timeout);
          resolve(code === 0);
        });
        
        statusProcess.on('error', (error) => {
          clearTimeout(timeout);
          reject(error);
        });
      });
      
    } catch (error) {
      return false;
    }
  }
  
  /**
   * Start periodic health checks
   */
  startHealthChecks() {
    if (this.healthCheckInterval) {
      clearInterval(this.healthCheckInterval);
    }
    
    const interval = this.config.healthCheckInterval || 30000;
    
    this.healthCheckInterval = setInterval(async () => {
      try {
        const isHealthy = await this.performHealthCheck();
        if (!isHealthy) {
          await OrchestratorLogger.warn(`Health check failed for ${this.config.name}`, this.config.name);
          
          // TODO: Implement restart logic if needed
        }
      } catch (error) {
        await OrchestratorLogger.error(`Health check error for ${this.config.name}: ${error.message}`, this.config.name);
      }
    }, interval);
  }
  
  /**
   * Utility function for delays
   */
  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

/**
 * Main MCP Services Orchestrator
 */
class MCPServicesOrchestrator {
  constructor() {
    this.services = new Map();
    this.isShuttingDown = false;
    
    // Initialize service managers
    for (const serviceConfig of ORCHESTRATOR_CONFIG.services) {
      this.services.set(serviceConfig.name, new ServiceManager(serviceConfig));
    }
  }
  
  /**
   * Initialize the orchestrator environment
   */
  async initialize() {
    await OrchestratorLogger.info('🚀 Initializing MCP Services Orchestrator...');
    
    try {
      // Initialize logging
      await OrchestratorLogger.initialize();
      
      // Log environment information
      await OrchestratorLogger.info(`Environment: ${ORCHESTRATOR_CONFIG.environment.isCI ? 'CI' : 'Local'}`);
      await OrchestratorLogger.info(`Node Environment: ${ORCHESTRATOR_CONFIG.environment.nodeEnv}`);
      
      // Check for existing orchestrator process
      await this.checkExistingProcess();
      
      // Create PID file
      await fs.writeFile(ORCHESTRATOR_CONFIG.paths.pidFile, process.pid.toString());
      
      await OrchestratorLogger.success('✅ Orchestrator environment initialized');
      return true;
      
    } catch (error) {
      await OrchestratorLogger.error(`Failed to initialize orchestrator: ${error.message}`);
      return false;
    }
  }
  
  /**
   * Check for existing orchestrator process
   */
  async checkExistingProcess() {
    try {
      const pid = await fs.readFile(ORCHESTRATOR_CONFIG.paths.pidFile, 'utf8');
      
      // Check if process is still running
      try {
        process.kill(parseInt(pid), 0);
        await OrchestratorLogger.warn(`Found existing orchestrator process with PID: ${pid}`);
        
        // For CI environments, kill the existing process
        if (ORCHESTRATOR_CONFIG.environment.isCI) {
          process.kill(parseInt(pid), 'SIGTERM');
          await OrchestratorLogger.info('Terminated existing process for CI environment');
        } else {
          throw new Error(`Orchestrator is already running with PID: ${pid}`);
        }
      } catch (killError) {
        // Process not running, clean up stale PID file
        await fs.unlink(ORCHESTRATOR_CONFIG.paths.pidFile);
      }
    } catch {
      // No PID file exists, proceed normally
    }
  }
  
  /**
   * Start all MCP services
   */
  async startAll() {
    await OrchestratorLogger.info('🌟 Starting all MCP services...');
    
    const results = [];
    
    for (const [serviceName, serviceManager] of this.services) {
      await OrchestratorLogger.info(`Starting service: ${serviceName}`);
      
      const started = await serviceManager.start();
      results.push({ service: serviceName, started });
      
      if (!started && serviceManager.config.required) {
        await OrchestratorLogger.error(`Required service ${serviceName} failed to start`);
        return false;
      }
    }
    
    const successCount = results.filter(r => r.started).length;
    await OrchestratorLogger.success(`✅ Started ${successCount}/${results.length} services successfully`);
    
    return successCount > 0;
  }
  
  /**
   * Stop all MCP services
   */
  async stopAll() {
    if (this.isShuttingDown) {
      await OrchestratorLogger.warn('Already shutting down...');
      return;
    }
    
    this.isShuttingDown = true;
    await OrchestratorLogger.info('🛑 Stopping all MCP services...');
    
    const stopPromises = [];
    
    for (const [serviceName, serviceManager] of this.services) {
      stopPromises.push(serviceManager.stop());
    }
    
    await Promise.all(stopPromises);
    
    // Clean up PID file
    try {
      await fs.unlink(ORCHESTRATOR_CONFIG.paths.pidFile);
    } catch (error) {
      // PID file might not exist
    }
    
    await OrchestratorLogger.success('✅ All services stopped');
  }
  
  /**
   * Perform initial knowledge synchronization
   */
  async performInitialSync() {
    await OrchestratorLogger.info('🧠 Performing initial knowledge graph synchronization...');
    
    try {
      // Import and run the knowledge sync script
      const syncScript = path.join(ORCHESTRATOR_CONFIG.paths.scriptsDir, 'mcp-knowledge-sync.js');
      
      const syncProcess = spawn('node', [syncScript, 'full'], {
        stdio: ['ignore', 'pipe', 'pipe'],
        cwd: ORCHESTRATOR_CONFIG.paths.rootDir
      });
      
      let output = '';
      syncProcess.stdout.on('data', (data) => {
        output += data.toString();
      });
      
      syncProcess.stderr.on('data', (data) => {
        output += data.toString();
      });
      
      const success = await new Promise((resolve) => {
        const timeout = setTimeout(() => {
          syncProcess.kill('SIGKILL');
          resolve(false);
        }, ORCHESTRATOR_CONFIG.startup.initialSyncTimeout);
        
        syncProcess.on('exit', (code) => {
          clearTimeout(timeout);
          resolve(code === 0);
        });
      });
      
      if (success) {
        await OrchestratorLogger.success('✅ Initial knowledge synchronization completed');
      } else {
        await OrchestratorLogger.warn('⚠️  Initial knowledge synchronization failed or timed out');
        await OrchestratorLogger.debug(`Sync output: ${output}`);
      }
      
      return success;
      
    } catch (error) {
      await OrchestratorLogger.error(`Initial sync error: ${error.message}`);
      return false;
    }
  }
  
  /**
   * Get status of all services
   */
  async getStatus() {
    const status = {
      orchestrator: {
        running: true,
        pid: process.pid,
        environment: ORCHESTRATOR_CONFIG.environment
      },
      services: {}
    };
    
    for (const [serviceName, serviceManager] of this.services) {
      status.services[serviceName] = {
        running: serviceManager.isRunning,
        attempts: serviceManager.startAttempts
      };
    }
    
    return status;
  }
  
  /**
   * Setup signal handlers for graceful shutdown
   */
  setupSignalHandlers() {
    const signals = ['SIGINT', 'SIGTERM', 'SIGQUIT'];
    
    for (const signal of signals) {
      process.on(signal, async () => {
        await OrchestratorLogger.info(`Received ${signal}, initiating graceful shutdown...`);
        await this.stopAll();
        process.exit(0);
      });
    }
    
    // Handle uncaught exceptions
    process.on('uncaughtException', async (error) => {
      await OrchestratorLogger.error(`Uncaught exception: ${error.message}`);
      await this.stopAll();
      process.exit(1);
    });
    
    process.on('unhandledRejection', async (reason, promise) => {
      await OrchestratorLogger.error(`Unhandled rejection at: ${promise}, reason: ${reason}`);
      await this.stopAll();
      process.exit(1);
    });
  }
}

/**
 * CLI interface for the orchestrator
 */
async function main() {
  const command = process.argv[2] || 'start';
  const orchestrator = new MCPServicesOrchestrator();
  
  // Setup signal handlers
  orchestrator.setupSignalHandlers();
  
  switch (command) {
    case 'start':
      const initialized = await orchestrator.initialize();
      if (!initialized) {
        process.exit(1);
      }
      
      const started = await orchestrator.startAll();
      if (!started) {
        await orchestrator.stopAll();
        process.exit(1);
      }
      
      // Perform initial sync
      await orchestrator.performInitialSync();
      
      // Keep the process running for service management
      if (ORCHESTRATOR_CONFIG.environment.isCI) {
        await OrchestratorLogger.info('CI environment detected, orchestrator will exit after startup');
        process.exit(0);
      } else {
        await OrchestratorLogger.info('Orchestrator is now managing MCP services...');
        await OrchestratorLogger.info('Press Ctrl+C to stop all services and exit');
        
        // Keep alive
        setInterval(() => {
          // Health check placeholder
        }, 30000);
      }
      break;
      
    case 'stop':
      await orchestrator.stopAll();
      process.exit(0);
      break;
      
    case 'status':
      const status = await orchestrator.getStatus();
      console.log('\n📊 MCP Services Status:');
      console.log(JSON.stringify(status, null, 2));
      console.log('');
      process.exit(0);
      break;
      
    case 'help':
    default:
      console.log(`
🚀 MCP Services Orchestrator

Usage: node start-mcp-services.js <command>

Commands:
  start     Start all MCP services and perform initial sync
  stop      Stop all MCP services
  status    Show status of all services
  help      Show this help message

Environment Variables:
  CI                   Set to 'true' for CI environment
  NODE_ENV             Node environment (development/production)
  DEBUG                Enable debug logging (true/false)
  MCP_MEMORY_HOST      MCP Memory server host
  MCP_MEMORY_PORT      MCP Memory server port

Examples:
  node start-mcp-services.js start
  CI=true node start-mcp-services.js start
  DEBUG=true node start-mcp-services.js status

The orchestrator will:
1. Start the Memory MCP server
2. Perform initial knowledge graph synchronization
3. Monitor service health
4. Handle graceful shutdown
`);
      break;
  }
}

// Export orchestrator for testing and reuse
export default MCPServicesOrchestrator;

// Run CLI if this script is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(async (error) => {
    await OrchestratorLogger.error(`Fatal error: ${error.message}`);
    process.exit(1);
  });
}