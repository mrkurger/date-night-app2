const fs = require('fs-extra');
const { Octokit } = require('@octokit/rest');

async function generateWorkflowReport() {
  const octokit = new Octokit({
    auth: process.env.GITHUB_TOKEN,
  });

  // Get workflow data
  const workflows = await octokit.actions.listWorkflowRuns({
    owner: context.repo.owner,
    repo: context.repo.repo,
  });

  // Generate report
  const report = {
    timestamp: new Date().toISOString(),
    workflows: workflows.data.workflow_runs.map(run => ({
      name: run.name,
      status: run.status,
      conclusion: run.conclusion,
      url: run.html_url,
    })),
  };

  // Save report
  await fs.writeJSON('./workflow-reports/latest.json', report, { spaces: 2 });
}

module.exports = generateWorkflowReport;
