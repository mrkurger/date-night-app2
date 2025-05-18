import { promises as fs } from 'fs';
import path from 'path';
import yaml from 'js-yaml';
import chalk from 'chalk';

class WorkflowTester {
  constructor() {
    this.results = {
      passed: [],
      failed: [],
      skipped: [],
      errors: []
    };
  }

  async testWorkflows(workflowsPath) {
    console.log(chalk.blue('🔍 Starting workflow tests...\n'));
    
    try {
      const files = await fs.readdir(workflowsPath);
      const ymlFiles = files.filter(f => f.endsWith('.yml') || f.endsWith('.yaml'));
      
      for (const file of ymlFiles) {
        await this.testWorkflow(path.join(workflowsPath, file));
      }
      
      this.generateReport();
    } catch (err) {
      console.error(chalk.red('❌ Error testing workflows:'), err);
    }
  }

  async testWorkflow(filePath) {
    const filename = path.basename(filePath);
    console.log(chalk.cyan(`\nTesting workflow: ${filename}`));

    try {
      const content = await fs.readFile(filePath, 'utf8');
      const workflow = yaml.load(content);

      const results = await Promise.all([
        this.validateSyntax(workflow),
        this.validateTriggers(workflow),
        this.validatePermissions(workflow),
        this.validateSecrets(workflow)
      ]);

      const failed = results.some(r => !r.passed);
      if (failed) {
        this.results.failed.push(filename);
      } else {
        this.results.passed.push(filename);
      }

      results.forEach(result => {
        const icon = result.passed ? '✅' : '❌';
        const color = result.passed ? chalk.green : chalk.red;
        console.log(color(`${icon} ${result.name}: ${result.message}`));
      });

    } catch (err) {
      console.error(chalk.red(`❌ Error processing ${filename}:`), err);
      this.results.errors.push({ file: filename, error: err.message });
    }
  }

  async validateSyntax(workflow) {
    try {
      if (!workflow.name || !workflow.on || !workflow.jobs) {
        return {
          name: 'Syntax Validation',
          passed: false,
          message: 'Missing required fields (name, on, or jobs)'
        };
      }
      return {
        name: 'Syntax Validation',
        passed: true,
        message: 'All required fields present'
      };
    } catch (err) {
      return {
        name: 'Syntax Validation',
        passed: false,
        message: `Invalid YAML: ${err.message}`
      };
    }
  }

  async validateTriggers(workflow) {
    const triggers = workflow.on;
    const validEvents = [
      'push', 
      'pull_request', 
      'schedule', 
      'workflow_dispatch', 
      'repository_dispatch',
      'workflow_call',
      'workflow_run'
    ];
    
    if (typeof triggers === 'string') {
      return {
        name: 'Trigger Validation',
        passed: validEvents.includes(triggers),
        message: validEvents.includes(triggers) ? 
          'Valid trigger event' : 
          `Invalid trigger event: ${triggers}`
      };
    }

    const events = Object.keys(triggers);
    const invalidEvents = events.filter(e => !validEvents.includes(e));

    return {
      name: 'Trigger Validation',
      passed: invalidEvents.length === 0,
      message: invalidEvents.length === 0 ?
        'All trigger events are valid' :
        `Invalid trigger events: ${invalidEvents.join(', ')}`
    };
  }

  async validatePermissions(workflow) {
    const hasPermissions = workflow.permissions !== undefined;
    const validPermissions = [
      'contents',
      'issues',
      'checks',
      'actions',
      'pull-requests',
      'security-events',
      'pages',
      'id-token',
      'statuses'
    ];
    
    if (!hasPermissions) {
      return {
        name: 'Permissions Validation',
        passed: false,
        message: 'Missing permissions configuration'
      };
    }

    // Check if permissions are properly configured
    const permissions = workflow.permissions;
    const configuredPermissions = Object.keys(permissions);
    const invalidPermissions = configuredPermissions.filter(p => !validPermissions.includes(p));

    return {
      name: 'Permissions Validation',
      passed: invalidPermissions.length === 0,
      message: invalidPermissions.length === 0 ?
        'Permissions properly configured' :
        `Invalid permissions: ${invalidPermissions.join(', ')}`
    };
  }

  async validateSecrets(workflow) {
    const jobs = workflow.jobs || {};
    let secretsUsed = new Set();

    for (const [_, job] of Object.entries(jobs)) {
      const steps = job.steps || [];
      for (const step of steps) {
        if (step.env) {
          const envVars = Object.values(step.env).join(' ');
          const matches = envVars.match(/\$\{\{\s*secrets\.[^\s\}]+\s*\}\}/g) || [];
          matches.forEach(match => {
            secretsUsed.add(match.match(/secrets\.([^\s\}]+)/)[1]);
          });
        }
      }
    }

    return {
      name: 'Secrets Validation',
      passed: true,
      message: secretsUsed.size > 0 ?
        `Found ${secretsUsed.size} secrets used: ${Array.from(secretsUsed).join(', ')}` :
        'No secrets used in workflow'
    };
  }

  generateReport() {
    console.log(chalk.blue('\n📊 Workflow Test Report'));
    console.log(chalk.green(`✅ Passed: ${this.results.passed.length}`));
    console.log(chalk.red(`❌ Failed: ${this.results.failed.length}`));
    console.log(chalk.yellow(`⚠️ Skipped: ${this.results.skipped.length}`));
    console.log(chalk.red(`💥 Errors: ${this.results.errors.length}`));

    if (this.results.failed.length > 0) {
      console.log(chalk.red('\nFailed Workflows:'));
      this.results.failed.forEach(file => console.log(`- ${file}`));
    }

    if (this.results.errors.length > 0) {
      console.log(chalk.red('\nErrors:'));
      this.results.errors.forEach(({file, error}) => {
        console.log(`- ${file}: ${error}`);
      });
    }
  }
}

// Run tests
const tester = new WorkflowTester();
const workflowsPath = path.resolve(process.cwd(), '.github/workflows');
console.log('Testing workflows in:', workflowsPath);
tester.testWorkflows(workflowsPath)
  .catch(console.error);
