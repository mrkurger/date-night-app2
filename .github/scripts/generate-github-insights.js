/**
 * GitHub Insights Report Generator
 *
 * This script fetches data from the GitHub API and generates two markdown reports:
 * 1. A detailed insights report with repository information, workflow runs, security alerts, PRs, and issues
 * 2. A summary file for AI analysis with key metrics
 *
 * Usage: node generate-github-insights.js
 *
 * Environment variables:
 * - GITHUB_TOKEN: GitHub token with appropriate permissions
 * - GITHUB_REPOSITORY: Repository in format "owner/repo"
 */

import fs from 'fs/promises';
import { Octokit } from '@octokit/rest';

async function generateInsightsReport() {
  try {
    // Initialize Octokit with GitHub token
    const octokit = new Octokit({ auth: process.env.GITHUB_TOKEN || process.env.WORKFLOW_TOKEN });

    // Parse repository owner and name
    const [owner, repo] = process.env.GITHUB_REPOSITORY.split('/');
    const date = new Date().toISOString().split('T')[0];

    let report = `# GitHub Insights Report\n\n`;
    report += `*Generated on: ${date}*\n\n`;

    // Initialize variables to store API results
    let repoInfo;
    let workflowRuns;
    let dependabotAlerts = null;
    let pullRequests;
    let issues;

    try {
      // Get repository info
      repoInfo = await octokit.repos.get({
        owner,
        repo,
      });

      report += `## Repository Information\n\n`;
      report += `- **Name**: ${repoInfo.data.name}\n`;
      report += `- **Description**: ${repoInfo.data.description || 'No description'}\n`;
      report += `- **Stars**: ${repoInfo.data.stargazers_count}\n`;
      report += `- **Forks**: ${repoInfo.data.forks_count}\n`;
      report += `- **Open Issues**: ${repoInfo.data.open_issues_count}\n`;
      report += `- **Default Branch**: ${repoInfo.data.default_branch}\n\n`;
    } catch (error) {
      console.log(`Error fetching repository info: ${error.message}`);
      report += `## Repository Information\n\n`;
      report += `- **Name**: ${repo}\n`;
      report += `- **Owner**: ${owner}\n`;
      report += `- **Error**: Unable to fetch complete repository information\n\n`;
    }

    try {
      // Get workflow runs
      workflowRuns = await octokit.actions.listWorkflowRunsForRepo({
        owner,
        repo,
        per_page: 10,
      });

      report += `## Recent Workflow Runs\n\n`;
      report += `| Workflow | Status | Started | Duration |\n`;
      report += `|----------|--------|---------|----------|\n`;

      for (const run of workflowRuns.data.workflow_runs.slice(0, 5)) {
        const startTime = new Date(run.created_at);
        const endTime = run.updated_at ? new Date(run.updated_at) : new Date();
        const durationMs = endTime - startTime;
        const durationMin = Math.floor(durationMs / 60000);
        const durationSec = Math.floor((durationMs % 60000) / 1000);

        report += `| ${run.name} | ${run.conclusion || run.status} | ${startTime.toISOString().split('T')[0]} | ${durationMin}m ${durationSec}s |\n`;
      }

      report += `\n`;
    } catch (error) {
      console.log(`Error fetching workflow runs: ${error.message}`);
      report += `## Recent Workflow Runs\n\n`;
      report += `Unable to fetch workflow runs: ${error.message}\n\n`;
    }

    // Get Dependabot alerts
    try {
      dependabotAlerts = await octokit.dependabot.listAlertsForRepo({
        owner,
        repo,
        state: 'open',
        per_page: 100,
      });

      report += `## Dependabot Security Alerts\n\n`;

      if (dependabotAlerts.data.length === 0) {
        report += `✅ No open security alerts found.\n\n`;
      } else {
        report += `### Open Alerts (${dependabotAlerts.data.length})\n\n`;

        const severityOrder = ['critical', 'high', 'medium', 'low'];
        const alertsBySeverity = {};

        severityOrder.forEach(severity => {
          alertsBySeverity[severity] = [];
        });

        dependabotAlerts.data.forEach(alert => {
          const severity = alert.security_advisory.severity.toLowerCase();
          if (alertsBySeverity[severity]) {
            alertsBySeverity[severity].push(alert);
          }
        });

        severityOrder.forEach(severity => {
          const severityAlerts = alertsBySeverity[severity];
          if (severityAlerts.length > 0) {
            report += `#### ${severity.charAt(0).toUpperCase() + severity.slice(1)} Severity (${severityAlerts.length})\n\n`;

            severityAlerts.forEach(alert => {
              report += `- **${alert.security_advisory.summary}** in \`${alert.dependency.package.name}\`\n`;
            });

            report += `\n`;
          }
        });
      }
    } catch (error) {
      console.log(`Error fetching security alerts: ${error.message}`);
      report += `## Dependabot Security Alerts\n\n`;
      report += `⚠️ Unable to fetch security alerts: ${error.message}\n\n`;
    }

    try {
      // Get recent pull requests
      pullRequests = await octokit.pulls.list({
        owner,
        repo,
        state: 'all',
        sort: 'updated',
        direction: 'desc',
        per_page: 5,
      });

      report += `## Recent Pull Requests\n\n`;

      if (pullRequests.data.length === 0) {
        report += `No recent pull requests found.\n\n`;
      } else {
        report += `| Title | Status | Author | Updated |\n`;
        report += `|-------|--------|--------|--------|\n`;

        pullRequests.data.forEach(pr => {
          const status = pr.state === 'open' ? '🔄 Open' : pr.merged_at ? '✅ Merged' : '❌ Closed';
          report += `| [#${pr.number}: ${pr.title}](${pr.html_url}) | ${status} | ${pr.user.login} | ${new Date(pr.updated_at).toISOString().split('T')[0]} |\n`;
        });

        report += `\n`;
      }
    } catch (error) {
      console.log(`Error fetching pull requests: ${error.message}`);
      report += `## Recent Pull Requests\n\n`;
      report += `Unable to fetch pull requests: ${error.message}\n\n`;
    }

    try {
      // Get recent issues
      issues = await octokit.issues.listForRepo({
        owner,
        repo,
        state: 'all',
        sort: 'updated',
        direction: 'desc',
        per_page: 5,
      });

      const issuesOnly = issues.data.filter(issue => !issue.pull_request);

      report += `## Recent Issues\n\n`;

      if (issuesOnly.length === 0) {
        report += `No recent issues found.\n\n`;
      } else {
        report += `| Title | Status | Author | Updated |\n`;
        report += `|-------|--------|--------|--------|\n`;

        issuesOnly.forEach(issue => {
          const status = issue.state === 'open' ? '🔄 Open' : '✅ Closed';
          report += `| [#${issue.number}: ${issue.title}](${issue.html_url}) | ${status} | ${issue.user.login} | ${new Date(issue.updated_at).toISOString().split('T')[0]} |\n`;
        });

        report += `\n`;
      }
    } catch (error) {
      console.log(`Error fetching issues: ${error.message}`);
      report += `## Recent Issues\n\n`;
      report += `Unable to fetch issues: ${error.message}\n\n`;
    }

    // Create directory if it doesn't exist
    try {
      fs.mkdirSync('downloaded-reports/github-insights', { recursive: true });
    } catch (error) {
      console.log('Directory already exists');
    }

    // Write report to file
    fs.writeFileSync('downloaded-reports/github-insights/insights-report.md', report);

    // Create a summary file for AI analysis
    const aiSummary =
      `# GitHub Insights for AI Analysis\n\n` +
      `*Generated on: ${date}*\n\n` +
      `This file contains structured data from GitHub that can be analyzed by AI assistants to provide insights and recommendations for the project.\n\n` +
      `## Repository Stats\n\n` +
      `- Stars: ${repoInfo?.data?.stargazers_count || 'Unknown'}\n` +
      `- Forks: ${repoInfo?.data?.forks_count || 'Unknown'}\n` +
      `- Open Issues: ${repoInfo?.data?.open_issues_count || 'Unknown'}\n` +
      `- Watchers: ${repoInfo?.data?.subscribers_count || 'Unknown'}\n\n` +
      `## Workflow Status\n\n` +
      (workflowRuns?.data
        ? workflowRuns.data.workflow_runs
            .slice(0, 10)
            .map(run => `- ${run.name}: ${run.conclusion || run.status}`)
            .join('\n')
        : 'Unable to fetch workflow status') +
      `\n\n## Security Alerts\n\n` +
      (dependabotAlerts?.data
        ? `Total Open Alerts: ${dependabotAlerts.data.length}\n` +
          ['critical', 'high', 'medium', 'low']
            .map(severity => {
              const alertsForSeverity = dependabotAlerts.data.filter(
                alert => alert.security_advisory.severity.toLowerCase() === severity
              );
              return `- ${severity}: ${alertsForSeverity.length || 0}`;
            })
            .join('\n')
        : 'Unable to fetch security alerts') +
      `\n\n## Recent Activity\n\n` +
      `- Pull Requests: ${pullRequests?.data?.length || 'Unknown'} recent updates\n` +
      `- Issues: ${issues?.data?.filter(issue => !issue.pull_request)?.length || 'Unknown'} recent updates\n`;

    fs.writeFileSync('downloaded-reports/github-insights/ai-analysis-data.md', aiSummary);

    console.log('GitHub insights report generated successfully');
    return true;
  } catch (error) {
    console.error('Error generating GitHub insights report:', error);
    return false;
  }
}

// Execute the function if this script is run directly
if (require.main === module) {
  generateInsightsReport();
}

// Export the function for use in other scripts
export default { generateInsightsReport };
