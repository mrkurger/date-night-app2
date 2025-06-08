#!/usr/bin/env node

/**
 * DeepScan Setup Validation Script
 * Tests and validates the DeepScan configuration for the Date Night App
 */

const fs = require('fs');
const path = require('path');

class DeepScanValidator {
  constructor() {
    this.results = {
      configFiles: [],
      eslintConfig: null,
      workspaceConfig: null,
      errors: [],
      warnings: [],
      score: 0,
      maxScore: 0
    };
    this.maxScore = 0; // Add separate maxScore property
  }

  async validateConfiguration() {
    console.log('🔍 Validating DeepScan Configuration...\n');

    await this.checkConfigFiles();
    await this.validateDeepScanConfig();
    await this.validateESLintConfig();
    await this.validateWorkspaceConfig();
    await this.checkDirectoryStructure();
    await this.generateReport();

    return this.results;
  }

  async checkConfigFiles() {
    console.log('📁 Checking configuration files...');
    
    const requiredFiles = [
      '.deepscan.json',
      '.eslintrc.security.json',
      'date-night-app.code-workspace',
      '.github/workflows/deepscan-analysis.yml',
      'docs/DEEPSCAN_INTEGRATION.md'
    ];

    this.maxScore += requiredFiles.length * 10;

    for (const file of requiredFiles) {
      const filePath = path.join(process.cwd(), file);
      if (fs.existsSync(filePath)) {
        this.results.configFiles.push({ file, status: 'exists', size: fs.statSync(filePath).size });
        this.results.score += 10;
        console.log(`  ✅ ${file} (${fs.statSync(filePath).size} bytes)`);
      } else {
        this.results.errors.push(`Missing configuration file: ${file}`);
        console.log(`  ❌ ${file} - MISSING`);
      }
    }
  }

  async validateDeepScanConfig() {
    console.log('\n🔧 Validating DeepScan configuration...');
    
    try {
      const configPath = path.join(process.cwd(), '.deepscan.json');
      if (fs.existsSync(configPath)) {
        const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
        
        // Check required fields
        const requiredFields = ['include', 'exclude', 'rules', 'eslint'];
        this.maxScore += requiredFields.length * 5;
        
        for (const field of requiredFields) {
          if (config[field]) {
            this.results.score += 5;
            console.log(`  ✅ ${field} configured`);
          } else {
            this.results.errors.push(`Missing DeepScan config field: ${field}`);
            console.log(`  ❌ ${field} - MISSING`);
          }
        }

        // Check include patterns
        if (config.include && config.include.length > 0) {
          this.results.score += 10;
          console.log(`  ✅ Include patterns: ${config.include.length} defined`);
        }

        // Check rule count
        if (config.rules && Object.keys(config.rules).length > 40) {
          this.results.score += 10;
          console.log(`  ✅ Rules: ${Object.keys(config.rules).length} defined`);
        }

        this.maxScore += 20;
      }
    } catch (error) {
      this.results.errors.push(`Invalid DeepScan config: ${error.message}`);
      console.log(`  ❌ Invalid JSON: ${error.message}`);
    }
  }

  async validateESLintConfig() {
    console.log('\n⚡ Validating ESLint security configuration...');
    
    try {
      const configPath = path.join(process.cwd(), '.eslintrc.security.json');
      if (fs.existsSync(configPath)) {
        const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
        
        // Check for security plugin
        this.maxScore += 30;
        if (config.plugins && config.plugins.includes('security')) {
          this.results.score += 10;
          console.log('  ✅ Security plugin enabled');
        } else {
          this.results.warnings.push('Security plugin not found in ESLint config');
        }

        // Check for Next.js config
        if (config.extends && config.extends.includes('next/core-web-vitals')) {
          this.results.score += 10;
          console.log('  ✅ Next.js core web vitals included');
        } else {
          this.results.warnings.push('Next.js ESLint config not included');
        }

        // Check for overrides (monorepo support)
        if (config.overrides && config.overrides.length > 0) {
          this.results.score += 10;
          console.log(`  ✅ Overrides: ${config.overrides.length} patterns for monorepo`);
        } else {
          this.results.warnings.push('No ESLint overrides found for monorepo structure');
        }

        this.results.eslintConfig = config;
      }
    } catch (error) {
      this.results.errors.push(`Invalid ESLint config: ${error.message}`);
      console.log(`  ❌ Invalid JSON: ${error.message}`);
    }
  }

  async validateWorkspaceConfig() {
    console.log('\n🏢 Validating VS Code workspace configuration...');
    
    try {
      const configPath = path.join(process.cwd(), 'date-night-app.code-workspace');
      if (fs.existsSync(configPath)) {
        const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
        
        this.maxScore += 20;
        
        // Check for multiple folders (monorepo)
        if (config.folders && config.folders.length >= 3) {
          this.results.score += 10;
          console.log(`  ✅ Multi-folder workspace: ${config.folders.length} folders`);
        }

        // Check for DeepScan settings
        if (config.settings && config.settings['deepscan.enable'] === true) {
          this.results.score += 10;
          console.log('  ✅ DeepScan enabled in workspace');
        } else {
          this.results.warnings.push('DeepScan not enabled in workspace settings');
        }

        this.results.workspaceConfig = config;
      }
    } catch (error) {
      this.results.errors.push(`Invalid workspace config: ${error.message}`);
      console.log(`  ❌ Invalid JSON: ${error.message}`);
    }
  }

  async checkDirectoryStructure() {
    console.log('\n📂 Checking monorepo directory structure...');
    
    const expectedDirs = [
      'client-angular',
      'client_angular2',
      '.github/workflows',
      'docs'
    ];

    this.maxScore += expectedDirs.length * 5;

    for (const dir of expectedDirs) {
      const dirPath = path.join(process.cwd(), dir);
      if (fs.existsSync(dirPath) && fs.statSync(dirPath).isDirectory()) {
        this.results.score += 5;
        console.log(`  ✅ ${dir}/`);
      } else {
        this.results.warnings.push(`Directory not found: ${dir}`);
        console.log(`  ⚠️  ${dir}/ - MISSING`);
      }
    }
  }

  async generateReport() {
    console.log('\n📊 DeepScan Setup Validation Report');
    console.log('=====================================');
    
    this.results.maxScore = this.maxScore; // Update results with calculated maxScore
    const percentage = this.maxScore > 0 ? Math.round((this.results.score / this.maxScore) * 100) : 0;
    console.log(`\n🎯 Overall Score: ${this.results.score}/${this.maxScore} (${percentage}%)`);
    
    if (percentage >= 90) {
      console.log('🟢 Excellent! DeepScan configuration is comprehensive.');
    } else if (percentage >= 75) {
      console.log('🟡 Good! Minor improvements recommended.');
    } else {
      console.log('🔴 Needs improvement. Several issues found.');
    }

    if (this.results.errors.length > 0) {
      console.log('\n❌ Errors:');
      this.results.errors.forEach(error => console.log(`  - ${error}`));
    }

    if (this.results.warnings.length > 0) {
      console.log('\n⚠️  Warnings:');
      this.results.warnings.forEach(warning => console.log(`  - ${warning}`));
    }

    console.log('\n📋 Next Steps:');
    console.log('1. Install DeepScan VS Code extension');
    console.log('2. Open date-night-app.code-workspace in VS Code');
    console.log('3. Configure DeepScan account and license');
    console.log('4. Add DEEPSCAN_LICENSE secret to GitHub repository');
    console.log('5. Test both client-angular/ and client_angular2/ separately');

    console.log('\n🔗 Documentation:');
    console.log('- DeepScan Setup: docs/DEEPSCAN_INTEGRATION.md');
    console.log('- Custom Instructions: .github/copilot-instructions.md');
    console.log('- Workspace Config: date-night-app.code-workspace');
  }
}

// Run validation
if (require.main === module) {
  const validator = new DeepScanValidator();
  validator.validateConfiguration()
    .then(results => {
      const percentage = validator.maxScore > 0 ? Math.round((results.score / validator.maxScore) * 100) : 0;
      process.exit(percentage >= 75 ? 0 : 1);
    })
    .catch(error => {
      console.error('❌ Validation failed:', error.message);
      process.exit(1);
    });
}

module.exports = DeepScanValidator;