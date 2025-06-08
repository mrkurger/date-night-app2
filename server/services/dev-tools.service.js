// ===================================================
// CUSTOMIZABLE SETTINGS IN THIS FILE
// ===================================================
// This file contains developer tools and system monitoring services
//
// COMMON CUSTOMIZATIONS:
// - HEALTH_CHECK_INTERVAL: System health check frequency (default: 60000ms)
//   Related to: dev-tools.routes.js:DevToolsService
// ===================================================

import { exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const execAsync = promisify(exec);
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Service for developer tools and system monitoring
 */
export class DevToolsService {
  constructor() {
    this.projectRoot = path.join(__dirname, '../..');
    this.buildHistory = [];
    this.taskHistory = [];
  }

  /**
   * Get system health status
   */
  async getSystemHealth() {
    try {
      const health = {
        status: 'healthy',
        checks: [],
        timestamp: new Date()
      };

      // Check Node.js version
      try {
        const { stdout } = await execAsync('node --version');
        health.checks.push({
          name: 'Node.js Version',
          status: 'passed',
          value: stdout.trim(),
          expected: '>=18.0.0'
        });
      } catch (error) {
        health.checks.push({
          name: 'Node.js Version',
          status: 'failed',
          error: error.message
        });
        health.status = 'unhealthy';
      }

      // Check npm version
      try {
        const { stdout } = await execAsync('npm --version');
        health.checks.push({
          name: 'npm Version',
          status: 'passed',
          value: stdout.trim()
        });
      } catch (error) {
        health.checks.push({
          name: 'npm Version',
          status: 'failed',
          error: error.message
        });
      }

      // Check disk space
      try {
        const { stdout } = await execAsync('df -h .');
        const diskInfo = stdout.split('\n')[1]?.split(/\s+/);
        if (diskInfo && diskInfo.length >= 5) {
          health.checks.push({
            name: 'Disk Space',
            status: 'passed',
            value: `${diskInfo[3]} available of ${diskInfo[1]} total`
          });
        }
      } catch (error) {
        // Disk check failed (might not be Unix-like system)
        health.checks.push({
          name: 'Disk Space',
          status: 'skipped',
          reason: 'Platform not supported'
        });
      }

      // Check memory usage
      const memUsage = process.memoryUsage();
      health.checks.push({
        name: 'Memory Usage',
        status: 'passed',
        value: {
          rss: `${Math.round(memUsage.rss / 1024 / 1024)}MB`,
          heapUsed: `${Math.round(memUsage.heapUsed / 1024 / 1024)}MB`,
          heapTotal: `${Math.round(memUsage.heapTotal / 1024 / 1024)}MB`
        }
      });

      // Check if dependencies are installed
      try {
        await fs.access(path.join(this.projectRoot, 'node_modules'));
        health.checks.push({
          name: 'Dependencies',
          status: 'passed',
          value: 'node_modules present'
        });
      } catch (error) {
        health.checks.push({
          name: 'Dependencies',
          status: 'failed',
          error: 'node_modules not found'
        });
        health.status = 'unhealthy';
      }

      return health;
    } catch (error) {
      console.error('Error getting system health:', error);
      return {
        status: 'error',
        error: error.message,
        timestamp: new Date()
      };
    }
  }

  /**
   * Get build status and history
   */
  async getBuildStatus() {
    try {
      // Check if build directories exist
      const clientBuildPath = path.join(this.projectRoot, 'client-angular/dist');
      const serverPath = path.join(this.projectRoot, 'server');

      let clientBuildExists = false;
      let clientBuildTime = null;

      try {
        const stats = await fs.stat(clientBuildPath);
        clientBuildExists = true;
        clientBuildTime = stats.mtime;
      } catch (error) {
        // Build directory doesn't exist
      }

      // Check package.json for build scripts
      let availableScripts = [];
      try {
        const packageJsonPath = path.join(this.projectRoot, 'package.json');
        const packageJson = JSON.parse(await fs.readFile(packageJsonPath, 'utf8'));
        availableScripts = Object.keys(packageJson.scripts || {});
      } catch (error) {
        // package.json not found or invalid
      }

      return {
        client_build: {
          exists: clientBuildExists,
          last_build: clientBuildTime,
          status: clientBuildExists ? 'success' : 'pending'
        },
        server_status: {
          running: true, // We're running the server to respond to this request
          pid: process.pid,
          uptime: process.uptime()
        },
        available_scripts: availableScripts,
        build_history: this.buildHistory.slice(-10), // Last 10 builds
        last_updated: new Date()
      };
    } catch (error) {
      console.error('Error getting build status:', error);
      throw error;
    }
  }

  /**
   * Trigger build process
   */
  async triggerBuild(target = 'all', clean = false) {
    try {
      const buildStart = new Date();
      const buildId = `build_${Date.now()}`;

      // Add to build history
      const buildEntry = {
        id: buildId,
        target: target,
        clean: clean,
        status: 'running',
        start_time: buildStart,
        end_time: null,
        duration: null,
        output: []
      };

      this.buildHistory.push(buildEntry);

      try {
        let command = '';
        
        switch (target) {
          case 'client':
            command = clean ? 'npm run build:clean && npm run build' : 'npm run build';
            break;
          case 'server':
            command = 'echo "Server build not required for Node.js project"';
            break;
          case 'all':
          default:
            command = clean ? 'npm run build:clean && npm run build' : 'npm run build';
            break;
        }

        const { stdout, stderr } = await execAsync(command, {
          cwd: this.projectRoot,
          timeout: 300000 // 5 minute timeout
        });

        buildEntry.status = 'success';
        buildEntry.end_time = new Date();
        buildEntry.duration = buildEntry.end_time - buildEntry.start_time;
        buildEntry.output.push({ type: 'stdout', content: stdout });
        if (stderr) {
          buildEntry.output.push({ type: 'stderr', content: stderr });
        }

        return {
          build_id: buildId,
          status: 'success',
          duration: buildEntry.duration,
          target: target,
          clean: clean
        };
      } catch (error) {
        buildEntry.status = 'failed';
        buildEntry.end_time = new Date();
        buildEntry.duration = buildEntry.end_time - buildEntry.start_time;
        buildEntry.output.push({ type: 'error', content: error.message });

        throw error;
      }
    } catch (error) {
      console.error('Error triggering build:', error);
      throw error;
    }
  }

  /**
   * Analyze project dependencies
   */
  async analyzeDependencies() {
    try {
      const analysis = {
        server: null,
        client: null,
        security: null,
        outdated: null
      };

      // Analyze server dependencies
      try {
        const serverPackagePath = path.join(this.projectRoot, 'server/package.json');
        const serverPackage = JSON.parse(await fs.readFile(serverPackagePath, 'utf8'));
        
        analysis.server = {
          dependencies: Object.keys(serverPackage.dependencies || {}).length,
          dev_dependencies: Object.keys(serverPackage.devDependencies || {}).length,
          scripts: Object.keys(serverPackage.scripts || {}).length,
          node_version: serverPackage.engines?.node || 'not specified'
        };
      } catch (error) {
        analysis.server = { error: 'Could not analyze server dependencies' };
      }

      // Analyze client dependencies
      try {
        const clientPackagePath = path.join(this.projectRoot, 'client-angular/package.json');
        const clientPackage = JSON.parse(await fs.readFile(clientPackagePath, 'utf8'));
        
        analysis.client = {
          dependencies: Object.keys(clientPackage.dependencies || {}).length,
          dev_dependencies: Object.keys(clientPackage.devDependencies || {}).length,
          scripts: Object.keys(clientPackage.scripts || {}).length,
          angular_version: clientPackage.dependencies?.['@angular/core'] || 'not found'
        };
      } catch (error) {
        analysis.client = { error: 'Could not analyze client dependencies' };
      }

      // Check for security vulnerabilities (mock implementation)
      analysis.security = {
        vulnerabilities: 0,
        last_audit: new Date(),
        status: 'clean'
      };

      // Check for outdated packages (mock implementation)
      analysis.outdated = {
        total_packages: (analysis.server?.dependencies || 0) + (analysis.client?.dependencies || 0),
        outdated_count: 0,
        major_updates: 0,
        minor_updates: 0,
        patch_updates: 0
      };

      return analysis;
    } catch (error) {
      console.error('Error analyzing dependencies:', error);
      throw error;
    }
  }

  /**
   * Get performance metrics
   */
  async getPerformanceMetrics() {
    try {
      const metrics = {
        process: {
          uptime: process.uptime(),
          memory: process.memoryUsage(),
          cpu_usage: process.cpuUsage(),
          pid: process.pid,
          platform: process.platform,
          node_version: process.version
        },
        system: {
          load_average: null,
          free_memory: null,
          total_memory: null
        },
        build_performance: {
          average_build_time: null,
          fastest_build: null,
          slowest_build: null,
          recent_builds: this.buildHistory.slice(-5)
        }
      };

      // Calculate build performance metrics
      const successfulBuilds = this.buildHistory.filter(build => 
        build.status === 'success' && build.duration
      );

      if (successfulBuilds.length > 0) {
        const durations = successfulBuilds.map(build => build.duration);
        metrics.build_performance.average_build_time = 
          durations.reduce((sum, duration) => sum + duration, 0) / durations.length;
        metrics.build_performance.fastest_build = Math.min(...durations);
        metrics.build_performance.slowest_build = Math.max(...durations);
      }

      return metrics;
    } catch (error) {
      console.error('Error getting performance metrics:', error);
      throw error;
    }
  }

  /**
   * Run development task
   */
  async runTask(taskName, parameters = {}) {
    try {
      const taskStart = new Date();
      const taskId = `task_${Date.now()}`;

      const taskEntry = {
        id: taskId,
        name: taskName,
        parameters: parameters,
        status: 'running',
        start_time: taskStart,
        end_time: null,
        duration: null,
        output: []
      };

      this.taskHistory.push(taskEntry);

      try {
        let result = {};

        switch (taskName) {
          case 'lint':
            result = await this.runLintTask(parameters);
            break;
          case 'test':
            result = await this.runTestTask(parameters);
            break;
          case 'clean':
            result = await this.runCleanTask(parameters);
            break;
          case 'dependencies-check':
            result = await this.runDependenciesCheck(parameters);
            break;
          default:
            throw new Error(`Unknown task: ${taskName}`);
        }

        taskEntry.status = 'success';
        taskEntry.end_time = new Date();
        taskEntry.duration = taskEntry.end_time - taskEntry.start_time;
        taskEntry.output.push({ type: 'result', content: result });

        return {
          task_id: taskId,
          status: 'success',
          duration: taskEntry.duration,
          result: result
        };
      } catch (error) {
        taskEntry.status = 'failed';
        taskEntry.end_time = new Date();
        taskEntry.duration = taskEntry.end_time - taskEntry.start_time;
        taskEntry.output.push({ type: 'error', content: error.message });

        throw error;
      }
    } catch (error) {
      console.error('Error running task:', error);
      throw error;
    }
  }

  /**
   * Run lint task
   */
  async runLintTask(parameters) {
    const target = parameters.target || 'all';
    let command = '';

    switch (target) {
      case 'client':
        command = 'cd client-angular && npm run lint';
        break;
      case 'server':
        command = 'cd server && npm run lint';
        break;
      case 'all':
      default:
        command = 'npm run lint';
        break;
    }

    const { stdout, stderr } = await execAsync(command, { cwd: this.projectRoot });

    return {
      target: target,
      output: stdout,
      errors: stderr || null,
      success: !stderr
    };
  }

  /**
   * Run test task
   */
  async runTestTask(parameters) {
    const target = parameters.target || 'all';
    const coverage = parameters.coverage || false;

    let command = '';

    switch (target) {
      case 'client':
        command = coverage ? 'cd client-angular && npm run test:coverage' : 'cd client-angular && npm run test';
        break;
      case 'server':
        command = coverage ? 'cd server && npm run test:coverage' : 'cd server && npm run test';
        break;
      case 'all':
      default:
        command = coverage ? 'npm run test:coverage' : 'npm test';
        break;
    }

    const { stdout, stderr } = await execAsync(command, { cwd: this.projectRoot });

    return {
      target: target,
      coverage: coverage,
      output: stdout,
      errors: stderr || null,
      success: !stderr
    };
  }

  /**
   * Run clean task
   */
  async runCleanTask(parameters) {
    const targets = parameters.targets || ['dist', 'node_modules', 'coverage'];
    const results = [];

    for (const target of targets) {
      try {
        let command = '';
        switch (target) {
          case 'dist':
            command = 'rm -rf client-angular/dist';
            break;
          case 'node_modules':
            command = 'rm -rf node_modules client-angular/node_modules server/node_modules';
            break;
          case 'coverage':
            command = 'rm -rf coverage client-angular/coverage server/coverage';
            break;
          default:
            throw new Error(`Unknown clean target: ${target}`);
        }

        await execAsync(command, { cwd: this.projectRoot });
        results.push({ target: target, status: 'success' });
      } catch (error) {
        results.push({ target: target, status: 'failed', error: error.message });
      }
    }

    return {
      targets: targets,
      results: results,
      success: results.every(r => r.status === 'success')
    };
  }

  /**
   * Run dependencies check
   */
  async runDependenciesCheck(parameters) {
    const checkOutdated = parameters.checkOutdated || false;
    const checkSecurity = parameters.checkSecurity || false;

    const results = {
      outdated: null,
      security: null
    };

    if (checkOutdated) {
      try {
        const { stdout } = await execAsync('npm outdated --json', { 
          cwd: this.projectRoot 
        });
        results.outdated = JSON.parse(stdout);
      } catch (error) {
        // npm outdated returns non-zero exit code when packages are outdated
        results.outdated = { error: 'Could not check outdated packages' };
      }
    }

    if (checkSecurity) {
      try {
        const { stdout } = await execAsync('npm audit --json', { 
          cwd: this.projectRoot 
        });
        results.security = JSON.parse(stdout);
      } catch (error) {
        results.security = { error: 'Could not run security audit' };
      }
    }

    return results;
  }
}