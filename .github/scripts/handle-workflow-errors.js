// Import required modules using ESModules syntax
import { Octokit } from '@octokit/rest';
import fs from 'fs-extra';

/**
 * Handles workflow errors by logging them and optionally creating a GitHub issue.
 * @param {Object} error - The error object containing message and stack.
 * @param {Object} context - The context of the workflow run.
 */
export async function handleWorkflowError(error, context) {
  try {
    // Create an error report object
    const errorReport = {
      timestamp: new Date().toISOString(),
      workflow: context.workflow,
      error: error.message,
      stack: error.stack,
    };

    // Save the error report to an artifact directory
    await fs.writeJSON('./workflow-error-logs/error.json', errorReport, { spaces: 2 });

    // Optional: Create a GitHub issue for critical errors
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