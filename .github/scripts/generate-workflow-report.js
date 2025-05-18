/**
 * generate-workflow-report.js
 *
 * This script collects recent workflow run data from the GitHub API and saves a JSON report.
 * It is designed for use as an ESModule in GitHub Actions or node environments.
 *
 * Usage:
 *   import generateWorkflowReport from './.github/scripts/generate-workflow-report.js';
 *   await generateWorkflowReport({ github, context });
 */

import fs from 'fs/promises';
import { Octokit } from '@octokit/rest';

/**
 * Generates a report of recent workflow runs and saves it as a JSON file.
 * @param {object} options - The options object, expects context.repo and a GITHUB_TOKEN in env.
 */
export default async function generateWorkflowReport({ context }) {
  // Create an authenticated Octokit instance with the GITHUB_TOKEN
  const octokit = new Octokit({
    auth: process.env.GITHUB_TOKEN,
  });

  // Extract owner and repo from context
  const { owner, repo } = context.repo;

  // Fetch workflow runs from GitHub Actions API
  const workflows = await octokit.actions.listWorkflowRunsForRepo({
    owner,
    repo,
    per_page: 10,
  });

  // Build a report object with relevant run metadata
  const report = {
    timestamp: new Date().toISOString(),
    workflows: workflows.data.workflow_runs.map(run => ({
      name: run.name,
      status: run.status,
      conclusion: run.conclusion,
      url: run.html_url,
    })),
  };

  // Ensure output directory exists and save the report as JSON
  const reportsDir = './workflow-reports';
  await fs.mkdir(reportsDir, { recursive: true });
  await fs.writeFile(`${reportsDir}/latest.json`, JSON.stringify(report, null, 2), 'utf8');
}