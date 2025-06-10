# Google Cloud Infrastructure Setup for Date Night App

This document provides comprehensive, step-by-step instructions for setting up automated deployment and cleanup for the `client_angular2/` frontend application using Google Cloud Run, GitHub Actions, and Cloud Functions.

## 📋 Overview

This infrastructure setup provides:

- **Automated Deployment**: GitHub Actions workflow that deploys `client_angular2/` to Google Cloud Run when the `web` branch is updated
- **Deployment Tracking**: Each deployment includes a `DEPLOY_TIMESTAMP` environment variable for tracking
- **Automated Cleanup**: Cloud Function that removes Cloud Run services older than 120 minutes
- **Scheduled Execution**: Cloud Scheduler runs the cleanup function every 10 minutes

## 🛠️ Prerequisites

Before starting, ensure you have:

- A Google Cloud Platform account with billing enabled
- `gcloud` CLI installed and configured ([Installation Guide](https://cloud.google.com/sdk/docs/install))
- A GitHub repository with appropriate permissions to add secrets
- Node.js 18+ installed locally for testing

## 🚀 Quick Start

1. Run the setup script to see all required commands:
   ```bash
   cd infra
   node setup-cloud-scheduler-instructions.mjs
   ```

2. Follow the generated commands in order
3. Update GitHub repository secrets
4. Test the deployment by pushing to the `web` branch

## 📝 Detailed Setup Instructions

### Step 1: Google Cloud Project Setup

#### 1.1 Create or Select a Project

```bash
# Create a new project (or use existing one)
gcloud projects create your-project-id --name="Date Night App"

# Set the project as default
gcloud config set project your-project-id

# Verify the project is set
gcloud config get-value project
```

#### 1.2 Enable Billing

Ensure billing is enabled for your project through the [Google Cloud Console](https://console.cloud.google.com/billing).

### Step 2: Enable Required APIs

```bash
# Enable all required APIs at once
gcloud services enable \
  cloudfunctions.googleapis.com \
  cloudbuild.googleapis.com \
  cloudscheduler.googleapis.com \
  run.googleapis.com \
  iam.googleapis.com \
  logging.googleapis.com \
  containerregistry.googleapis.com

# Verify APIs are enabled
gcloud services list --enabled
```

### Step 3: Service Account Creation and Configuration

#### 3.1 Create Service Accounts

```bash
# Create service account for Cloud Function
gcloud iam service-accounts create cloudrun-cleanup \
  --display-name="Cloud Run Cleanup Service Account" \
  --description="Service account for automated cleanup of old Cloud Run services"

# Create service account for GitHub Actions (recommended)
gcloud iam service-accounts create github-actions \
  --display-name="GitHub Actions Service Account" \
  --description="Service account for GitHub Actions deployments"
```

#### 3.2 Grant IAM Permissions

```bash
# Set environment variables
export PROJECT_ID="your-project-id"  # TODO: Replace with your project ID
export CLEANUP_SA_EMAIL="cloudrun-cleanup@${PROJECT_ID}.iam.gserviceaccount.com"
export GITHUB_SA_EMAIL="github-actions@${PROJECT_ID}.iam.gserviceaccount.com"

# Grant permissions to cleanup service account
gcloud projects add-iam-policy-binding $PROJECT_ID \
  --member="serviceAccount:$CLEANUP_SA_EMAIL" \
  --role="roles/run.admin"

gcloud projects add-iam-policy-binding $PROJECT_ID \
  --member="serviceAccount:$CLEANUP_SA_EMAIL" \
  --role="roles/cloudfunctions.invoker"

gcloud projects add-iam-policy-binding $PROJECT_ID \
  --member="serviceAccount:$CLEANUP_SA_EMAIL" \
  --role="roles/logging.logWriter"

# Grant permissions to GitHub Actions service account
gcloud projects add-iam-policy-binding $PROJECT_ID \
  --member="serviceAccount:$GITHUB_SA_EMAIL" \
  --role="roles/run.admin"

gcloud projects add-iam-policy-binding $PROJECT_ID \
  --member="serviceAccount:$GITHUB_SA_EMAIL" \
  --role="roles/storage.admin"

gcloud projects add-iam-policy-binding $PROJECT_ID \
  --member="serviceAccount:$GITHUB_SA_EMAIL" \
  --role="roles/cloudbuild.builds.builder"
```

### Step 4: Create Service Account Keys

```bash
# Create key for GitHub Actions
gcloud iam service-accounts keys create github-actions-key.json \
  --iam-account=$GITHUB_SA_EMAIL

# Display the key content (for adding to GitHub secrets)
cat github-actions-key.json

# ⚠️ IMPORTANT: Store this securely and delete the local file after adding to GitHub
# rm github-actions-key.json
```

### Step 5: GitHub Repository Secrets Setup

Add the following secrets to your GitHub repository (Settings → Secrets and variables → Actions):

| Secret Name | Description | Example Value |
|-------------|-------------|---------------|
| `GCP_PROJECT_ID` | Your Google Cloud project ID | `date-night-app-123456` |
| `GCP_SA_KEY` | GitHub Actions service account key (JSON) | `{"type": "service_account",...}` |

**To add secrets:**
1. Go to your GitHub repository
2. Navigate to Settings → Secrets and variables → Actions
3. Click "New repository secret"
4. Add each secret with the exact name and value

### Step 6: Deploy the Cloud Function

#### 6.1 Prepare the Function

```bash
# Navigate to the infra directory
cd infra

# Install dependencies
npm install

# Update configuration in gcp-delete-old-cloudrun-services.mjs
# TODO: Edit the CONFIG object with your project details
```

#### 6.2 Deploy the Function

```bash
# Set environment variables
export REGION="us-central1"  # TODO: Choose your preferred region
export FUNCTION_NAME="delete-old-cloudrun-services"

# Deploy the function
gcloud functions deploy $FUNCTION_NAME \
  --runtime=nodejs18 \
  --trigger-http \
  --allow-unauthenticated \
  --source=. \
  --entry-point=deleteOldCloudRunServices \
  --memory=512MB \
  --timeout=300s \
  --region=$REGION \
  --service-account=$CLEANUP_SA_EMAIL \
  --set-env-vars="GCP_PROJECT_ID=$PROJECT_ID,CLOUD_RUN_REGION=$REGION,SERVICE_NAME_PATTERN=date-night-frontend,DRY_RUN=false"

# Get the function URL
FUNCTION_URL=$(gcloud functions describe $FUNCTION_NAME --region=$REGION --format="value(httpsTrigger.url)")
echo "Function URL: $FUNCTION_URL"
```

### Step 7: Setup Cloud Scheduler

```bash
# Create the scheduler job
export SCHEDULER_JOB_NAME="cleanup-old-cloudrun-services"

gcloud scheduler jobs create http $SCHEDULER_JOB_NAME \
  --location=$REGION \
  --schedule="*/10 * * * *" \
  --time-zone="UTC" \
  --uri="$FUNCTION_URL" \
  --http-method=POST \
  --headers="Content-Type=application/json" \
  --message-body='{}' \
  --description="Automated cleanup of Cloud Run services older than 120 minutes"

# Verify the job was created
gcloud scheduler jobs list --location=$REGION
```

### Step 8: Create the Web Branch

```bash
# In your repository root, create and push the web branch
git checkout -b web
git push origin web
```

### Step 9: Test the Deployment

#### 9.1 Test Cloud Function Manually

```bash
# Test the function with dry run
curl -X POST "$FUNCTION_URL" \
  -H "Content-Type: application/json" \
  -d '{}'

# Check the logs
gcloud functions logs read $FUNCTION_NAME --limit=10
```

#### 9.2 Test GitHub Actions Deployment

1. Make a small change to a file in `client_angular2/`
2. Commit and push to the `web` branch:
   ```bash
   git checkout web
   echo "# Test deployment" >> client_angular2/README.md
   git add client_angular2/README.md
   git commit -m "Test deployment"
   git push origin web
   ```
3. Check the GitHub Actions tab for the deployment status
4. Verify the service was deployed in Google Cloud Console

## 🔧 Configuration Options

### GitHub Actions Workflow Configuration

Edit `.github/workflows/deploy-web.yml` to customize:

- **Service Name**: Change `SERVICE_NAME` environment variable
- **Region**: Change `REGION` environment variable  
- **Cloud Run Resources**: Modify memory, CPU, and scaling settings
- **Build Options**: Add or modify build steps

### Cloud Function Configuration

Edit `infra/gcp-delete-old-cloudrun-services.mjs` to customize:

- **Maximum Age**: Change `MAX_AGE_MINUTES` (default: 120 minutes)
- **Service Pattern**: Change `SERVICE_NAME_PATTERN` to match your services
- **Dry Run**: Set `DRY_RUN=true` for testing without actual deletion

### Cloud Scheduler Configuration

Modify the schedule by updating the cron expression:
- `*/10 * * * *` - Every 10 minutes (default)
- `0 */2 * * *` - Every 2 hours
- `0 0 * * *` - Daily at midnight

## 📊 Monitoring and Troubleshooting

### Viewing Logs

```bash
# Cloud Function logs
gcloud functions logs read $FUNCTION_NAME --limit=50

# Cloud Run service logs
gcloud logging read "resource.type=cloud_run_revision" --limit=50

# GitHub Actions deployment logs
# View in GitHub repository → Actions tab
```

### Common Issues and Solutions

#### Issue: Function fails with permission errors
**Solution**: Verify service account permissions and IAM bindings

#### Issue: GitHub Actions fails to authenticate
**Solution**: Check that `GCP_SA_KEY` secret is correctly formatted JSON

#### Issue: Cloud Run deployment fails
**Solution**: Check container build logs and ensure Dockerfile is correct

#### Issue: Scheduler job not running
**Solution**: Verify the function URL and check Cloud Scheduler logs

### Useful Monitoring Commands

```bash
# List all Cloud Run services
gcloud run services list --region=$REGION

# Check Cloud Scheduler job status
gcloud scheduler jobs describe $SCHEDULER_JOB_NAME --location=$REGION

# View recent function executions
gcloud functions logs read $FUNCTION_NAME --limit=20 --format="table(timestamp,severity,textPayload)"

# Test function manually
curl -X POST "$FUNCTION_URL" -H "Content-Type: application/json" -d '{}'
```

## 🧹 Cleanup and Removal

When you no longer need this infrastructure:

```bash
# Delete Cloud Scheduler job
gcloud scheduler jobs delete $SCHEDULER_JOB_NAME --location=$REGION --quiet

# Delete Cloud Function
gcloud functions delete $FUNCTION_NAME --region=$REGION --quiet

# Delete service accounts
gcloud iam service-accounts delete $CLEANUP_SA_EMAIL --quiet
gcloud iam service-accounts delete $GITHUB_SA_EMAIL --quiet

# Delete Cloud Run services (if needed)
gcloud run services delete date-night-frontend --region=$REGION --quiet
```

## 🔒 Security Considerations

1. **Service Account Keys**: Store GitHub Actions service account keys securely
2. **Least Privilege**: Service accounts have minimal required permissions
3. **Function Authentication**: Consider adding authentication to Cloud Function for production
4. **Container Security**: Images are scanned for vulnerabilities during build
5. **Network Security**: Cloud Run services can be configured with VPC settings

## 📚 Additional Resources

- [Google Cloud Run Documentation](https://cloud.google.com/run/docs)
- [Google Cloud Functions Documentation](https://cloud.google.com/functions/docs)
- [Google Cloud Scheduler Documentation](https://cloud.google.com/scheduler/docs)
- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Next.js Deployment Documentation](https://nextjs.org/docs/deployment)

## 🆘 Support and Troubleshooting

For issues with this setup:

1. Check the logs using the commands provided above
2. Verify all configuration values are correct
3. Ensure all required APIs are enabled
4. Check IAM permissions for service accounts
5. Refer to the generated setup script output: `node setup-cloud-scheduler-instructions.mjs`

---

**Last Updated**: Generated automatically by infrastructure setup scripts  
**Version**: 1.0.0  
**Scope**: client_angular2/ deployment only