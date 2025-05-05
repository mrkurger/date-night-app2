const { Octokit } = require('@octokit/rest');
const fs = require('fs-extra');

async function handleWorkflowError(error, context) {
  try {
    // Create error report
    const errorReport = {
      timestamp: new Date().toISOString(),
      workflow: context.workflow,
      error: error.message,
      stack: error.stack,
    };

    // Save to artifact directory
    await fs.writeJSON('./workflow-error-logs/error.json', errorReport, { spaces: 2 });

    // Optional: Create issue for critical errors
    if (process.env.GITHUB_TOKEN && error.critical) {
      const octokit = new Octokit({
        auth: process.env.GITHUB_TOKEN,
      });

      await octokit.issues.create({
        ...context.repo,
        title: `Workflow Error: ${context.workflow}`,
        body: `Error in workflow: ${error.message}\n\nStack: ${error.stack}`,
      });
    }
  } catch (e) {
    console.error('Error handling workflow error:', e);
  }
}

module.exports = handleWorkflowError;
