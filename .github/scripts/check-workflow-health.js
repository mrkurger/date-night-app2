import { Octokit } from '@octokit/rest';
import { writeFileSync } from 'fs';

const octokit = new Octokit({
  auth: process.env.GITHUB_TOKEN,
  request: {
    retries: 3,
    retryAfter: 1
  }
});

/**
 * Checks workflow health and generates a status report
 * @returns {Promise<void>}
 */
async function checkWorkflowHealth() {
  try {
    const [owner, repo] = process.env.GITHUB_REPOSITORY?.split('/') || [];
    
    if (!owner || !repo) {
      throw new Error('Missing repository information');
    }

    console.log('Checking workflow health...');

    // Get all workflows
    const { data: { workflows } } = await octokit.actions.listRepoWorkflows({
      owner,
      repo
    });

    const healthReport = {
      timestamp: new Date().toISOString(),
      workflows: []
    };

    // Check each workflow
    for (const workflow of workflows) {
      console.log(`Analyzing workflow: ${workflow.name}`);

      // Get recent runs
      const { data: { workflow_runs: runs } } = await octokit.actions.listWorkflowRuns({
        owner,
        repo,
        workflow_id: workflow.id,
        per_page: 10
      });

      const stats = {
        name: workflow.name,
        id: workflow.id,
        state: workflow.state,
        totalRuns: runs.length,
        successCount: 0,
        failureCount: 0,
        lastRunStatus: runs[0]?.conclusion || 'unknown',
        lastRunDate: runs[0]?.created_at,
        commonErrors: new Map()
      };

      // Analyze runs
      for (const run of runs) {
        if (run.conclusion === 'success') {
          stats.successCount++;
        } else if (run.conclusion === 'failure') {
          stats.failureCount++;
          
          // Get run details
          const { data: { jobs } } = await octokit.actions.listJobsForWorkflowRun({
            owner,
            repo,
            run_id: run.id
          });

          // Analyze failed jobs
          for (const job of jobs) {
            if (job.conclusion === 'failure') {
              const errorKey = `${job.name}: ${job.steps?.find(s => s.conclusion === 'failure')?.name || 'Unknown Step'}`;
              stats.commonErrors.set(
                errorKey,
                (stats.commonErrors.get(errorKey) || 0) + 1
              );
            }
          }
        }
      }

      // Convert Map to array for JSON serialization
      stats.commonErrors = Array.from(stats.commonErrors.entries())
        .map(([error, count]) => ({ error, count }))
        .sort((a, b) => b.count - a.count);

      healthReport.workflows.push(stats);
    }

    // Generate report
    const report = generateHealthReport(healthReport);
    writeFileSync('workflow-health-report.md', report);
    
    // Also save raw data
    writeFileSync('workflow-health-data.json', JSON.stringify(healthReport, null, 2));

    console.log('✅ Health check complete. Reports generated.');
  } catch (error) {
    console.error('❌ Error checking workflow health:', error.message);
    process.exit(1);
  }
}

/**
 * Generates a markdown report from health check data
 * @param {Object} data - Health check data
 * @returns {string} Markdown report
 */
function generateHealthReport(data) {
  let report = '# Workflow Health Report\n\n';
  report += `Generated on: ${data.timestamp}\n\n`;
  
  // Summary section
  report += '## Summary\n\n';
  const totalFailures = data.workflows.reduce((sum, wf) => sum + wf.failureCount, 0);
  report += `- Total workflows: ${data.workflows.length}\n`;
  report += `- Workflows with recent failures: ${data.workflows.filter(w => w.failureCount > 0).length}\n`;
  report += `- Total failures in recent runs: ${totalFailures}\n\n`;
  
  // Individual workflow reports
  report += '## Workflow Details\n\n';
  for (const workflow of data.workflows) {
    report += `### ${workflow.name}\n\n`;
    report += `- State: ${workflow.state}\n`;
    report += `- Success rate: ${((workflow.successCount / workflow.totalRuns) * 100).toFixed(1)}%\n`;
    report += `- Last run: ${workflow.lastRunStatus} (${workflow.lastRunDate})\n\n`;
    
    if (workflow.commonErrors.length > 0) {
      report += '#### Common Errors:\n';
      workflow.commonErrors.forEach(({ error, count }) => {
        report += `- ${error}: ${count} occurrences\n`;
      });
      report += '\n';
    }
  }
  
  return report;
}

// Run if called directly
if (require.main === module) {
  checkWorkflowHealth();
}
