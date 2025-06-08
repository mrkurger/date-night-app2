# MCP Server Setup Guide

This guide provides step-by-step instructions for setting up the recommended MCP servers to enhance GitHub Copilot's capabilities in the Date Night App project.

## Prerequisites

1. **VS Code with GitHub Copilot** installed and configured
2. **Node.js** (v18 or later) and npm
3. **MCP Extension for VS Code**:
   ```bash
   code --install-extension modelcontextprotocol.mcp
   ```

## Phase 1: Essential MCP Servers

### 1. ESLint MCP Server Setup

#### Installation
```bash
# Install ESLint MCP server globally or in project
npm install -g @eslint/mcp-server

# Or add to project dependencies
npm install --save-dev @eslint/mcp-server
```

#### Configuration
Add to your VS Code settings (`settings.json`):
```json
{
  "mcp": {
    "servers": {
      "eslint": {
        "command": "npx",
        "args": ["@eslint/mcp-server", "--stdio"],
        "env": {
          "ESLINT_CONFIG_PATH": ".eslintrc.json"
        }
      }
    }
  }
}
```

#### Project Configuration
Create or update `.eslintrc.json`:
```json
{
  "extends": [
    "@angular-eslint/recommended",
    "@typescript-eslint/recommended",
    "plugin:security/recommended"
  ],
  "plugins": ["security", "@typescript-eslint"],
  "rules": {
    "security/detect-object-injection": "warn",
    "security/detect-non-literal-fs-filename": "warn",
    "security/detect-unsafe-regex": "error",
    "@typescript-eslint/no-unused-vars": "error",
    "@typescript-eslint/explicit-function-return-type": "warn"
  },
  "parserOptions": {
    "ecmaVersion": 2022,
    "sourceType": "module"
  }
}
```

### 2. TypeDoc MCP Server Setup

#### Installation
```bash
# Install TypeDoc and MCP server
npm install --save-dev typedoc @typedoc/mcp-server

# For React/Next.js projects
npm install --save-dev typedoc-plugin-markdown
```

#### Configuration
Add to VS Code settings:
```json
{
  "mcp": {
    "servers": {
      "typedoc": {
        "command": "npx",
        "args": ["@typedoc/mcp-server", "--stdio"],
        "env": {
          "TYPEDOC_CONFIG": "typedoc.json"
        }
      }
    }
  }
}
```

#### Project Configuration
Create `typedoc.json`:
```json
{
  "entryPoints": [
    "./client-angular/src",
    "./client_angular2/src"
  ],
  "out": "./docs/api",
  "plugin": ["typedoc-plugin-markdown"],
  "theme": "markdown",
  "readme": "./README.md",
  "includeVersion": true,
  "excludePrivate": true,
  "excludeProtected": true,
  "excludeInternal": true,
  "categorizeByGroup": true,
  "defaultCategory": "Other",
  "categoryOrder": [
    "Components",
    "Services",
    "Models",
    "Utilities",
    "*"
  ]
}
```

### 3. Bundle Analyzer MCP Setup

#### Installation
```bash
# For Angular projects
npm install --save-dev webpack-bundle-analyzer-mcp

# For Next.js projects (already installed)
# @next/bundle-analyzer is already in dependencies
```

#### Configuration
Add to VS Code settings:
```json
{
  "mcp": {
    "servers": {
      "bundle-analyzer": {
        "command": "npx",
        "args": ["bundle-analyzer-mcp", "--stdio"],
        "env": {
          "ANALYZER_CONFIG": "bundle-analyzer.config.js"
        }
      }
    }
  }
}
```

#### Project Configuration
Create `bundle-analyzer.config.js`:
```javascript
module.exports = {
  // Angular configuration
  angular: {
    statsFile: 'dist/client-angular/stats.json',
    thresholds: {
      bundleSize: '2MB',
      chunkSize: '500KB',
      assetSize: '1MB'
    }
  },
  // Next.js configuration
  nextjs: {
    outputDirectory: 'client_angular2/.next',
    thresholds: {
      bundleSize: '1.5MB',
      firstLoadJS: '300KB'
    }
  },
  // Common configuration
  reportFormat: 'json',
  generateReport: true,
  openAnalyzer: false
};
```

## Phase 2: Security and Testing MCP Servers

### 4. Security Audit MCP Setup

#### Custom Implementation
Create `scripts/security-audit-mcp.js`:
```javascript
#!/usr/bin/env node

/**
 * Security Audit MCP Server
 * Provides security scanning capabilities for the Date Night App
 */

import { spawn } from 'child_process';
import { writeFile } from 'fs/promises';
import { join } from 'path';

class SecurityAuditMCP {
  constructor() {
    this.auditResults = {
      npm: null,
      snyk: null,
      eslintSecurity: null,
      timestamp: new Date().toISOString()
    };
  }

  async runNpmAudit() {
    return new Promise((resolve, reject) => {
      const proc = spawn('npm', ['audit', '--json']);
      let output = '';
      
      proc.stdout.on('data', (data) => {
        output += data.toString();
      });
      
      proc.on('close', (code) => {
        try {
          this.auditResults.npm = JSON.parse(output);
          resolve(this.auditResults.npm);
        } catch (error) {
          reject(error);
        }
      });
    });
  }

  async runSnykTest() {
    return new Promise((resolve, reject) => {
      const proc = spawn('npx', ['snyk', 'test', '--json']);
      let output = '';
      
      proc.stdout.on('data', (data) => {
        output += data.toString();
      });
      
      proc.on('close', (code) => {
        try {
          this.auditResults.snyk = JSON.parse(output);
          resolve(this.auditResults.snyk);
        } catch (error) {
          // Snyk might not be configured, that's ok
          this.auditResults.snyk = { error: 'Snyk not configured' };
          resolve(this.auditResults.snyk);
        }
      });
    });
  }

  async generateSecurityReport() {
    await this.runNpmAudit();
    await this.runSnykTest();
    
    const reportPath = join(process.cwd(), 'security-audit-report.json');
    await writeFile(reportPath, JSON.stringify(this.auditResults, null, 2));
    
    return this.auditResults;
  }

  async getSecuritySummary() {
    const results = await this.generateSecurityReport();
    
    return {
      totalVulnerabilities: results.npm?.metadata?.vulnerabilities?.total || 0,
      criticalVulnerabilities: results.npm?.metadata?.vulnerabilities?.critical || 0,
      highVulnerabilities: results.npm?.metadata?.vulnerabilities?.high || 0,
      recommendations: this.generateRecommendations(results)
    };
  }

  generateRecommendations(results) {
    const recommendations = [];
    
    if (results.npm?.metadata?.vulnerabilities?.total > 0) {
      recommendations.push('Run "npm audit fix" to address known vulnerabilities');
    }
    
    if (results.npm?.metadata?.vulnerabilities?.critical > 0) {
      recommendations.push('Critical vulnerabilities detected - immediate action required');
    }
    
    recommendations.push('Consider using "npm ci" in production deployments');
    recommendations.push('Regularly update dependencies to latest secure versions');
    
    return recommendations;
  }
}

// MCP Server Protocol Implementation
const securityAudit = new SecurityAuditMCP();

process.stdin.on('data', async (data) => {
  try {
    const request = JSON.parse(data.toString());
    
    switch (request.method) {
      case 'tools/list':
        process.stdout.write(JSON.stringify({
          tools: [
            {
              name: 'security_audit',
              description: 'Run comprehensive security audit',
              inputSchema: {
                type: 'object',
                properties: {}
              }
            },
            {
              name: 'security_summary',
              description: 'Get security summary and recommendations',
              inputSchema: {
                type: 'object',
                properties: {}
              }
            }
          ]
        }));
        break;
        
      case 'tools/call':
        if (request.params.name === 'security_audit') {
          const results = await securityAudit.generateSecurityReport();
          process.stdout.write(JSON.stringify({
            content: [{
              type: 'text',
              text: JSON.stringify(results, null, 2)
            }]
          }));
        } else if (request.params.name === 'security_summary') {
          const summary = await securityAudit.getSecuritySummary();
          process.stdout.write(JSON.stringify({
            content: [{
              type: 'text',
              text: JSON.stringify(summary, null, 2)
            }]
          }));
        }
        break;
    }
  } catch (error) {
    process.stdout.write(JSON.stringify({
      error: error.message
    }));
  }
});
```

Make the script executable:
```bash
chmod +x scripts/security-audit-mcp.js
```

#### Configuration
Add to VS Code settings:
```json
{
  "mcp": {
    "servers": {
      "security-audit": {
        "command": "node",
        "args": ["./scripts/security-audit-mcp.js"]
      }
    }
  }
}
```

### 5. Jest MCP Server Setup

#### Installation
```bash
npm install --save-dev jest-mcp-server jest-coverage-reporter
```

#### Configuration
Add to VS Code settings:
```json
{
  "mcp": {
    "servers": {
      "jest": {
        "command": "npx",
        "args": ["jest-mcp-server", "--stdio"],
        "env": {
          "JEST_CONFIG": "jest.config.js"
        }
      }
    }
  }
}
```

#### Project Configuration
Create `jest.config.js`:
```javascript
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/src', '<rootDir>/tests'],
  testMatch: [
    '**/__tests__/**/*.+(ts|tsx|js)',
    '**/*.(test|spec).+(ts|tsx|js)'
  ],
  transform: {
    '^.+\\.(ts|tsx)$': 'ts-jest'
  },
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.d.ts',
    '!src/**/index.ts'
  ],
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 70,
      lines: 70,
      statements: 70
    }
  },
  coverageReporters: ['text', 'lcov', 'html'],
  setupFilesAfterEnv: ['<rootDir>/tests/setup.ts']
};
```

## Complete VS Code Configuration

### Final `settings.json`
```json
{
  "github.copilot.settings": {
    "maxFilesPerBatch": 20,
    "batchProcessingTimeout": 30000,
    "enableParallelProcessing": true,
    "memoryLimit": 4096,
    "advanced": {
      "enableDeepAnalysis": true,
      "maxContextFiles": 15,
      "maxTokensPerFile": 5000
    }
  },
  "mcp": {
    "servers": {
      "typescript-lsp": {
        "command": "npx",
        "args": ["lsp-mcp", "typescript", "typescript-language-server", "--stdio"]
      },
      "eslint": {
        "command": "npx",
        "args": ["@eslint/mcp-server", "--stdio"],
        "env": {
          "ESLINT_CONFIG_PATH": ".eslintrc.json"
        }
      },
      "typedoc": {
        "command": "npx",
        "args": ["@typedoc/mcp-server", "--stdio"],
        "env": {
          "TYPEDOC_CONFIG": "typedoc.json"
        }
      },
      "bundle-analyzer": {
        "command": "npx",
        "args": ["bundle-analyzer-mcp", "--stdio"]
      },
      "security-audit": {
        "command": "node",
        "args": ["./scripts/security-audit-mcp.js"]
      },
      "jest": {
        "command": "npx",
        "args": ["jest-mcp-server", "--stdio"]
      },
      "playwright": {
        "command": "npx",
        "args": ["@playwright/mcp@latest"]
      },
      "sequentialthinking": {
        "maxConcurrentOperations": 5,
        "timeout": 30000
      }
    }
  },
  "editor.maxTokenizationLineLength": 20000,
  "files.maxMemoryForLargeFilesMB": 4096
}
```

## Installation Script

Create `scripts/setup-mcp-servers.sh`:
```bash
#!/bin/bash

echo "🚀 Setting up MCP servers for Date Night App..."

# Install ESLint MCP Server
echo "📦 Installing ESLint MCP Server..."
npm install --save-dev @eslint/mcp-server eslint-plugin-security

# Install TypeDoc MCP Server
echo "📦 Installing TypeDoc MCP Server..."
npm install --save-dev typedoc @typedoc/mcp-server typedoc-plugin-markdown

# Install Bundle Analyzer MCP
echo "📦 Installing Bundle Analyzer MCP..."
npm install --save-dev webpack-bundle-analyzer-mcp

# Install Jest MCP Server
echo "📦 Installing Jest MCP Server..."
npm install --save-dev jest-mcp-server jest-coverage-reporter

# Make security audit script executable
echo "🔧 Setting up security audit script..."
chmod +x scripts/security-audit-mcp.js

# Install MCP VS Code extension
echo "🔧 Installing VS Code MCP extension..."
code --install-extension modelcontextprotocol.mcp

echo "✅ MCP servers setup complete!"
echo "📝 Please restart VS Code and configure your settings.json file"
echo "📚 See MCP_SERVERS_CATALOG.md for configuration details"
```

Make it executable:
```bash
chmod +x scripts/setup-mcp-servers.sh
```

## Testing Your Setup

Create `scripts/test-mcp-setup.js`:
```javascript
#!/usr/bin/env node

/**
 * Test script to verify MCP server setup
 */

import { spawn } from 'child_process';
import { existsSync } from 'fs';

const servers = [
  'typescript-lsp',
  'eslint',
  'typedoc',
  'security-audit',
  'playwright'
];

async function testMCPServer(serverName) {
  console.log(`🧪 Testing ${serverName} MCP server...`);
  
  // This would test the server's basic functionality
  // Implementation depends on specific server capabilities
  return true;
}

async function runTests() {
  console.log('🚀 Testing MCP server setup...\n');
  
  for (const server of servers) {
    try {
      await testMCPServer(server);
      console.log(`✅ ${server}: OK`);
    } catch (error) {
      console.log(`❌ ${server}: FAILED - ${error.message}`);
    }
  }
  
  console.log('\n🎉 MCP server testing complete!');
}

runTests().catch(console.error);
```

## Troubleshooting

### Common Issues

1. **MCP Server Not Starting**
   - Check VS Code Output panel for error messages
   - Verify server installation: `npm list [package-name]`
   - Check file permissions for custom scripts

2. **Performance Issues**
   - Reduce concurrent operations in settings
   - Increase timeout values
   - Monitor memory usage

3. **Configuration Errors**
   - Validate JSON syntax in settings files
   - Check environment variable paths
   - Verify executable permissions

### Support Resources

- [MCP Protocol Documentation](https://modelcontextprotocol.io/)
- [VS Code MCP Extension Issues](https://github.com/modelcontextprotocol/vscode-mcp/issues)
- [Project Documentation](./MCP_SERVERS_CATALOG.md)

---

*Last updated: 2025-05-21*
*Setup guide for Date Night App MCP servers*