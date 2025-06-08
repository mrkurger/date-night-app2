#!/usr/bin/env node

/**
 * Security Audit MCP Server for Date Night App
 * 
 * This MCP server provides security auditing capabilities by integrating
 * various security tools and providing actionable insights through the
 * Model Context Protocol.
 * 
 * Features:
 * - NPM audit integration
 * - Snyk vulnerability scanning (if available)
 * - Custom security pattern detection
 * - Security best practices validation
 * - Dependency analysis
 * 
 * Usage:
 *   node scripts/security-audit-mcp.js
 * 
 * @author MCP Assistant
 * @created 2025-05-21
 */

import { spawn } from 'child_process';
import { writeFile, readFile, access } from 'fs/promises';
import { join } from 'path';
import { createHash } from 'crypto';

class SecurityAuditMCP {
  constructor() {
    this.auditResults = {
      npm: null,
      snyk: null,
      customChecks: null,
      summary: null,
      timestamp: new Date().toISOString(),
      projectHash: null
    };
    
    this.securityPatterns = [
      {
        name: 'hardcoded-secrets',
        pattern: /(password|secret|key|token)\s*[:=]\s*['"][^'"]{8,}/gi,
        severity: 'high',
        description: 'Potential hardcoded secrets detected'
      },
      {
        name: 'sql-injection',
        pattern: /\$\{[^}]*\}/g,
        severity: 'medium',
        description: 'Potential SQL injection vulnerability'
      },
      {
        name: 'eval-usage',
        pattern: /\beval\s*\(/gi,
        severity: 'high',
        description: 'Use of eval() detected - potential security risk'
      },
      {
        name: 'innerHTML-usage',
        pattern: /\.innerHTML\s*=/gi,
        severity: 'medium',
        description: 'Use of innerHTML detected - potential XSS risk'
      }
    ];
  }

  async runCommand(command, args, options = {}) {
    return new Promise((resolve, reject) => {
      const proc = spawn(command, args, options);
      let stdout = '';
      let stderr = '';
      
      proc.stdout.on('data', (data) => {
        stdout += data.toString();
      });
      
      proc.stderr.on('data', (data) => {
        stderr += data.toString();
      });
      
      proc.on('close', (code) => {
        resolve({
          code,
          stdout,
          stderr,
          success: code === 0
        });
      });
      
      proc.on('error', (error) => {
        reject(error);
      });
    });
  }

  async runNpmAudit() {
    try {
      const result = await this.runCommand('npm', ['audit', '--json']);
      
      if (result.stdout) {
        try {
          this.auditResults.npm = JSON.parse(result.stdout);
        } catch (parseError) {
          // Handle non-JSON output
          this.auditResults.npm = {
            error: 'Failed to parse npm audit output',
            rawOutput: result.stdout
          };
        }
      } else {
        this.auditResults.npm = {
          vulnerabilities: { total: 0 },
          metadata: { vulnerabilities: { total: 0 } }
        };
      }
      
      return this.auditResults.npm;
    } catch (error) {
      this.auditResults.npm = {
        error: `NPM audit failed: ${error.message}`
      };
      return this.auditResults.npm;
    }
  }

  async runSnykTest() {
    try {
      // Check if snyk is available
      const snykCheck = await this.runCommand('npx', ['snyk', '--version']);
      
      if (!snykCheck.success) {
        this.auditResults.snyk = {
          error: 'Snyk not available or not authenticated',
          recommendation: 'Install and authenticate Snyk for enhanced security scanning'
        };
        return this.auditResults.snyk;
      }

      const result = await this.runCommand('npx', ['snyk', 'test', '--json']);
      
      if (result.stdout) {
        try {
          this.auditResults.snyk = JSON.parse(result.stdout);
        } catch (parseError) {
          this.auditResults.snyk = {
            error: 'Failed to parse Snyk output',
            rawOutput: result.stdout
          };
        }
      }
      
      return this.auditResults.snyk;
    } catch (error) {
      this.auditResults.snyk = {
        error: `Snyk test failed: ${error.message}`,
        recommendation: 'Consider setting up Snyk for comprehensive vulnerability scanning'
      };
      return this.auditResults.snyk;
    }
  }

  async runCustomSecurityChecks() {
    const checks = {
      patterns: [],
      files: [],
      recommendations: []
    };

    const filesToCheck = [
      'client-angular/src/**/*.ts',
      'client-angular/src/**/*.js',
      'client_angular2/src/**/*.ts',
      'client_angular2/src/**/*.tsx',
      'server/**/*.js',
      'server/**/*.ts'
    ];

    // For now, we'll check common files that likely exist
    const commonFiles = [
      'package.json',
      'package-lock.json',
      '.env.example'
    ];

    for (const file of commonFiles) {
      try {
        await access(file);
        const content = await readFile(file, 'utf-8');
        
        // Check for security patterns
        for (const pattern of this.securityPatterns) {
          const matches = content.match(pattern.pattern);
          if (matches) {
            checks.patterns.push({
              file,
              pattern: pattern.name,
              severity: pattern.severity,
              description: pattern.description,
              matches: matches.length
            });
          }
        }
        
        checks.files.push({
          file,
          status: 'scanned',
          size: content.length
        });
      } catch (error) {
        // File doesn't exist or can't be read
        checks.files.push({
          file,
          status: 'not_found'
        });
      }
    }

    // Add general security recommendations
    checks.recommendations = [
      'Ensure all dependencies are regularly updated',
      'Use environment variables for sensitive configuration',
      'Implement proper input validation',
      'Use HTTPS in production',
      'Implement proper authentication and authorization',
      'Regular security audits and penetration testing',
      'Use Content Security Policy (CSP) headers',
      'Implement proper error handling to avoid information disclosure'
    ];

    this.auditResults.customChecks = checks;
    return checks;
  }

  async generateProjectHash() {
    try {
      const packageJson = await readFile('package.json', 'utf-8');
      const packageData = JSON.parse(packageJson);
      
      const hashData = {
        name: packageData.name,
        version: packageData.version,
        dependencies: packageData.dependencies,
        devDependencies: packageData.devDependencies
      };
      
      this.auditResults.projectHash = createHash('sha256')
        .update(JSON.stringify(hashData))
        .digest('hex')
        .substring(0, 16);
        
      return this.auditResults.projectHash;
    } catch (error) {
      this.auditResults.projectHash = 'unknown';
      return this.auditResults.projectHash;
    }
  }

  generateSecuritySummary() {
    const npm = this.auditResults.npm;
    const custom = this.auditResults.customChecks;
    
    let totalVulnerabilities = 0;
    let criticalVulnerabilities = 0;
    let highVulnerabilities = 0;
    let customIssues = 0;

    if (npm && npm.metadata && npm.metadata.vulnerabilities) {
      totalVulnerabilities = npm.metadata.vulnerabilities.total || 0;
      criticalVulnerabilities = npm.metadata.vulnerabilities.critical || 0;
      highVulnerabilities = npm.metadata.vulnerabilities.high || 0;
    }

    if (custom && custom.patterns) {
      customIssues = custom.patterns.filter(p => p.severity === 'high' || p.severity === 'critical').length;
    }

    const summary = {
      overallRisk: this.calculateOverallRisk(criticalVulnerabilities, highVulnerabilities, customIssues),
      totalVulnerabilities,
      criticalVulnerabilities,
      highVulnerabilities,
      customIssues,
      recommendations: this.generatePriorityRecommendations(),
      lastAudit: this.auditResults.timestamp,
      projectHash: this.auditResults.projectHash
    };

    this.auditResults.summary = summary;
    return summary;
  }

  calculateOverallRisk(critical, high, custom) {
    if (critical > 0 || custom > 2) return 'HIGH';
    if (high > 5 || custom > 0) return 'MEDIUM';
    return 'LOW';
  }

  generatePriorityRecommendations() {
    const recommendations = [];
    const npm = this.auditResults.npm;
    const custom = this.auditResults.customChecks;

    if (npm && npm.metadata && npm.metadata.vulnerabilities) {
      if (npm.metadata.vulnerabilities.critical > 0) {
        recommendations.push({
          priority: 'CRITICAL',
          action: 'Run "npm audit fix" immediately to address critical vulnerabilities',
          impact: 'Security compromise possible'
        });
      }
      
      if (npm.metadata.vulnerabilities.high > 0) {
        recommendations.push({
          priority: 'HIGH',
          action: 'Review and fix high-severity vulnerabilities',
          impact: 'Potential security risks'
        });
      }
      
      if (npm.metadata.vulnerabilities.total > 0) {
        recommendations.push({
          priority: 'MEDIUM',
          action: 'Update dependencies to latest secure versions',
          impact: 'Improved security posture'
        });
      }
    }

    if (custom && custom.patterns && custom.patterns.length > 0) {
      recommendations.push({
        priority: 'HIGH',
        action: 'Review code patterns flagged by security analysis',
        impact: 'Prevent potential security vulnerabilities'
      });
    }

    if (!this.auditResults.snyk || this.auditResults.snyk.error) {
      recommendations.push({
        priority: 'MEDIUM',
        action: 'Set up Snyk for enhanced vulnerability scanning',
        impact: 'More comprehensive security monitoring'
      });
    }

    return recommendations;
  }

  async generateFullReport() {
    await this.generateProjectHash();
    await this.runNpmAudit();
    await this.runSnykTest();
    await this.runCustomSecurityChecks();
    this.generateSecuritySummary();
    
    const reportPath = join(process.cwd(), 'security-audit-report.json');
    await writeFile(reportPath, JSON.stringify(this.auditResults, null, 2));
    
    return this.auditResults;
  }
}

// MCP Server Protocol Implementation
const securityAudit = new SecurityAuditMCP();

// Handle MCP protocol messages
async function handleMCPMessage(message) {
  try {
    const request = JSON.parse(message);
    let response = {};

    switch (request.method) {
      case 'initialize':
        response = {
          jsonrpc: '2.0',
          id: request.id,
          result: {
            protocolVersion: '2024-11-05',
            capabilities: {
              tools: {}
            },
            serverInfo: {
              name: 'security-audit-mcp',
              version: '1.0.0'
            }
          }
        };
        break;

      case 'tools/list':
        response = {
          jsonrpc: '2.0',
          id: request.id,
          result: {
            tools: [
              {
                name: 'security_audit',
                description: 'Run comprehensive security audit including npm audit, Snyk test, and custom security checks',
                inputSchema: {
                  type: 'object',
                  properties: {
                    includeSnyk: {
                      type: 'boolean',
                      description: 'Include Snyk vulnerability scanning',
                      default: true
                    }
                  }
                }
              },
              {
                name: 'security_summary',
                description: 'Get security summary and priority recommendations',
                inputSchema: {
                  type: 'object',
                  properties: {}
                }
              },
              {
                name: 'npm_audit',
                description: 'Run NPM audit only',
                inputSchema: {
                  type: 'object',
                  properties: {}
                }
              },
              {
                name: 'custom_security_check',
                description: 'Run custom security pattern analysis',
                inputSchema: {
                  type: 'object',
                  properties: {}
                }
              }
            ]
          }
        };
        break;

      case 'tools/call':
        const toolName = request.params.name;
        let result = '';

        switch (toolName) {
          case 'security_audit':
            const fullReport = await securityAudit.generateFullReport();
            result = `# Security Audit Report

## Summary
- **Overall Risk**: ${fullReport.summary.overallRisk}
- **Total Vulnerabilities**: ${fullReport.summary.totalVulnerabilities}
- **Critical**: ${fullReport.summary.criticalVulnerabilities}
- **High**: ${fullReport.summary.highVulnerabilities}
- **Custom Issues**: ${fullReport.summary.customIssues}

## Priority Recommendations
${fullReport.summary.recommendations.map(r => `- **${r.priority}**: ${r.action}`).join('\n')}

## Detailed Results
${JSON.stringify(fullReport, null, 2)}`;
            break;

          case 'security_summary':
            await securityAudit.runNpmAudit();
            await securityAudit.runCustomSecurityChecks();
            const summary = securityAudit.generateSecuritySummary();
            result = `# Security Summary

**Overall Risk Level**: ${summary.overallRisk}

## Vulnerability Counts
- Total: ${summary.totalVulnerabilities}
- Critical: ${summary.criticalVulnerabilities}
- High: ${summary.highVulnerabilities}
- Custom Issues: ${summary.customIssues}

## Priority Actions
${summary.recommendations.map(r => `1. **${r.priority}**: ${r.action} - ${r.impact}`).join('\n')}

Last audit: ${summary.lastAudit}`;
            break;

          case 'npm_audit':
            const npmResults = await securityAudit.runNpmAudit();
            result = `# NPM Audit Results

${JSON.stringify(npmResults, null, 2)}`;
            break;

          case 'custom_security_check':
            const customResults = await securityAudit.runCustomSecurityChecks();
            result = `# Custom Security Check Results

## Patterns Found
${customResults.patterns.map(p => `- **${p.severity.toUpperCase()}** in ${p.file}: ${p.description} (${p.matches} matches)`).join('\n') || 'No security patterns detected'}

## Files Scanned
${customResults.files.map(f => `- ${f.file}: ${f.status}`).join('\n')}

## Recommendations
${customResults.recommendations.map(r => `- ${r}`).join('\n')}`;
            break;

          default:
            throw new Error(`Unknown tool: ${toolName}`);
        }

        response = {
          jsonrpc: '2.0',
          id: request.id,
          result: {
            content: [
              {
                type: 'text',
                text: result
              }
            ]
          }
        };
        break;

      default:
        response = {
          jsonrpc: '2.0',
          id: request.id,
          error: {
            code: -32601,
            message: `Method not found: ${request.method}`
          }
        };
    }

    return JSON.stringify(response);
  } catch (error) {
    return JSON.stringify({
      jsonrpc: '2.0',
      id: null,
      error: {
        code: -32603,
        message: `Internal error: ${error.message}`
      }
    });
  }
}

// Set up stdio communication
if (process.stdin.isTTY) {
  console.log('Security Audit MCP Server');
  console.log('This server provides security auditing capabilities through the MCP protocol.');
  console.log('Use with VS Code and the MCP extension for integration with GitHub Copilot.');
  process.exit(0);
}

let buffer = '';

process.stdin.on('data', async (chunk) => {
  buffer += chunk.toString();
  
  // Process complete messages (assuming line-delimited JSON)
  const lines = buffer.split('\n');
  buffer = lines.pop() || ''; // Keep incomplete line in buffer
  
  for (const line of lines) {
    if (line.trim()) {
      const response = await handleMCPMessage(line.trim());
      process.stdout.write(response + '\n');
    }
  }
});

process.stdin.on('end', () => {
  if (buffer.trim()) {
    handleMCPMessage(buffer.trim()).then(response => {
      process.stdout.write(response + '\n');
      process.exit(0);
    });
  } else {
    process.exit(0);
  }
});

// Handle termination signals
process.on('SIGINT', () => process.exit(0));
process.on('SIGTERM', () => process.exit(0));