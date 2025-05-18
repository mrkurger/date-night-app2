import { Octokit } from '@octokit/rest';
import { writeFileSync, mkdirSync } from 'fs';
import { join } from 'path';
import AdmZip from 'adm-zip';

const octokit = new Octokit({
  auth: process.env.GITHUB_TOKEN,
  request: {
    retries: 3,
    retryAfter: 1
  }
});

/**
 * Fetches workflow run logs from GitHub
 * @param {string} owner - Repository owner
 * @param {string} repo - Repository name
 * @param {string} runId - Workflow run ID
 * @returns {Promise<void>}
 */
async function fetchWorkflowLogs(owner, repo, runId) {
  try {
    console.log(`Fetching logs for workflow run ${runId}...`);

    // Get workflow run details
    const { data: run } = await octokit.actions.getWorkflowRun({
      owner,
      repo,
      run_id: runId
    });

    // Get all jobs for the run
    const { data: { jobs } } = await octokit.actions.listJobsForWorkflowRun({
      owner,
      repo,
      run_id: runId
    });

    // Create directories
    const baseDir = 'workflow-error-logs-temp';
    const runDir = join(baseDir, run.name.replace(/[^a-z0-9-]/gi, '_').toLowerCase());
    mkdirSync(runDir, { recursive: true });

    // Save run metadata
    writeFileSync(
      join(runDir, 'run-metadata.json'),
      JSON.stringify(run, null, 2)
    );

    // Process each job
    for (const job of jobs) {
      const jobDir = join(runDir, job.name.replace(/[^a-z0-9-]/gi, '_').toLowerCase());
      mkdirSync(jobDir, { recursive: true });

      // Save job metadata
      writeFileSync(
        join(jobDir, 'job-metadata.json'),
        JSON.stringify(job, null, 2)
      );

      if (job.conclusion !== 'success') {
        try {
          // Download logs
          const logs = await octokit.actions.downloadJobLogsForWorkflowRun({
            owner,
            repo,
            job_id: job.id
          });

          // Extract and save logs
          const zip = new AdmZip(Buffer.from(logs.data));
          zip.extractAllTo(jobDir, true);

          console.log(`✅ Saved logs for job ${job.name}`);
        } catch (jobError) {
          console.warn(`⚠️ Failed to download logs for job ${job.name}:`, jobError.message);
          writeFileSync(
            join(jobDir, 'download-error.txt'),
            `Failed to download logs: ${jobError.message}\n\nTimestamp: ${new Date().toISOString()}`
          );
        }
      }
    }

    console.log('✅ Workflow logs fetched successfully');
  } catch (error) {
    console.error('❌ Error fetching workflow logs:', error.message);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  const [owner, repo] = process.env.GITHUB_REPOSITORY?.split('/') || [];
  const runId = process.env.WORKFLOW_RUN_ID;

  if (!owner || !repo) {
    console.error('❌ Missing repository information');
    process.exit(1);
  }

  if (!runId) {
    console.error('❌ Missing workflow run ID');
    process.exit(1);
  }

  fetchWorkflowLogs(owner, repo, runId);
}