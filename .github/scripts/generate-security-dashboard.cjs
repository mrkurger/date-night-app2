/**
 * Security Dashboard Generator
 * 
 * Generates a comprehensive security dashboard combining Trivy and CodeQL results
 * with enhanced error handling, performance monitoring, and validation.
 * 
 * @author Security Workflow Enhancement
 * @created 2025-01-21
 */

const { Octokit } = require('@octokit/rest');
const fs = require('fs');
const path = require('path');
const {
  WorkflowLogger,
  PerformanceTracker,
  RetryHelper,
  ErrorNotifier,
  ValidationHelper,
  ChangeDetector
} = require('./security-workflow-utils.cjs');

class SecurityDashboardGenerator {
  constructor(githubToken, context) {
    this.octokit = new Octokit({ auth: githubToken });
    this.context = context;
    this.logger = new WorkflowLogger('SecurityDashboard');
    this.performance = new PerformanceTracker();
    this.errorNotifier = new ErrorNotifier(this.octokit, context, this.logger);
    this.changeDetector = new ChangeDetector(this.octokit, context, this.logger);
    
    this.owner = context.repo.owner;
    this.repo = context.repo.repo;
  }

  /**
   * Main method to generate the security dashboard
   */
  async generateDashboard(options = {}) {
    this.performance.start('total_generation');
    this.logger.info('Starting security dashboard generation', { 
      repository: `${this.owner}/${this.repo}`,
      runId: this.context.runId,
      options 
    });

    try {
      // Step 1: Check if generation is needed
      if (options.skipIfNoChanges !== false) {
        await this.checkIfGenerationNeeded();
      }

      // Step 2: Fetch security data
      const securityData = await this.fetchSecurityData();

      // Step 3: Generate dashboard HTML
      const dashboardHtml = await this.generateDashboardHtml(securityData);

      // Step 4: Save and validate dashboard
      await this.saveDashboard(dashboardHtml);

      // Step 5: Generate summary
      const summary = await this.generateSummary(securityData);

      const totalTime = this.performance.stop('total_generation');
      this.logger.logPerformance('Dashboard generation', totalTime);
      this.logger.info('Security dashboard generated successfully', {
        fileSize: dashboardHtml.length,
        totalTime
      });

      return {
        success: true,
        summary,
        metrics: {
          totalTime,
          fileSize: dashboardHtml.length
        }
      };

    } catch (error) {
      const totalTime = this.performance.stop('total_generation');
      this.logger.error('Dashboard generation failed', error, {
        totalTime,
        repository: `${this.owner}/${this.repo}`
      });

      // Send error notification
      await this.errorNotifier.notifyError(error, 'Security Dashboard Generation', {
        repository: `${this.owner}/${this.repo}`,
        runId: this.context.runId,
        totalTime
      });

      throw error;
    }
  }

  /**
   * Check if dashboard generation is needed
   */
  async checkIfGenerationNeeded() {
    this.performance.start('change_detection');
    this.logger.info('Checking if dashboard generation is needed');

    try {
      const hasNewData = await this.changeDetector.hasNewSecurityData(24);
      const hasConfigChanges = await this.changeDetector.hasConfigurationChanges();

      const shouldGenerate = hasNewData || hasConfigChanges;

      this.logger.info('Change detection completed', {
        hasNewData,
        hasConfigChanges,
        shouldGenerate
      });

      if (!shouldGenerate) {
        this.logger.info('No new security data or configuration changes detected, skipping generation');
        throw new Error('SKIP_GENERATION: No changes detected');
      }

    } finally {
      const duration = this.performance.stop('change_detection');
      this.logger.logPerformance('Change detection', duration);
    }
  }

  /**
   * Fetch security data from GitHub API
   */
  async fetchSecurityData() {
    this.performance.start('data_fetch');
    this.logger.info('Fetching security data from GitHub API');

    try {
      // Fetch recent workflow runs with retry
      const workflowRuns = await RetryHelper.retry(async () => {
        const { data } = await this.octokit.actions.listWorkflowRunsForRepo({
          owner: this.owner,
          repo: this.repo,
          per_page: 100,
          status: 'completed'
        });
        return data.workflow_runs;
      }, 3, 1000, this.logger);

      // Filter security-related workflows
      const trivyRuns = workflowRuns.filter(run => 
        run.name.includes('Trivy')
      ).slice(0, 10);

      const codeqlRuns = workflowRuns.filter(run => 
        run.name.includes('CodeQL')
      ).slice(0, 10);

      // Fetch additional security data if available
      const securityAlerts = await this.fetchSecurityAlerts();
      const dependencyData = await this.fetchDependencyData();

      const securityData = {
        trivyRuns,
        codeqlRuns,
        securityAlerts,
        dependencyData,
        fetchedAt: new Date().toISOString(),
        totalRuns: trivyRuns.length + codeqlRuns.length
      };

      this.logger.info('Security data fetched successfully', {
        trivyRuns: trivyRuns.length,
        codeqlRuns: codeqlRuns.length,
        securityAlerts: securityAlerts.length,
        totalRuns: securityData.totalRuns
      });

      return securityData;

    } finally {
      const duration = this.performance.stop('data_fetch');
      this.logger.logPerformance('Data fetch', duration);
    }
  }

  /**
   * Fetch security alerts if available
   */
  async fetchSecurityAlerts() {
    try {
      // Try to fetch Dependabot alerts
      const { data: alerts } = await this.octokit.rest.dependabot.listAlertsForRepo({
        owner: this.owner,
        repo: this.repo,
        per_page: 50
      });
      return alerts;
    } catch (error) {
      this.logger.warn('Could not fetch security alerts (may require GitHub Advanced Security)', error);
      return [];
    }
  }

  /**
   * Fetch dependency data
   */
  async fetchDependencyData() {
    try {
      // Try to fetch dependency graph
      const { data: dependencies } = await this.octokit.rest.dependencyGraph.createRepositorySnapshot({
        owner: this.owner,
        repo: this.repo
      });
      return dependencies;
    } catch (error) {
      this.logger.warn('Could not fetch dependency data', error);
      return null;
    }
  }

  /**
   * Generate dashboard HTML
   */
  async generateDashboardHtml(securityData) {
    this.performance.start('html_generation');
    this.logger.info('Generating dashboard HTML');

    try {
      const { trivyRuns, codeqlRuns, securityAlerts, fetchedAt } = securityData;

      // Calculate metrics
      const totalScans = trivyRuns.length + codeqlRuns.length;
      const recentScans = [...trivyRuns, ...codeqlRuns]
        .filter(run => {
          const runDate = new Date(run.created_at);
          const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
          return runDate > oneDayAgo;
        });

      const successRate = totalScans > 0 ? 
        Math.round((trivyRuns.concat(codeqlRuns).filter(run => run.conclusion === 'success').length / totalScans) * 100) : 0;

      const avgScanTime = totalScans > 0 ?
        Math.floor([...trivyRuns, ...codeqlRuns]
          .map(run => (new Date(run.updated_at) - new Date(run.created_at)) / 60000)
          .reduce((a, b) => a + b, 0) / totalScans) : 0;

      // Get last scan time
      const lastScan = [...trivyRuns, ...codeqlRuns]
        .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))[0];
      const hoursSinceLastScan = lastScan ? 
        Math.floor((new Date() - new Date(lastScan.created_at)) / 3600000) : 'N/A';

      const dashboard = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Security Dashboard - ${this.repo}</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      max-width: 1200px;
      margin: 0 auto;
      padding: 20px;
      background: #f6f8fa;
      line-height: 1.6;
    }
    .header {
      background: #24292e;
      color: white;
      padding: 20px;
      border-radius: 6px;
      margin-bottom: 20px;
    }
    .header h1 {
      margin: 0 0 10px 0;
      display: flex;
      align-items: center;
      gap: 10px;
    }
    .card {
      background: white;
      border: 1px solid #e1e4e8;
      border-radius: 6px;
      padding: 20px;
      margin-bottom: 20px;
      box-shadow: 0 1px 3px rgba(0,0,0,0.12);
    }
    .metrics {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 15px;
      margin-bottom: 20px;
    }
    .metric {
      background: #f6f8fa;
      padding: 15px;
      border-radius: 6px;
      text-align: center;
      border-left: 4px solid #0366d6;
    }
    .metric-value {
      font-size: 2em;
      font-weight: bold;
      color: #0366d6;
      margin-bottom: 5px;
    }
    .metric-label {
      color: #586069;
      font-size: 0.9em;
    }
    .status-badge {
      display: inline-block;
      padding: 3px 8px;
      border-radius: 12px;
      font-size: 0.85em;
      font-weight: 600;
      text-transform: capitalize;
    }
    .status-success { background: #d4edda; color: #155724; }
    .status-failure { background: #f8d7da; color: #721c24; }
    .status-cancelled { background: #fff3cd; color: #856404; }
    .status-skipped { background: #e2e3e5; color: #383d41; }
    table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 15px;
    }
    th, td {
      padding: 12px;
      text-align: left;
      border-bottom: 1px solid #e1e4e8;
    }
    th {
      background: #f6f8fa;
      font-weight: 600;
      color: #24292e;
    }
    tr:hover {
      background: #f6f8fa;
    }
    .risk-high { color: #d73a49; font-weight: bold; }
    .risk-medium { color: #f66a0a; font-weight: bold; }
    .risk-low { color: #28a745; font-weight: bold; }
    .alert-banner {
      background: #fff3cd;
      border: 1px solid #ffeaa7;
      border-radius: 6px;
      padding: 15px;
      margin-bottom: 20px;
    }
    .alert-banner.error {
      background: #f8d7da;
      border-color: #f5c6cb;
    }
    .alert-banner.success {
      background: #d4edda;
      border-color: #c3e6cb;
    }
    .footer {
      text-align: center;
      padding: 20px;
      color: #586069;
      font-size: 0.9em;
      border-top: 1px solid #e1e4e8;
      margin-top: 40px;
    }
    .recommendations {
      background: #f1f8ff;
      border-left: 4px solid #0366d6;
      padding: 15px;
      margin: 15px 0;
    }
    .trend-indicator {
      font-size: 0.8em;
      margin-left: 8px;
    }
    .trend-up { color: #d73a49; }
    .trend-down { color: #28a745; }
    .trend-neutral { color: #6c757d; }
  </style>
</head>
<body>
  <div class="header">
    <h1>🔐 Security Dashboard</h1>
    <p><strong>Repository:</strong> ${this.owner}/${this.repo}</p>
    <p><strong>Generated:</strong> ${new Date().toUTCString()}</p>
    <p><strong>Data fetched:</strong> ${new Date(fetchedAt).toUTCString()}</p>
  </div>

  ${this.generateAlertBanner(securityData)}
  
  <div class="card">
    <h2>📊 Security Overview</h2>
    <div class="metrics">
      <div class="metric">
        <div class="metric-value">${recentScans.length}</div>
        <div class="metric-label">Scans (24h)</div>
      </div>
      <div class="metric">
        <div class="metric-value">${trivyRuns[0]?.conclusion || 'None'}</div>
        <div class="metric-label">Latest Trivy</div>
      </div>
      <div class="metric">
        <div class="metric-value">${codeqlRuns[0]?.conclusion || 'None'}</div>
        <div class="metric-label">Latest CodeQL</div>
      </div>
      <div class="metric">
        <div class="metric-value">${hoursSinceLastScan}</div>
        <div class="metric-label">Hours Since Last Scan</div>
      </div>
      <div class="metric">
        <div class="metric-value">${successRate}%</div>
        <div class="metric-label">Success Rate</div>
      </div>
      <div class="metric">
        <div class="metric-value">${avgScanTime}</div>
        <div class="metric-label">Avg Duration (min)</div>
      </div>
    </div>
  </div>

  ${this.generateWorkflowTable('🔄 Recent Trivy Scans', trivyRuns)}
  ${this.generateWorkflowTable('🔍 Recent CodeQL Analyses', codeqlRuns)}
  ${this.generateSecurityAlertsSection(securityAlerts)}
  ${this.generateTrendsSection(securityData)}
  ${this.generateRecommendationsSection(securityData)}

  <div class="footer">
    <p>Dashboard generated by Security Workflow Enhancement System</p>
    <p>Run ID: ${this.context.runId} | Run Number: ${this.context.runNumber}</p>
    <p>Next scheduled update: Daily at 6 AM UTC</p>
  </div>
</body>
</html>`;

      // Validate the generated HTML
      ValidationHelper.validateHtmlContent(dashboard);

      this.logger.info('Dashboard HTML generated successfully', {
        size: dashboard.length,
        totalScans,
        recentScans: recentScans.length,
        successRate
      });

      return dashboard;

    } finally {
      const duration = this.performance.stop('html_generation');
      this.logger.logPerformance('HTML generation', duration);
    }
  }

  /**
   * Generate alert banner based on security status
   */
  generateAlertBanner(securityData) {
    const { trivyRuns, codeqlRuns, securityAlerts } = securityData;
    const recentFailures = [...trivyRuns, ...codeqlRuns]
      .filter(run => run.conclusion === 'failure' && 
        new Date(run.created_at) > new Date(Date.now() - 24 * 60 * 60 * 1000));

    if (recentFailures.length > 0) {
      return `<div class="alert-banner error">
        <strong>⚠️ Alert:</strong> ${recentFailures.length} security scan(s) failed in the last 24 hours. 
        <a href="https://github.com/${this.owner}/${this.repo}/actions">Review workflow runs</a>
      </div>`;
    }

    if (securityAlerts.length > 0) {
      const criticalAlerts = securityAlerts.filter(alert => alert.security_advisory?.severity === 'critical');
      if (criticalAlerts.length > 0) {
        return `<div class="alert-banner error">
          <strong>🚨 Critical Security Alerts:</strong> ${criticalAlerts.length} critical vulnerability alert(s) detected.
          <a href="https://github.com/${this.owner}/${this.repo}/security/dependabot">View alerts</a>
        </div>`;
      }
    }

    return `<div class="alert-banner success">
      <strong>✅ All Clear:</strong> No critical security issues detected in recent scans.
    </div>`;
  }

  /**
   * Generate workflow table section
   */
  generateWorkflowTable(title, runs) {
    if (runs.length === 0) {
      return `<div class="card">
        <h2>${title}</h2>
        <p>No recent scans found.</p>
      </div>`;
    }

    return `<div class="card">
      <h2>${title}</h2>
      <table>
        <thead>
          <tr>
            <th>Date</th>
            <th>Branch</th>
            <th>Status</th>
            <th>Duration</th>
            <th>Commit</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          ${runs.map(run => `
            <tr>
              <td>${new Date(run.created_at).toLocaleDateString()} ${new Date(run.created_at).toLocaleTimeString()}</td>
              <td><code>${run.head_branch}</code></td>
              <td><span class="status-badge status-${run.conclusion}">${run.conclusion || 'pending'}</span></td>
              <td>${Math.floor((new Date(run.updated_at) - new Date(run.created_at)) / 60000)} min</td>
              <td><code title="${run.head_sha}">${run.head_sha.substring(0, 7)}</code></td>
              <td><a href="${run.html_url}" target="_blank">View Run</a></td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>`;
  }

  /**
   * Generate security alerts section
   */
  generateSecurityAlertsSection(alerts) {
    if (alerts.length === 0) {
      return `<div class="card">
        <h2>🔒 Security Alerts</h2>
        <p>No security alerts detected. Great job! 🎉</p>
      </div>`;
    }

    const criticalAlerts = alerts.filter(alert => alert.security_advisory?.severity === 'critical');
    const highAlerts = alerts.filter(alert => alert.security_advisory?.severity === 'high');
    const mediumAlerts = alerts.filter(alert => alert.security_advisory?.severity === 'medium');

    return `<div class="card">
      <h2>🔒 Security Alerts</h2>
      <div class="metrics">
        <div class="metric">
          <div class="metric-value risk-high">${criticalAlerts.length}</div>
          <div class="metric-label">Critical</div>
        </div>
        <div class="metric">
          <div class="metric-value risk-medium">${highAlerts.length}</div>
          <div class="metric-label">High</div>
        </div>
        <div class="metric">
          <div class="metric-value risk-low">${mediumAlerts.length}</div>
          <div class="metric-label">Medium</div>
        </div>
      </div>
      ${alerts.length > 0 ? `
        <p><a href="https://github.com/${this.owner}/${this.repo}/security/dependabot">View all security alerts →</a></p>
      ` : ''}
    </div>`;
  }

  /**
   * Generate trends section
   */
  generateTrendsSection(securityData) {
    const { trivyRuns, codeqlRuns } = securityData;
    const allRuns = [...trivyRuns, ...codeqlRuns];

    return `<div class="card">
      <h2>📈 Security Trends</h2>
      <ul>
        <li><strong>Total scans (7 days):</strong> ${allRuns.length}</li>
        <li><strong>Average scan duration:</strong> ${
          allRuns.length > 0 ? 
          Math.floor(allRuns.map(run => (new Date(run.updated_at) - new Date(run.created_at)) / 60000)
            .reduce((a, b) => a + b, 0) / allRuns.length) : 0
        } minutes</li>
        <li><strong>Success rate:</strong> ${
          allRuns.length > 0 ? 
          Math.floor(allRuns.filter(run => run.conclusion === 'success').length / allRuns.length * 100) : 0
        }%</li>
        <li><strong>Most active branch:</strong> ${this.getMostActiveBranch(allRuns)}</li>
      </ul>
    </div>`;
  }

  /**
   * Generate recommendations section
   */
  generateRecommendationsSection(securityData) {
    const recommendations = this.generateSmartRecommendations(securityData);

    return `<div class="card">
      <h2>🎯 Recommendations</h2>
      <div class="recommendations">
        ${recommendations.map(rec => `<p><strong>${rec.priority}:</strong> ${rec.action}</p>`).join('')}
      </div>
    </div>`;
  }

  /**
   * Generate smart recommendations based on data
   */
  generateSmartRecommendations(securityData) {
    const { trivyRuns, codeqlRuns, securityAlerts } = securityData;
    const allRuns = [...trivyRuns, ...codeqlRuns];
    const recommendations = [];

    // Check for failures
    const recentFailures = allRuns.filter(run => 
      run.conclusion === 'failure' && 
      new Date(run.created_at) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
    );

    if (recentFailures.length > allRuns.length * 0.3) {
      recommendations.push({
        priority: 'HIGH',
        action: 'High failure rate detected. Review workflow configurations and fix failing security scans.'
      });
    }

    // Check for missing scans
    if (trivyRuns.length === 0) {
      recommendations.push({
        priority: 'MEDIUM',
        action: 'No Trivy scans found. Enable dependency vulnerability scanning with Trivy.'
      });
    }

    if (codeqlRuns.length === 0) {
      recommendations.push({
        priority: 'MEDIUM',
        action: 'No CodeQL scans found. Enable static code analysis with CodeQL.'
      });
    }

    // Check for old scans
    const lastScan = allRuns.sort((a, b) => new Date(b.created_at) - new Date(a.created_at))[0];
    if (lastScan) {
      const hoursSince = Math.floor((new Date() - new Date(lastScan.created_at)) / 3600000);
      if (hoursSince > 48) {
        recommendations.push({
          priority: 'MEDIUM',
          action: `Last security scan was ${hoursSince} hours ago. Consider more frequent scanning.`
        });
      }
    }

    // Security alerts recommendations
    if (securityAlerts.length > 0) {
      const criticalAlerts = securityAlerts.filter(alert => alert.security_advisory?.severity === 'critical');
      if (criticalAlerts.length > 0) {
        recommendations.push({
          priority: 'CRITICAL',
          action: `${criticalAlerts.length} critical security alert(s) require immediate attention.`
        });
      }
    }

    // Default recommendations if no issues
    if (recommendations.length === 0) {
      recommendations.push(
        {
          priority: 'LOW',
          action: 'Enable branch protection rules to require security scans before merging'
        },
        {
          priority: 'LOW',
          action: 'Consider upgrading to GitHub Advanced Security for enhanced features'
        },
        {
          priority: 'LOW',
          action: 'Keep dependencies updated to minimize vulnerability exposure'
        }
      );
    }

    return recommendations;
  }

  /**
   * Get most active branch from runs
   */
  getMostActiveBranch(runs) {
    if (runs.length === 0) return 'N/A';
    
    const branchCounts = {};
    runs.forEach(run => {
      branchCounts[run.head_branch] = (branchCounts[run.head_branch] || 0) + 1;
    });

    return Object.entries(branchCounts)
      .sort(([,a], [,b]) => b - a)[0][0];
  }

  /**
   * Save dashboard to file system
   */
  async saveDashboard(dashboardHtml) {
    this.performance.start('file_save');
    this.logger.info('Saving dashboard to file system');

    try {
      // Create directory if it doesn't exist
      const dashboardDir = path.join(process.cwd(), 'security-dashboard');
      if (!fs.existsSync(dashboardDir)) {
        fs.mkdirSync(dashboardDir, { recursive: true });
      }

      // Write dashboard file
      const dashboardPath = path.join(dashboardDir, 'index.html');
      await fs.promises.writeFile(dashboardPath, dashboardHtml, 'utf8');

      // Validate saved file
      const validation = await ValidationHelper.validateFile(dashboardPath, 1000);
      
      // Generate checksum
      const checksum = ValidationHelper.generateChecksum(dashboardHtml);
      const checksumPath = path.join(dashboardDir, 'checksum.txt');
      await fs.promises.writeFile(checksumPath, checksum, 'utf8');

      this.logger.info('Dashboard saved successfully', {
        path: dashboardPath,
        size: validation.size,
        checksum: checksum.substring(0, 16) + '...'
      });

    } finally {
      const duration = this.performance.stop('file_save');
      this.logger.logPerformance('File save', duration);
    }
  }

  /**
   * Generate workflow summary
   */
  async generateSummary(securityData) {
    const { trivyRuns, codeqlRuns, securityAlerts, totalRuns } = securityData;
    
    let summary = `# 🔐 Security Dashboard Summary\n\n`;
    summary += `**Generated:** ${new Date().toUTCString()}\n`;
    summary += `**Repository:** ${this.owner}/${this.repo}\n\n`;
    
    summary += `## 📊 Quick Stats\n\n`;
    summary += `- **Total Security Scans:** ${totalRuns}\n`;
    summary += `- **Latest Trivy Scan:** ${trivyRuns[0]?.conclusion || 'No recent scans'}\n`;
    summary += `- **Latest CodeQL Scan:** ${codeqlRuns[0]?.conclusion || 'No recent scans'}\n`;
    summary += `- **Security Alerts:** ${securityAlerts.length}\n\n`;

    // Add recent activity
    summary += `## 🔄 Recent Activity\n\n`;
    if (trivyRuns.length > 0) {
      summary += `### Trivy Scans\n`;
      trivyRuns.slice(0, 3).forEach(run => {
        summary += `- ${new Date(run.created_at).toLocaleString()} - ${run.head_branch} - ${run.conclusion}\n`;
      });
      summary += '\n';
    }

    if (codeqlRuns.length > 0) {
      summary += `### CodeQL Analyses\n`;
      codeqlRuns.slice(0, 3).forEach(run => {
        summary += `- ${new Date(run.created_at).toLocaleString()} - ${run.head_branch} - ${run.conclusion}\n`;
      });
      summary += '\n';
    }

    // Add smart recommendations
    const recommendations = this.generateSmartRecommendations(securityData);
    summary += `## 🎯 Recommendations\n\n`;
    recommendations.forEach(rec => {
      summary += `- **${rec.priority}:** ${rec.action}\n`;
    });

    return summary;
  }
}

module.exports = SecurityDashboardGenerator;