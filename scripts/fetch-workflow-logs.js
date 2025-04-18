#!/usr/bin/env node

/**
 * Workflow Logs Fetcher
 *
 * This script fetches logs from GitHub Actions workflow runs and saves them locally.
 * It properly handles zip files by extracting the text content.
 */

const { Octokit } = require('@octokit/rest');
const fs = require('fs-extra');
const path = require('path');
const AdmZip = require('adm-zip');

async function main() {
  const owner = process.env.REPO_OWNER;
  const repo = process.env.REPO_NAME;
  const logsDir = path.join('workflow-error-logs');

  console.log(`Fetching workflow logs for ${owner}/${repo}`);

  // Create logs directory if it doesn't exist
  await fs.ensureDir(logsDir);

  const octokit = new Octokit({
    auth: process.env.GITHUB_TOKEN,
    request: {
      retries: 3,
      retryAfter: 1,
    },
  });

  // Get all workflows
  const { data: workflows } = await octokit.actions.listRepoWorkflows({
    owner,
    repo,
  });

  // Get recent workflow runs (last 30 days)
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  for (const workflow of workflows.workflows) {
    console.log(`Processing workflow: ${workflow.name} (${workflow.id})`);

    try {
      const { data: runs } = await octokit.actions.listWorkflowRuns({
        owner,
        repo,
        workflow_id: workflow.id,
        created: `>=${thirtyDaysAgo.toISOString().split('T')[0]}`,
      });

      // Process failed runs
      const failedRuns = runs.workflow_runs.filter(
        run =>
          run.conclusion === 'failure' ||
          run.conclusion === 'cancelled' ||
          run.conclusion === 'timed_out'
      );

      console.log(`Found ${failedRuns.length} failed runs for ${workflow.name}`);

      for (const run of failedRuns) {
        const runDate = new Date(run.created_at).toISOString().split('T')[0];
        const workflowDir = path.join(
          logsDir,
          workflow.name.replace(/[^a-zA-Z0-9]/g, '-').toLowerCase()
        );
        const runDir = path.join(workflowDir, `${runDate}_${run.id}`);

        await fs.ensureDir(runDir);

        // Save run metadata
        await fs.writeJson(path.join(runDir, 'metadata.json'), run, { spaces: 2 });

        try {
          // Get jobs for this run
          const { data: jobs } = await octokit.actions.listJobsForWorkflowRun({
            owner,
            repo,
            run_id: run.id,
          });

          // Save jobs metadata
          await fs.writeJson(path.join(runDir, 'jobs.json'), jobs, { spaces: 2 });

          // Process each job
          for (const job of jobs.jobs) {
            if (
              job.conclusion === 'failure' ||
              job.conclusion === 'cancelled' ||
              job.conclusion === 'timed_out'
            ) {
              const jobDir = path.join(
                runDir,
                job.name.replace(/[^a-zA-Z0-9]/g, '-').toLowerCase()
              );
              await fs.ensureDir(jobDir);

              // Save job metadata
              await fs.writeJson(path.join(jobDir, 'job-metadata.json'), job, { spaces: 2 });

              try {
                // Get job logs
                const logs = await octokit.actions.downloadJobLogsForWorkflowRun({
                  owner,
                  repo,
                  job_id: job.id,
                });

                // Check if the response is a zip file (binary data)
                const isZip =
                  Buffer.isBuffer(logs.data) ||
                  (typeof logs.data === 'string' &&
                    logs.data.startsWith('PK') &&
                    logs.headers &&
                    logs.headers['content-type'] === 'application/zip');

                if (isZip) {
                  console.log(`Received zip file for job ${job.name} (${job.id}), extracting...`);

                  // Save the zip file temporarily
                  const zipPath = path.join(jobDir, 'logs.zip');
                  await fs.writeFile(zipPath, logs.data);

                  try {
                    // Extract text from the zip file
                    const zip = new AdmZip(zipPath);
                    const zipEntries = zip.getEntries();

                    // Process each entry in the zip file
                    for (const entry of zipEntries) {
                      if (!entry.isDirectory) {
                        const entryName = entry.entryName;
                        const content = entry.getData().toString('utf8');

                        // Save the extracted content
                        await fs.writeFile(path.join(jobDir, `${entryName}`), content);

                        // If this is the main log file, also save it as logs.txt
                        if (entryName.endsWith('.txt') || entryName.includes('log')) {
                          await fs.writeFile(path.join(jobDir, 'logs.txt'), content);
                        }
                      }
                    }

                    // Remove the temporary zip file
                    await fs.remove(zipPath);
                    console.log(`Successfully extracted logs for job ${job.name} (${job.id})`);
                  } catch (extractError) {
                    console.error(
                      `Error extracting zip for job ${job.id}: ${extractError.message}`
                    );
                    await fs.writeFile(
                      path.join(jobDir, 'extract-error.txt'),
                      `Error extracting zip: ${extractError.message}`
                    );
                  }
                } else {
                  // Save logs directly if not a zip file
                  await fs.writeFile(path.join(jobDir, 'logs.txt'), logs.data);
                  console.log(`Saved logs for job ${job.name} (${job.id})`);
                }
              } catch (error) {
                console.error(`Error fetching logs for job ${job.id}: ${error.message}`);
                await fs.writeFile(
                  path.join(jobDir, 'error.txt'),
                  `Error fetching logs: ${error.message}`
                );
              }
            }
          }
        } catch (error) {
          console.error(`Error processing run ${run.id}: ${error.message}`);
          await fs.writeFile(
            path.join(runDir, 'error.txt'),
            `Error processing run: ${error.message}`
          );
        }
      }
    } catch (error) {
      console.error(`Error processing workflow ${workflow.id}: ${error.message}`);
    }
  }

  // Create summary file
  const summary = {
    timestamp: new Date().toISOString(),
    totalWorkflows: workflows.workflows.length,
    workflowSummary: workflows.workflows.map(w => ({
      name: w.name,
      id: w.id,
      path: w.path,
    })),
  };

  await fs.writeJson(path.join(logsDir, 'summary.json'), summary, { spaces: 2 });
  console.log('Workflow error logs sync completed');
}

main().catch(error => {
  console.error('Error in main process:', error);
  process.exit(1);
});
