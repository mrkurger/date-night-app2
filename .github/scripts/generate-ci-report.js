/**
 * generate-ci-report.js
 * 
 * This script generates a summary markdown report of recent CI runs and their status.
 * It fetches workflow runs and highlights failures and durations for CI visibility.
 * 
 * Usage: node .github/scripts/generate-ci-report.js
 */

import fs from 'fs/promises';
import { Octokit } from '@octokit/rest';

/**
 * Generates CI summary markdown for the given repo.
 * @param {object} options - { owner, repo }
 */
export default async function generateCIReport({ owner, repo }) {
  try {
    const octokit = new Octokit({ auth: process.env.GITHUB_TOKEN });
    const runs = await octokit.actions.listWorkflowRunsForRepo({
      owner,
      repo,
      per_page: 10
    });
    let md = `# CI/CD Report for ${owner}/${repo}\n\n| Name | Status | Conclusion | Duration | URL |\n|------|--------|------------|----------|-----|\n`;
    for (const run of runs.data.workflow_runs) {
      const started = new Date(run.created_at);
      const ended = new Date(run.updated_at || started);
      const duration = `${Math.floor((ended - started)/60000)}m ${(Math.floor((ended - started)/1000)%60)}s`;
      md += `| ${run.name} | ${run.status} | ${run.conclusion} | ${duration} | [View Run](${run.html_url}) |\n`;
    }
    await fs.mkdir('ci-reports', { recursive: true });
    await fs.writeFile('ci-reports/latest.md', md, 'utf8');
    console.log('[generateCIReport] CI report generated at ci-reports/latest.md');
  } catch (err) {
    console.error('[generateCIReport] Failed:', err);
  }
}