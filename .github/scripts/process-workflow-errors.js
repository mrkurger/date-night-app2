// Import necessary modules
// Use @octokit/rest for interacting with the GitHub API
// Use built-in modules like 'fs' for file system operations
import { Octokit } from "@octokit/rest"; // GitHub API client
import fs from "fs"; // File system module
import path from "path"; // Path module for handling file paths

// Initialize Octokit with the provided GitHub token
const octokit = new Octokit({
  auth: process.env.GITHUB_TOKEN, // Token for accessing GitHub API
});

/**
 * Main function to process workflow errors.
 * Fetches workflow run details and logs,
 * and saves them into a directory for further analysis.
 */
async function processWorkflowErrors() {
  try {
    // Retrieve the workflow run ID from environment variables
    const workflowRunId = process.env.WORKFLOW_RUN_ID;

    if (!workflowRunId) {
      throw new Error("WORKFLOW_RUN_ID environment variable is missing.");
    }

    // Log the start of the process
    console.log(`Processing workflow errors for run ID: ${workflowRunId}`);

    // Fetch workflow run details from the GitHub API
    const { data: workflowRun } = await octokit.actions.getWorkflowRun({
      owner: "mrkurger", // Replace with repository owner
      repo: "date-night-app2", // Replace with repository name
      run_id: workflowRunId, // Workflow run ID
    });

    // Log the workflow run details
    console.log("Workflow run details fetched successfully.");

    // Fetch logs for the workflow run
    const { data: logs } = await octokit.actions.downloadWorkflowRunLogs({
      owner: "mrkurger",
      repo: "date-night-app2",
      run_id: workflowRunId,
    });

    // Create a directory for storing error logs
    const logsDir = path.resolve("workflow-error-logs"); // Directory path
    if (!fs.existsSync(logsDir)) {
      fs.mkdirSync(logsDir); // Create directory if it doesn't exist
    }

    // Define the path for the log file
    const logFilePath = path.join(logsDir, `workflow-run-${workflowRunId}.log`);

    // Write logs to the file
    fs.writeFileSync(logFilePath, logs);

    // Log the success of the operation
    console.log(`Workflow logs saved to: ${logFilePath}`);
  } catch (error) {
    // Log any errors encountered during execution
    console.error("An error occurred while processing workflow errors:", error);
    process.exit(1); // Exit with error code
  }
}

// Execute the main function
processWorkflowErrors();