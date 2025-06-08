#!/usr/bin/env node

/**
 * MCP Memory Server Management Script
 * 
 * This script manages the @modelcontextprotocol/server-memory instance for the
 * Date Night App project. It provides functionality to start, stop, and monitor
 * the Memory MCP server that maintains the persistent knowledge graph.
 * 
 * Features:
 * - Start/stop Memory MCP server instances
 * - Monitor server health and status
 * - Handle graceful shutdown and cleanup
 * - Support for both local development and CI environments
 * - Integration with existing documentation control system
 * 
 * @author MCP Integration System
 * @version 1.0.0
 * @requires @modelcontextprotocol/server-memory
 * @requires @modelcontextprotocol/sdk
 */

import fs from 'fs/promises';
import path from 'path';
import { spawn, exec } from 'child_process';
import { fileURLToPath } from 'url';
import { promisify } from 'util';

const execAsync = promisify(exec);
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Configuration for the MCP Memory server
 */
const CONFIG = {
  // Server configuration
  server: {
    name: 'date-night-memory-mcp',
    port: process.env.MCP_MEMORY_PORT || 3001,
    host: process.env.MCP_MEMORY_HOST || 'localhost',
    storageDir: path.resolve(__dirname, '../docs/graph'),
    persistentKnowledgeFile: 'persistent_knowledge.md',
    tempKnowledgeFile: 'ci_knowledge.md'
  },
  
  // Process management
  process: {
    pidFile: path.resolve(__dirname, '../.mcp-memory-server.pid'),
    logFile: path.resolve(__dirname, '../logs/mcp-memory-server.log'),
    maxRestarts: 3,
    restartDelay: 5000
  },
  
  // Directories to exclude from knowledge extraction
  excludeDirs: [
    'client-angular',
    'node_modules',
    '.git',
    'dist',
    'build',
    'coverage',
    '.next',
    'logs'
  ],
  
  // File patterns to include in knowledge graph
  includePatterns: [
    '**/*.js',
    '**/*.ts',
    '**/*.md',
    '**/*.json',
    '**/*.yml',
    '**/*.yaml'
  ]
};

/**
 * Logging utility with different levels
 */
class Logger {
  static info(message) {
    console.log(`[INFO] ${new Date().toISOString()} - ${message}`);
  }
  
  static warn(message) {
    console.warn(`[WARN] ${new Date().toISOString()} - ${message}`);
  }
  
  static error(message) {
    console.error(`[ERROR] ${new Date().toISOString()} - ${message}`);
  }
  
  static debug(message) {
    if (process.env.DEBUG === 'true') {
      console.log(`[DEBUG] ${new Date().toISOString()} - ${message}`);
    }
  }
}

/**
 * Main MCP Memory Server Manager class
 */
class MCPMemoryServerManager {
  constructor() {
    this.serverProcess = null;
    this.isShuttingDown = false;
    this.restartCount = 0;
  }
  
  /**
   * Initialize the server environment
   */
  async initialize() {
    Logger.info('Initializing MCP Memory Server environment...');
    
    try {
      // Ensure required directories exist
      await this.ensureDirectories();
      
      // Check for existing server process
      await this.checkExistingProcess();
      
      // Validate MCP server package availability
      await this.validateDependencies();
      
      Logger.info('✅ MCP Memory Server environment initialized successfully');
      return true;
    } catch (error) {
      Logger.error(`Failed to initialize environment: ${error.message}`);
      return false;
    }
  }
  
  /**
   * Ensure required directories exist
   */
  async ensureDirectories() {
    const dirs = [
      CONFIG.server.storageDir,
      path.dirname(CONFIG.process.logFile)
    ];
    
    for (const dir of dirs) {
      try {
        await fs.access(dir);
      } catch {
        Logger.info(`Creating directory: ${dir}`);
        await fs.mkdir(dir, { recursive: true });
      }
    }
  }
  
  /**
   * Check if there's an existing server process running
   */
  async checkExistingProcess() {
    try {
      const pid = await fs.readFile(CONFIG.process.pidFile, 'utf8');
      
      // Check if process is still running
      try {
        process.kill(parseInt(pid), 0);
        Logger.warn(`Found existing server process with PID: ${pid}`);
        return parseInt(pid);
      } catch {
        // Process not running, clean up stale PID file
        await fs.unlink(CONFIG.process.pidFile);
        Logger.info('Cleaned up stale PID file');
      }
    } catch {
      // No PID file exists
    }
    
    return null;
  }
  
  /**
   * Validate that required MCP dependencies are available
   */
  async validateDependencies() {
    Logger.debug('Validating MCP server dependencies...');
    
    try {
      // Check if @modelcontextprotocol/server-memory is available
      const { stdout } = await execAsync('npm list @modelcontextprotocol/server-memory --json');
      const packageInfo = JSON.parse(stdout);
      
      if (!packageInfo.dependencies?.['@modelcontextprotocol/server-memory']) {
        throw new Error('@modelcontextprotocol/server-memory not found in dependencies');
      }
      
      Logger.debug('✅ MCP server dependencies validated');
    } catch (error) {
      throw new Error(`MCP server dependency validation failed: ${error.message}\n\nPlease install with: npm install @modelcontextprotocol/server-memory`);
    }
  }
  
  /**
   * Start the MCP Memory server
   */
  async start() {
    if (this.serverProcess) {
      Logger.warn('Server is already running');
      return false;
    }
    
    Logger.info('Starting MCP Memory Server...');
    
    try {
      // TODO: Implement actual Memory MCP server startup
      // This will require the specific startup command/API for the memory server
      // For now, we'll create a placeholder that can be expanded
      
      const serverCommand = this.buildServerCommand();
      Logger.debug(`Server command: ${serverCommand.join(' ')}`);
      
      // Start the server process
      this.serverProcess = spawn(serverCommand[0], serverCommand.slice(1), {
        detached: false,
        stdio: ['ignore', 'pipe', 'pipe']
      });
      
      // Set up process event handlers
      this.setupProcessHandlers();
      
      // Write PID file
      await fs.writeFile(CONFIG.process.pidFile, this.serverProcess.pid.toString());
      
      Logger.info(`✅ MCP Memory Server started with PID: ${this.serverProcess.pid}`);
      Logger.info(`📁 Storage directory: ${CONFIG.server.storageDir}`);
      Logger.info(`📊 Knowledge file: ${CONFIG.server.persistentKnowledgeFile}`);
      
      return true;
      
    } catch (error) {
      Logger.error(`Failed to start MCP Memory Server: ${error.message}`);
      return false;
    }
  }
  
  /**
   * Build the command to start the Memory MCP server
   * TODO: Update this when the exact Memory MCP server API is determined
   */
  buildServerCommand() {
    // This is a placeholder command structure
    // The actual command will depend on how @modelcontextprotocol/server-memory is invoked
    
    return [
      'npx',
      '@modelcontextprotocol/server-memory',
      '--storage-dir', CONFIG.server.storageDir,
      '--knowledge-file', CONFIG.server.persistentKnowledgeFile,
      '--port', CONFIG.server.port.toString(),
      '--host', CONFIG.server.host
    ];
  }
  
  /**
   * Set up event handlers for the server process
   */
  setupProcessHandlers() {
    if (!this.serverProcess) return;
    
    // Handle stdout
    this.serverProcess.stdout.on('data', (data) => {
      Logger.debug(`Server stdout: ${data.toString().trim()}`);
    });
    
    // Handle stderr
    this.serverProcess.stderr.on('data', (data) => {
      Logger.warn(`Server stderr: ${data.toString().trim()}`);
    });
    
    // Handle process exit
    this.serverProcess.on('exit', (code, signal) => {
      Logger.info(`Server process exited with code ${code}, signal ${signal}`);
      this.serverProcess = null;
      
      // Clean up PID file
      fs.unlink(CONFIG.process.pidFile).catch(() => {});
      
      // Handle restart logic if not shutting down intentionally
      if (!this.isShuttingDown && this.restartCount < CONFIG.process.maxRestarts) {
        this.scheduleRestart();
      }
    });
    
    // Handle process errors
    this.serverProcess.on('error', (error) => {
      Logger.error(`Server process error: ${error.message}`);
      this.serverProcess = null;
    });
  }
  
  /**
   * Schedule a server restart after a delay
   */
  scheduleRestart() {
    this.restartCount++;
    Logger.info(`Scheduling restart attempt ${this.restartCount}/${CONFIG.process.maxRestarts} in ${CONFIG.process.restartDelay}ms`);
    
    setTimeout(async () => {
      if (!this.isShuttingDown) {
        const success = await this.start();
        if (success) {
          this.restartCount = 0; // Reset counter on successful restart
        }
      }
    }, CONFIG.process.restartDelay);
  }
  
  /**
   * Stop the MCP Memory server
   */
  async stop() {
    if (!this.serverProcess) {
      Logger.info('No server process to stop');
      return true;
    }
    
    Logger.info('Stopping MCP Memory Server...');
    this.isShuttingDown = true;
    
    try {
      // Send SIGTERM for graceful shutdown
      this.serverProcess.kill('SIGTERM');
      
      // Wait for graceful shutdown
      await new Promise((resolve) => {
        const timeout = setTimeout(() => {
          Logger.warn('Graceful shutdown timeout, forcing termination...');
          if (this.serverProcess) {
            this.serverProcess.kill('SIGKILL');
          }
          resolve();
        }, 10000);
        
        this.serverProcess.on('exit', () => {
          clearTimeout(timeout);
          resolve();
        });
      });
      
      // Clean up
      await fs.unlink(CONFIG.process.pidFile).catch(() => {});
      this.serverProcess = null;
      this.isShuttingDown = false;
      
      Logger.info('✅ MCP Memory Server stopped successfully');
      return true;
      
    } catch (error) {
      Logger.error(`Error stopping server: ${error.message}`);
      return false;
    }
  }
  
  /**
   * Get the current status of the MCP Memory server
   */
  async getStatus() {
    try {
      const pid = await fs.readFile(CONFIG.process.pidFile, 'utf8');
      
      // Check if process is actually running
      try {
        process.kill(parseInt(pid), 0);
        return {
          running: true,
          pid: parseInt(pid),
          port: CONFIG.server.port,
          storageDir: CONFIG.server.storageDir,
          uptime: await this.getProcessUptime(parseInt(pid))
        };
      } catch {
        // Process not running
        await fs.unlink(CONFIG.process.pidFile).catch(() => {});
        return { running: false };
      }
    } catch {
      return { running: false };
    }
  }
  
  /**
   * Get process uptime (placeholder implementation)
   * TODO: Implement actual uptime calculation
   */
  async getProcessUptime(pid) {
    try {
      const { stdout } = await execAsync(`ps -o etime= -p ${pid}`);
      return stdout.trim();
    } catch {
      return 'unknown';
    }
  }
  
  /**
   * Sync the knowledge graph with the Memory MCP server
   * This method coordinates with the mcp-knowledge-sync.js script
   */
  async syncKnowledgeGraph() {
    Logger.info('Initiating knowledge graph synchronization...');
    
    try {
      // Import and run the knowledge sync script
      const { default: syncKnowledge } = await import('./mcp-knowledge-sync.js');
      await syncKnowledge();
      
      Logger.info('✅ Knowledge graph synchronization completed');
      return true;
    } catch (error) {
      Logger.error(`Knowledge graph sync failed: ${error.message}`);
      return false;
    }
  }
}

/**
 * CLI interface for the MCP Memory Server Manager
 */
async function main() {
  const command = process.argv[2] || 'help';
  const manager = new MCPMemoryServerManager();
  
  // Handle process signals for graceful shutdown
  process.on('SIGINT', async () => {
    Logger.info('Received SIGINT, shutting down...');
    await manager.stop();
    process.exit(0);
  });
  
  process.on('SIGTERM', async () => {
    Logger.info('Received SIGTERM, shutting down...');
    await manager.stop();
    process.exit(0);
  });
  
  switch (command) {
    case 'start':
      const initialized = await manager.initialize();
      if (initialized) {
        const started = await manager.start();
        process.exit(started ? 0 : 1);
      } else {
        process.exit(1);
      }
      break;
      
    case 'stop':
      const stopped = await manager.stop();
      process.exit(stopped ? 0 : 1);
      break;
      
    case 'restart':
      await manager.stop();
      await new Promise(resolve => setTimeout(resolve, 2000));
      const restartSuccess = await manager.initialize() && await manager.start();
      process.exit(restartSuccess ? 0 : 1);
      break;
      
    case 'status':
      const status = await manager.getStatus();
      console.log('\n📊 MCP Memory Server Status:');
      console.log(`Status: ${status.running ? '🟢 Running' : '🔴 Stopped'}`);
      if (status.running) {
        console.log(`PID: ${status.pid}`);
        console.log(`Port: ${status.port}`);
        console.log(`Storage: ${status.storageDir}`);
        console.log(`Uptime: ${status.uptime}`);
      }
      console.log('');
      process.exit(0);
      break;
      
    case 'sync':
      const syncSuccess = await manager.syncKnowledgeGraph();
      process.exit(syncSuccess ? 0 : 1);
      break;
      
    case 'help':
    default:
      console.log(`
🧠 MCP Memory Server Manager

Usage: node mcp-memory-server.js <command>

Commands:
  start     Start the MCP Memory server
  stop      Stop the MCP Memory server  
  restart   Restart the MCP Memory server
  status    Show server status
  sync      Sync knowledge graph with server
  help      Show this help message

Environment Variables:
  MCP_MEMORY_PORT      Server port (default: 3001)
  MCP_MEMORY_HOST      Server host (default: localhost)
  DEBUG                Enable debug logging (true/false)

Examples:
  node mcp-memory-server.js start
  MCP_MEMORY_PORT=3002 node mcp-memory-server.js start
  DEBUG=true node mcp-memory-server.js status

For more information, see the MCP implementation documentation.
`);
      break;
  }
}

// Export the manager class for use by other scripts
export default MCPMemoryServerManager;

// Run CLI if this script is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch((error) => {
    Logger.error(`Fatal error: ${error.message}`);
    process.exit(1);
  });
}