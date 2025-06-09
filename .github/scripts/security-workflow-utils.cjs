/**
 * Security Workflow Utilities
 * 
 * Shared utilities for security dashboard workflows including:
 * - Structured logging with timestamps
 * - Error handling and notification helpers
 * - Performance measurement utilities
 * - Retry mechanisms for API calls
 * 
 * @author Security Workflow Enhancement
 * @created 2025-01-21
 */

const crypto = require('crypto');

/**
 * Logger utility with structured logging
 */
class WorkflowLogger {
  constructor(context = 'SecurityWorkflow') {
    this.context = context;
    this.startTime = Date.now();
  }

  /**
   * Log info message with timestamp
   */
  info(message, data = {}) {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] [${this.context}] INFO: ${message}`, 
      Object.keys(data).length ? JSON.stringify(data, null, 2) : '');
  }

  /**
   * Log error message with timestamp
   */
  error(message, error = null, data = {}) {
    const timestamp = new Date().toISOString();
    console.error(`[${timestamp}] [${this.context}] ERROR: ${message}`, 
      error ? error.message || error : '', 
      Object.keys(data).length ? JSON.stringify(data, null, 2) : '');
  }

  /**
   * Log warning message with timestamp
   */
  warn(message, data = {}) {
    const timestamp = new Date().toISOString();
    console.warn(`[${timestamp}] [${this.context}] WARN: ${message}`, 
      Object.keys(data).length ? JSON.stringify(data, null, 2) : '');
  }

  /**
   * Log debug message with timestamp
   */
  debug(message, data = {}) {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] [${this.context}] DEBUG: ${message}`, 
      Object.keys(data).length ? JSON.stringify(data, null, 2) : '');
  }

  /**
   * Get elapsed time since logger creation
   */
  getElapsedTime() {
    return Date.now() - this.startTime;
  }

  /**
   * Log performance metric
   */
  logPerformance(operation, duration) {
    this.info(`Performance: ${operation} completed in ${duration}ms`);
  }
}

/**
 * Performance measurement utility
 */
class PerformanceTracker {
  constructor() {
    this.measurements = {};
  }

  /**
   * Start measuring an operation
   */
  start(operation) {
    this.measurements[operation] = Date.now();
  }

  /**
   * Stop measuring and return duration
   */
  stop(operation) {
    if (!this.measurements[operation]) {
      throw new Error(`No measurement started for operation: ${operation}`);
    }
    const duration = Date.now() - this.measurements[operation];
    delete this.measurements[operation];
    return duration;
  }

  /**
   * Get all current measurements
   */
  getAllMeasurements() {
    const now = Date.now();
    return Object.entries(this.measurements).map(([operation, startTime]) => ({
      operation,
      duration: now - startTime,
      inProgress: true
    }));
  }
}

/**
 * Retry utility for API calls
 */
class RetryHelper {
  /**
   * Retry an async operation with exponential backoff
   */
  static async retry(operation, maxRetries = 3, baseDelay = 1000, logger = null) {
    let lastError;
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        if (logger) {
          logger.debug(`Attempt ${attempt}/${maxRetries} for operation`);
        }
        return await operation();
      } catch (error) {
        lastError = error;
        if (logger) {
          logger.warn(`Attempt ${attempt}/${maxRetries} failed`, { error: error.message });
        }
        
        if (attempt === maxRetries) {
          break;
        }
        
        // Exponential backoff with jitter
        const delay = baseDelay * Math.pow(2, attempt - 1) + Math.random() * 1000;
        if (logger) {
          logger.debug(`Waiting ${Math.round(delay)}ms before retry`);
        }
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
    
    throw new Error(`Operation failed after ${maxRetries} attempts: ${lastError.message}`);
  }
}

/**
 * Error notification helper
 */
class ErrorNotifier {
  constructor(github, context, logger) {
    this.github = github;
    this.context = context;
    this.logger = logger;
  }

  /**
   * Create or update an error notification issue
   */
  async notifyError(error, workflowName, additionalContext = {}) {
    try {
      const issueTitle = `🚨 Security Workflow Error: ${workflowName}`;
      const issueBody = this.buildErrorIssueBody(error, workflowName, additionalContext);

      // Check for existing error issues
      const { data: existingIssues } = await this.github.rest.issues.listForRepo({
        owner: this.context.repo.owner,
        repo: this.context.repo.repo,
        labels: ['workflow-error', 'security-dashboard'],
        state: 'open'
      });

      const existingIssue = existingIssues.find(issue => 
        issue.title.includes(workflowName)
      );

      if (existingIssue) {
        // Update existing issue
        await this.github.rest.issues.createComment({
          owner: this.context.repo.owner,
          repo: this.context.repo.repo,
          issue_number: existingIssue.number,
          body: `## 🔄 New Error Occurrence\n\n${issueBody}\n\n---\n*Updated: ${new Date().toUTCString()}*`
        });
        this.logger.info(`Updated existing error issue #${existingIssue.number}`);
      } else {
        // Create new issue
        const newIssue = await this.github.rest.issues.create({
          owner: this.context.repo.owner,
          repo: this.context.repo.repo,
          title: issueTitle,
          body: issueBody,
          labels: ['workflow-error', 'security-dashboard', 'bug']
        });
        this.logger.info(`Created new error issue #${newIssue.data.number}`);
      }
    } catch (notificationError) {
      this.logger.error('Failed to create error notification', notificationError);
    }
  }

  /**
   * Build error issue body with context
   */
  buildErrorIssueBody(error, workflowName, additionalContext) {
    return `## 🚨 Workflow Error Report

**Workflow:** ${workflowName}
**Error Time:** ${new Date().toUTCString()}
**Run ID:** ${this.context.runId}
**Run Number:** ${this.context.runNumber}

### Error Details
\`\`\`
${error.message || error}
\`\`\`

### Stack Trace
\`\`\`
${error.stack || 'No stack trace available'}
\`\`\`

### Additional Context
${Object.keys(additionalContext).length ? 
  Object.entries(additionalContext)
    .map(([key, value]) => `- **${key}:** ${JSON.stringify(value)}`)
    .join('\n') : 
  'No additional context provided'}

### Workflow Information
- **Repository:** ${this.context.repo.owner}/${this.context.repo.repo}
- **Branch:** ${this.context.ref}
- **Actor:** ${this.context.actor}
- **Event:** ${this.context.eventName}

### Quick Links
- [View Workflow Run](https://github.com/${this.context.repo.owner}/${this.context.repo.repo}/actions/runs/${this.context.runId})
- [View Workflow File](https://github.com/${this.context.repo.owner}/${this.context.repo.repo}/blob/main/.github/workflows/trivy-codeql-dashboard.yml)

### Recommended Actions
1. Check the workflow logs for detailed error information
2. Verify that all required secrets and permissions are properly configured
3. Ensure external services (GitHub API, security tools) are accessible
4. Review recent changes that might have affected the workflow

---
*This issue was automatically created by the security workflow error notification system.*`;
  }
}

/**
 * Validation utilities
 */
class ValidationHelper {
  /**
   * Validate file exists and has minimum size
   */
  static async validateFile(filePath, minSize = 100) {
    const fs = require('fs');
    try {
      const stats = await fs.promises.stat(filePath);
      if (stats.size < minSize) {
        throw new Error(`File ${filePath} is too small (${stats.size} bytes, minimum ${minSize})`);
      }
      return { valid: true, size: stats.size };
    } catch (error) {
      throw new Error(`File validation failed for ${filePath}: ${error.message}`);
    }
  }

  /**
   * Validate HTML content structure
   */
  static validateHtmlContent(content) {
    // Basic HTML validation
    if (!content.includes('<!DOCTYPE html>')) {
      throw new Error('Invalid HTML: Missing DOCTYPE declaration');
    }
    if (!content.includes('<html>') || !content.includes('</html>')) {
      throw new Error('Invalid HTML: Missing html tags');
    }
    if (!content.includes('<head>') || !content.includes('</head>')) {
      throw new Error('Invalid HTML: Missing head section');
    }
    if (!content.includes('<body>') || !content.includes('</body>')) {
      throw new Error('Invalid HTML: Missing body section');
    }
    return true;
  }

  /**
   * Generate checksum for content
   */
  static generateChecksum(content) {
    return crypto.createHash('sha256').update(content).digest('hex');
  }
}

/**
 * Change detection utility
 */
class ChangeDetector {
  constructor(github, context, logger) {
    this.github = github;
    this.context = context;
    this.logger = logger;
  }

  /**
   * Check if there are new security scan results since last dashboard generation
   */
  async hasNewSecurityData(hoursThreshold = 24) {
    try {
      const since = new Date(Date.now() - hoursThreshold * 60 * 60 * 1000).toISOString();
      
      // Check for recent workflow runs
      const { data: workflowRuns } = await this.github.rest.actions.listWorkflowRunsForRepo({
        owner: this.context.repo.owner,
        repo: this.context.repo.repo,
        per_page: 100,
        created: `>${since}`
      });

      // Filter security-related workflows
      const securityRuns = workflowRuns.workflow_runs.filter(run => 
        run.name.includes('Trivy') || 
        run.name.includes('CodeQL') || 
        run.name.includes('Security')
      );

      // Check for any completed security runs
      const completedSecurityRuns = securityRuns.filter(run => 
        run.status === 'completed' && run.conclusion !== 'cancelled'
      );

      this.logger.info('Change detection results', {
        totalRuns: workflowRuns.workflow_runs.length,
        securityRuns: securityRuns.length,
        completedSecurityRuns: completedSecurityRuns.length,
        hoursThreshold
      });

      return completedSecurityRuns.length > 0;
    } catch (error) {
      this.logger.warn('Failed to detect changes, proceeding with dashboard generation', error);
      return true; // Fail open - generate dashboard if we can't detect changes
    }
  }

  /**
   * Check if security configuration files have changed
   */
  async hasConfigurationChanges(paths = ['.github/workflows/', 'scripts/security-', '.github/scripts/']) {
    try {
      // Check recent commits for security-related file changes
      const { data: commits } = await this.github.rest.repos.listCommits({
        owner: this.context.repo.owner,
        repo: this.context.repo.repo,
        per_page: 10,
        since: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
      });

      for (const commit of commits) {
        const { data: commitDetails } = await this.github.rest.repos.getCommit({
          owner: this.context.repo.owner,
          repo: this.context.repo.repo,
          ref: commit.sha
        });

        const changedFiles = commitDetails.files || [];
        const hasSecurityChanges = changedFiles.some(file => 
          paths.some(path => file.filename.includes(path))
        );

        if (hasSecurityChanges) {
          this.logger.info('Security configuration changes detected', {
            commit: commit.sha,
            changedFiles: changedFiles.map(f => f.filename)
          });
          return true;
        }
      }

      return false;
    } catch (error) {
      this.logger.warn('Failed to check configuration changes, proceeding with dashboard generation', error);
      return true; // Fail open
    }
  }
}

module.exports = {
  WorkflowLogger,
  PerformanceTracker,
  RetryHelper,
  ErrorNotifier,
  ValidationHelper,
  ChangeDetector
};