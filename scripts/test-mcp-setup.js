#!/usr/bin/env node

/**
 * Test script to verify MCP server setup for Date Night App
 * 
 * This script tests the various MCP servers to ensure they are
 * properly configured and functional.
 * 
 * Usage:
 *   node scripts/test-mcp-setup.js
 * 
 * @author MCP Assistant
 * @created 2025-05-21
 */

import { spawn } from 'child_process';
import { existsSync, readFileSync } from 'fs';
import { join } from 'path';

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

class MCPTester {
  constructor() {
    this.testResults = [];
    this.totalTests = 0;
    this.passedTests = 0;
  }

  log(message, color = colors.reset) {
    console.log(color + message + colors.reset);
  }

  logSection(title) {
    this.log('\n' + '='.repeat(60), colors.cyan);
    this.log(` ${title}`, colors.cyan + colors.bright);
    this.log('='.repeat(60), colors.cyan);
  }

  logTest(name, passed, details = '') {
    this.totalTests++;
    if (passed) {
      this.passedTests++;
      this.log(`✅ ${name}`, colors.green);
    } else {
      this.log(`❌ ${name}`, colors.red);
    }
    if (details) {
      this.log(`   ${details}`, colors.blue);
    }
    this.testResults.push({ name, passed, details });
  }

  async runCommand(command, args, timeout = 5000) {
    return new Promise((resolve) => {
      const proc = spawn(command, args);
      let stdout = '';
      let stderr = '';
      let timedOut = false;

      const timer = setTimeout(() => {
        timedOut = true;
        proc.kill();
      }, timeout);

      proc.stdout.on('data', (data) => {
        stdout += data.toString();
      });

      proc.stderr.on('data', (data) => {
        stderr += data.toString();
      });

      proc.on('close', (code) => {
        clearTimeout(timer);
        resolve({
          code,
          stdout,
          stderr,
          success: code === 0 && !timedOut,
          timedOut
        });
      });

      proc.on('error', (error) => {
        clearTimeout(timer);
        resolve({
          code: -1,
          stdout: '',
          stderr: error.message,
          success: false,
          timedOut: false
        });
      });
    });
  }

  async testFileExists(filePath, description) {
    const exists = existsSync(filePath);
    this.logTest(
      `File exists: ${description}`,
      exists,
      exists ? `Found: ${filePath}` : `Missing: ${filePath}`
    );
    return exists;
  }

  async testPackageInstalled(packageName) {
    try {
      const packageJson = JSON.parse(readFileSync('package.json', 'utf-8'));
      const installed = 
        (packageJson.dependencies && packageJson.dependencies[packageName]) ||
        (packageJson.devDependencies && packageJson.devDependencies[packageName]);
      
      this.logTest(
        `Package installed: ${packageName}`,
        !!installed,
        installed ? `Version: ${installed}` : 'Not found in package.json'
      );
      return !!installed;
    } catch (error) {
      this.logTest(
        `Package check failed: ${packageName}`,
        false,
        error.message
      );
      return false;
    }
  }

  async testCommandAvailable(command, args = ['--version']) {
    const result = await this.runCommand(command, args, 3000);
    this.logTest(
      `Command available: ${command}`,
      result.success,
      result.success ? 'Available' : result.stderr || result.stdout || 'Command not found'
    );
    return result.success;
  }

  async testMCPServer(serverName, command, args) {
    this.log(`\nTesting ${serverName} MCP server...`);
    
    // Test basic connectivity
    const result = await this.runCommand(command, args, 5000);
    
    // For MCP servers, we expect them to start and be ready for communication
    // A successful start is indicated by the process running without immediate error
    const success = result.code !== -1 && !result.timedOut;
    
    this.logTest(
      `${serverName} MCP server startup`,
      success,
      success ? 'Server started successfully' : result.stderr || 'Failed to start'
    );
    
    return success;
  }

  async testSecurityAuditMCP() {
    this.log('\nTesting Security Audit MCP server...');
    
    // Test if the script exists and is executable
    const scriptPath = './scripts/security-audit-mcp.js';
    const exists = await this.testFileExists(scriptPath, 'Security Audit MCP script');
    
    if (!exists) {
      return false;
    }

    // Test if we can run the script
    const result = await this.runCommand('node', [scriptPath], 3000);
    
    // The script should exit cleanly when run in TTY mode
    const success = result.code === 0;
    
    this.logTest(
      'Security Audit MCP execution',
      success,
      success ? 'Script executed successfully' : result.stderr || 'Execution failed'
    );
    
    return success;
  }

  async testConfiguration() {
    this.logSection('Configuration Files');
    
    const configs = [
      { file: '.vscode/settings-template.json', desc: 'VS Code settings template' },
      { file: '.vscode/mcp-servers-template.json', desc: 'MCP servers template' },
      { file: '.eslintrc.security.json', desc: 'ESLint security configuration' },
      { file: 'typedoc.json', desc: 'TypeDoc configuration' }
    ];

    let allConfigsExist = true;
    for (const config of configs) {
      const exists = await this.testFileExists(config.file, config.desc);
      if (!exists) allConfigsExist = false;
    }

    return allConfigsExist;
  }

  async testDependencies() {
    this.logSection('Dependencies');
    
    const requiredPackages = [
      'typescript-language-server',
      'lsp-mcp-server'
    ];

    const optionalPackages = [
      'snyk',
      '@playwright/test'
    ];

    let allRequired = true;
    for (const pkg of requiredPackages) {
      const installed = await this.testPackageInstalled(pkg);
      if (!installed) allRequired = false;
    }

    this.log('\nOptional packages:');
    for (const pkg of optionalPackages) {
      await this.testPackageInstalled(pkg);
    }

    return allRequired;
  }

  async testCommands() {
    this.logSection('Command Availability');
    
    const commands = [
      { cmd: 'node', desc: 'Node.js' },
      { cmd: 'npm', desc: 'NPM' },
      { cmd: 'npx', args: ['--version'], desc: 'NPX' }
    ];

    let allAvailable = true;
    for (const command of commands) {
      const available = await this.testCommandAvailable(command.cmd, command.args);
      if (!available) allAvailable = false;
    }

    return allAvailable;
  }

  async testMCPServers() {
    this.logSection('MCP Servers');
    
    // Test existing LSP-MCP server
    const lspAvailable = await this.testCommandAvailable('npx', ['lsp-mcp', '--help']);
    
    // Test Playwright MCP
    const playwrightAvailable = await this.testCommandAvailable('npx', ['@playwright/mcp@latest', '--help']);
    
    // Test our custom security audit MCP
    const securityAuditWorking = await this.testSecurityAuditMCP();
    
    return lspAvailable && securityAuditWorking;
  }

  async testDocumentation() {
    this.logSection('Documentation');
    
    const docs = [
      { file: 'docs/MCP_SERVERS_CATALOG.md', desc: 'MCP Servers Catalog' },
      { file: 'docs/MCP_SETUP_GUIDE.md', desc: 'MCP Setup Guide' },
      { file: 'docs/LSP_MCP_INTEGRATION.html', desc: 'LSP-MCP Integration docs' },
      { file: 'client_angular2/docs/PLAYWRIGHT_MCP_WORKFLOWS.md', desc: 'Playwright MCP workflows' }
    ];

    let allDocsExist = true;
    for (const doc of docs) {
      const exists = await this.testFileExists(doc.file, doc.desc);
      if (!exists) allDocsExist = false;
    }

    return allDocsExist;
  }

  generateReport() {
    this.logSection('Test Summary');
    
    const percentage = Math.round((this.passedTests / this.totalTests) * 100);
    
    this.log(`Total tests: ${this.totalTests}`);
    this.log(`Passed: ${this.passedTests}`, colors.green);
    this.log(`Failed: ${this.totalTests - this.passedTests}`, colors.red);
    this.log(`Success rate: ${percentage}%`, percentage > 80 ? colors.green : colors.yellow);
    
    if (percentage < 100) {
      this.log('\n⚠️  Some tests failed. Check the output above for details.', colors.yellow);
      this.log('📚 Refer to docs/MCP_SETUP_GUIDE.md for troubleshooting.', colors.blue);
    } else {
      this.log('\n🎉 All tests passed! Your MCP setup is ready.', colors.green);
    }

    // Provide specific recommendations based on failed tests
    const failedTests = this.testResults.filter(test => !test.passed);
    if (failedTests.length > 0) {
      this.log('\n📋 Recommendations:', colors.yellow);
      
      for (const test of failedTests) {
        if (test.name.includes('Package installed')) {
          this.log('   - Run: npm install --save-dev <missing-package>', colors.blue);
        } else if (test.name.includes('File exists')) {
          this.log('   - Run: ./scripts/setup-mcp-servers.sh', colors.blue);
        } else if (test.name.includes('Command available')) {
          this.log('   - Install missing command or check PATH', colors.blue);
        }
      }
    }
  }

  async runAllTests() {
    this.log('🚀 Starting MCP setup validation for Date Night App...', colors.bright);
    
    // Run all test categories
    await this.testCommands();
    await this.testDependencies();
    await this.testConfiguration();
    await this.testMCPServers();
    await this.testDocumentation();
    
    // Generate final report
    this.generateReport();
    
    // Exit with appropriate code
    const success = this.passedTests === this.totalTests;
    process.exit(success ? 0 : 1);
  }
}

// Run the tests
const tester = new MCPTester();
tester.runAllTests().catch(console.error);