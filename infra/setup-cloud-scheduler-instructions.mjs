#!/usr/bin/env node

/**
 * Setup Script for Google Cloud Scheduler and Cloud Function Deployment
 * 
 * This ESModules-based script generates the required gcloud commands to deploy
 * the Cloud Function and set up Cloud Scheduler for automated cleanup of old
 * Cloud Run services every 10 minutes.
 * 
 * @fileoverview Generates deployment commands for Cloud Function and Scheduler
 * @author Date Night App Deployment Automation
 * @version 1.0.0
 */

import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Get current directory for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/**
 * Configuration object containing deployment settings
 * TODO: Update these values according to your Google Cloud setup
 */
const CONFIG = {
  // Google Cloud Project configuration
  PROJECT_ID: 'your-project-id', // TODO: Replace with your GCP project ID
  REGION: 'us-central1',         // TODO: Replace with your preferred region
  
  // Cloud Function configuration
  FUNCTION_NAME: 'delete-old-cloudrun-services',
  FUNCTION_RUNTIME: 'nodejs18',
  FUNCTION_MEMORY: '512MB',
  FUNCTION_TIMEOUT: '300s',
  
  // Cloud Scheduler configuration
  SCHEDULER_JOB_NAME: 'cleanup-old-cloudrun-services',
  SCHEDULER_SCHEDULE: '*/10 * * * *', // Every 10 minutes
  SCHEDULER_TIMEZONE: 'UTC',
  
  // Cloud Run cleanup configuration
  SERVICE_NAME_PATTERN: 'date-night-frontend',
  MAX_AGE_MINUTES: 120,
  
  // Security configuration
  SERVICE_ACCOUNT_EMAIL: 'cloudrun-cleanup@your-project-id.iam.gserviceaccount.com', // TODO: Update with your service account
};

/**
 * Prints a formatted header for command sections
 * 
 * @param {string} title - The title of the section
 * @param {string} description - Description of what the section does
 */
function printHeader(title, description) {
  console.log('\n' + '='.repeat(80));
  console.log(`🔧 ${title}`);
  console.log('='.repeat(80));
  console.log(`📝 ${description}`);
  console.log('');
}

/**
 * Prints a command with description and formatting
 * 
 * @param {string} description - What the command does
 * @param {string} command - The actual command to run
 * @param {boolean} isOptional - Whether the command is optional
 */
function printCommand(description, command, isOptional = false) {
  const prefix = isOptional ? '🔹 [OPTIONAL]' : '▶️';
  console.log(`${prefix} ${description}`);
  console.log('```bash');
  console.log(command);
  console.log('```\n');
}

/**
 * Prints environment variable setup commands
 */
function printEnvironmentSetup() {
  printHeader(
    'Environment Setup',
    'Set up environment variables for easier command execution'
  );
  
  const envSetupCommands = `
# Set your Google Cloud project ID
export PROJECT_ID="${CONFIG.PROJECT_ID}"

# Set your preferred region
export REGION="${CONFIG.REGION}"

# Set the service account email
export SERVICE_ACCOUNT_EMAIL="${CONFIG.SERVICE_ACCOUNT_EMAIL}"

# Set Cloud Function configuration
export FUNCTION_NAME="${CONFIG.FUNCTION_NAME}"

# Set Cloud Scheduler configuration
export SCHEDULER_JOB_NAME="${CONFIG.SCHEDULER_JOB_NAME}"
`.trim();

  printCommand(
    'Set up environment variables (copy and paste this into your terminal)',
    envSetupCommands
  );
}

/**
 * Prints Google Cloud APIs enablement commands
 */
function printAPIEnablement() {
  printHeader(
    'Enable Required Google Cloud APIs',
    'Enable the necessary APIs for Cloud Functions, Cloud Run, and Cloud Scheduler'
  );
  
  const apis = [
    'cloudfunctions.googleapis.com',
    'cloudbuild.googleapis.com',
    'cloudscheduler.googleapis.com',
    'run.googleapis.com',
    'iam.googleapis.com',
    'logging.googleapis.com',
  ];
  
  printCommand(
    'Enable all required APIs',
    `gcloud services enable ${apis.join(' ')} --project=$PROJECT_ID`
  );
}

/**
 * Prints service account creation and IAM configuration commands
 */
function printServiceAccountSetup() {
  printHeader(
    'Service Account Setup',
    'Create and configure a service account for the Cloud Function'
  );
  
  printCommand(
    'Create a service account for Cloud Function',
    `gcloud iam service-accounts create cloudrun-cleanup \\
  --display-name="Cloud Run Cleanup Service Account" \\
  --description="Service account for automated cleanup of old Cloud Run services" \\
  --project=$PROJECT_ID`
  );
  
  printCommand(
    'Grant necessary permissions to the service account',
    `# Grant Cloud Run Admin role
gcloud projects add-iam-policy-binding $PROJECT_ID \\
  --member="serviceAccount:$SERVICE_ACCOUNT_EMAIL" \\
  --role="roles/run.admin"

# Grant Cloud Functions Invoker role  
gcloud projects add-iam-policy-binding $PROJECT_ID \\
  --member="serviceAccount:$SERVICE_ACCOUNT_EMAIL" \\
  --role="roles/cloudfunctions.invoker"

# Grant Logging Writer role
gcloud projects add-iam-policy-binding $PROJECT_ID \\
  --member="serviceAccount:$SERVICE_ACCOUNT_EMAIL" \\
  --role="roles/logging.logWriter"`
  );
}

/**
 * Prints Cloud Function deployment commands
 */
function printCloudFunctionDeployment() {
  printHeader(
    'Deploy Cloud Function',
    'Deploy the cleanup function to Google Cloud Functions'
  );
  
  printCommand(
    'Navigate to the infra directory (run this from the repository root)',
    'cd infra'
  );
  
  printCommand(
    'Install Cloud Function dependencies',
    'npm install'
  );
  
  printCommand(
    'Deploy the Cloud Function',
    `gcloud functions deploy $FUNCTION_NAME \\
  --runtime=${CONFIG.FUNCTION_RUNTIME} \\
  --trigger-http \\
  --allow-unauthenticated \\
  --source=. \\
  --entry-point=deleteOldCloudRunServices \\
  --memory=${CONFIG.FUNCTION_MEMORY} \\
  --timeout=${CONFIG.FUNCTION_TIMEOUT} \\
  --region=$REGION \\
  --service-account=$SERVICE_ACCOUNT_EMAIL \\
  --set-env-vars="GCP_PROJECT_ID=$PROJECT_ID,CLOUD_RUN_REGION=$REGION,SERVICE_NAME_PATTERN=${CONFIG.SERVICE_NAME_PATTERN},DRY_RUN=false" \\
  --project=$PROJECT_ID`
  );
  
  printCommand(
    'Test the Cloud Function (optional)',
    `# Get the function URL
FUNCTION_URL=$(gcloud functions describe $FUNCTION_NAME --region=$REGION --project=$PROJECT_ID --format="value(httpsTrigger.url)")

# Test the function
curl -X POST "$FUNCTION_URL" \\
  -H "Content-Type: application/json" \\
  -d '{}'`,
    true
  );
}

/**
 * Prints Cloud Scheduler setup commands
 */
function printCloudSchedulerSetup() {
  printHeader(
    'Setup Cloud Scheduler',
    'Create a scheduled job to run the cleanup function every 10 minutes'
  );
  
  printCommand(
    'Get the Cloud Function trigger URL',
    `FUNCTION_URL=$(gcloud functions describe $FUNCTION_NAME \\
  --region=$REGION \\
  --project=$PROJECT_ID \\
  --format="value(httpsTrigger.url)")

echo "Function URL: $FUNCTION_URL"`
  );
  
  printCommand(
    'Create the Cloud Scheduler job',
    `gcloud scheduler jobs create http $SCHEDULER_JOB_NAME \\
  --location=$REGION \\
  --schedule="${CONFIG.SCHEDULER_SCHEDULE}" \\
  --time-zone="${CONFIG.SCHEDULER_TIMEZONE}" \\
  --uri="$FUNCTION_URL" \\
  --http-method=POST \\
  --headers="Content-Type=application/json" \\
  --message-body='{}' \\
  --description="Automated cleanup of Cloud Run services older than ${CONFIG.MAX_AGE_MINUTES} minutes" \\
  --project=$PROJECT_ID`
  );
  
  printCommand(
    'Verify the scheduler job was created',
    `gcloud scheduler jobs list --location=$REGION --project=$PROJECT_ID`
  );
  
  printCommand(
    'Run the job manually to test (optional)',
    `gcloud scheduler jobs run $SCHEDULER_JOB_NAME \\
  --location=$REGION \\
  --project=$PROJECT_ID`,
    true
  );
}

/**
 * Prints monitoring and troubleshooting commands
 */
function printMonitoringCommands() {
  printHeader(
    'Monitoring and Troubleshooting',
    'Commands to monitor the cleanup function and troubleshoot issues'
  );
  
  printCommand(
    'View Cloud Function logs',
    `gcloud functions logs read $FUNCTION_NAME \\
  --region=$REGION \\
  --project=$PROJECT_ID \\
  --limit=50`
  );
  
  printCommand(
    'View Cloud Scheduler job status',
    `gcloud scheduler jobs describe $SCHEDULER_JOB_NAME \\
  --location=$REGION \\
  --project=$PROJECT_ID`
  );
  
  printCommand(
    'List all Cloud Run services (to verify cleanup is working)',
    `gcloud run services list \\
  --region=$REGION \\
  --project=$PROJECT_ID`
  );
  
  printCommand(
    'Enable dry run mode for testing (optional)',
    `gcloud functions deploy $FUNCTION_NAME \\
  --update-env-vars="DRY_RUN=true" \\
  --region=$REGION \\
  --project=$PROJECT_ID`,
    true
  );
}

/**
 * Prints cleanup commands
 */
function printCleanupCommands() {
  printHeader(
    'Cleanup Commands',
    'Commands to remove the infrastructure when no longer needed'
  );
  
  printCommand(
    'Delete the Cloud Scheduler job',
    `gcloud scheduler jobs delete $SCHEDULER_JOB_NAME \\
  --location=$REGION \\
  --project=$PROJECT_ID \\
  --quiet`
  );
  
  printCommand(
    'Delete the Cloud Function',
    `gcloud functions delete $FUNCTION_NAME \\
  --region=$REGION \\
  --project=$PROJECT_ID \\
  --quiet`
  );
  
  printCommand(
    'Delete the service account',
    `gcloud iam service-accounts delete $SERVICE_ACCOUNT_EMAIL \\
  --project=$PROJECT_ID \\
  --quiet`
  );
}

/**
 * Prints configuration summary
 */
function printConfigurationSummary() {
  printHeader(
    'Configuration Summary',
    'Summary of the configuration used for this deployment'
  );
  
  console.log('📋 **Current Configuration:**');
  console.log(`- Project ID: ${CONFIG.PROJECT_ID}`);
  console.log(`- Region: ${CONFIG.REGION}`);
  console.log(`- Function Name: ${CONFIG.FUNCTION_NAME}`);
  console.log(`- Scheduler Job Name: ${CONFIG.SCHEDULER_JOB_NAME}`);
  console.log(`- Schedule: ${CONFIG.SCHEDULER_SCHEDULE} (every 10 minutes)`);
  console.log(`- Service Name Pattern: ${CONFIG.SERVICE_NAME_PATTERN}`);
  console.log(`- Max Age: ${CONFIG.MAX_AGE_MINUTES} minutes`);
  console.log(`- Service Account: ${CONFIG.SERVICE_ACCOUNT_EMAIL}`);
  console.log('');
  
  console.log('⚠️  **Important Notes:**');
  console.log('- Make sure to update the PROJECT_ID and SERVICE_ACCOUNT_EMAIL in this script');
  console.log('- Review all TODO comments in the generated commands');
  console.log('- Test the function with DRY_RUN=true before enabling actual deletion');
  console.log('- Monitor the logs after deployment to ensure everything works correctly');
  console.log('');
}

/**
 * Main function that orchestrates the command generation
 */
function main() {
  console.log('🚀 Google Cloud Setup Instructions for Automated Cloud Run Cleanup');
  console.log('Generated by setup-cloud-scheduler-instructions.mjs');
  console.log(`Generated at: ${new Date().toISOString()}`);
  
  printConfigurationSummary();
  printEnvironmentSetup();
  printAPIEnablement();
  printServiceAccountSetup();
  printCloudFunctionDeployment();
  printCloudSchedulerSetup();
  printMonitoringCommands();
  printCleanupCommands();
  
  console.log('\n' + '='.repeat(80));
  console.log('🎉 Setup instructions generated successfully!');
  console.log('='.repeat(80));
  console.log('');
  console.log('📚 Next steps:');
  console.log('1. Update the PROJECT_ID and other configuration values in this script');
  console.log('2. Run the commands in order as shown above');
  console.log('3. Test the deployment with DRY_RUN=true first');
  console.log('4. Monitor the logs to ensure everything is working correctly');
  console.log('5. Refer to infra/README.md for detailed setup instructions');
  console.log('');
}

// Run the script if executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export default main;