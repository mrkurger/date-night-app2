/**
 * handle-workflow-errors.js
 *
 * This script processes a GitHub workflow_run event payload and writes a detailed error report as a JSON file.
 * It also attempts to extract job/step errors for deeper diagnostics.
 * Usage: import handleError from './.github/scripts/handle-workflow-errors.js'; await handleError(context.payload.workflow_run, context);
 */

import fs from 'node:fs/promises';
import path from 'node:path';
import { Octokit } from '@octokit/rest';

/**
 * Helper to fetch job/step errors from the run using Octokit.
 * @param {object} context - GitHub Actions context (should contain repo and run_id)
 * @returns {Promise<object[]>} Array of failed job/step info, or empty array if unavailable.
 */
async function fetchJobErrors(context) {
  try {
    if (!process.env.GITHUB_TOKEN || !context || !context.repo || !context.run_id) return [];
    const octokit = new Octokit({ auth: process.env.GITHUB_TOKEN });
    const { owner, repo } = context.repo;
    const jobsResp = await octokit.actions.listJobsForWorkflowRun({
      owner,
      repo,
      run_id: context.run_id,
      per_page: 50
    });
    return jobsResp.data.jobs
      .filter(job => job.conclusion === 'failure')
      .map(job => ({
        job_name: job.name,
        status: job.status,
        conclusion: job.conclusion,
        steps: (job.steps || []).filter(step => step.conclusion === 'failure')
      }));
  } catch (err) {
    console.error('[handle-workflow-errors.js] Failed to fetch job errors:', err);
    return [];
  }
}

/**
 * Main handler to process workflow_run payload and save error diagnostics.
 * @param {object} workflowRun - The workflow_run payload.
 * @param {object} context - GitHub Actions context (optional, for job/step error extraction).
 */
export default async function handleError(workflowRun, context = null) {
  // Directory for error logs
  const errorLogsDir = path.resolve(process.cwd(), 'workflow-error-logs');
  await fs.mkdir(errorLogsDir, { recursive: true });

  // File for this error report
  const reportFilename = `error-report-${workflowRun.id}-${workflowRun.run_attempt || 1}.json`;
  const reportPath = path.join(errorLogsDir, reportFilename);

  // Optionally collect job/step errors
  let jobErrors = [];
  if (context) jobErrors = await fetchJobErrors(context);

  // Build error report
  const errorReport = {
    generated_at: new Date().toISOString(),
    workflow: {
      id: workflowRun.id,
      name: workflowRun.name,
      run_number: workflowRun.run_number,
      run_attempt: workflowRun.run_attempt,
      status: workflowRun.status,
      conclusion: workflowRun.conclusion,
      url: workflowRun.html_url,
      event: workflowRun.event,
      actor: workflowRun.actor ? workflowRun.actor.login : null,
      created_at: workflowRun.created_at,
      updated_at: workflowRun.updated_at,
    },
    failed_jobs: jobErrors,
    raw_payload: workflowRun
  };

  await fs.writeFile(reportPath, JSON.stringify(errorReport, null, 2), 'utf8');
  console.log(`[handleError] Error report written to ${reportPath}`);
}